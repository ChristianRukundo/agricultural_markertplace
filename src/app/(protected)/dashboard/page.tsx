"use client"

import { useSession } from "next-auth/react"
import { TrendingUp, Package, ShoppingCart, Users, DollarSign, Star, Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FadeIn } from "@/components/animations/fade-in"
import { SlideInOnScroll } from "@/components/animations/slide-in-on-scroll"
import { api } from "@/lib/trpc/client"

export default function DashboardPage() {
  const { data: session } = useSession()

  // Fetch user profile
  const { data: profile } = api.user.getProfile.useQuery()

  // Fetch notifications
  const { data: notificationStats } = api.notification.getStats.useQuery()

  const userRole = session?.user.role

  const getWelcomeMessage = () => {
    const name = profile?.name || session?.user.name || "User"
    switch (userRole) {
      case "FARMER":
        return `Welcome back, ${name}! Ready to manage your farm?`
      case "SELLER":
        return `Welcome back, ${name}! Let's find some great products.`
      case "ADMIN":
        return `Welcome back, ${name}! Here's your platform overview.`
      default:
        return `Welcome back, ${name}!`
    }
  }

  const getQuickStats = () => {
    switch (userRole) {
      case "FARMER":
        return [
          { title: "Active Products", value: "12", icon: Package, color: "text-blue-600" },
          { title: "Pending Orders", value: "8", icon: ShoppingCart, color: "text-orange-600" },
          { title: "This Month Sales", value: "RWF 450K", icon: DollarSign, color: "text-green-600" },
          { title: "Average Rating", value: "4.8", icon: Star, color: "text-yellow-600" },
        ]
      case "SELLER":
        return [
          { title: "Cart Items", value: "5", icon: ShoppingCart, color: "text-blue-600" },
          { title: "Active Orders", value: "3", icon: Package, color: "text-orange-600" },
          { title: "This Month Spent", value: "RWF 125K", icon: DollarSign, color: "text-green-600" },
          { title: "Saved Products", value: "24", icon: Star, color: "text-yellow-600" },
        ]
      case "ADMIN":
        return [
          { title: "Total Users", value: "7,542", icon: Users, color: "text-blue-600" },
          { title: "Active Products", value: "1,234", icon: Package, color: "text-orange-600" },
          { title: "Monthly Revenue", value: "RWF 2.4M", icon: DollarSign, color: "text-green-600" },
          { title: "Growth Rate", value: "+12.5%", icon: TrendingUp, color: "text-purple-600" },
        ]
      default:
        return []
    }
  }

  const quickStats = getQuickStats()

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <FadeIn>
        <div className="bg-gradient-primary text-white rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2">{getWelcomeMessage()}</h1>
          <p className="text-white/90">
            {userRole === "FARMER" && "Manage your products, track orders, and grow your business."}
            {userRole === "SELLER" && "Discover fresh products and manage your purchases."}
            {userRole === "ADMIN" && "Monitor platform performance and manage users."}
          </p>
        </div>
      </FadeIn>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <SlideInOnScroll key={stat.title} delay={index * 0.1}>
            <Card className="glassmorphism hover:scale-105 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </SlideInOnScroll>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <SlideInOnScroll direction="left">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationStats ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">
                      You have {notificationStats.unreadCount} unread notifications
                    </p>
                    <a href="/notifications" className="text-primary hover:underline">
                      View all notifications
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </SlideInOnScroll>

        {/* Quick Actions */}
        <SlideInOnScroll direction="right">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userRole === "FARMER" && (
                  <>
                    <a
                      href="/farmer/products/new"
                      className="block p-3 rounded-lg border border-muted hover:bg-muted/50 transition-colors"
                    >
                      <div className="font-medium">Add New Product</div>
                      <div className="text-sm text-muted-foreground">List a new product for sale</div>
                    </a>
                    <a
                      href="/farmer/orders"
                      className="block p-3 rounded-lg border border-muted hover:bg-muted/50 transition-colors"
                    >
                      <div className="font-medium">View Orders</div>
                      <div className="text-sm text-muted-foreground">Check pending orders</div>
                    </a>
                  </>
                )}

                {userRole === "SELLER" && (
                  <>
                    <a
                      href="/products"
                      className="block p-3 rounded-lg border border-muted hover:bg-muted/50 transition-colors"
                    >
                      <div className="font-medium">Browse Products</div>
                      <div className="text-sm text-muted-foreground">Find fresh produce</div>
                    </a>
                    <a
                      href="/seller/cart"
                      className="block p-3 rounded-lg border border-muted hover:bg-muted/50 transition-colors"
                    >
                      <div className="font-medium">View Cart</div>
                      <div className="text-sm text-muted-foreground">Review your selected items</div>
                    </a>
                  </>
                )}

                {userRole === "ADMIN" && (
                  <>
                    <a
                      href="/admin/users"
                      className="block p-3 rounded-lg border border-muted hover:bg-muted/50 transition-colors"
                    >
                      <div className="font-medium">Manage Users</div>
                      <div className="text-sm text-muted-foreground">View and manage user accounts</div>
                    </a>
                    <a
                      href="/admin/analytics"
                      className="block p-3 rounded-lg border border-muted hover:bg-muted/50 transition-colors"
                    >
                      <div className="font-medium">View Analytics</div>
                      <div className="text-sm text-muted-foreground">Platform performance metrics</div>
                    </a>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </SlideInOnScroll>
      </div>
    </div>
  )
}
