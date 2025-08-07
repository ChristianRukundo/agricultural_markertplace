"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Star, Filter, Package, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/star-rating";
import { FadeIn } from "@/components/animations/fade-in";
import { SlideInOnScroll } from "@/components/animations/slide-in-on-scroll";
import { api } from "@/lib/trpc/client";
import { ReviewEntityType } from "@prisma/client";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/lib/trpc/_app";

type ReviewReceived = NonNullable<
  inferRouterOutputs<AppRouter>["review"]["getReviews"]
>["reviews"][number];
type ReviewGiven = NonNullable<
  inferRouterOutputs<AppRouter>["review"]["getMyReviews"]
>["reviews"][number];
type CombinedReview = ReviewReceived | ReviewGiven;

type FilterType = "ALL" | ReviewEntityType;

export default function ReviewsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"received" | "given">("received");
  const [filter, setFilter] = useState<FilterType>("ALL");

  const userId = session?.user.id;

  const { data: receivedReviewsData, isLoading: isLoadingReceived } =
    api.review.getReviews.useQuery(
      {
        reviewedEntityId: userId!,
        reviewedEntityType: "FARMER",
        page: 1,
        limit: 100,
      },
      {
        enabled:
          activeTab === "received" &&
          !!userId &&
          session?.user.role === "FARMER",
      }
    );

  const { data: givenReviewsData, isLoading: isLoadingGiven } =
    api.review.getMyReviews.useQuery(
      {
        page: 1,
        limit: 100,
      },
      {
        enabled: activeTab === "given" && !!userId,
      }
    );

  const filteredGivenReviews = useMemo(() => {
    if (!givenReviewsData) return [];
    if (filter === "ALL") return givenReviewsData.reviews;
    return givenReviewsData.reviews.filter(
      (review) => review.reviewedEntityType === filter
    );
  }, [givenReviewsData, filter]);

  const isLoading =
    activeTab === "received" ? isLoadingReceived : isLoadingGiven;
  const currentReviews =
    activeTab === "received"
      ? receivedReviewsData?.reviews
      : filteredGivenReviews;
  const totalReceived = receivedReviewsData?.pagination.total || 0;
  const totalGiven = givenReviewsData?.pagination.total || 0;

  const getReviewTypeIcon = (type: ReviewEntityType) => {
    switch (type) {
      case "PRODUCT":
        return <Package className="w-4 h-4" />;
      case "FARMER":
        return <User className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getReviewTypeColor = (type: ReviewEntityType) => {
    switch (type) {
      case "PRODUCT":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "FARMER":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getAvatarInitial = (review: CombinedReview) => {
    if (activeTab === "received" && "reviewer" in review) {
      return review.reviewer?.profile?.name?.charAt(0) || "A";
    }
    if (activeTab === "given" && "product" in review) {
      return review.product?.name?.charAt(0) || "P";
    }
    return "F";
  };

  const getDisplayName = (review: CombinedReview) => {
    if (activeTab === "received" && "reviewer" in review) {
      return review.reviewer?.profile?.name || "Anonymous User";
    }
    if (activeTab === "given" && "product" in review) {
      return `Review for ${review.product?.name || "Product"}`;
    }
    return "Review for a Farmer";
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Star className="w-8 h-8 mr-3" />
              Reviews
            </h1>
            <p className="text-muted-foreground">
              Manage your reviews and feedback
            </p>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SlideInOnScroll>
          <Card className="glassmorphism">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">
                Average Rating Received
              </p>
              <p className="text-3xl font-bold text-primary">
                {receivedReviewsData?.stats.averageRating.toFixed(1) || "N/A"}
              </p>
            </CardContent>
          </Card>
        </SlideInOnScroll>
        <SlideInOnScroll delay={0.1}>
          <Card className="glassmorphism">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">
                Total Received
              </p>
              <p className="text-3xl font-bold text-primary">{totalReceived}</p>
            </CardContent>
          </Card>
        </SlideInOnScroll>
        <SlideInOnScroll delay={0.2}>
          <Card className="glassmorphism">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">
                Reviews Given
              </p>
              <p className="text-3xl font-bold text-primary">{totalGiven}</p>
            </CardContent>
          </Card>
        </SlideInOnScroll>
      </div>

      <FadeIn delay={0.3}>
        <Card className="glassmorphism">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                <Button
                  variant={activeTab === "received" ? "default" : "ghost"}
                  onClick={() => setActiveTab("received")}
                >
                  Received
                </Button>
                <Button
                  variant={activeTab === "given" ? "default" : "ghost"}
                  onClick={() => setActiveTab("given")}
                >
                  Given
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <div className="flex space-x-1">
                  {(["ALL", "PRODUCT", "FARMER"] as const).map(
                    (filterOption) => (
                      <Button
                        key={filterOption}
                        variant={filter === filterOption ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setFilter(filterOption)}
                      >
                        {filterOption.charAt(0) +
                          filterOption.slice(1).toLowerCase()}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <div className="space-y-4">
        {isLoading ? (
          <p>Loading reviews...</p>
        ) : currentReviews && currentReviews.length > 0 ? (
          currentReviews.map((review, index) => (
            <SlideInOnScroll key={review.id} delay={index * 0.05}>
              <Card className="glassmorphism hover:scale-[1.01] transition-transform duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-xl">
                        {getAvatarInitial(review)}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold mb-1">
                            {getDisplayName(review)}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <StarRating
                              rating={review.rating}
                              readonly
                              size="sm"
                            />
                            <Badge
                              className={getReviewTypeColor(
                                review.reviewedEntityType
                              )}
                            >
                              {getReviewTypeIcon(review.reviewedEntityType)}
                              <span className="ml-1 capitalize">
                                {review.reviewedEntityType.toLowerCase()}
                              </span>
                            </Badge>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {review.comment}
                      </p>

                      <div className="flex items-center justify-end">
                        {activeTab === "given" &&
                          review.reviewedEntityType === "PRODUCT" &&
                          "product" in review &&
                          review.product && (
                            <Button variant="link" size="sm" asChild>
                              <Link href={`/products/${review.product.id}`}>
                                View Product
                              </Link>
                            </Button>
                          )}
                        {activeTab === "given" &&
                          review.reviewedEntityType === "FARMER" && (
                            <Button variant="link" size="sm" asChild>
                              <Link
                                href={`/farmers/${review.reviewedEntityId}`}
                              >
                                View Farmer
                              </Link>
                            </Button>
                          )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideInOnScroll>
          ))
        ) : (
          <SlideInOnScroll>
            <Card className="glassmorphism">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Reviews Found</h3>
                <p className="text-muted-foreground">
                  {activeTab === "received"
                    ? "You haven't received any reviews yet."
                    : "No reviews match the current filter."}
                </p>
              </CardContent>
            </Card>
          </SlideInOnScroll>
        )}
      </div>
    </div>
  );
}
