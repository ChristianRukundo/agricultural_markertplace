"use client";

import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { api } from "@/lib/trpc/client";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { FullScreenLoader } from "@/components/ui/loader";

export default function OrdersPage() {
  const { data: session } = useSession();
  const {
    data: ordersData,
    isLoading,
    error,
  } = api.order.getMyOrders.useQuery(
    {},
    {
      enabled: !!session,
    }
  );

  if (isLoading) return <FullScreenLoader />;
  if (error)
    return (
      <div className="text-center text-red-500 p-8">Error: {error.message}</div>
    );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {ordersData?.orders && ordersData.orders.length > 0 ? (
        <div className="space-y-6">
          {ordersData.orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    Order #{order.id.substring(0, 8)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Placed on {formatDate(new Date(order.orderDate))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatPrice(Number(order.totalAmount))}</p>
                  <Badge className="mt-1">{order.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-4">
                    {order.orderItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="w-12 h-12 bg-muted rounded-full overflow-hidden border-2 border-background"
                      >
                        <img
                          src={item.product.imageUrls[0] || "/placeholder.svg"}
                          alt={item.product.name}
                        />
                      </div>
                    ))}
                    {order.orderItems.length > 3 && (
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-sm font-medium border-2 border-background">
                        +{order.orderItems.length - 3}
                      </div>
                    )}
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/orders/${order.id}`}>
                      View Details <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Package className="mx-auto w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold">No Orders Yet</h2>
          <p className="text-muted-foreground mb-6">
            You haven't placed any orders. Let's change that!
          </p>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
