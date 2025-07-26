"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Star, Filter, MessageSquare, Package, User } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { StarRating } from "@/components/ui/star-rating"
import { FadeIn } from "@/components/animations/fade-in"
import { SlideInOnScroll } from "@/components/animations/slide-in-on-scroll"
import { api } from "@/lib/trpc/client"

export default function ReviewsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<"received" | "given">("received")
  const [filter, setFilter] = useState<"ALL" | "PRODUCT" | "USER">("ALL")

  // Fetch received reviews
  const { data: receivedReviewsData } = api.review.getReviews.useQuery(
    {
      reviewedEntityId: session?.user.id!,
      reviewedEntityType: filter === "ALL" ? undefined : filter,
      page: 1,
      limit: 20,
    },
    { enabled: activeTab === "received" && !!session?.user.id },
  )

  // Fetch given reviews
  const { data: givenReviewsData } = api.review.getReviews.useQuery(
    {
      reviewerId: session?.user.id!,
      reviewedEntityType: filter === "ALL" ? undefined : filter,
      page: 1,
      limit: 20,
    },
    { enabled: activeTab === "given" && !!session?.user.id },
  )

  const currentData = activeTab === "received" ? receivedReviewsData : givenReviewsData

  const getReviewTypeIcon = (type: string) => {
    switch (type) {
      case "PRODUCT":
        return <Package className="w-4 h-4" />
      case "USER":
        return <User className="w-4 h-4" />
      default:
        return <Star className="w-4 h-4" />
    }
  }

  const getReviewTypeColor = (type: string) => {
    switch (type) {
      case "PRODUCT":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "USER":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Star className="w-8 h-8 mr-3" />
              Reviews
            </h1>
            <p className="text-muted-foreground">Manage your reviews and feedback</p>
          </div>
        </div>
      </FadeIn>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SlideInOnScroll>
          <Card className="glassmorphism">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                  <p className="text-3xl font-bold text-primary">
                    {receivedReviewsData?.stats.averageRating.toFixed(1) || "0.0"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideInOnScroll>

        <SlideInOnScroll delay={0.1}>
          <Card className="glassmorphism">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Received</p>
                  <p className="text-3xl font-bold text-primary">{receivedReviewsData?.pagination.total || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideInOnScroll>

        <SlideInOnScroll delay={0.2}>
          <Card className="glassmorphism">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reviews Given</p>
                  <p className="text-3xl font-bold text-primary">{givenReviewsData?.pagination.total || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideInOnScroll>
      </div>

      {/* Tabs and Filters */}
      <FadeIn delay={0.3}>
        <Card className="glassmorphism">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {/* Tabs */}
              <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab("received")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "received"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Received Reviews
                </button>
                <button
                  onClick={() => setActiveTab("given")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "given"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Given Reviews
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <div className="flex space-x-1">
                  {["ALL", "PRODUCT", "USER"].map((filterOption) => (
                    <Button
                      key={filterOption}
                      variant={filter === filterOption ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFilter(filterOption as typeof filter)}
                    >
                      {filterOption === "ALL" ? "All" : filterOption.charAt(0) + filterOption.slice(1).toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Reviews List */}
      <div className="space-y-4">
        {currentData?.reviews && currentData.reviews.length > 0 ? (
          currentData.reviews.map((review, index) => (
            <SlideInOnScroll key={review.id} delay={index * 0.05}>
              <Card className="glassmorphism hover:scale-[1.02] transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium">
                        {activeTab === "received"
                          ? review.reviewer.profile?.name?.charAt(0) || "U"
                          : review.reviewedEntity?.name?.charAt(0) || "U"}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold mb-1">
                            {activeTab === "received"
                              ? review.reviewer.profile?.name || "Anonymous User"
                              : `Review for ${review.reviewedEntity?.name || "Unknown"}`}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <StarRating rating={review.rating} readonly size="sm" />
                            <Badge className={getReviewTypeColor(review.reviewedEntityType)}>
                              {getReviewTypeIcon(review.reviewedEntityType)}
                              <span className="ml-1">{review.reviewedEntityType}</span>
                            </Badge>
                          </div>
                        </div>

                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-muted-foreground mb-4 leading-relaxed">{review.comment}</p>

                      {/* Review Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Rating: {review.rating}/5</span>
                          {review.reviewedEntityType === "PRODUCT" && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`/products/${review.reviewedEntityId}`}>View Product</a>
                            </Button>
                          )}
                        </div>

                        {activeTab === "received" && (
                          <Button variant="outline" size="sm">
                            Reply
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
                <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
                <p className="text-muted-foreground">
                  {activeTab === "received"
                    ? "You haven't received any reviews yet"
                    : "You haven't given any reviews yet"}
                </p>
              </CardContent>
            </Card>
          </SlideInOnScroll>
        )}
      </div>
    </div>
  )
}
