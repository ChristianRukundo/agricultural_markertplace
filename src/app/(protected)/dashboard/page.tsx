"use client";

import type React from "react";
import { useSession } from "next-auth/react";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Star,
  Bell,
  MessageCircle,
  PieChart,
  PlusCircle,
  Settings,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/trpc/client";
import { cn, formatPrice } from "@/lib/utils";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  PieLabelRenderProps,
  LineChart,
} from "recharts";
import type { TooltipProps } from "recharts";
import type {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef } from "react";
import { UserRole } from "@prisma/client";

const monthlySalesData = [
  { name: "Jan", Sales: 2400, Orders: 15 },
  { name: "Feb", Sales: 1398, Orders: 10 },
  { name: "Mar", Sales: 9800, Orders: 65 },
  { name: "Apr", Sales: 3908, Orders: 28 },
  { name: "May", Sales: 4800, Orders: 35 },
  { name: "Jun", Sales: 3800, Orders: 30 },
  { name: "Jul", Sales: 4300, Orders: 32 },
];
const userGrowthData = [
  { name: "Jan", Users: 120 },
  { name: "Feb", Users: 150 },
  { name: "Mar", Users: 210 },
  { name: "Apr", Users: 250 },
  { name: "May", Users: 310 },
  { name: "Jun", Users: 350 },
];
const productCategoriesData = [
  { name: "Vegetables", value: 45 },
  { name: "Fruits", value: 25 },
  { name: "Grains", value: 15 },
  { name: "Other", value: 15 },
];
const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#6366F1"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-background/80 backdrop-blur-md border border-border/50 rounded-lg shadow-lg">
        <p className="font-bold text-foreground">{label}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.color }}>{`${
            pld.name
          }: ${pld.value.toLocaleString()}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

function AnimatedIcon({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
      <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeType,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  changeType?: "increase" | "decrease";
}) {
  return (
    <div className="relative p-px rounded-xl overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <Card className="relative h-full bg-background/80 backdrop-blur-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <AnimatedIcon icon={Icon} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{value}</p>
          {change && (
            <p
              className={cn(
                "text-xs mt-1",
                changeType === "increase" ? "text-green-500" : "text-red-500"
              )}
            >
              {change} vs. last month
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuickActions({ role }: { role: UserRole }) {
  const actions = {
    FARMER: [
      {
        label: "Add New Product",
        icon: PlusCircle,
        href: "/farmer/products/new",
      },
    ],
    SELLER: [
      { label: "Browse Products", icon: ShoppingCart, href: "/products" },
    ],
    ADMIN: [{ label: "Manage Users", icon: Users, href: "/admin/users" }],
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions[role].map((action) => (
          <Button
            key={action.href}
            asChild
            variant="outline"
            className="w-full justify-start text-left"
          >
            <Link href={action.href}>
              <action.icon className="w-4 h-4 mr-3" />
              {action.label}
            </Link>
          </Button>
        ))}
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/messages">
            <MessageCircle className="w-4 h-4 mr-3" />
            View Messages
          </Link>
        </Button>
        <Button asChild className="w-full justify-start">
          <Link href="/profile">
            <Settings className="w-4 h-4 mr-3" />
            Account Settings
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const dashboardRef = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".dashboard-item",
        { opacity: 0, y: 30, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
        }
      );
    },
    { scope: dashboardRef }
  );

  const { data: profile, isLoading: profileLoading } =
    api.user.getProfile.useQuery(undefined, { enabled: !!userId });
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    error: statsError,
  } = api.dashboard.getStats.useQuery(undefined, { enabled: !!userId });

  const renderFarmerDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 dashboard-item">
        <StatCard
          title="Active Products"
          value={(dashboardStats?.stats as any)?.activeProductsCount ?? 0}
          icon={Package}
        />
        <StatCard
          title="Pending Orders"
          value={(dashboardStats?.stats as any)?.pendingOrdersCount ?? 0}
          icon={ShoppingCart}
          change="+2"
          changeType="increase"
        />
        <StatCard
          title="This Month's Sales"
          value={formatPrice(
            Number((dashboardStats?.stats as any)?.monthlySales ?? 0)
          )}
          icon={DollarSign}
        />
        <StatCard
          title="Average Rating"
          value={`${Number(
            (dashboardStats?.stats as any)?.averageRating ?? 0
          ).toFixed(1)}`}
          icon={Star}
        />
      </div>
      <Card className="dashboard-item">
        <CardHeader>
          <CardTitle>Sales & Orders Overview</CardTitle>
          <CardDescription>
            Your performance over the last 7 months.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlySalesData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border)/0.5)"
              />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="Sales"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorSales)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Orders"
                stroke="#3B82F6"
                fill="transparent"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );

  const renderAdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 dashboard-item">
        <StatCard
          title="Total Users"
          value={(dashboardStats?.stats as any)?.totalUsers ?? 0}
          icon={Users}
          change={`+${Number(
            (dashboardStats?.stats as any)?.userGrowthRate ?? 0
          ).toFixed(1)}%`}
          changeType="increase"
        />
        <StatCard
          title="Active Products"
          value={(dashboardStats?.stats as any)?.activeProducts ?? 0}
          icon={Package}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatPrice(
            Number((dashboardStats?.stats as any)?.monthlyRevenue ?? 0)
          )}
          icon={DollarSign}
        />
        <StatCard title="Pending Reviews" value={0} icon={Star} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 dashboard-item">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border)/0.5)"
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="Users"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productCategoriesData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  label={({ name, percent }: PieLabelRenderProps) =>
                    `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                  }
                >
                  {productCategoriesData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderDashboardContent = () => {
    if (statsLoading || profileLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    if (statsError) {
      return (
        <div className="text-red-500 p-4 bg-red-500/10 rounded-lg">
          Error loading dashboard: {statsError.message}
        </div>
      );
    }
    switch (session?.user.role) {
      case "FARMER":
        return renderFarmerDashboard();
      case "SELLER":
        return renderFarmerDashboard();
      case "ADMIN":
        return renderAdminDashboard();
      default:
        return <div>Welcome to your dashboard.</div>;
    }
  };

  const name = profile?.name || session?.user.name || "User";

  return (
    <div ref={dashboardRef} className="space-y-8">
      <div className="dashboard-item">
        <div className="p-8 bg-background/80 backdrop-blur-md border rounded-2xl">
          <h1 className="text-3xl font-bold">Welcome back, {name}!</h1>
          <p className="text-muted-foreground">
            Here is your business at a glance. Ready to get started?
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
          {renderDashboardContent()}
        </div>
        <div className="xl:col-span-1 space-y-8">
          <div className="dashboard-item">
            <QuickActions role={session?.user.role as UserRole} />
          </div>
          <Card className="dashboard-item">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <Bell className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <p>
                  <span className="font-semibold">New order #1235</span> from
                  Kigali Fresh Market.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Star className="w-4 h-4 mt-1 text-yellow-500 flex-shrink-0" />
                <p>
                  You received a{" "}
                  <span className="font-semibold">5-star review</span> on
                  &quot;Organic Tomatoes&quot;.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <MessageCircle className="w-4 h-4 mt-1 text-blue-500 flex-shrink-0" />
                <p>New message from Heaven Restaurant.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
