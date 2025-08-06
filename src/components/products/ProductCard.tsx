"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ShoppingCart, ArrowRight, MapPin } from "lucide-react";
import { useCartSlider } from "./CartSliderProvider";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/lib/trpc/_app";

type Product =
  inferRouterOutputs<AppRouter>["product"]["getProducts"]["products"][number];

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const { openCart } = useCartSlider();
  const { toast } = useToast();
  const utils = api.useUtils();

  const addToCartMutation = api.cart.addItem.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
      toast({
        title: "Added to Cart",
        description: `"${product.name}" has been added.`,
      });
      openCart();
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  useGSAP(
    () => {
      if (!cardRef.current || !imageRef.current) return;
      gsap.to(imageRef.current, {
        y: "-15%",
        ease: "none",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: cardRef }
  );

  return (
    <div ref={cardRef} className="group h-full">
      <Card className="overflow-hidden relative h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="aspect-[4/3] overflow-hidden relative">
          <div
            ref={imageRef}
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110"
            style={{
              backgroundImage: `url(${
                product.imageUrls[0] || "/placeholder.svg"
              })`,
              top: "-7.5%",
              bottom: "-7.5%",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <Link
            href={`/products/${product.id}`}
            className="absolute inset-0 z-10"
            aria-label={`View details for ${product.name}`}
          />
          <div className="absolute top-3 left-3 z-20">
            <Badge variant="secondary">{product.category.name}</Badge>
          </div>
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-bold text-lg mb-2 flex-grow transition-colors group-hover:text-primary">
            {product.name}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <img
              src={
                product.farmer.profile?.profilePictureUrl ||
                "/placeholder.svg?w=24&h=24"
              }
              alt={product.farmer.profile?.name || "Farmer"}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span>{product.farmer.profile?.name || "Verified Farmer"}</span>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <div>
              <p className="text-xs text-muted-foreground">per unit</p>
              <p className="text-xl font-bold text-primary">
                {formatPrice(Number(product.unitPrice))}
              </p>
            </div>
            <Button
              size="sm"
              className="relative z-20"
              onClick={(e) => {
                e.stopPropagation();
                addToCartMutation.mutate({
                  productId: product.id,
                  quantity: 1,
                });
              }}
              disabled={addToCartMutation.isPending}
            >
              <ShoppingCart className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
