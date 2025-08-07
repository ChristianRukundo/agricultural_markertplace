"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  MessageCircle,
  MapPin,
  Calendar,
  Package,
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { FadeIn } from "@/components/animations/fade-in";
import { SlideInOnScroll } from "@/components/animations/slide-in-on-scroll";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  const { toast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "description" | "reviews" | "farmer"
  >("description");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  const {
    data: product,
    isLoading,
    error,
    refetch: refetchProduct,
  } = api.product.getById.useQuery({ id: productId });

  const { data: farmerData } = api.user.getFarmerProfile.useQuery(
    { id: product?.farmer.profile.user.id ?? "" },
    { enabled: !!product?.farmer.profile.user.id }
  );

  const { data: relatedProductsData } = api.product.getProducts.useQuery(
    {
      limit: 5,
      categoryId: product?.categoryId,
    },
    { enabled: !!product?.categoryId }
  );

  const relatedProducts = useMemo(() => {
    if (!relatedProductsData) return [];
    return relatedProductsData.products
      .filter((p) => p.id !== productId)
      .slice(0, 4);
  }, [relatedProductsData, productId]);

  const addToCartMutation = api.cart.addItem.useMutation({
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: `${quantity}kg of ${product?.name} added to your cart.`,
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to Add to Cart",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const addReviewMutation = api.review.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Review Added",
        description: "Thank you for your feedback!",
      });
      setReviewText("");
      setReviewRating(5);
      refetchProduct();
    },
    onError: (err) => {
      toast({
        title: "Failed to Add Review",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!product) return;
    addToCartMutation.mutate({
      productId: product.id,
      quantity,
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    addReviewMutation.mutate({
      reviewedEntityId: productId,
      reviewedEntityType: "PRODUCT",
      rating: reviewRating,
      comment: reviewText,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The product you&apos;re looking for doesn&apos;t exist or could not
            be loaded.
          </p>
          <Button onClick={() => router.push("/products")}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  const productImages =
    product.imageUrls.length > 0 ? product.imageUrls : ["/placeholder.svg"];
  const productUnit = "kg";

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground"
            >
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link
              href="/products"
              className="text-muted-foreground hover:text-foreground"
            >
              Products
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <FadeIn>
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted relative group">
                <Image
                  src={productImages[selectedImageIndex]!}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {productImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={() =>
                        setSelectedImageIndex((p) =>
                          p === 0 ? productImages.length - 1 : p - 1
                        )
                      }
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={() =>
                        setSelectedImageIndex((p) =>
                          p === productImages.length - 1 ? 0 : p + 1
                        )
                      }
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <div className="absolute top-4 left-4">
                  {product.status === "ACTIVE" && (
                    <Badge className="bg-blue-500 text-white">
                      <Package className="w-3 h-3 mr-1" />
                      In Stock
                    </Badge>
                  )}
                </div>
              </div>
              {productImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto p-1">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors relative",
                        selectedImageIndex === index
                          ? "border-primary"
                          : "border-transparent hover:border-muted-foreground"
                      )}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>

          <SlideInOnScroll direction="right">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <StarRating
                      rating={product.averageRating}
                      readonly
                      size="sm"
                    />
                    <span className="text-sm text-muted-foreground">
                      ({product._count.reviews} reviews)
                    </span>
                  </div>
                  <Badge variant="outline">{product.category.name}</Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-primary">
                    RWF {Number(product.unitPrice).toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    per {productUnit}
                  </span>
                </div>
                {product.minimumOrderQuantity && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Minimum order: {product.minimumOrderQuantity} {productUnit}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Available:</span>{" "}
                    {product.quantityAvailable.toString()} {productUnit}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Available from:</span>{" "}
                    {new Date(product.availabilityDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Location:</span>{" "}
                    {JSON.parse(product.farmer.profile.location || "{}")
                      .district || "N/A"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Quantity ({productUnit})
                  </label>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setQuantity(
                          Math.max(product.minimumOrderQuantity, quantity - 1)
                        )
                      }
                      disabled={quantity <= product.minimumOrderQuantity}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-16 text-center font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setQuantity(
                          Math.min(
                            Number(product.quantityAvailable),
                            quantity + 1
                          )
                        )
                      }
                      disabled={quantity >= Number(product.quantityAvailable)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Price:</span>
                    <span className="text-xl font-bold text-primary">
                      RWF{" "}
                      {(Number(product.unitPrice) * quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-gradient-primary text-white"
                  onClick={handleAddToCart}
                  disabled={
                    addToCartMutation.isPending ||
                    product.status !== "ACTIVE" ||
                    quantity > Number(product.quantityAvailable)
                  }
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="lg" asChild>
                    <Link href={`/farmers/${product.farmer.profile.user.id}`}>
                      <Users className="w-4 h-4 mr-2" />
                      View Farmer
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </div>
            </div>
          </SlideInOnScroll>
        </div>

        <SlideInOnScroll>
          <Card className="glassmorphism mb-16">
            <CardHeader>
              <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
                <button
                  onClick={() => setActiveTab("description")}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    activeTab === "description"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    activeTab === "reviews"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Reviews ({product._count.reviews})
                </button>
                <button
                  onClick={() => setActiveTab("farmer")}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    activeTab === "farmer"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  About Farmer
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === "description" && (
                <div className="prose dark:prose-invert max-w-none">
                  <p>{product.description}</p>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-6">
                    <div>
                      <dt className="font-medium text-foreground">Category</dt>
                      <dd className="text-muted-foreground">
                        {product.category.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">
                        Available Quantity
                      </dt>
                      <dd className="text-muted-foreground">
                        {product.quantityAvailable.toString()} {productUnit}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">
                        Minimum Order
                      </dt>
                      <dd className="text-muted-foreground">
                        {product.minimumOrderQuantity} {productUnit}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">
                        Available From
                      </dt>
                      <dd className="text-muted-foreground">
                        {new Date(
                          product.availabilityDate
                        ).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
              {activeTab === "reviews" && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    {product.reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-medium">
                                {review.reviewer.profile?.name?.charAt(0) ||
                                  "A"}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">
                                  {review.reviewer.profile?.name || "Anonymous"}
                                </h4>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(
                                    review.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <StarRating
                                rating={review.rating}
                                readonly
                                size="sm"
                                className="mb-2"
                              />
                              <p className="text-muted-foreground">
                                {review.comment}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {product.reviews.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">
                        No reviews for this product yet.
                      </p>
                    )}
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Write a Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Rating
                          </label>
                          <StarRating
                            rating={reviewRating}
                            onRatingChange={setReviewRating}
                            size="lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Your Review
                          </label>
                          <Textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Share your experience..."
                            rows={4}
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={
                            addReviewMutation.isPending || !reviewText.trim()
                          }
                        >
                          {addReviewMutation.isPending
                            ? "Submitting..."
                            : "Submit Review"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}
              {activeTab === "farmer" && farmerData && (
                <div className="flex items-start space-x-6">
                  <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-2xl">
                      {farmerData.profile?.name?.charAt(0) || "F"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">
                      {farmerData.profile?.name}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {farmerData.profile?.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Products:
                        </span>
                        <span className="ml-2 font-medium">
                          {farmerData._count.products}
                        </span>
                      </div>
                      <div className="inline-flex items-center">
                        <span className="text-sm text-muted-foreground">
                          Rating:
                        </span>
                        <div className="ml-2 inline-flex items-center space-x-1">
                          <StarRating
                            rating={farmerData.averageRating}
                            readonly
                            size="sm"
                          />
                          <span className="text-sm">
                            ({farmerData._count.receivedReviews})
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={`/farmers/${product.farmer.profile.user.id}`}>
                        View Full Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </SlideInOnScroll>

        {relatedProducts && relatedProducts.length > 0 && (
          <SlideInOnScroll>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Related Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((rp) => (
                  <Card
                    key={rp.id}
                    className="glassmorphism hover:scale-105 transition-transform duration-300"
                  >
                    <CardContent className="p-4">
                      <Link href={`/products/${rp.id}`} className="block">
                        <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden relative">
                          <Image
                            src={rp.imageUrls[0] || "/placeholder.svg"}
                            alt={rp.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h3 className="font-semibold mb-2 line-clamp-2 h-12">
                          {rp.name}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">
                          RWF {Number(rp.unitPrice).toLocaleString()}
                        </span>
                        <Button size="sm" asChild>
                          <Link href={`/products/${rp.id}`}>View</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </SlideInOnScroll>
        )}
      </div>
    </div>
  );
}
