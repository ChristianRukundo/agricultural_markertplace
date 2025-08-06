"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "./SectionHeader";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/lib/trpc/_app";

gsap.registerPlugin(ScrollTrigger);

type RouterOutput = inferRouterOutputs<AppRouter>;
type Product = RouterOutput["product"]["getProducts"]["products"][number];

interface FeaturedProductCardProps {  
  product: Product;
}

function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

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
    <div ref={cardRef} className="group animate-item h-full">
      <Card className="overflow-hidden h-full flex flex-col">
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
          <div className="absolute top-4 left-4">
            <Badge variant="secondary">{product.category.name}</Badge>
          </div>
        </div>
        <div className="p-6 flex-grow flex flex-col">
          <h3 className="text-xl font-bold mb-2 flex-grow">{product.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <div className="w-6 h-6 rounded-full bg-muted overflow-hidden">
              <img
                src={
                  product.farmer.profile?.profilePictureUrl ||
                  "/placeholder.svg?height=24&width=24&query=farmer-avatar"
                }
                alt={product.farmer.profile?.name || "Farmer"}
                className="w-full h-full object-cover"
              />
            </div>
            <span>{product.farmer.profile?.name || "Verified Farmer"}</span>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <div>
              <p className="text-xs text-muted-foreground">Price per unit</p>
              <p className="text-2xl font-bold text-primary">
                RWF {Number(product.unitPrice).toLocaleString()}
              </p>
            </div>
            <Button asChild size="sm">
              <Link href={`/products/${product.id}`}>
                View <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function FeaturedProducts() {
  const { data: productsData, isLoading: productsLoading } =
    api.product.getProducts.useQuery({
      page: 1,
      limit: 4,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

  if (productsLoading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={
              <>
                Fresh Off the <span className="gradient-text">Farm</span>
              </>
            }
            subtitle="Explore our latest and most popular products, sourced directly from the heart of Rwanda's farms."
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Card className="h-full">
                  <div className="animate-pulse">
                    <div className="aspect-[4/3] bg-muted/80 rounded-t-lg"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="flex justify-between items-end">
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded w-16"></div>
                          <div className="h-8 bg-muted rounded w-24"></div>
                        </div>
                        <div className="h-9 w-24 bg-muted rounded-md"></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!productsData || productsData.products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 animated-section">
      <div className="container mx-auto px-4">
        <SectionHeader
          title={
            <>
              Fresh Off the <span className="gradient-text">Farm</span>
            </>
          }
          subtitle="Explore our latest and most popular products, sourced directly from the heart of Rwanda's farms."
          className="animate-item"
        />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {productsData.products.map((product) => (
            <FeaturedProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-12 text-center animate-item">
          <Button asChild size="lg" variant="outline">
            <Link href="/products">
              Explore All Products <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
