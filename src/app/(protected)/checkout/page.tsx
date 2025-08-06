"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, MapPin, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/Card";
import { api } from "@/lib/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { FullScreenLoader } from "@/components/ui/loader";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const checkoutSchema = z.object({
  deliveryAddress: z
    .string()
    .min(10, "Please provide a detailed delivery address."),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const { data: cartData, isLoading: isCartLoading } =
    api.cart.getCart.useQuery(undefined, {
      enabled: !!session && session.user.role === "SELLER",
      staleTime: 5 * 60 * 1000,
    });

  const createOrderMutation = api.order.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Order Placed!",
        description: "Your order has been successfully placed.",
      }); // FIX: Check if data.orders exists and has length before accessing it
      if (data?.orders?.length > 0) {
        router.push(`/orders/${data.orders[0]!.id}/success`);
      } else {
        router.push("/orders");
      }
    },
    onError: (err) => {
      toast({
        title: "Order Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = (data: CheckoutFormData) => {
    if (!cartData || cartData.items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Cannot place an order with an empty cart.",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate({
      items: cartData.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      deliveryAddress: data.deliveryAddress,
      notes: data.notes,
    });
  };

  const subtotal = useMemo(() => {
    if (!cartData) return 0;
    // FIX: Convert Prisma Decimal to number before reducing
    return cartData.items.reduce(
      (acc, item) => acc + Number(item.product.unitPrice) * item.quantity,
      0
    );
  }, [cartData]);

  const deliveryFee = 5000;
  const total = subtotal + deliveryFee;

  if (isCartLoading) return <FullScreenLoader />;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
      >
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" /> Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label
                  htmlFor="deliveryAddress"
                  className="block text-sm font-medium mb-1"
                >
                  Full Delivery Address
                </label>
                <Textarea
                  id="deliveryAddress"
                  {...register("deliveryAddress")}
                  rows={3}
                  placeholder="e.g., KG 15 Ave, Kigali Innovation City, Gasabo, Kigali"
                />
                {errors.deliveryAddress && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.deliveryAddress.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" /> Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="font-semibold">Pay on Delivery</p>
                <p className="text-sm text-muted-foreground">
                  You will pay the farmer or delivery agent upon receiving your
                  order. Please have cash or Mobile Money ready.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Order Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...register("notes")}
                placeholder="Any special instructions for the farmer or delivery?"
              />
            </CardContent>
          </Card>
        </div>

        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto divide-y">
              {cartData?.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-sm pt-2"
                >
                  <p>
                    {item.quantity} x {item.product.name}
                  </p>
                  {/* FIX: Convert Prisma Decimal to number for calculation and formatting */}
                  <p className="font-medium">
                    {formatPrice(
                      Number(item.product.unitPrice) * item.quantity
                    )}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? (
                "Placing Order..."
              ) : (
                <>
                  Place Order <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
