import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyPaymentWebhook } from "@/services/paymentGateway"

/**
 * Webhook endpoint for payment gateway callbacks
 * Handles payment status updates and order processing
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-payment-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    // Verify webhook signature to ensure it's from the payment gateway
    const isValid = await verifyPaymentWebhook(body, signature)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const paymentData = JSON.parse(body)
    const { orderId, status, transactionId, amount } = paymentData

    // Update order payment status
    const order = await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: status === "success" ? "PAID" : "FAILED",
        paymentRefId: transactionId,
        updatedAt: new Date(),
      },
      include: {
        seller: true,
        farmer: true,
      },
    })

    // Create notifications for both parties
    if (status === "success") {
      await Promise.all([
        // Notify seller
        db.notification.create({
          data: {
            userId: order.sellerId,
            type: "PAYMENT_RECEIVED",
            content: `Payment of RWF ${amount} received for order #${orderId}`,
            relatedEntityId: orderId,
          },
        }),
        // Notify farmer
        db.notification.create({
          data: {
            userId: order.farmerId,
            type: "ORDER_UPDATED",
            content: `Order #${orderId} has been paid and confirmed`,
            relatedEntityId: orderId,
          },
        }),
      ])

      // Update order status to confirmed if payment is successful
      await db.order.update({
        where: { id: orderId },
        data: { status: "CONFIRMED" },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Payment webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
