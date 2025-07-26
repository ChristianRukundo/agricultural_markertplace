"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Leaf,
  TrendingUp,
  Star,
  CheckCircle,
  Mail,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FadeIn } from "@/components/animations/fade-in";
import { SlideInOnScroll } from "@/components/animations/slide-in-on-scroll";
import { useGSAP } from "@/components/providers/gsap-provider";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/trpc/client";
import { useSession } from "next-auth/react";
import { FullScreenLoader } from "@/components/ui/loader";
import { useRouter } from "next/navigation";

const FEATURES = [
  {
    icon: <Users className="w-8 h-8" />,
    title: "Direct Connection",
    description:
      "Connect farmers directly with sellers, eliminating middlemen and ensuring fair prices for everyone.",
    stats: "5,000+ connections made",
  },
  {
    icon: <Leaf className="w-8 h-8" />,
    title: "Fresh & Quality",
    description:
      "Get the freshest produce directly from verified farmers with quality guarantees and traceability.",
    stats: "99% satisfaction rate",
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Market Growth",
    description:
      "Help grow the agricultural market with transparent pricing, reliable transactions, and fair trade.",
    stats: "40% income increase",
  },
];

const TESTIMONIALS = [
  {
    name: "Jean Baptiste Uwimana",
    role: "Farmer from Musanze",
    content:
      "AgriConnect has transformed my farming business. I now sell directly to buyers and earn 40% more than before. The platform is easy to use and the support team is amazing.",
    rating: 5,
    avatar: "/placeholder.svg?height=60&width=60",
    location: "Musanze District",
    verified: true,
  },
  {
    name: "Marie Claire Mukamana",
    role: "Restaurant Owner, Kigali",
    content:
      "The quality of produce is exceptional. I can trace every item back to its source farm and my customers love the fresh local ingredients. Delivery is always on time.",
    rating: 5,
    avatar: "/placeholder.svg?height=60&width=60",
    location: "Kigali City",
    verified: true,
  },
  {
    name: "Paul Kagame Mutabazi",
    role: "Grocery Store Manager",
    content:
      "Reliable supply chain and competitive prices. Our customers love the fresh local produce and we've seen a 30% increase in sales since partnering with AgriConnect.",
    rating: 5,
    avatar: "/placeholder.svg?height=60&width=60",
    location: "Huye District",
    verified: true,
  },
];

