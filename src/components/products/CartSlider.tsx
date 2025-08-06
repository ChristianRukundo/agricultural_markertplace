"use client";

import React, { useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Info,
} from "lucide-react";
import { useCartSlider } from "./CartSliderProvider";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, cn } from "@/lib/utils";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/lib/trpc/_app";

type CartItem = NonNullable<
  inferRouterOutputs<AppRouter>["cart"]["getCart"]
>["items"][number];

export function CartSlider() {
  const { isOpen, closeCart } = useCartSlider();
  const sliderRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const utils = api.useUtils();

  const { data: cartData, isLoading } = api.cart.getCart.useQuery();

  const updateItemMutation = api.cart.updateItemQuantity.useMutation({
    async onMutate(variables) {
      await utils.cart.getCart.cancel();
      const previousCart = utils.cart.getCart.getData();
      utils.cart.getCart.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) =>
            item.productId === variables.productId
              ? { ...item, quantity: variables.quantity }
              : item
          ),
        };
      });
      return { previousCart };
    },
    onError: (err, _, context) => {
      utils.cart.getCart.setData(undefined, context?.previousCart);
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      utils.cart.getCart.invalidate();
    },
  });

  const removeItemMutation = api.cart.removeItem.useMutation({
    async onMutate(variables) {
      await utils.cart.getCart.cancel();
      const previousCart = utils.cart.getCart.getData();
      utils.cart.getCart.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter(
            (item) => item.productId !== variables.productId
          ),
        };
      });
      return { previousCart };
    },
    onError: (err, _, context) => {
      utils.cart.getCart.setData(undefined, context?.previousCart);
      toast({
        title: "Removal Failed",
        description: err.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      utils.cart.getCart.invalidate();
    },
  });

  const isMutating =
    updateItemMutation.isPending || removeItemMutation.isPending;

  useGSAP(
    () => {
      gsap.set(sliderRef.current, { xPercent: 100 });
    },
    { scope: sliderRef }
  );

  useEffect(() => {
    if (isOpen) {
      gsap.to(sliderRef.current, {
        xPercent: 0,
        duration: 0.5,
        ease: "power3.out",
      });
      document.body.style.overflow = "hidden";
    } else {
      gsap.to(sliderRef.current, {
        xPercent: 100,
        duration: 0.5,
        ease: "power3.in",
      });
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const subtotal = useMemo(() => {
    return (
      cartData?.items.reduce(
        (acc, item) => acc + Number(item.product.unitPrice) * item.quantity,
        0
      ) ?? 0
    );
  }, [cartData]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeCart}
      />
      <div
        ref={sliderRef}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-background border-l z-50 flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center">
            <ShoppingCart className="w-6 h-6 mr-3" /> Your Cart
          </h2>
          <Button variant="ghost" size="icon" onClick={closeCart}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {isLoading && (
          <div className="flex-grow flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && (!cartData || cartData.items.length === 0) && (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
            <ShoppingCart className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground">
              Add some products to get started!
            </p>
          </div>
        )}

        {cartData && cartData.items.length > 0 && (
          <div className="flex-grow overflow-y-auto p-6">
            <div className="space-y-4 divide-y">
              {cartData.items.map((item: CartItem) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-4 pt-4 first:pt-0"
                >
                  <img
                    src={item.product.imageUrls[0] || "/placeholder.svg"}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-md object-cover"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(Number(item.product.unitPrice))}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateItemMutation.mutate({
                            productId: item.productId,
                            quantity: item.quantity - 1,
                          })
                        }
                        disabled={item.quantity <= 1 || isMutating}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateItemMutation.mutate({
                            productId: item.productId,
                            quantity: item.quantity + 1,
                          })
                        }
                        disabled={isMutating}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(
                        Number(item.product.unitPrice) * item.quantity
                      )}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        removeItemMutation.mutate({ productId: item.productId })
                      }
                      disabled={isMutating}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 border-t mt-auto bg-muted/30">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Delivery fees and taxes calculated at checkout.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="w-full"
            disabled={!cartData || cartData.items.length === 0}
          >
            <Link href="/checkout">
              Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
