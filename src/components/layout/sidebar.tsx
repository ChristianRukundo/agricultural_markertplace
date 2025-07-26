"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Package,
  ShoppingCart,
  MessageCircle,
  Bell,
  Star,
  Settings,
  Users,
  BarChart3,
  Truck,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Home,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { api } from "@/lib/trpc/client";
import { ComponentType } from "react";

type NavigationChild = {
  href: string;
  label: string;
  description?: string;
};

type NavigationItem = {
  href?: string;
  label: string;
  icon?: ComponentType<any>;
  description?: string;
  children?: NavigationChild[];
  badge?: string;
};

const NAVIGATION_ITEMS: Record<string, NavigationItem[]> = {
  FARMER: [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Overview and analytics",
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
      description: "Manage your profile",
    },
    {
      label: "Products",
      icon: Package,
      children: [
        {
          href: "/farmer/products",
          label: "My Products",
          description: "Manage your listings",
        },
        {
          href: "/farmer/products/new",
          label: "Add Product",
          description: "Create new listing",
        },
        {
          href: "/farmer/products/analytics",
          label: "Analytics",
          description: "Product performance",
        },
      ],
    },
    {
      href: "/farmer/orders",
      label: "Orders",
      icon: Truck,
      description: "Manage customer orders",
      badge: "3",
    },
    {
      href: "/messages",
      label: "Messages",
      icon: MessageCircle,
      description: "Chat with buyers",
      badge: "2",
    },
    {
      href: "/notifications",
      label: "Notifications",
      icon: Bell,
      description: "Stay updated",
    },
    {
      href: "/reviews",
      label: "Reviews",
      icon: Star,
      description: "Customer feedback",
    },
  ],
  SELLER: [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Overview and analytics",
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
      description: "Manage your profile",
    },
    {
      href: "/seller/cart",
      label: "Cart",
      icon: ShoppingCart,
      description: "Review your items",
      badge: "5",
    },
    {
      href: "/seller/orders",
      label: "My Orders",
      icon: Truck,
      description: "Track your purchases",
    },
    {
      href: "/messages",
      label: "Messages",
      icon: MessageCircle,
      description: "Chat with farmers",
    },
    {
      href: "/notifications",
      label: "Notifications",
      icon: Bell,
      description: "Stay updated",
    },
    {
      href: "/reviews",
      label: "Reviews",
      icon: Star,
      description: "Your feedback",
    },
  ],
  ADMIN: [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Platform overview",
    },
    {
      label: "User Management",
      icon: Users,
      children: [
        {
          href: "/admin/users",
          label: "All Users",
          description: "Manage user accounts",
        },
        {
          href: "/admin/users/farmers",
          label: "Farmers",
          description: "Farmer accounts",
        },
        {
          href: "/admin/users/sellers",
          label: "Sellers",
          description: "Seller accounts",
        },
        {
          href: "/admin/users/verification",
          label: "Verification",
          description: "Pending verifications",
        },
      ],
    },
    {
      label: "Content Management",
      icon: Package,
      children: [
        {
          href: "/admin/products",
          label: "Products",
          description: "Manage all products",
        },
        {
          href: "/admin/products/pending",
          label: "Pending Approval",
          description: "Review new products",
        },
        {
          href: "/admin/categories",
          label: "Categories",
          description: "Manage categories",
        },
      ],
    },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: Truck,
      description: "Monitor all orders",
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: BarChart3,
      description: "Platform metrics",
    },
    {
      href: "/messages",
      label: "Messages",
      icon: MessageCircle,
      description: "Support messages",
    },
    {
      href: "/notifications",
      label: "Notifications",
      icon: Bell,
      description: "System notifications",
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      description: "Platform settings",
    },
  ],
};

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const { data: notificationStats } = api.notification.getStats.useQuery(
    undefined,
    {
      enabled: !!session,
    }
  );

  if (!session) return null;

  // FIX 1: Provide an empty array as a fallback to satisfy the NavigationItem[] type.
  const navigationItems: NavigationItem[] =
    NAVIGATION_ITEMS[session.user.role as keyof typeof NAVIGATION_ITEMS] ?? [];

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const filteredItems = navigationItems.filter(
    (item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.children &&
        item.children.some((child) =>
          child.label.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  );

  const getBadgeCount = (href: string) => {
    switch (href) {
      case "/notifications":
        return notificationStats?.unreadCount || 0;
      // You can add other cases here for dynamic badges
      case "/messages":
        return 2; // Mock data
      case "/farmer/orders":
        return 3; // Mock data
      case "/seller/cart":
        return 5; // Mock data
      default:
        return 0;
    }
  };

  return (
    <>
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border overflow-hidden transition-all duration-300 z-50",
          isCollapsed ? "w-16" : "w-80"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div>
                  <h2 className="font-semibold text-lg">Navigation</h2>
                  <p className="text-sm text-muted-foreground capitalize">
                    {session.user.role.toLowerCase()} Dashboard
                  </p>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="lg:flex hidden"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(true)}
                className="lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isCollapsed && (
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search navigation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              {!isCollapsed && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Quick Actions
                  </h3>
                  <div className="space-y-1">
                    {session.user.role === "FARMER" && (
                      <Link
                        href="/farmer/products/new"
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Product</span>
                      </Link>
                    )}
                    {session.user.role === "SELLER" && (
                      <Link
                        href="/products"
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        <Search className="w-4 h-4" />
                        <span>Browse Products</span>
                      </Link>
                    )}
                    <Link
                      href="/"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <Home className="w-4 h-4" />
                      <span>Back to Site</span>
                    </Link>
                  </div>
                </div>
              )}

              <div>
                {!isCollapsed && (
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Main Menu
                  </h3>
                )}

                {filteredItems.map((item) => {
                  const Icon = item.icon; // FIX 2: Alias component to a capitalized variable
                  const isExpanded = expandedItems.includes(item.label);

                  if (item.children) {
                    return (
                      <div key={item.label}>
                        <button
                          onClick={() => toggleExpanded(item.label)}
                          className={cn(
                            "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            "text-muted-foreground hover:text-foreground hover:bg-muted",
                            isCollapsed && "justify-center"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            {/* FIX 3: Conditionally render the icon */}
                            {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                            {!isCollapsed && <span>{item.label}</span>}
                          </div>
                          {!isCollapsed && (
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 transition-transform",
                                isExpanded && "rotate-180"
                              )}
                            />
                          )}
                        </button>

                        {!isCollapsed && isExpanded && (
                          <div className="ml-6 mt-1 space-y-1">
                            {item.children.map((child) => {
                              const isChildActive = pathname === child.href;
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={cn(
                                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                    isChildActive
                                      ? "bg-primary text-primary-foreground font-medium"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                  )}
                                >
                                  <div className="w-2 h-2 rounded-full bg-current opacity-50" />
                                  <div className="flex-1">
                                    <div>{child.label}</div>
                                    {child.description && (
                                      <div className="text-xs opacity-70">
                                        {child.description}
                                      </div>
                                    )}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const isActive = pathname === item.href;
                  const badgeCount = item.href ? getBadgeCount(item.href) : 0;

                  return (
                    <Link
                      key={item.href}
                      href={item.href!}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        isCollapsed && "justify-center"
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        {/* FIX 4: Conditionally render the icon */}
                        {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                        {!isCollapsed && (
                          <div className="flex-1">
                            <div>{item.label}</div>
                            {item.description && (
                              <div className="text-xs opacity-70 group-hover:opacity-100 transition-opacity">
                                {item.description}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {!isCollapsed && badgeCount > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                          {badgeCount > 99 ? "99+" : badgeCount}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>

          <div className="p-4 border-t border-border">
            {!isCollapsed ? (
              <div className="space-y-2">
                <Link
                  href="/help"
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Help & Support</span>
                </Link>
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-sm">
                      {session.user.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {session.user.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/help">
                    <HelpCircle className="w-4 h-4" />
                  </Link>
                </Button>
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {session.user.name?.charAt(0) || "U"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(false)}
        className={cn(
          "fixed bottom-4 left-4 z-40 lg:hidden",
          !isCollapsed && "hidden"
        )}
      >
        <Menu className="w-4 h-4" />
      </Button>

      <div
        className={cn(
          "transition-all duration-300 lg:block hidden",
          isCollapsed ? "w-16" : "w-80"
        )}
      />
    </>
  );
}
