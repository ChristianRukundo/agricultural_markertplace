"use client";

import { useParams } from "next/navigation";
import { Package, Truck, User, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { api } from "@/lib/trpc/client";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { FullScreenLoader } from "@/components/ui/loader";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { data: session } = useSession();

  const {
    data: order,
    isLoading,
    error,
  } = api.order.getById.useQuery(
    { id: orderId },
    {
      enabled: !!session && !!orderId,
    }
  );

  if (isLoading) return <FullScreenLoader />;
  if (error)
    return (
      <div className="text-center text-red-500 p-8">Error: {error.message}</div>
    );
  if (!order) return <div className="text-center p-8">Order not found.</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="text-muted-foreground">
            Order #{order.id.substring(0, 8)} &bull; Placed on{" "}
            {formatDate(new Date(order.orderDate))}
          </p>
        </div>
        <Badge className="text-lg py-2 px-4">{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items Ordered</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 py-4">
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.imageUrls[0] || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />  
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {formatPrice(Number(item.priceAtOrder))}
                    </p>
                  </div>
                  <p className="font-bold">
                    {formatPrice(Number(item.priceAtOrder) * item.quantity)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(Number(order.totalAmount))}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{formatPrice(Number(order.deliveryFee))}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span>
                  {formatPrice(
                    Number(order.totalAmount) + Number(order.deliveryFee)
                  )}
                </span>
              </div>
              <div className="pt-2">
                <Badge
                  variant={
                    order.paymentStatus === "PAID" ? "default" : "secondary"
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Farmer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-semibold">{order.farmer.profile?.name}</p>
              <p className="text-muted-foreground">
                {order.farmer.profile?.farmerProfile?.farmName}
              </p>
              <p className="text-muted-foreground">
                {order.farmer.profile?.contactPhone}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                Delivery To
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-semibold">{order.seller.profile?.name}</p>
              <p className="text-muted-foreground">{order.deliveryAddress}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
