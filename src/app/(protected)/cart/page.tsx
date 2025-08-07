"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Info,
} from "lucide-react";
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
import Image from "next/image";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/lib/trpc/_app";

type CartItemType = NonNullable<
  inferRouterOutputs<AppRouter>["cart"]["getCart"]
>["items"][number];

interface CartItemProps {
  item: CartItemType;
  onUpdate: (data: { productId: string; quantity: number }) => void;
  onRemove: (data: { productId: string }) => void;
  isMutating: boolean;
}

function CartItem({ item, onUpdate, onRemove, isMutating }: CartItemProps) {
  const itemTotal = Number(item.product.unitPrice) * item.quantity;

  return (
    <div className="flex items-start space-x-4 py-4">
      <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={item.product.imageUrls[0] || "/placeholder.svg"}
          alt={item.product.name}
          width={100}
          height={100}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold">{item.product.name}</h3>
        <p className="text-sm text-muted-foreground">
          {formatPrice(Number(item.product.unitPrice))} / unit
        </p>
        <div className="flex items-center space-x-3 mt-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              onUpdate({
                productId: item.productId,
                quantity: item.quantity - 1,
              })
            }
            disabled={
              item.quantity <= (item.product.minimumOrderQuantity || 1) ||
              isMutating
            }
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              onUpdate({
                productId: item.productId,
                quantity: item.quantity + 1,
              })
            }
            disabled={isMutating}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold">{formatPrice(itemTotal)}</p>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive mt-2"
          onClick={() => onRemove({ productId: item.productId })}
          disabled={isMutating}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const utils = api.useUtils();

  const {
    data: cartData,
    isLoading,
    error,
  } = api.cart.getCart.useQuery(undefined, {
    enabled: !!session && session.user.role === "SELLER",
  });

  const updateItemMutation = api.cart.updateItemQuantity.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
      toast({
        title: "Cart Updated",
        description: "Item quantity has been updated.",
      });
    },
    onError: (err) => {
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = api.cart.removeItem.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
      toast({
        title: "Item Removed",
        description: "The item has been removed from your cart.",
      });
    },
    onError: (err) => {
      toast({
        title: "Removal Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const isMutating =
    updateItemMutation.isPending || removeItemMutation.isPending;

  const subtotal = useMemo(() => {
    if (!cartData) return 0;
    return cartData.items.reduce(
      (acc, item) => acc + Number(item.product.unitPrice) * item.quantity,
      0
    );
  }, [cartData]);

  const deliveryFee = 5000;
  const total = subtotal + deliveryFee;

  if (isLoading) return <FullScreenLoader />;
  if (error)
    return (
      <div className="text-center text-red-500 p-8">Error: {error.message}</div>
    );
  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingCart className="mx-auto w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-6">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Button asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <ShoppingCart className="w-8 h-8 mr-3" /> My Shopping Cart
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cart Items ({cartData.items.length})</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {cartData.items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdate={updateItemMutation.mutate}
                onRemove={removeItemMutation.mutate}
                isMutating={isMutating}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Estimated Delivery Fee</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-700 rounded-lg text-sm flex items-start space-x-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Delivery fees are estimates and will be finalized at checkout
                based on your address.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild size="lg" className="w-full">
              <Link href="/checkout">
                Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
