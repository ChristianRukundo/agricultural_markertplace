"use client";

import type React from "react";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Heart,
  Share2,
  ShoppingCart,
  MessageCircle,
  MapPin,
  Calendar,
  Package,
  Truck,
  Shield,
  Award,
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
  const productId = params.productId as string;
  const { toast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "description" | "reviews" | "farmer"
  >("description");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Fetch product details
  const { data: product, isLoading } = api.product.getById.useQuery({
    id: productId,
  });

  // Fetch product reviews
  const { data: reviewsData } = api.review.getReviews.useQuery({
    reviewedEntityId: productId,
    reviewedEntityType: "PRODUCT",
    page: 1,
    limit: 10,
  });

  // Fetch related products
  const relatedProductsQueryInput: any = { limit: 4 };
  if (product?.category?.id)
    relatedProductsQueryInput.categoryId = product.category.id;
  if (productId) relatedProductsQueryInput.excludeId = productId;
  const { data: relatedProducts } = api.product.getProducts.useQuery(
    relatedProductsQueryInput,
    { enabled: !!product?.category?.id }
  );

  // Add to cart mutation
  const addToCartMutation = api.cart.addItem.useMutation({
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: `${quantity} ${product?.unit} of ${product?.name} added to your cart.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add review mutation
  const addReviewMutation = api.review.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Review Added",
        description: "Thank you for your feedback!",
      });
      setReviewText("");
      setReviewRating(5);
    },
  });

  const handleAddToCart = () => {
    if (!product) return;
    addToCartMutation.mutate({
      productId: product.id,
      quantity,
      pricePerUnit: product.pricePerUnit,
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

  const productImages = product?.images
    ? JSON.parse(product.images)
    : ["/placeholder.svg?height=600&width=600&text=Product+Image"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-16 bg-muted rounded"></div>
                <div className="h-12 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The product you're looking for doesn't exist.
          </p>
          <Button asChild>
            <a href="/products">Browse Products</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <a href="/" className="text-muted-foreground hover:text-foreground">
              Home
            </a>
            <span className="text-muted-foreground">/</span>
            <a
              href="/products"
              className="text-muted-foreground hover:text-foreground"
            >
              Products
            </a>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <FadeIn>
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted relative group">
                <img
                  src={productImages[selectedImageIndex] || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Image Navigation */}
                {productImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={() =>
                        setSelectedImageIndex((prev) =>
                          prev === 0 ? productImages.length - 1 : prev - 1
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
                        setSelectedImageIndex((prev) =>
                          prev === productImages.length - 1 ? 0 : prev + 1
                        )
                      }
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 space-y-2">
                  {product.isOrganic && (
                    <Badge className="bg-green-500 text-white">
                      <Award className="w-3 h-3 mr-1" />
                      Organic
                    </Badge>
                  )}
                  {product.availability === "IN_STOCK" && (
                    <Badge className="bg-blue-500 text-white">
                      <Package className="w-3 h-3 mr-1" />
                      In Stock
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 space-y-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-background/80 hover:bg-background"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                  >
                    <Heart
                      className={cn(
                        "w-4 h-4",
                        isWishlisted && "fill-red-500 text-red-500"
                      )}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-background/80 hover:bg-background"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {productImages.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                        selectedImageIndex === index
                          ? "border-primary"
                          : "border-muted"
                      )}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>

          {/* Product Info */}
          <SlideInOnScroll direction="right">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <StarRating
                      rating={product.averageRating || 0}
                      readonly
                      size="sm"
                    />
                    <span className="text-sm text-muted-foreground">
                      ({reviewsData?.pagination.total || 0} reviews)
                    </span>
                  </div>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-primary">
                    RWF {product.pricePerUnit.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    per {product.unit}
                  </span>
                </div>
                {product.minimumOrder && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Minimum order: {product.minimumOrder} {product.unit}
                  </p>
                )}
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Available:</span>{" "}
                    {product.quantityAvailable} {product.unit}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Harvest:</span>{" "}
                    {new Date(product.harvestDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Location:</span>{" "}
                    {JSON.parse(product.location || "{}").district || "Rwanda"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Delivery:</span> 2-3 days
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Quantity ({product.unit})
                  </label>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
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
                          Math.min(product.quantityAvailable, quantity + 1)
                        )
                      }
                      disabled={quantity >= product.quantityAvailable}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Price:</span>
                    <span className="text-xl font-bold text-primary">
                      RWF {(product.pricePerUnit * quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-gradient-primary text-white"
                  onClick={handleAddToCart}
                  disabled={
                    addToCartMutation.isPending ||
                    product.availability !== "IN_STOCK"
                  }
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="lg" asChild>
                    <a href={`/farmers/${product.farmerId}`}>
                      <Users className="w-4 h-4 mr-2" />
                      View Farmer
                    </a>
                  </Button>
                  <Button variant="outline" size="lg">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center space-x-6 pt-4 border-t">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Truck className="w-4 h-4" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Award className="w-4 h-4" />
                  <span>Quality Assured</span>
                </div>
              </div>
            </div>
          </SlideInOnScroll>
        </div>

        {/* Product Details Tabs */}
        <SlideInOnScroll>
          <Card className="glassmorphism mb-16">
            <CardHeader>
              <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
                {[
                  { key: "description", label: "Description" },
                  {
                    key: "reviews",
                    label: `Reviews (${reviewsData?.pagination.total || 0})`,
                  },
                  { key: "farmer", label: "About Farmer" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      activeTab === tab.key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === "description" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Product Details
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {product.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Specifications</h4>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Category:</dt>
                            <dd className="font-medium">{product.category}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Unit:</dt>
                            <dd className="font-medium">{product.unit}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Organic:</dt>
                            <dd className="font-medium">
                              {product.isOrganic ? "Yes" : "No"}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">
                              Harvest Date:
                            </dt>
                            <dd className="font-medium">
                              {new Date(
                                product.harvestDate
                              ).toLocaleDateString()}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Availability</h4>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Status:</dt>
                            <dd>
                              <Badge
                                className={
                                  product.availability === "IN_STOCK"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }
                              >
                                {product.availability.replace("_", " ")}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Quantity:</dt>
                            <dd className="font-medium">
                              {product.quantityAvailable} {product.unit}
                            </dd>
                          </div>
                          {product.minimumOrder && (
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">
                                Min. Order:
                              </dt>
                              <dd className="font-medium">
                                {product.minimumOrder} {product.unit}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {/* Review Summary */}
                  <div className="bg-muted/50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-3xl font-bold">
                            {product.averageRating?.toFixed(1) || "0.0"}
                          </span>
                          <StarRating
                            rating={product.averageRating || 0}
                            readonly
                          />
                        </div>
                        <p className="text-muted-foreground">
                          Based on {reviewsData?.pagination.total || 0} reviews
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Add Review Form */}
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
                            placeholder="Share your experience with this product..."
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

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviewsData?.reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {review.reviewer.profile?.name?.charAt(0) ||
                                  "U"}
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
                  </div>
                </div>
              )}

              {activeTab === "farmer" && (
                <div className="space-y-6">
                  <div className="flex items-start space-x-6">
                    <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {product.farmer?.profile?.name?.charAt(0) || "F"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">
                        {product.farmer?.profile?.name || "Unknown Farmer"}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {product.farmer?.profile?.description ||
                          "Dedicated farmer providing quality produce."}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-muted-foreground">
                            Products:
                          </span>
                          <span className="ml-2 font-medium">
                            {product.farmer?._count?.products || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">
                            Rating:
                          </span>
                          <div className="ml-2 inline-flex items-center space-x-1">
                            <StarRating
                              rating={product.farmer?.averageRating || 0}
                              readonly
                              size="sm"
                            />
                            <span className="text-sm">
                              ({product.farmer?._count?.receivedReviews || 0})
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button asChild>
                        <a href={`/farmers/${product.farmerId}`}>
                          View Full Profile
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </SlideInOnScroll>

        {/* Related Products */}
        {relatedProducts && relatedProducts.products.length > 0 && (
          <SlideInOnScroll>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Related Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.products.map((relatedProduct) => (
                  <Card
                    key={relatedProduct.id}
                    className="glassmorphism hover:scale-105 transition-transform"
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
                        <img
                          src={
                            relatedProduct.images
                              ? JSON.parse(relatedProduct.images)[0]
                              : "/placeholder.svg?height=200&width=200"
                          }
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-semibold mb-2 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">
                          RWF {relatedProduct.pricePerUnit.toLocaleString()}
                        </span>
                        <Button size="sm" asChild>
                          <a href={`/products/${relatedProduct.id}`}>View</a>
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
