"use client";

import { useState } from "react";
import { Bell, Check, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/fade-in";
import { SlideInOnScroll } from "@/components/animations/slide-in-on-scroll";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { NotificationType } from "@/validation/notification"; // Import the unified NotificationType

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const { toast } = useToast();

  // Fetch notifications
  const { data: notificationsData, refetch } =
    api.notification.getNotifications.useQuery({
      page: 1,
      limit: 50,
      isRead: filter === "ALL" ? undefined : filter === "READ",
    });

  // Mark as read mutation
  const markAsReadMutation = api.notification.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
      toast({
        title: "Notification Updated",
        description: "Notification marked as read.",
      });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = api.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      refetch();
      toast({
        title: "All Notifications Read",
        description: "All notifications have been marked as read.",
      });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = api.notification.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast({
        title: "Notification Deleted",
        description: "Notification has been deleted.",
      });
    },
  });

  // Function to get appropriate icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "ORDER_CREATED":
      case "ORDER_PLACED": // Map ORDER_PLACED to ORDER_CREATED icon
        return "🛒";
      case "ORDER_UPDATED":
      case "ORDER_CONFIRMED": // Map ORDER_CONFIRMED to ORDER_UPDATED icon
        return "✅";
      case "ORDER_SHIPPED":
        return "🚚";
      case "ORDER_DELIVERED":
        return "📦";
      case "PAYMENT_RECEIVED":
        return "💰";
      case "REVIEW_RECEIVED":
        return "⭐";
      case "MESSAGE_RECEIVED":
        return "💬";
      case "PRODUCT_APPROVED":
        return "✅";
      case "PRODUCT_REJECTED":
        return "❌";
      case "SYSTEM_ANNOUNCEMENT":
        return "📢";
      default:
        return "🔔";
    }
  };

  // Function to get appropriate color based on notification type
  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "ORDER_CREATED":
      case "ORDER_PLACED":
      case "ORDER_UPDATED":
      case "ORDER_CONFIRMED":
        return "text-blue-600";
      case "ORDER_SHIPPED":
      case "ORDER_DELIVERED":
        return "text-green-600";
      case "PAYMENT_RECEIVED":
        return "text-emerald-600";
      case "REVIEW_RECEIVED":
        return "text-yellow-600";
      case "MESSAGE_RECEIVED":
        return "text-purple-600";
      case "PRODUCT_APPROVED":
        return "text-green-600";
      case "PRODUCT_REJECTED":
        return "text-red-600";
      case "SYSTEM_ANNOUNCEMENT":
        return "text-indigo-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Bell className="w-8 h-8 mr-3" />
              Notifications
            </h1>
            <p className="text-muted-foreground">
              Stay updated with your latest activities
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => markAllAsReadMutation.mutate({})} // Pass an empty object
              disabled={markAllAsReadMutation.isPending}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.1}>
        <Card className="glassmorphism">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <div className="flex space-x-2">
                  {["ALL", "UNREAD", "READ"].map((filterOption) => (
                    <Button
                      key={filterOption}
                      variant={filter === filterOption ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFilter(filterOption as typeof filter)}
                    >
                      {filterOption.charAt(0) +
                        filterOption.slice(1).toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {notificationsData?.pagination.total || 0} notifications
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Notifications List */}
      <div className="space-y-4">
        {/* Safely access notifications array, providing an empty array if undefined */}
        {(notificationsData?.notifications || []).length > 0 ? (
          (notificationsData?.notifications || []).map(
            (notification, index) => (
              <SlideInOnScroll key={notification.id} delay={index * 0.05}>
                <Card
                  className={cn(
                    "glassmorphism hover:scale-[1.02] transition-all duration-300 cursor-pointer",
                    !notification.isRead && "border-primary/50 bg-primary/5"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0",
                          !notification.isRead ? "bg-primary/10" : "bg-muted"
                        )}
                      >
                        {/* Ensure notification.type is cast to NotificationType for type safety */}
                        {getNotificationIcon(
                          notification.type as NotificationType
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3
                            className={cn(
                              "font-semibold",
                              !notification.isRead && "text-primary"
                            )}
                          >
                            {/* Use notification.content or derive a title from type */}
                            {notification.content ||
                              `New ${notification.type
                                .replace(/_/g, " ")
                                .toLowerCase()} notification`}
                          </h3>

                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.isRead && (
                              <Badge variant="default" className="bg-primary">
                                New
                              </Badge>
                            )}

                            <div className="flex items-center space-x-1">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsReadMutation.mutate({
                                      id: notification.id,
                                    });
                                  }}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotificationMutation.mutate({
                                    id: notification.id,
                                  });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-3 leading-relaxed">
                          {notification.content}
                        </p>{" "}
                        {/* Use notification.content */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {new Date(
                              notification.createdAt
                            ).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(
                              notification.createdAt
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          {notification.link && ( // Use notification.link
                            <Button variant="outline" size="sm" asChild>
                              <a href={notification.link}>View Details</a>{" "}
                              {/* Use notification.link */}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SlideInOnScroll>
            )
          )
        ) : (
          <SlideInOnScroll>
            <Card className="glassmorphism">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
                <p className="text-muted-foreground">
                  {filter === "UNREAD"
                    ? "You have no unread notifications"
                    : filter === "READ"
                    ? "You have no read notifications"
                    : "You don't have any notifications yet"}
                </p>
              </CardContent>
            </Card>
          </SlideInOnScroll>
        )}
      </div>

      {/* Pagination */}
      {notificationsData && notificationsData.pagination.pages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {[...Array(Math.min(5, notificationsData.pagination.pages))].map(
              (_, i) => (
                <Button key={i} variant="outline" size="sm">
                  {i + 1}
                </Button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
