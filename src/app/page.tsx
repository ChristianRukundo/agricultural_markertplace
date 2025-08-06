"use client";

import type React from "react";
import { useEffect, useRef, useState, SVGProps } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FullScreenLoader } from "@/components/ui/loader";

import {
  ArrowRight,
  BarChart,
  Check,
  CheckCircle,
  Clock,
  Database,
  KeyRound,
  Leaf,
  Minus,
  Package,
  Plus,
  Quote,
  Shield,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

import { SectionHeader } from "@/components/landing/SectionHeader";
import { FeaturedProducts } from "@/components/landing/FeaturedProducts";

gsap.registerPlugin(ScrollTrigger);

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

function BenefitCard({ icon, title, description, features }: BenefitCardProps) {
  return (
    <Card className="p-8 h-full bg-background/50 backdrop-blur-sm border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
      <div className="mb-6 w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-foreground/90">{feature}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// --- StatItem Component ---
interface StatItemProps {
  value: string;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  const statRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  const targetValue = parseFloat(value.replace(/[^0-9.]/g, ""));
  const suffix = value.replace(/[0-9.]/g, "");

  useGSAP(
    () => {
      if (!numberRef.current) return;
      gsap.from(numberRef.current, {
        textContent: 0,
        duration: 2.5,
        ease: "power3.out",
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: statRef.current,
          start: "top 85%",
        },
        onUpdate: function () {
          const target = this.targets()[0] as HTMLElement;
          target.innerHTML = Math.ceil(
            parseFloat(target.textContent || "0")
          ).toLocaleString();
        },
      });
    },
    { scope: statRef }
  );

  return (
    <div ref={statRef} className="text-center">
      <h3 className="text-5xl md:text-6xl font-bold tracking-tighter text-primary">
        <span ref={numberRef}>{targetValue.toLocaleString()}</span>
        {suffix}
      </h3>
      <p className="mt-2 text-muted-foreground">{label}</p>
    </div>
  );
}

// --- HowItWorksStep Component ---
interface HowItWorksStepProps {
  step: number;
  title: string;
  description: string;
  className?: string;
}

function HowItWorksStep({
  step,
  title,
  description,
  className,
}: HowItWorksStepProps) {
  return (
    <div className={cn("how-it-works-step py-12", className)}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-primary text-primary font-bold text-xl">
          {step}
        </div>
        <h3 className="text-3xl font-bold">{title}</h3>
      </div>
      <p className="text-lg text-muted-foreground pl-16">{description}</p>
    </div>
  );
}

// --- DashboardMockup Component ---
const MetricWidget = ({ title, value, change, icon: Icon }: any) => (
  <div className="p-4 bg-background/50 rounded-lg border border-border/50">
    <div className="flex items-center justify-between mb-1">
      <p className="text-xs text-muted-foreground">{title}</p>
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <p className="text-xl font-bold">{value}</p>
    <p
      className={cn(
        "text-xs",
        change.startsWith("+") ? "text-green-500" : "text-red-500"
      )}
    >
      {change}
    </p>
  </div>
);

const RecentOrderItem = ({ name, farmer, status, img }: any) => (
  <div className="flex items-center space-x-3 text-xs">
    <img src={img} alt={name} className="w-8 h-8 rounded-full object-cover" />
    <div className="flex-grow">
      <p className="font-semibold">{name}</p>
      <p className="text-muted-foreground">{farmer}</p>
    </div>
    <span
      className={cn(
        "px-2 py-1 rounded-full",
        status === "Delivered"
          ? "bg-green-500/10 text-green-500"
          : "bg-orange-500/10 text-orange-500"
      )}
    >
      {status}
    </span>
  </div>
);

function DashboardMockup() {
  return (
    <div
      className="dashboard-mockup-container"
      style={{ perspective: "2000px" }}
    >
      <div className="dashboard-mockup p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl shadow-2xl transition-transform duration-500 ease-out">
        <div className="bg-background/80 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-border/50 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <p className="text-sm font-medium">Dashboard</p>
            <div className="w-16" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricWidget
                  title="Total Revenue"
                  value="RWF 15.2M"
                  change="+12.5%"
                  icon={TrendingUp}
                />
                <MetricWidget
                  title="New Orders"
                  value="214"
                  change="+8.2%"
                  icon={Package}
                />
                <MetricWidget
                  title="Active Farmers"
                  value="1,204"
                  change="+2.1%"
                  icon={Users}
                />
                <MetricWidget
                  title="Avg. Rating"
                  value="4.8/5"
                  change="+0.1"
                  icon={Star}
                />
              </div>
              <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                <h4 className="font-semibold mb-2 text-sm">Revenue Growth</h4>
                <BarChart className="w-full h-48 text-muted-foreground/20" />
              </div>
            </div>
            <div className="md:col-span-1 p-4 bg-background/50 rounded-lg border border-border/50">
              <h4 className="font-semibold mb-3 text-sm flex items-center">
                <Clock className="w-4 h-4 mr-2" /> Recent Orders
              </h4>
              <div className="space-y-3">
                <RecentOrderItem
                  name="Organic Tomatoes"
                  farmer="Green Valley Farm"
                  status="Delivered"
                  img="/placeholder.svg?height=40&width=40&query=tomatoes"
                />
                <RecentOrderItem
                  name="Irish Potatoes"
                  farmer="Musanze Fields"
                  status="In Transit"
                  img="/placeholder.svg?height=40&width=40&query=potatoes"
                />
                <RecentOrderItem
                  name="Fresh Avocados"
                  farmer="Huye Orchards"
                  status="Delivered"
                  img="/placeholder.svg?height=40&width=40&query=avocados"
                />
                <RecentOrderItem
                  name="Red Beans"
                  farmer="Bugesera Co-op"
                  status="Delivered"
                  img="/placeholder.svg?height=40&width=40&query=beans"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- BusinessCard Component ---
interface BusinessCardProps {
  name: string;
  category: string;
  owner: string;
  image: string;
}

function BusinessCard({ name, category, owner, image }: BusinessCardProps) {
  return (
    <div className="group">
      <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <p className="text-sm text-primary font-semibold">{category}</p>
      <h3 className="text-lg font-bold">{name}</h3>
      <p className="text-sm text-muted-foreground">by {owner}</p>
    </div>
  );
}

// --- Pricing Section Components ---
interface PricingToggleProps {
  onToggle: (cycle: "monthly" | "yearly") => void;
  billingCycle: "monthly" | "yearly";
}

function PricingToggle({ onToggle, billingCycle }: PricingToggleProps) {
  return (
    <div className="inline-flex items-center justify-center p-1 bg-muted/50 rounded-full">
      <button
        onClick={() => onToggle("monthly")}
        className={cn(
          "px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-300",
          billingCycle === "monthly"
            ? "bg-background shadow"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Monthly
      </button>
      <button
        onClick={() => onToggle("yearly")}
        className={cn(
          "px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-300 relative",
          billingCycle === "yearly"
            ? "bg-background shadow"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Yearly
        <Badge className="absolute -top-2 -right-2 bg-green-500 text-white border-2 border-muted/50">
          Save 20%
        </Badge>
      </button>
    </div>
  );
}

function FeatureComparisonTable() {
  const featureData = [
    {
      feature: "Farmer Connections",
      basic: "5 / month",
      business: "Unlimited",
      enterprise: "Unlimited",
    },
    {
      feature: "Product Listings View",
      basic: "Unlimited",
      business: "Unlimited",
      enterprise: "Unlimited",
    },
    {
      feature: "Basic Analytics",
      basic: <Check className="text-green-500 mx-auto" />,
      business: <Check className="text-green-500 mx-auto" />,
      enterprise: <Check className="text-green-500 mx-auto" />,
    },
    {
      feature: "Advanced Analytics",
      basic: "-",
      business: <Check className="text-green-500 mx-auto" />,
      enterprise: <Check className="text-green-500 mx-auto" />,
    },
    {
      feature: "Team Members",
      basic: "1 User",
      business: "Up to 5 Users",
      enterprise: "Unlimited Users",
    },
    {
      feature: "Priority Support",
      basic: "-",
      business: <Check className="text-green-500 mx-auto" />,
      enterprise: <Check className="text-green-500 mx-auto" />,
    },
    {
      feature: "API Access",
      basic: "-",
      business: "-",
      enterprise: <Check className="text-green-500 mx-auto" />,
    },
    {
      feature: "Dedicated Account Manager",
      basic: "-",
      business: "-",
      enterprise: <Check className="text-green-500 mx-auto" />,
    },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left">
        <thead>
          <tr className="border-b">
            <th className="p-4 font-semibold text-lg">Features</th>
            <th className="p-4 font-semibold text-center text-lg">Basic</th>
            <th className="p-4 font-semibold text-center text-lg text-primary">
              Business
            </th>
            <th className="p-4 font-semibold text-center text-lg">
              Enterprise
            </th>
          </tr>
        </thead>
        <tbody>
          {featureData.map((row, i) => (
            <tr
              key={i}
              className="border-b transition-colors hover:bg-muted/50"
            >
              <td className="p-4 font-medium">{row.feature}</td>
              <td className="p-4 text-center text-muted-foreground">
                {row.basic}
              </td>
              <td className="p-4 text-center font-semibold text-primary">
                {row.business}
              </td>
              <td className="p-4 text-center text-muted-foreground">
                {row.enterprise}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- PricingTier Component (Enhanced) ---
interface PricingTierProps {
  plan: string;
  priceMonthly: string;
  priceYearly: string;
  billingCycle: "monthly" | "yearly";
  description: string;
  features: string[];
  isPopular?: boolean;
}

/**
 * An advanced component for a single pricing tier, with animated price changes.
 */
function PricingTier({
  plan,
  priceMonthly,
  priceYearly,
  billingCycle,
  description,
  features,
  isPopular = false,
}: PricingTierProps) {
  const priceRef = useRef<HTMLSpanElement>(null);

  // Animate the price change when the billing cycle toggles
  useGSAP(() => {
    if (!priceRef.current) return;
    const priceText = billingCycle === "monthly" ? priceMonthly : priceYearly;

    gsap
      .timeline()
      .to(priceRef.current, {
        y: -10,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      })
      .set(priceRef.current, { textContent: priceText })
      .to(priceRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
  }, [billingCycle]);

  return (
    <div
      className={cn(
        "relative p-8 border rounded-2xl h-full flex flex-col transition-all duration-300",
        isPopular
          ? "border-primary shadow-2xl shadow-primary/20"
          : "border-border"
      )}
    >
      {isPopular && (
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2">{plan}</h3>
      <p className="text-muted-foreground mb-6 h-12">{description}</p>
      <div className="mb-6 h-16">
        <span className="text-5xl font-bold tracking-tighter" ref={priceRef}>
          {priceMonthly}
        </span>
        <span className="text-muted-foreground">/ month</span>
      </div>
      <ul className="space-y-3 flex-grow mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        size="lg"
        className={cn(
          "w-full",
          !isPopular &&
            "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        )}
      >
        Get Started
      </Button>
    </div>
  );
}

// --- SecurityFeatureCard Component ---
interface SecurityFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function SecurityFeatureCard({
  icon,
  title,
  description,
}: SecurityFeatureCardProps) {
  return (
    <div className="p-6 border border-border/50 rounded-xl bg-background/30 backdrop-blur-md">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-lg">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

// --- TestimonialCard Component ---
interface TestimonialCardProps {
  quote: string;
  author: { name: string; role: string; image: string };
  stats: { value: string; label: string; icon: React.ReactNode }[];
  timeline: { date: string; event: string }[];
}

function TestimonialCard({
  quote,
  author,
  stats,
  timeline,
}: TestimonialCardProps) {
  return (
    <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
      <div className="lg:col-span-3">
        <Badge variant="secondary" className="mb-4">
          Success Story
        </Badge>
        <Quote className="w-12 h-12 text-primary/20 mb-4" />
        <p className="text-2xl md:text-3xl font-medium leading-snug mb-8">
          "{quote}"
        </p>
        <div className="flex items-center space-x-4">
          <img
            src={author.image}
            alt={author.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <p className="font-bold text-lg">{author.name}</p>
            <p className="text-muted-foreground">{author.role}</p>
          </div>
        </div>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <h4 className="font-semibold">Key Results:</h4>
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-4 bg-muted/50 rounded-lg flex items-center space-x-4"
            >
              <div className="text-primary">{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
        <h4 className="font-semibold pt-4 border-t">Their Journey:</h4>
        <div className="space-y-4">
          {timeline.map((item, index) => (
            <div key={index} className="flex items-start text-sm">
              <p className="w-20 font-medium text-muted-foreground">
                {item.date}
              </p>
              <p>{item.event}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- FAQItem Component ---
interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-6"
      >
        <h4 className="text-lg font-semibold">{question}</h4>
        {isOpen ? (
          <Minus className="w-5 h-5 text-primary" />
        ) : (
          <Plus className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="pb-6 text-muted-foreground">{answer}</p>
        </div>
      </div>
    </div>
  );
}

// --- Checklist Component ---
interface ChecklistProps {
  items: string[];
  columns?: 1 | 2;
}

function Checklist({ items, columns = 1 }: ChecklistProps) {
  return (
    <div
      className={`grid ${
        columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
      } gap-x-8 gap-y-3`}
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
          <span className="text-lg">{item}</span>
        </div>
      ))}
    </div>
  );
}

// --- Background Pattern Component ---
function BackgroundPattern() {
  return (
    <div className="absolute inset-0 -z-20 overflow-hidden">
      <svg
        className="absolute top-0 left-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="pattern"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="5"
              cy="5"
              r="1"
              className="text-primary/5 fill-current"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pattern)" />
      </svg>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl animate-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
    </div>
  );
}

export default function HomePage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const { status } = useSession();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  useGSAP(
    () => {
      // Hero Animations
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          ".hero-background",
          { scale: 1.2, y: "-5%" },
          { scale: 1, y: "0%", duration: 2.5, ease: "power2.inOut" }
        )
        .fromTo(
          ".hero-title",
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1 },
          "-=1.5"
        )
        .fromTo(
          ".hero-subtitle",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.8"
        )
        .fromTo(
          ".hero-cta",
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
          "-=0.5"
        );

      gsap.to(".hero-background", {
        y: () => window.innerHeight * 0.1,
        ease: "none",
        scrollTrigger: {
          trigger: mainRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Staggered Section Entrances
      const sections = gsap.utils.toArray<HTMLElement>(".animated-section");
      sections.forEach((section) => {
        const elems = section.querySelectorAll(".animate-item");
        gsap.fromTo(
          elems,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: section, start: "top 80%" },
          }
        );
      });

      // How It Works Sticky Scroll
      const howItWorksSection = mainRef.current?.querySelector(
        ".how-it-works-section"
      );
      if (howItWorksSection) {
        const steps = gsap.utils.toArray<HTMLElement>(".how-it-works-step");
        const visual = howItWorksSection.querySelector(".how-it-works-visual");
        const visualContent =
          gsap.utils.toArray<HTMLElement>(".visual-content");

        ScrollTrigger.create({
          trigger: howItWorksSection,
          start: "top top",
          end: () => `+=${steps.length * window.innerHeight * 0.5}`,
          pin: visual,
          scrub: 1,
          anticipatePin: 1,
        });

        steps.forEach((step, i) => {
          gsap.timeline({
            scrollTrigger: {
              trigger: step,
              start: "top center",
              end: "bottom center",
              toggleClass: {
                targets: visualContent[i],
                className: "is-active",
              },
              scrub: true,
            },
          });
        });
      }

      // Dashboard 3D Effect
      const mockupContainer = mainRef.current?.querySelector(
        ".dashboard-mockup-container"
      );
      if (mockupContainer) {
        gsap.to(".dashboard-mockup", {
          rotationY: -5,
          rotationX: 5,
          ease: "none",
          scrollTrigger: {
            trigger: mockupContainer,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    },
    { scope: mainRef }
  );

  if (status === "loading" || status === "authenticated") {
    return <FullScreenLoader />;
  }

  return (
    <div
      ref={mainRef}
      className="min-h-screen bg-background relative overflow-hidden"
    >
      <BackgroundPattern />
      <Header />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center text-white">
        <div className="hero-background absolute inset-0 bg-hero-farming bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 text-shadow-lg">
            <span className="bg-gradient-to-r from-green-300 via-emerald-400 to-green-300 bg-clip-text text-transparent">
              Harvesting the Future
            </span>
            <br />
            <span className="text-white">Connecting Rwanda's Farms</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            The definitive B2B platform for sourcing quality agricultural
            products directly from verified farmers across Rwanda.
          </p>
          <div className="hero-cta">
            <Button
              asChild
              size="lg"
              className="bg-gradient-primary text-white px-8 py-4 text-lg"
            >
              <Link href="/auth/register">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* --- FEATURED BUSINESSES SECTION --- */}
      <section className="py-20 animated-section">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Trusted by Rwandan Businesses"
            subtitle="From local restaurants to national distributors, businesses rely on AgriConnect for fresh, reliable produce."
            className="animate-item"
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="animate-item">
              <BusinessCard
                name="Kigali Fresh Market"
                category="Groceries"
                owner="A. Uwimana"
                image="https://images.unsplash.com/photo-1558907530-fe311178388a?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              />
            </div>
            <div className="animate-item">
              <BusinessCard
                name="Heaven Restaurant"
                category="Fine Dining"
                owner="J.P. Nsenga"
                image="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              />
            </div>
            <div className="animate-item">
              <BusinessCard
                name="EcoHarvest Exports"
                category="Export"
                owner="C. Mukamana"
                image="https://images.unsplash.com/photo-1651002624194-b262e618a319?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              />
            </div>
            <div className="animate-item">
              <BusinessCard
                name="Musanze Farmers Co-op"
                category="Cooperative"
                owner="E. Hakizimana"
                image="https://images.unsplash.com/photo-1543070443-faf0e862bf8b?q=80&w=1109&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE US SECTION --- */}
      <section className="py-20 bg-muted/30 animated-section">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={
              <>
                Why <span className="gradient-text">AgriConnect</span>?
              </>
            }
            subtitle="We provide an end-to-end solution designed for the unique challenges of the agricultural supply chain."
            className="animate-item"
          />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="animate-item">
              <BenefitCard
                icon={<Leaf className="w-8 h-8" />}
                title="Unmatched Quality"
                description="Source directly from verified farmers."
                features={[
                  "Verified Farmer Profiles",
                  "Quality Scoring System",
                  "Full Product Traceability",
                ]}
              />
            </div>
            <div className="animate-item">
              <BenefitCard
                icon={<TrendingUp className="w-8 h-8" />}
                title="Operational Efficiency"
                description="Streamline your procurement process."
                features={[
                  "Real-time Inventory",
                  "Automated Order Management",
                  "Consolidated Invoicing",
                ]}
              />
            </div>
            <div className="animate-item">
              <BenefitCard
                icon={<Users className="w-8 h-8" />}
                title="Direct Relationships"
                description="Build sustainable partnerships."
                features={[
                  "Integrated Secure Messaging",
                  "Transparent Farmer Pricing",
                  "Long-term Contract Tools",
                ]}
              />
            </div>
          </div>
        </div>
      </section>
      <FeaturedProducts />

      {/* --- HOW IT WORKS (VERTICAL STICKY SCROLL) --- */}
      <section className="py-20 how-it-works-section">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={
              <>
                A <span className="gradient-text">Smarter Way</span> to Source
              </>
            }
            subtitle="Our streamlined process ensures quality, transparency, and efficiency from farm to business."
          />
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            <div className="how-it-works-steps">
              <HowItWorksStep
                step={1}
                title="Discover & Vet"
                description="Use advanced filters to find verified farmers. Analyze their certifications, product history, and quality ratings to make informed decisions."
              />
              <HowItWorksStep
                step={2}
                title="Connect & Negotiate"
                description="Initiate conversations through our secure messaging system. Discuss bulk pricing, delivery schedules, and product specifics directly."
              />
              <HowItWorksStep
                step={3}
                title="Order with Confidence"
                description="Place orders from single or multiple farms. Your payment is held in a secure escrow and is only released upon your confirmation of delivery."
              />
              <HowItWorksStep
                step={4}
                title="Track & Manage"
                description="Monitor your order's progress from farm to your doorstep with real-time tracking. Manage all invoices and documentation in one place."
              />
            </div>
            <div className="relative h-[500px]">
              <div className="how-it-works-visual h-full w-full">
                <div className="visual-content absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500">
                  <p className="text-xl text-center p-8 bg-muted/50 rounded-lg">
                    Visual for Step 1: Map of farmers
                  </p>
                </div>
                <div className="visual-content absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500">
                  <p className="text-xl text-center p-8 bg-muted/50 rounded-lg">
                    Visual for Step 2: Chat interface
                  </p>
                </div>
                <div className="visual-content absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500">
                  <p className="text-xl text-center p-8 bg-muted/50 rounded-lg">
                    Visual for Step 3: Payment screen
                  </p>
                </div>
                <div className="visual-content absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500">
                  <p className="text-xl text-center p-8 bg-muted/50 rounded-lg">
                    Visual for Step 4: Delivery tracking
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- DASHBOARD MOCKUP --- */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={
              <>
                Your <span className="gradient-text">Command Center</span>
              </>
            }
            subtitle="Manage your entire agricultural supply chain from one powerful, intuitive dashboard."
          />
          <div className="mt-12 max-w-6xl mx-auto">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}

      <section className="py-20 animated-section">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={
              <>
                Transparent <span className="gradient-text">Pricing</span> for
                Everyone
              </>
            }
            subtitle="Choose a plan that scales with your business. No hidden fees, just pure value."
            className="animate-item"
          />
          <div className="mt-8 flex justify-center animate-item">
            <PricingToggle
              billingCycle={billingCycle}
              onToggle={setBillingCycle}
            />
          </div>
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="animate-item">
              <PricingTier
                plan="Basic"
                priceMonthly="Free"
                priceYearly="Free"
                billingCycle={billingCycle}
                description="For individuals or small businesses just getting started."
                features={[
                  "Browse all products",
                  "Connect with 5 farmers/month",
                  "Standard email support",
                ]}
              />
            </div>
            <div className="animate-item">
              <PricingTier
                plan="Business"
                priceMonthly="RWF 25,000"
                priceYearly="RWF 20,000"
                billingCycle={billingCycle}
                description="For growing businesses that need more connections and features."
                features={[
                  "Unlimited farmer connections",
                  "Advanced analytics dashboard",
                  "Priority support (24hr response)",
                  "Up to 5 team members",
                ]}
                isPopular={true}
              />
            </div>
            <div className="animate-item">
              <PricingTier
                plan="Enterprise"
                priceMonthly="Custom"
                priceYearly="Custom"
                billingCycle={billingCycle}
                description="For large-scale operations with custom needs."
                features={[
                  "Dedicated account manager",
                  "API access for integration",
                  "Custom reporting & onboarding",
                  "On-site training options",
                ]}
              />
            </div>
          </div>
          <div className="mt-20 animate-item">
            <SectionHeader
              title="Compare Features"
              subtitle="A detailed look at what each plan offers to help you choose the right one."
            />
            <div className="mt-12 max-w-6xl mx-auto">
              <Card className="p-4 md:p-8 bg-muted/30">
                <FeatureComparisonTable />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIAL CASE STUDY --- */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <TestimonialCard
            quote="AgriConnect isn't just a platform, it's the central nervous system for our entire procurement process. Our efficiency is up 60%, and our food cost is down 15%."
            author={{
              name: "Chef Antoine",
              role: "Head Chef, The Kigali Grill",
              image: "/placeholder.svg?height=100&width=100&query=chef-2",
            }}
            stats={[
              {
                value: "+60%",
                label: "Procurement Efficiency",
                icon: <TrendingUp className="w-6 h-6" />,
              },
              {
                value: "200+",
                label: "Farmer Relationships",
                icon: <Users className="w-6 h-6" />,
              },
            ]}
            timeline={[
              { date: "Jan 2023", event: "Onboarded AgriConnect" },
              { date: "Mar 2023", event: "Consolidated 80% of suppliers" },
              { date: "Jun 2023", event: "Launched new 'Farm-to-Table' menu" },
            ]}
          />
        </div>
      </section>

      {/* --- FAQ Section --- */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Frequently Asked Questions"
            subtitle="Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us."
          />
          <div className="mt-12 max-w-4xl mx-auto">
            <FAQItem
              question="How are farmers verified on the platform?"
              answer="Our verification process is rigorous. We require national ID, proof of farm ownership or cooperative membership, and conduct on-site visits for larger operations. This ensures that every farmer on our platform is legitimate and meets our quality standards."
            />
            <FAQItem
              question="What is the payment process and how does escrow work?"
              answer="When a seller places an order, the payment is held securely in escrow by AgriConnect. The funds are only released to the farmer after the seller confirms that they have received the goods as described. This protects both parties and builds trust."
            />
            <FAQItem
              question="Can I negotiate prices directly with farmers?"
              answer="Yes! We encourage direct communication. Our built-in messaging system allows you to connect with farmers to discuss bulk pricing, delivery schedules, and specific product requirements before finalizing an order."
            />
            <FAQItem
              question="What happens if there is an issue with my order?"
              answer="In the rare case of a dispute (e.g., quality or quantity issues), you can raise a dispute ticket directly from your order page. Our dedicated support team will mediate between the buyer and seller to find a fair resolution, leveraging the escrow system if necessary."
            />
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative p-12 bg-muted/50 rounded-2xl overflow-hidden text-center">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/10 rounded-full" />
            <div className="relative z-10">
              <SectionHeader
                title={
                  <>
                    Join the Agricultural{" "}
                    <span className="gradient-text">Revolution</span>
                  </>
                }
                subtitle="Empower your business with direct access to Rwanda's finest farms."
              />
              <div className="my-8 max-w-2xl mx-auto">
                <Checklist
                  items={[
                    "Increase Profitability",
                    "Enhance Product Quality",
                    "Build a Sustainable Supply Chain",
                  ]}
                  columns={1}
                />
              </div>
              <Button
                asChild
                size="lg"
                className="bg-gradient-primary text-white px-8 py-4 text-lg"
              >
                <Link href="/auth/register">
                  Sign Up for Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
