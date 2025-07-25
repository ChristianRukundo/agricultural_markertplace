"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Package,
  Calendar,
  Award,
  MessageCircle,
  Share2,
  Heart,
  Filter,
  Grid,
  List,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { FadeIn } from "@/components/animations/fade-in";
import { SlideInOnScroll } from "@/components/animations/slide-in-on-scroll";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

export default function FarmerProfilePage() {
  const params = useParams();
  const farmerId = params.farmerId as string;
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"products" | "reviews" | "about">(
    "products"
  );
  const [productViewMode, setProductViewMode] = useState<"grid" | "list">(
    "grid"
  );
  const [productFilter, setProductFilter] = useState<"all" | "available">(
    "all"
  );
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch farmer profile
  const { data: farmer, isLoading } = api.user.getFarmerProfile.useQuery({
    id: farmerId,
  });

  // Fetch farmer's products
  const productQueryInput: any = { farmerId, limit: 12 };
  if (productFilter === "available") productQueryInput.status = "ACTIVE";
  const { data: productsData } =
    api.product.getProducts.useQuery(productQueryInput);

  // Fetch farmer reviews
  const { data: reviewsData } = api.review.getReviews.useQuery({
    reviewedEntityId: farmerId,
    reviewedEntityType: "FARMER",
    page: 1,
    limit: 10,
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

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    addReviewMutation.mutate({
      reviewedEntityId: farmerId,
      reviewedEntityType: "FARMER",
      rating: reviewRating,
      comment: reviewText,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg"></div>
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Farmer Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The farmer profile you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href="/farmers">Browse Farmers</Link>
          </Button>
        </div>
      </div>
    );
  }

  const location = farmer.profile?.location
    ? JSON.parse(farmer.profile.location)
    : null;
  const specializations = farmer.profile?.specializations
    ? JSON.parse(farmer.profile.specializations)
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
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
              href="/farmers"
              className="text-muted-foreground hover:text-foreground"
            >
              Farmers
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">
              {farmer.profile?.name || "Farmer Profile"}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Farmer Profile Sidebar */}
          <FadeIn>
            <div className="space-y-6">
              {/* Profile Card */}
              <Card className="glassmorphism">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    {/* Avatar */}
                    <div className="relative inline-block mb-4">
                      <div className="w-32 h-32 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-4xl">
                          {farmer.profile?.name?.charAt(0) || "F"}
                        </span>
                      </div>

                      {/* Verification Badge */}
                      <div className="absolute -bottom-2 -right-2">
                        <Badge className="bg-green-500 text-white">
                          <Award className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    </div>

                    <h1 className="text-2xl font-bold mb-2">
                      {farmer.profile?.name || "Unknown Farmer"}
                    </h1>

                    {/* Rating */}
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <StarRating rating={farmer.averageRating || 0} readonly />
                     <span className="text-sm text-muted-foreground">({farmer._count.receivedReviews || 0} reviews)</span>

                    </div>

                    {/* Location */}
                    {location && (
                      <div className="flex items-center justify-center text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>
                          {location.district}, {location.sector}
                        </span>
                      </div>
                    )}

                    {/* Member Since */}
                    <div className="flex items-center justify-center text-muted-foreground mb-6">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        Member since{" "}
                        {new Date(farmer.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button
                        className="w-full bg-gradient-primary text-white"
                        onClick={() => setIsFollowing(!isFollowing)}
                      >
                        <Heart
                          className={cn(
                            "w-4 h-4 mr-2",
                            isFollowing && "fill-current"
                          )}
                        />
                        {isFollowing ? "Following" : "Follow Farmer"}
                      </Button>

                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="text-lg">Farmer Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Products</span>
                    <span className="font-bold text-primary">
                      {farmer._count?.products || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Orders Completed
                    </span>
                    <span className="font-bold text-primary">
                      {farmer._count?.orders || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Response Rate</span>
                    <span className="font-bold text-primary">98%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Avg. Response Time
                    </span>
                    <span className="font-bold text-primary">2 hours</span>
                  </div>
                </CardContent>
              </Card>

              {/* Specializations */}
              {specializations.length > 0 && (
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="text-lg">Specializations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {specializations.map((spec: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Info */}
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {farmer.profile?.contactPhone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {farmer.profile.contactPhone}
                      </span>
                    </div>
                  )}
                  {farmer.profile?.contactEmail && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {farmer.profile.contactEmail}
                      </span>
                    </div>
                  )}
                  {location && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm">
                        <div>{location.district} District</div>
                        <div className="text-muted-foreground">
                          {location.sector} Sector
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </FadeIn>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <SlideInOnScroll direction="right">
              <Card className="glassmorphism">
                <CardContent className="p-4">
                  <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
                    {[
                      {
                        key: "products",
                        label: `Products (${farmer._count?.products || 0})`,
                      },
                      {
                        key: "reviews",
                        label: `Reviews (${farmer._count.receivedReviews || 0})` 
                      },
                      { key: "about", label: "About" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() =>
                          setActiveTab(tab.key as typeof activeTab)
                        }
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
                </CardContent>
              </Card>
            </SlideInOnScroll>

            {/* Tab Content */}
            <SlideInOnScroll direction="right" delay={0.1}>
              {activeTab === "products" && (
                <div className="space-y-6">
                  {/* Products Header */}
                  <Card className="glassmorphism">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Filter className="w-4 h-4 text-muted-foreground" />
                          <div className="flex space-x-2">
                            {["all", "available"].map((filter) => (
                              <Button
                                key={filter}
                                variant={
                                  productFilter === filter ? "default" : "ghost"
                                }
                                size="sm"
                                onClick={() =>
                                  setProductFilter(
                                    filter as typeof productFilter
                                  )
                                }
                              >
                                {filter.charAt(0).toUpperCase() +
                                  filter.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="flex border rounded-md">
                          <Button
                            variant={
                              productViewMode === "grid" ? "default" : "ghost"
                            }
                            size="sm"
                            onClick={() => setProductViewMode("grid")}
                            className="rounded-r-none"
                          >
                            <Grid className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={
                              productViewMode === "list" ? "default" : "ghost"
                            }
                            size="sm"
                            onClick={() => setProductViewMode("list")}
                            className="rounded-l-none"
                          >
                            <List className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Products Grid */}
                  {productsData?.products &&
                  productsData.products.length > 0 ? (
                    <div
                      className={cn(
                        "grid gap-6",
                        productViewMode === "grid"
                          ? "grid-cols-1 md:grid-cols-2"
                          : "grid-cols-1"
                      )}
                    >
                      {productsData.products.map((product) => (
                        <Card
                          key={product.id}
                          className="glassmorphism hover:scale-105 transition-transform"
                        >
                          <CardContent className="p-4">
                            <div
                              className={cn(
                                "flex gap-4",
                                productViewMode === "grid"
                                  ? "flex-col"
                                  : "flex-row"
                              )}
                            >
                              {/* Product Image */}
                              <div
                                className={cn(
                                  "bg-muted rounded-lg overflow-hidden relative",
                                  productViewMode === "grid"
                                    ? "aspect-square"
                                    : "w-32 h-32 flex-shrink-0"
                                )}
                              >
                                <img
                                  src={
                                    product.imageUrls[0] || "/placeholder.svg"
                                  }
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />

                                {/* Badges */}
                                <div className="absolute top-2 left-2 space-y-1">
                                  {product.status === "ACTIVE" && (
                                    <Badge className="bg-blue-500 text-white text-xs">
                                      Available
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Product Info */}
                              <div className="flex-1 space-y-2">
                                <div>
                                  <h3 className="font-semibold line-clamp-2">
                                    {product.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {product.description}
                                  </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <StarRating
                                    rating={product._count.reviews}
                                    readonly
                                    size="sm"
                                  />
                                  <Badge variant="outline" className="text-xs">
                                    {product.category.name}
                                  </Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-lg font-bold text-primary">
                                      RWF{" "}
                                      {Number(
                                        product.unitPrice
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  <Button size="sm" asChild>
                                    <Link href={`/products/${product.id}`}>
                                      View Details
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="glassmorphism">
                      <CardContent className="p-12 text-center">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No Products Found
                        </h3>
                        <p className="text-muted-foreground">
                          This farmer hasn't listed any products yet.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {/* Review Summary */}
                  <Card className="glassmorphism">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-3xl font-bold">
                              {farmer.averageRating?.toFixed(1) || "0.0"}
                            </span>
                            <StarRating
                              rating={farmer.averageRating || 0}
                              readonly
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({farmer._count.receivedReviews || 0} reviews)
                          </span>
                          <p className="text-muted-foreground">
  Based on {farmer._count.receivedReviews || 0} reviews
</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Add Review Form */}
                  <Card className="glassmorphism">
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
                            placeholder="Share your experience with this farmer..."
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
                    {reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
                      reviewsData.reviews.map((review) => (
                        <Card key={review.id} className="glassmorphism">
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
                                    {review.reviewer.profile?.name ||
                                      "Anonymous"}
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
                      ))
                    ) : (
                      <Card className="glassmorphism">
                        <CardContent className="p-12 text-center">
                          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            No Reviews Yet
                          </h3>
                          <p className="text-muted-foreground">
                            Be the first to review this farmer!
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "about" && (
                <Card className="glassmorphism">
                  <CardContent className="p-6 space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        About {farmer.profile?.name}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {farmer.profile?.description ||
                          "This farmer hasn't provided a description yet."}
                      </p>
                    </div>

                    {/* Farming Experience */}
                    <div>
                      <h4 className="font-medium mb-3">Farming Experience</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium">Experience</div>
                            <div className="text-sm text-muted-foreground">
                              {farmer.profile?.createdAt
                                ? Math.floor(
                                    (Date.now() -
                                      new Date(
                                        farmer.profile.createdAt
                                      ).getTime()) /
                                      (1000 * 60 * 60 * 24 * 365)
                                  )
                                : 0}{" "}
                              years
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium">Success Rate</div>
                            <div className="text-sm text-muted-foreground">
                              98%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certifications */}
                    <div>
                      <h4 className="font-medium mb-3">
                        Certifications & Awards
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-green-600" />
                          <span className="text-sm">
                            Verified Organic Farmer
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">
                            Quality Assurance Certified
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-purple-600" />
                          <span className="text-sm">
                            Sustainable Farming Practices
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Business Hours */}
                    <div>
                      <h4 className="font-medium mb-3">Business Hours</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Monday - Friday:</span>
                          <span>6:00 AM - 6:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Saturday:</span>
                          <span>6:00 AM - 4:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sunday:</span>
                          <span>8:00 AM - 2:00 PM</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </SlideInOnScroll>
          </div>
        </div>
      </div>
    </div>
  );
}
