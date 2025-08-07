"use client";

import React, { useMemo, useRef, useEffect, Suspense } from "react";
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
  Package,
  Heart,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useCartSlider } from "./CartSliderProvider";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, cn } from "@/lib/utils";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/lib/trpc/_app";

type CartItemType = NonNullable<
  inferRouterOutputs<AppRouter>["cart"]["getCart"]
>["items"][number];

type SavedProductType = NonNullable<
  inferRouterOutputs<AppRouter>["savedProduct"]["getAll"]
>[number];

interface CartItemDisplayProps {
  item: CartItemType;
  isMutating: boolean;
  onUpdate: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

function CartItemDisplay({
  item,
  isMutating,
  onUpdate,
  onRemove,
}: CartItemDisplayProps) {
  const itemTotal = Number(item.product.unitPrice) * item.quantity;
  const quantityAvailable = Number(item.product.quantityAvailable);
  const isAvailable = item.product.status === "ACTIVE" && quantityAvailable > 0;
  const isLowStock = isAvailable && item.quantity > quantityAvailable;
  const itemRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      itemRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
  }, [item.quantity, item.id]);

  return (
    <div
      ref={itemRef}
      className="flex items-start space-x-4 py-4 relative group"
    >
      {isMutating && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 transition-opacity opacity-100">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
        <img
          src={item.product.imageUrls[0] || "/placeholder.svg"}
          alt={item.product.name}
          className="w-full h-full object-cover"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-semibold px-2 py-1 bg-red-500 rounded-md">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="flex-grow min-w-0">
        <h3 className="font-semibold text-base truncate pr-10">
          {item.product.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {formatPrice(Number(item.product.unitPrice))} / unit
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {item.product.farmer?.profile?.name
            ? `From: ${item.product.farmer.profile.name}`
            : "Farmer Info N/A"}
        </p>

        <div className="flex items-center space-x-3 mt-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdate(item.productId, item.quantity - 1)}
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
            onClick={() => onUpdate(item.productId, item.quantity + 1)}
            disabled={
              !isAvailable || item.quantity >= quantityAvailable || isMutating
            }
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {isLowStock && (
          <p className="text-xs text-orange-500 mt-2 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Only {quantityAvailable} units available. Adjust quantity.
          </p>
        )}
      </div>

      <div className="text-right flex flex-col justify-between items-end h-full">
        <p className="font-bold text-lg">{formatPrice(itemTotal)}</p>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onRemove(item.productId)}
          disabled={isMutating}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function CartSlider() {
  const { isOpen, closeCart } = useCartSlider();
  const sliderRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const utils = api.useUtils();
  const { data: session } = useSession();

  const {
    data: cartData,
    isLoading: isCartLoading,
    error: cartError,
  } = api.cart.getCart.useQuery(undefined, {
    enabled: session?.user?.role === "SELLER",
  });

  const { data: savedProductsData, isLoading: isSavedProductsLoading } =
    api.savedProduct.getAll.useQuery(undefined, {
      enabled: session?.user?.role === "SELLER",
    });

  const updateItemMutation = api.cart.updateItemQuantity.useMutation({
    async onMutate(variables) {
      if (session?.user?.role !== "SELLER") {
        toast({
          title: "Access Denied",
          description: "You must be a seller to modify cart.",
          variant: "destructive",
        });
        throw new Error("Access Denied");
      }

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
      if (session?.user?.role !== "SELLER") {
        toast({
          title: "Access Denied",
          description: "You must be a seller to modify cart.",
          variant: "destructive",
        });
        throw new Error("Access Denied");
      }

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
        onComplete: () => {
          if (!isOpen) {
            document.body.style.overflow = "auto";
          }
        },
      });
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

  const deliveryFee = 5000;
  const total = subtotal + deliveryFee;

  const isMutatingAnyItem =
    updateItemMutation.isPending || removeItemMutation.isPending;

  const renderCartContent = () => {
    if (!session || session.user.role !== "SELLER") {
      return (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
          <ShoppingCart className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold">Access Denied</h3>
          <p className="text-muted-foreground">
            Only sellers can view the cart. Please log in as a seller or
            register.
          </p>
          <Button asChild className="mt-4">
            <Link href="/auth/login" onClick={closeCart}>
              Login / Register
            </Link>
          </Button>
        </div>
      );
    }

    if (isCartLoading) {
      return (
        <div className="flex-grow flex flex-col items-center justify-center p-8">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      );
    }

    if (cartError) {
      return (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-red-500">
          <AlertTriangle className="w-16 h-16 mb-4" />
          <h3 className="text-xl font-semibold">Error Loading Cart</h3>
          <p className="text-sm">{cartError.message}</p>
          <Button
            onClick={() => utils.cart.getCart.invalidate()}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      );
    }

    if (!cartData || cartData.items.length === 0) {
      return (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
          <ShoppingCart className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold">Your cart is empty</h3>
          <p className="text-muted-foreground">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button asChild className="mt-6 text-lg px-6 py-3">
            <Link href="/products" onClick={closeCart}>
              Start Shopping
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className="flex-grow overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
          <div className="space-y-4 divide-y divide-border">
            {cartData.items.map((item: CartItemType) => (
              <CartItemDisplay
                key={item.id}
                item={item}
                isMutating={isMutatingAnyItem}
                onUpdate={(productId, quantity) =>
                  updateItemMutation.mutate({ productId, quantity })
                }
                onRemove={(productId) =>
                  removeItemMutation.mutate({ productId })
                }
              />
            ))}
          </div>

          {session?.user?.role === "SELLER" && (
            <Card className="mt-8 border-dashed border-2 bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  You might also like
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                {isSavedProductsLoading ? (
                  <div className="flex flex-col space-y-2">
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-3 animate-pulse"
                      >
                        <div className="w-10 h-10 bg-muted rounded"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : savedProductsData && savedProductsData.length > 0 ? (
                  savedProductsData
                    .slice(0, 3)
                    .map((savedItem: SavedProductType) => (
                      <Link
                        key={savedItem.id}
                        href={`/products/${savedItem.productId}`}
                        onClick={closeCart}
                        className="flex items-center space-x-3 hover:bg-accent/50 p-2 rounded-md transition-colors group"
                      >
                        <img
                          src={
                            savedItem.product.imageUrls[0] || "/placeholder.svg"
                          }
                          alt={savedItem.product.name}
                          className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium group-hover:text-primary line-clamp-1">
                            {savedItem.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(Number(savedItem.product.unitPrice))}
                          </p>
                        </div>
                      </Link>
                    ))
                ) : (
                  <p className="text-center text-xs text-muted-foreground">
                    No saved items to suggest.
                  </p>
                )}
                {savedProductsData && savedProductsData.length > 3 && (
                  <p
                    className="text-center text-sm text-primary hover:underline cursor-pointer"
                    onClick={closeCart}
                  >
                    <Link href="/profile?tab=saved-products">
                      View all saved products
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="p-6 border-t mt-auto bg-muted/30 shadow-inner">
          <div className="space-y-3 mb-5">
            <div className="flex justify-between font-medium text-lg">
              <span>Subtotal ({cartData?.items.length} items)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Estimated Delivery Fee</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-700 rounded-lg text-sm flex items-start space-x-2 mt-4">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Delivery fees are estimates and will be finalized at checkout
                based on your address and farmer's location.
              </p>
            </div>
          </div>
          <Button
            asChild
            size="lg"
            className="w-full bg-gradient-primary text-white text-lg py-3"
            disabled={
              !cartData || cartData.items.length === 0 || isMutatingAnyItem
            }
          >
            <Link href="/checkout" onClick={closeCart}>
              Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-muted-foreground hover:text-foreground"
            onClick={closeCart}
          >
            Continue Shopping
          </Button>
        </div>
      </>
    );
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto z-40"
            : "opacity-0 pointer-events-none z-0"
        )}
        onClick={closeCart}
      />
      {/* Slider Panel */}
      <div
        ref={sliderRef}
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border flex flex-col shadow-2xl"
        )}
        style={{ zIndex: isOpen ? 50 : -1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border/70 bg-card/90 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-2xl font-bold flex items-center">
            <ShoppingCart className="w-7 h-7 mr-3 text-primary" /> Your Shopping
            Cart
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeCart}
            className="hover:bg-accent/50"
          >
            <X className="w-6 h-6 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>

        <Suspense
          fallback={
            <div className="flex-grow flex flex-col items-center justify-center p-8">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Preparing your cart...</p>
            </div>
          }
        >
          {renderCartContent()}
        </Suspense>
      </div>
    </>
  );
}
