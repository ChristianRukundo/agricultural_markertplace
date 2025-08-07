import { useRef } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/trpc/client";
import { SlideInOnScroll } from "../animations/slide-in-on-scroll";
import Link from "next/link";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Heart, Loader2, ShoppingCart } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Card } from "../ui/Card";
import { useSession } from "next-auth/react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/lib/trpc/_app";

type ProductType =
  inferRouterOutputs<AppRouter>["product"]["getProducts"]["products"][number];

interface ProductCardProps {
  product: ProductType;
  viewMode: "grid" | "list";
  delay?: number;
}

export function ProductCard({
  product,
  viewMode,
  delay = 0,
}: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const utils = api.useUtils();
  const { data: session } = useSession();

  const addToCartMutation = api.cart.addItem.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
      toast({
        title: "Added to Cart",
        description: `"${product.name}" has been added.`,
      });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const toggleSavedMutation = api.savedProduct.toggle.useMutation({
    onSuccess: (data) => {
      utils.savedProduct.getAll.invalidate();
      toast({
        title: "Saved Products",
        description: data.message,
      });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const { data: isProductSaved } = api.savedProduct.getAll.useQuery(undefined, {
    enabled: session?.user?.role === "SELLER",
    select: (data) =>
      data?.some((item) => item.productId === product.id) || false,
  });

  const productAvailable =
    product.status === "ACTIVE" && Number(product.quantityAvailable) > 0;

  return (
    <SlideInOnScroll key={product.id} direction="up" delay={delay}>
      <Card
        ref={cardRef}
        className={cn(
          "group overflow-hidden relative h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
          viewMode === "list" && "flex-row md:flex-row"
        )}
      >
        <div
          className={cn(
            "relative",
            viewMode === "grid"
              ? "aspect-[4/3] overflow-hidden"
              : "w-48 flex-shrink-0 aspect-[4/3] md:aspect-square"
          )}
        >
          <Image
            src={product.imageUrls[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
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
          {session?.user?.role === "SELLER" && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute top-3 right-3 z-20 rounded-full",
                isProductSaved
                  ? "text-red-500 fill-red-500"
                  : "text-white/70 hover:text-white"
              )}
              onClick={(e) => {
                e.stopPropagation();
                toggleSavedMutation.mutate({ productId: product.id });
              }}
              disabled={toggleSavedMutation.isPending}
            >
              <Heart className="w-5 h-5" />
            </Button>
          )}
        </div>
        <div
          className={cn(
            "p-4 flex-grow flex flex-col",
            viewMode === "list" && "flex-1"
          )}
        >
          <h3 className="font-bold text-lg mb-2 flex-grow transition-colors group-hover:text-primary">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Image
              src={
                product.farmer.profile?.profilePictureUrl || "/placeholder.svg"
              }
              alt={product.farmer.profile?.name || "Farmer"}
              width={24}
              height={24}
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
            {session?.user?.role === "SELLER" ? (
              <Button
                size="sm"
                className="relative z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCartMutation.mutate({
                    productId: product.id,
                    quantity:
                      product.minimumOrderQuantity > 0
                        ? product.minimumOrderQuantity
                        : 1,
                  });
                }}
                disabled={addToCartMutation.isPending || !productAvailable}
              >
                {addToCartMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : !productAvailable ? (
                  <span className="text-xs">Sold Out</span>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" /> Add
                  </>
                )}
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link href={`/products/${product.id}`}>View</Link>
              </Button>
            )}
          </div>
        </div>
      </Card>
    </SlideInOnScroll>
  );
}