const PLATFORM_STATS = [
  {
    number: "5,000+",
    label: "Active Farmers",
    description: "Verified farmers across Rwanda",
  },
  {
    number: "2,500+",
    label: "Registered Sellers",
    description: "Restaurants, stores, and wholesalers",
  },
  {
    number: "50,000+",
    label: "Successful Orders",
    description: "Completed transactions",
  },
  {
    number: "30",
    label: "Districts Covered",
    description: "Nationwide coverage",
  },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const gsap = useGSAP();
  const { toast } = useToast();
  const { data: productsData, isLoading: productsLoading } =
    api.product.getProducts.useQuery({
      page: 1,
      limit: 6,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const newsletterMutation = api.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
    },
    onError: (error) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!heroRef.current) return;

    if (!gsap) return;
    const tl = gsap.timeline();

    tl.fromTo(
      ".hero-title",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    )
      .fromTo(
        ".hero-subtitle",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.4"
      )
      .fromTo(
        ".hero-cta",
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
        "-=0.2"
      )
      .fromTo(
        ".hero-video",
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      );
  }, [gsap]);

  if (status === "loading" || status === "authenticated") {
    return <FullScreenLoader />;
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    newsletterMutation.mutate({ email: email.trim() });
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Enhanced Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 dark:from-green-950 dark:via-blue-950 dark:to-yellow-950" />
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-10" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <FadeIn>
                <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6">
                  <span className="gradient-text">Connecting</span>
                  <br />
                  <span className="text-foreground">Farmers & Sellers</span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="hero-subtitle text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl">
                  Join Rwanda's premier agricultural marketplace where farmers
                  meet sellers directly, ensuring fresh produce, fair prices,
                  and sustainable growth for all.
                </p>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <Link href="/auth/register">
                    <Button
                      size="lg"
                      className="bg-gradient-primary text-white px-8 py-4 text-lg"
                    >
                      Get Started Today
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-8 py-4 text-lg bg-transparent"
                    >
                      Browse Products
                    </Button>
                  </Link>
                </div>
              </FadeIn>

              <FadeIn delay={0.6}>
                <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Free to join</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Verified farmers</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Secure payments</span>
                  </div>
                </div>
              </FadeIn>
            </div>

            <div className="hero-video">
              <FadeIn delay={0.5}>
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src="/placeholder.svg?height=400&width=600"
                      alt="AgriConnect Platform"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        size="lg"
                        className="rounded-full w-16 h-16 bg-white/90 hover:bg-white text-primary"
                      >
                        <Play className="w-6 h-6 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-primary rounded-full opacity-20 animate-float" />
        <div
          className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-secondary rounded-full opacity-20 animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 right-20 w-12 h-12 bg-gradient-accent rounded-full opacity-20 animate-float"
          style={{ animationDelay: "4s" }}
        />
      </section>

      {/* Platform Statistics */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4">
          <SlideInOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Our Growing Impact
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Real numbers that showcase our thriving agricultural community
              </p>
            </div>
          </SlideInOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {PLATFORM_STATS.map((stat, index) => (
              <SlideInOnScroll key={index} delay={index * 0.1}>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    {stat.number}
                  </div>
                  <div className="text-lg font-medium mb-1">{stat.label}</div>
                  <div className="text-sm opacity-80">{stat.description}</div>
                </div>
              </SlideInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <SlideInOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Why Choose <span className="gradient-text">AgriConnect</span>?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We're revolutionizing agriculture in Rwanda by creating direct
                connections between farmers and sellers.
              </p>
            </div>
          </SlideInOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <SlideInOnScroll key={index} direction="up" className="h-full">
                <Card className="glassmorphism p-8 h-full hover:scale-105 transition-transform duration-300 group">
                  <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <div className="text-sm font-medium text-primary">
                    {feature.stats}
                  </div>
                </Card>
              </SlideInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Featured Products */}
      {(productsData?.products && productsData.products.length > 0) ||
      productsLoading ? (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <SlideInOnScroll>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Featured <span className="gradient-text">Products</span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Discover fresh, quality produce from verified farmers
                </p>
              </div>
            </SlideInOnScroll>

            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <Card className="glassmorphism overflow-hidden">
                      <div className="aspect-video bg-muted" />
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                        <div className="flex justify-between items-center">
                          <div className="h-6 bg-muted rounded w-1/3" />
                          <div className="h-8 bg-muted rounded w-1/4" />
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {productsData!.products.slice(0, 6).map((product, index) => (
                  <SlideInOnScroll key={product.id} delay={index * 0.1}>
                    <Card className="glassmorphism overflow-hidden hover:scale-105 transition-transform duration-300 group">
                      <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 relative overflow-hidden">
                        {product.imageUrls && product.imageUrls.length > 0 ? (
                          <img
                            src={product.imageUrls[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Leaf className="w-16 h-16 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="bg-primary/90 text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                            {product.category.name}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-primary">
                              RWF {Number(product.unitPrice).toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground ml-1">
                              /{Number(product.quantityAvailable)}
                            </span>
                          </div>
                          <Link href={`/products/${product.id}`}>
                            <Button
                              size="sm"
                              className="bg-gradient-primary text-white"
                            >
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </SlideInOnScroll>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Link href="/products">
                <Button size="lg" variant="outline">
                  View All Products
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Enhanced Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <SlideInOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                What Our <span className="gradient-text">Community</span> Says
              </h2>
              <p className="text-xl text-muted-foreground">
                Real stories from farmers and sellers who've transformed their
                businesses
              </p>
            </div>
          </SlideInOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <SlideInOnScroll key={index} delay={index * 0.2}>
                <Card className="glassmorphism p-8 h-full hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full mr-4 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-bold">{testimonial.name}</h4>
                        {testimonial.verified && (
                          <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </Card>
              </SlideInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <SlideInOnScroll>
            <Card className="glassmorphism max-w-4xl mx-auto">
              <div className="p-12 text-center">
                <Mail className="w-16 h-16 text-primary mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Stay Updated
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Get the latest updates on new products, market trends, and
                  platform features delivered to your inbox.
                </p>
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                >
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={newsletterMutation.isPending}
                    className="bg-gradient-primary text-white"
                  >
                    {newsletterMutation.isPending
                      ? "Subscribing..."
                      : "Subscribe"}
                  </Button>
                </form>
                <p className="text-sm text-muted-foreground mt-4">
                  No spam, unsubscribe at any time. We respect your privacy.
                </p>
              </div>
            </Card>
          </SlideInOnScroll>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <SlideInOnScroll>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Agricultural Business?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of farmers and sellers who are already benefiting
              from direct trade relationships.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="px-8 py-4 text-lg"
                >
                  Join as Farmer
                  <CheckCircle className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-primary bg-transparent"
                >
                  Join as Seller
                  <CheckCircle className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-8 text-sm opacity-80">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Free registration</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>24/7 support</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Secure platform</span>
              </div>
            </div>
          </SlideInOnScroll>
        </div>
      </section>

      <Footer />
    </div>
  );
}
