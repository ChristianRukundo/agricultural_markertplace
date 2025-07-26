"use client";

import type React from "react";
import { useSession } from "next-auth/react";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Star,
  Bell,
  Heart,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FadeIn } from "@/components/animations/fade-in";
import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  change,
  changeType,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change?: string;
  changeType?: "increase" | "decrease";
}) {
  return (
    <Card className="glassmorphism hover:scale-105 transition-transform duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("w-5 h-5", color)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p
            className={cn(
              "text-xs text-muted-foreground",
              changeType === "increase" ? "text-green-600" : "text-red-600"
            )}
          >
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 bg-muted rounded w-2/3"></div>
        <div className="h-5 w-5 bg-muted rounded-full"></div>
      </CardHeader>
      <CardContent>
        <div className="h-7 bg-muted rounded w-1/2 mt-1"></div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: profile, isLoading: profileLoading } =
    api.user.getProfile.useQuery();
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    error: statsError,
  } = api.dashboard.getStats.useQuery();

  const getWelcomeMessage = () => {
    if (profileLoading) return "Welcome back!";
    const name = profile?.name || session?.user.name || "User";
    switch (session?.user.role) {
      case "FARMER":
        return `Welcome back, ${name}! Ready to manage your farm?`;
      case "SELLER":
        return `Welcome back, ${name}! Let's find some great products.`;
      case "ADMIN":
        return `Welcome back, ${name}! Here's your platform overview.`;
      default:
        return `Welcome back, ${name}!`;
    }
  };

  const renderStats = () => {
    if (!dashboardStats || !dashboardStats.stats) return null;

    switch (dashboardStats.role) {
      case "FARMER":
        return (
          <>
            <StatCard
              title="Active Products"
              value={dashboardStats.stats.activeProductsCount ?? 0}
              icon={Package}
              color="text-blue-600"
            />
            <StatCard
              title="Pending Orders"
              value={dashboardStats.stats.pendingOrdersCount ?? 0}
              icon={ShoppingCart}
              color="text-orange-600"
            />
            <StatCard
              title="This Month's Sales"
              value={formatPrice(
                Number(dashboardStats.stats.monthlySales ?? 0)
              )}
              icon={DollarSign}
              color="text-green-600"
            />
            <StatCard
              title="Average Rating"
              value={`${(dashboardStats.stats.averageRating ?? 0).toFixed(
                1
              )} (${dashboardStats.stats.reviewCount ?? 0})`}
              icon={Star}
              color="text-yellow-600"
            />
          </>
        );
      case "SELLER":
        return (
          <>
            <StatCard
              title="Cart Items"
              value={dashboardStats.stats.cartItemsCount ?? 0}
              icon={ShoppingCart}
              color="text-blue-600"
            />
            <StatCard
              title="Active Orders"
              value={dashboardStats.stats.activeOrdersCount ?? 0}
              icon={Package}
              color="text-orange-600"
            />
            <StatCard
              title="This Month's Spend"
              value={formatPrice(
                Number(dashboardStats.stats.monthlySpent ?? 0)
              )}
              icon={DollarSign}
              color="text-green-600"
            />
            <StatCard
              title="Saved Products"
              value={dashboardStats.stats.savedProductsCount ?? 0}
              icon={Heart}
              color="text-red-600"
            />
          </>
        );
      case "ADMIN":
        const growthRate = (dashboardStats.stats.userGrowthRate ?? 0).toFixed(
          1
        );
        const isGrowthPositive =
          (dashboardStats.stats.userGrowthRate ?? 0) >= 0;
        return (
          <>
            <StatCard
              title="Total Users"
              value={dashboardStats.stats.totalUsers ?? 0}
              icon={Users}
              color="text-blue-600"
            />
            <StatCard
              title="Active Products"
              value={dashboardStats.stats.activeProducts ?? 0}
              icon={Package}
              color="text-orange-600"
            />
            <StatCard
              title="Monthly Revenue"
              value={formatPrice(
                Number(dashboardStats.stats.monthlyRevenue ?? 0)
              )}
              icon={DollarSign}
              color="text-green-600"
            />
            <StatCard
              title="User Growth"
              value={`${growthRate}%`}
              icon={TrendingUp}
              color={isGrowthPositive ? "text-green-600" : "text-red-600"}
              change={"vs last month"}
              changeType={isGrowthPositive ? "increase" : "decrease"}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="bg-gradient-primary text-white rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2">{getWelcomeMessage()}</h1>
          <p className="text-white/90">
            {session?.user.role === "FARMER" &&
              "Manage your products, track orders, and grow your business."}
            {session?.user.role === "SELLER" &&
              "Discover fresh products and manage your purchases."}
            {session?.user.role === "ADMIN" &&
              "Monitor platform performance and manage users."}
          </p>
        </div>
      </FadeIn>

      {statsError && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">
              Could not load dashboard statistics
            </h3>
            <p className="text-sm">{statsError.message}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          renderStats()
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Notification system is active. Check the notifications page for
              details.
            </p>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {session?.user.role === "FARMER" && (
                <>
                  <a
                    href="/products/new"
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium">Add New Product</div>
                  </a>
                  <a
                    href="/orders"
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium">View Orders</div>
                  </a>
                </>
              )}
              {session?.user.role === "SELLER" && (
                <>
                  <a
                    href="/products"
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium">Browse Products</div>
                  </a>
                  <a
                    href="/cart"
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium">View Cart</div>
                  </a>
                </>
              )}
              {session?.user.role === "ADMIN" && (
                <>
                  <a
                    href="/admin/users"
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium">Manage Users</div>
                  </a>
                  <a
                    href="/admin/analytics"
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium">View Analytics</div>
                  </a>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
