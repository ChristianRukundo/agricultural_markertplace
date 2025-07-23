"use client"

import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { StarRating } from "@/components/ui/StarRating"
import { FadeIn } from "@/components/animations/FadeIn"
import { SlideInOnScroll } from "@/components/animations/SlideInOnScroll"
import { FEATURES, TESTIMONIALS } from "@/lib/constants"
import Link from "next/link"
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export default function HomePage() {
  useGSAP(() => {
    // Hero section animations
    const tl = gsap.timeline()

    tl.fromTo(".hero-title", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" })
      .fromTo(".hero-subtitle", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.5")
      .fromTo(".hero-cta", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3")

    // Floating animation for hero elements
    gsap.to(".hero-float", {
      y: -10,
      duration: 2,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
    })

    // Stats counter animation
    ScrollTrigger.create({
      trigger: ".stats-section",
      start: "top 80%",
      onEnter: () => {
        gsap.to(".stat-number", {
          textContent: (i: number, target: HTMLElement & { dataset: DOMStringMap }) => target.dataset.value,
          duration: 2,
          ease: "power2.out",
          snap: { textContent: 1 },
          stagger: 0.2,
        } as gsap.TweenVars)
      },
    })
  })

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 hero-gradient opacity-90" />

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] bg-center bg-repeat" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Connecting Rwanda's
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Farmers & Buyers
              </span>
            </h1>

            <p className="hero-subtitle text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              Fresh produce, fair prices, direct connections. Join Rwanda's premier agricultural marketplace.
            </p>

            <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="xl" variant="glass" asChild>
                <Link href="/products">Explore Products</Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary bg-transparent"
                asChild
              >
                <Link href="/auth/register">Join as Farmer</Link>
              </Button>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="hero-float absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm hidden lg:block" />
          <div
            className="hero-float absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm hidden lg:block"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="hero-float absolute bottom-40 left-20 w-12 h-12 bg-white/10 rounded-full backdrop-blur-sm hidden lg:block"
            style={{ animationDelay: "2s" }}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <FadeIn>
              <div>
                <div className="stat-number text-4xl font-bold text-primary mb-2" data-value="1000">
                  0
                </div>
                <p className="text-muted-foreground">Active Farmers</p>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div>
                <div className="stat-number text-4xl font-bold text-primary mb-2" data-value="500">
                  0
                </div>
                <p className="text-muted-foreground">Registered Buyers</p>
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div>
                <div className="stat-number text-4xl font-bold text-primary mb-2" data-value="50">
                  0
                </div>
                <p className="text-muted-foreground">Product Categories</p>
              </div>
            </FadeIn>
            <FadeIn delay={0.6}>
              <div>
                <div className="stat-number text-4xl font-bold text-primary mb-2" data-value="30">
                  0
                </div>
                <p className="text-muted-foreground">Districts Covered</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose AgriConnect?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We're revolutionizing Rwanda's agricultural marketplace with innovative features designed for farmers
                and buyers.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <SlideInOnScroll key={index} delay={index * 0.1}>
                <Card className="h-full">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </SlideInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">What Our Community Says</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Real stories from farmers and buyers who have transformed their business with AgriConnect.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <SlideInOnScroll key={index} delay={index * 0.2}>
                <Card className="h-full">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <StarRating rating={testimonial.rating} readonly className="mb-4" />
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </Card>
              </SlideInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-90" />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <FadeIn>
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Agricultural Business?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of farmers and buyers who are already benefiting from direct connections and fair prices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="glass" asChild>
                <Link href="/auth/register?role=farmer">Start Selling</Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary bg-transparent"
                asChild
              >
                <Link href="/auth/register?role=seller">Start Buying</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  )
}
