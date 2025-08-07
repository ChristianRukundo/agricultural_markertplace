"use client";

import { Search } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Card } from "@/components/ui/Card";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/lib/trpc/_app";

type ProductsData = inferRouterOutputs<AppRouter>["product"]["getProducts"];

interface ProductGridProps {
  productsData: ProductsData | undefined;
  isLoading: boolean;
}

export function ProductGrid({ productsData, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(12)].map((_, i) => (
          <Card key={i} className="h-full">
            <div className="animate-pulse">
              <div className="aspect-[4/3] bg-muted/80 rounded-t-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-24"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!productsData || productsData.products.length === 0) {
    return (
      <div className="text-center py-20 col-span-full">
        <Search className="mx-auto w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-2xl font-bold">No Products Found</h3>
        <p className="text-muted-foreground mt-2">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {productsData.products.map((product) => (
        <ProductCard viewMode="grid" key={product.id} product={product} />
      ))}
    </div>
  );
}
