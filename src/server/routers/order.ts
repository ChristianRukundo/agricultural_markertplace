import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  getOrdersSchema,
  getOrderByIdSchema,
} from "@/validation/order";
import { paymentGateway } from "@/services/paymentGateway";
import { smsGateway } from "@/services/smsGateway";

/**
 * Order management router
 */
export const orderRouter = createTRPCRouter({
  /**
   * Create a new order (sellers only)
   */
  create: protectedProcedure
    .input(createOrderSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id as string;

        // Verify user is a seller
        if (ctx.session.user.role !== "SELLER") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only sellers can create orders",
          });
        }

        const { items, deliveryAddress, notes } = input;

        // Validate products and calculate total
        let totalAmount = 0;
        const validatedItems = [];

        for (const item of items) {
          const product = await ctx.db.product.findUnique({
            where: { id: item.productId },
            include: {
              farmer: {
                include: {
                  profile: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          });

          if (!product) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Product ${item.productId} not found`,
            });
          }

          if (product.status !== "ACTIVE") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Product ${product.name} is not available`,
            });
          }

          if (item.quantity < product.minimumOrderQuantity) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Minimum order quantity for ${product.name} is ${product.minimumOrderQuantity}`,
            });
          }

          if (item.quantity > Number(product.quantityAvailable)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Only ${product.quantityAvailable} units of ${product.name} available`,
            });
          }

          const itemTotal = Number(product.unitPrice) * item.quantity;
          totalAmount += itemTotal;

          validatedItems.push({
            productId: item.productId,
            quantity: item.quantity,
            priceAtOrder: product.unitPrice,
            farmerId: product.farmer.profile.user.id,
          });
        }

        // Group items by farmer (one order per farmer)
        const ordersByFarmer = validatedItems.reduce((acc, item) => {
          if (!acc[item.farmerId]) {
            acc[item.farmerId] = [];
          }
          (acc[item.farmerId] ??= []).push(item);
          return acc;
        }, {} as Record<string, typeof validatedItems>);

        const createdOrders = [];

        // Create separate orders for each farmer
        for (const [farmerId, farmerItems] of Object.entries(ordersByFarmer)) {
          const farmerTotal = farmerItems.reduce(
            (sum, item) => sum + Number(item.priceAtOrder) * item.quantity,
            0
          );

          const order = await ctx.db.$transaction(async (tx) => {
            // Create order
            const newOrder = await tx.order.create({
              data: {
                sellerId: userId,
                farmerId,
                totalAmount: farmerTotal,
                deliveryAddress,
                notes,
                deliveryFee: 0, // TODO: Calculate delivery fee based on location
              },
            });

            // Create order items
            await tx.orderItem.createMany({
              data: farmerItems.map((item) => ({
                orderId: newOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                priceAtOrder: item.priceAtOrder,
              })),
            });

            // Update product quantities
            for (const item of farmerItems) {
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  quantityAvailable: {
                    decrement: item.quantity,
                  },
                },
              });
            }

            return newOrder;
          });

          createdOrders.push(order);

          // Send notification to farmer
          await ctx.db.notification.create({
            data: {
              userId: farmerId,
              type: "ORDER_CREATED",
              content: `New order #${order.id} received for RWF ${farmerTotal}`,
              relatedEntityId: order.id,
            },
          });

          // Send SMS notification to farmer
          const farmer = await ctx.db.user.findUnique({
            where: { id: farmerId },
          });

          if (farmer?.phoneNumber) {
            await smsGateway.sendOrderNotification(
              farmer.phoneNumber,
              order.id,
              "PENDING"
            );
          }
        }

        return {
          success: true,
          message: "Orders created successfully",
          orders: createdOrders,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create order",
        });
      }
    }),

  /**
   * Get orders for current user
   */
  getMyOrders: protectedProcedure
    .input(getOrdersSchema)
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id;
        const userRole = ctx.session.user.role;

        const {
          page,
          limit,
          status,
          paymentStatus,
          dateFrom,
          dateTo,
          sortBy,
          sortOrder,
        } = input;

        const skip = (page - 1) * limit;

        // Build where clause based on user role
        const where: any = {};

        if (userRole === "SELLER") {
          where.sellerId = userId;
        } else if (userRole === "FARMER") {
          where.farmerId = userId;
        } else {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Invalid user role for viewing orders",
          });
        }

        if (status) where.status = status;
        if (paymentStatus) where.paymentStatus = paymentStatus;

        if (dateFrom || dateTo) {
          where.orderDate = {};
          if (dateFrom) where.orderDate.gte = dateFrom;
          if (dateTo) where.orderDate.lte = dateTo;
        }

        // Build orderBy clause
        let orderBy: any = { createdAt: "desc" };
        if (sortBy) {
          orderBy = { [sortBy]: sortOrder };
        }

        const [orders, total] = await Promise.all([
          ctx.db.order.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include: {
              seller: {
                select: {
                  id: true,
                  profile: {
                    select: {
                      name: true,
                      profilePictureUrl: true,
                      contactPhone: true,
                    },
                  },
                },
              },
              farmer: {
                select: {
                  id: true,
                  profile: {
                    select: {
                      name: true,
                      profilePictureUrl: true,
                      contactPhone: true,
                    },
                  },
                },
              },
              orderItems: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      imageUrls: true,
                      unitPrice: true,
                    },
                  },
                },
              },
            },
          }),
          ctx.db.order.count({ where }),
        ]);

        return {
          orders,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch orders",
        });
      }
    }),

  /**
   * Get order by ID
   */
  getById: protectedProcedure
    .input(getOrderByIdSchema)
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id;
        const { id } = input;

        const order = await ctx.db.order.findUnique({
          where: { id },
          include: {
            seller: {
              select: {
                id: true,
                profile: {
                  select: {
                    name: true,
                    profilePictureUrl: true,
                    contactEmail: true,
                    contactPhone: true,
                    location: true,
                    sellerProfile: {
                      select: {
                        businessName: true,
                        deliveryOptions: true,
                      },
                    },
                  },
                },
              },
            },
            farmer: {
              select: {
                id: true,
                profile: {
                  select: {
                    name: true,
                    profilePictureUrl: true,
                    contactEmail: true,
                    contactPhone: true,
                    location: true,
                    farmerProfile: {
                      select: {
                        farmName: true,
                        farmLocationDetails: true,
                      },
                    },
                  },
                },
              },
            },
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    imageUrls: true,
                    unitPrice: true,
                    category: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        // Verify user has access to this order
        if (order.sellerId !== userId && order.farmerId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this order",
          });
        }

        return order;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch order",
        });
      }
    }),

  /**
   * Update order status (farmers only)
   */
  updateStatus: protectedProcedure
    .input(updateOrderStatusSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id;
        const { id, status, notes } = input;

        // Verify user is a farmer
        if (ctx.session.user.role !== "FARMER") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only farmers can update order status",
          });
        }

        const order = await ctx.db.order.findUnique({
          where: { id },
          include: {
            seller: true,
          },
        });

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        // Verify farmer owns this order
        if (order.farmerId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only update your own orders",
          });
        }

        // Validate status transition
        const validTransitions: Record<string, string[]> = {
          PENDING: ["CONFIRMED", "CANCELLED"],
          CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
          IN_PROGRESS: ["READY_FOR_DELIVERY", "CANCELLED"],
          READY_FOR_DELIVERY: ["DELIVERED"],
          DELIVERED: [],
          CANCELLED: [],
          DISPUTED: ["CONFIRMED", "CANCELLED"],
        };

        if (!validTransitions[order.status]?.includes(status)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Cannot change status from ${order.status} to ${status}`,
          });
        }

        const updatedOrder = await ctx.db.order.update({
          where: { id },
          data: {
            status,
            notes: notes || order.notes,
          },
        });

        // Create notification for seller
        await ctx.db.notification.create({
          data: {
            userId: order.sellerId,
            type: "ORDER_UPDATED",
            content: `Order #${id} status updated to ${status}`,
            relatedEntityId: id,
          },
        });

        // Send SMS notification
        if (order.seller.phoneNumber) {
          await smsGateway.sendOrderNotification(
            order.seller.phoneNumber,
            id,
            status
          );
        }

        return {
          success: true,
          message: "Order status updated successfully",
          order: updatedOrder,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update order status",
        });
      }
    }),

  /**
   * Cancel order
   */
  cancel: protectedProcedure
    .input(cancelOrderSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id;
        const { id, reason } = input;

        const order = await ctx.db.order.findUnique({
          where: { id },
          include: {
            orderItems: {
              include: {
                product: true,
              },
            },
            seller: true,
            farmer: true,
          },
        });

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        // Verify user has permission to cancel
        if (order.sellerId !== userId && order.farmerId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to cancel this order",
          });
        }

        // Check if order can be cancelled
        if (!["PENDING", "CONFIRMED"].includes(order.status)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Order cannot be cancelled at this stage",
          });
        }

        await ctx.db.$transaction(async (tx) => {
          // Update order status
          await tx.order.update({
            where: { id },
            data: {
              status: "CANCELLED",
              notes: `Cancelled: ${reason}`,
            },
          });

          // Restore product quantities
          for (const item of order.orderItems) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                quantityAvailable: {
                  increment: item.quantity,
                },
              },
            });
          }
        });

        // Notify the other party
        const notifyUserId =
          order.sellerId === userId ? order.farmerId : order.sellerId;
        const notifyUser =
          order.sellerId === userId ? order.farmer : order.seller;

        await ctx.db.notification.create({
          data: {
            userId: notifyUserId,
            type: "ORDER_UPDATED",
            content: `Order #${id} has been cancelled: ${reason}`,
            relatedEntityId: id,
          },
        });

        // Send SMS notification
        if (notifyUser.phoneNumber) {
          await smsGateway.sendOrderNotification(
            notifyUser.phoneNumber,
            id,
            "CANCELLED"
          );
        }

        return {
          success: true,
          message: "Order cancelled successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cancel order",
        });
      }
    }),

  /**
   * Initiate payment for order (sellers only)
   */
  initiatePayment: protectedProcedure
    .input(getOrderByIdSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id;
        const { id } = input;

        // Verify user is a seller
        if (ctx.session.user.role !== "SELLER") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only sellers can initiate payments",
          });
        }

        const order = await ctx.db.order.findUnique({
          where: { id },
          include: {
            seller: {
              include: {
                profile: true,
              },
            },
          },
        });

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        // Verify seller owns this order
        if (order.sellerId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only pay for your own orders",
          });
        }

        // Check if payment is already processed
        if (order.paymentStatus === "PAID") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Order is already paid",
          });
        }

        // Initiate payment with payment gateway
        const paymentResult = await paymentGateway.initiatePayment({
          orderId: order.id,
          amount: Number(order.totalAmount) + Number(order.deliveryFee),
          currency: "RWF",
          customerEmail:
            order.seller.profile?.contactEmail || order.seller.email,
          customerPhone: order.seller.phoneNumber || "",
          description: `Payment for order #${order.id}`,
          callbackUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/payment`,
        });

        if (!paymentResult.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: paymentResult.error || "Failed to initiate payment",
          });
        }

        // Update order with payment reference
        await ctx.db.order.update({
          where: { id },
          data: {
            paymentRefId: paymentResult.transactionId,
            paymentStatus: "PENDING",
          },
        });

        return {
          success: true,
          paymentUrl: paymentResult.paymentUrl,
          transactionId: paymentResult.transactionId,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to initiate payment",
        });
      }
    }),
});
