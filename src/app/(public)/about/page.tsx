"use client"

import { useEffect, useRef, useState } from "react"
import {
  Target,
  Award,
  TrendingUp,
  Heart,
  Shield,
  Users,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/animations/fade-in"
import { SlideInOnScroll } from "@/components/animations/slide-in-on-scroll"
import { useGSAP } from "@/components/providers/gsap-provider"

const ABOUT_INFO = {
  mission:
    "To revolutionize Rwanda's agricultural sector by creating direct connections between farmers and sellers, ensuring fair prices, quality produce, and sustainable growth for all stakeholders in the agricultural value chain.",
  vision:
    "A thriving agricultural ecosystem where every farmer has access to fair markets, every seller can source quality produce directly, and technology bridges the gap between rural producers and urban consumers.",
  values: [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Community First",
      description:
        "We prioritize the wellbeing of our farming communities and their sustainable development, ensuring that technology serves people, not the other way around.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Trust & Transparency",
      description:
        "Every transaction is transparent with verified farmers, quality guarantees, and clear pricing. We build trust through consistent, reliable service.",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Growth & Innovation",
      description:
        "We continuously innovate to provide better tools and opportunities for growth, helping our community thrive in the digital economy.",
    },
  ],
  team: [
    {
      name: "Jean Baptiste Nzeyimana",
      role: "CEO & Founder",
      bio: "Agricultural economist with 15+ years experience in Rwanda's farming sector. Former World Bank consultant specializing in agricultural development.",
      image: "/placeholder.svg?height=300&width=300",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "jean@agriconnect.rw",
      },
    },
    {
      name: "Marie Claire Uwimana",
      role: "CTO & Co-Founder",
      bio: "Technology leader passionate about using tech to solve agricultural challenges. Former software engineer at major tech companies.",
      image: "/placeholder.svg?height=300&width=300",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "marie@agriconnect.rw",
      },
    },
    {
      name: "Paul Kagame Mutabazi",
      role: "Head of Operations",
      bio: "Operations expert ensuring smooth connections between farmers and sellers. 10+ years in supply chain management and logistics.",
      image: "/placeholder.svg?height=300&width=300",
      social: {
        linkedin: "#",
        email: "paul@agriconnect.rw",
      },
    },
    {
      name: "Grace Mukamana",
      role: "Head of Farmer Relations",
      bio: "Community organizer with deep roots in Rwanda's farming communities. Ensures farmers get the support they need to succeed.",
      image: "/placeholder.svg?height=300&width=300",
      social: {
        linkedin: "#",
        email: "grace@agriconnect.rw",
      },
    },
  ],
  stats: [
    { number: "5,000+", label: "Active Farmers", description: "Verified farmers across all 30 districts" },
    { number: "2,500+", label: "Registered Sellers", description: "Restaurants, stores, and wholesalers" },
    { number: "50,000+", label: "Successful Transactions", description: "Orders completed successfully" },
    { number: "30", label: "Districts Covered", description: "Complete nationwide coverage" },
  ],
  timeline: [
    {
      year: "2021",
      title: "Company Founded",
      description:
        "AgriConnect was founded with a vision to transform Rwanda's agricultural sector through technology.",
    },
    {
      year: "2022",
      title: "First 100 Farmers",
      description: "Onboarded our first 100 farmers and launched the beta platform in Kigali.",
    },
    {
      year: "2023",
      title: "Nationwide Expansion",
      description: "Expanded to all 30 districts of Rwanda and reached 1,000+ farmers on the platform.",
    },
    {
      year: "2024",
      title: "Major Milestones",
      description: "Reached 5,000+ farmers, launched mobile app, and processed over 50,000 orders.",
    },
  ],
  certifications: [
    {
      name: "ISO 27001",
      description: "Information Security Management",
      year: "2023",
    },
    {
      name: "Rwanda Standards Board",
      description: "Quality Management Certification",
      year: "2023",
    },
    {
      name: "Fair Trade Certified",
      description: "Ethical Trading Practices",
      year: "2024",
    },
  ],
}

const FAQ_DATA = [
  {
    question: "How does AgriConnect ensure fair pricing for farmers?",
    answer:
      "We provide transparent market pricing, eliminate middlemen, and allow farmers to set their own prices. Our platform shows real-time market rates and helps farmers understand the value of their produce.",
  },
  {
    question: "What support do you provide to farmers new to technology?",
    answer:
      "We offer comprehensive training programs, multilingual support in Kinyarwanda, English, and French, and have field representatives who provide hands-on assistance to farmers.",
  },
  {
    question: "How do you verify the quality of products?",
    answer:
      "All farmers go through a verification process, we have quality standards for each product category, and buyers can rate and review their purchases. We also conduct regular quality audits.",
  },
  {
    question: "What are your plans for expansion beyond Rwanda?",
    answer:
      "We're currently focused on perfecting our model in Rwanda. Once we've achieved our goals here, we plan to expand to other East African countries with similar agricultural challenges.",
  },
]

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const gsap = useGSAP()

  useEffect(() => {
    if (!heroRef.current) return

    gsap.fromTo(
      ".about-hero-content",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.2 },
    )
  }, [gsap])

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Hero Section */}
      <section
        ref={heroRef}
        className="bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 dark:from-green-950 dark:via-blue-950 dark:to-yellow-950 py-20"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <h1 className="about-hero-content text-4xl md:text-6xl font-bold mb-6">
                About <span className="gradient-text">AgriConnect</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="about-hero-content text-xl text-muted-foreground mb-8">
                Transforming Rwanda's agricultural landscape through technology and direct farmer-seller connections
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="about-hero-content flex items-center justify-center space-x-8 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Founded in 2021</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>30 Districts Covered</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>5,000+ Farmers</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Enhanced Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <SlideInOnScroll direction="left">
              <Card className="glassmorphism p-8 h-full">
                <CardHeader className="p-0 mb-6">
                  <div className="flex items-center mb-4">
                    <Target className="w-10 h-10 text-primary mr-4" />
                    <CardTitle className="text-3xl">Our Mission</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">{ABOUT_INFO.mission}</p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Direct farmer-to-seller connections</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Fair pricing for all stakeholders</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Sustainable agricultural growth</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideInOnScroll>

            <SlideInOnScroll direction="right">
              <Card className="glassmorphism p-8 h-full">
                <CardHeader className="p-0 mb-6">
                  <div className="flex items-center mb-4">
                    <Award className="w-10 h-10 text-primary mr-4" />
                    <CardTitle className="text-3xl">Our Vision</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">{ABOUT_INFO.vision}</p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Technology-driven agriculture</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Bridging rural-urban divide</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>Thriving agricultural ecosystem</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideInOnScroll>
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <SlideInOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Our <span className="gradient-text">Journey</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From a simple idea to transforming Rwanda's agricultural sector
              </p>
            </div>
          </SlideInOnScroll>

          <div className="max-w-4xl mx-auto">
            {ABOUT_INFO.timeline.map((milestone, index) => (
              <SlideInOnScroll key={index} delay={index * 0.2}>
                <div className="flex items-start mb-12 last:mb-0">
                  <div className="flex-shrink-0 w-24 text-right mr-8">
                    <div className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold">
                      {milestone.year}
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-4 h-4 bg-primary rounded-full mt-2 mr-8 relative">
                    {index < ABOUT_INFO.timeline.length - 1 && (
                      <div className="absolute top-4 left-1/2 w-0.5 h-12 bg-primary/30 transform -translate-x-1/2" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{milestone.description}</p>
                  </div>
                </div>
              </SlideInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SlideInOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Our <span className="gradient-text">Values</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do and every decision we make
              </p>
            </div>
          </SlideInOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ABOUT_INFO.values.map((value, index) => (
              <SlideInOnScroll key={index} delay={index * 0.2}>
                <Card className="glassmorphism p-8 text-center hover:scale-105 transition-transform duration-300 h-full">
                  <div className="text-primary mb-6 flex justify-center transform hover:scale-110 transition-transform">
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </Card>
              </SlideInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Stats */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4">
          <SlideInOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Impact</h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Numbers that showcase our growing community and the real difference we're making
              </p>
            </div>
          </SlideInOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {ABOUT_INFO.stats.map((stat, index) => (
              <SlideInOnScroll key={index} delay={index * 0.1}>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                  <div className="text-lg font-medium mb-1">{stat.label}</div>
                  <div className="text-sm opacity-80">{stat.description}</div>
                </div>
              </SlideInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SlideInOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Meet Our <span className="gradient-text">Team</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Passionate individuals working to transform Rwanda's agriculture
              </p>
            </div>
          </SlideInOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ABOUT_INFO.team.map((member, index) => (
              <SlideInOnScroll key={index} delay={index * 0.2}>
                <Card className="glassmorphism overflow-hidden hover:scale-105 transition-transform duration-300">
                  <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 relative">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                    <p className="text-primary font-medium mb-4">{member.role}</p>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{member.bio}</p>

                    {/* Social Links */}
                    <div className="flex items-center space-x-3">
                      {member.social.linkedin && (
                        <Button variant="ghost" size="sm" className="p-2" asChild>
                          <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {member.social.twitter && (
                        <Button variant="ghost" size="sm" className="p-2" asChild>
                          <a href={member.social.twitter} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {member.social.email && (
                        <Button variant="ghost" size="sm" className="p-2" asChild>
                          <a href={`mailto:${member.social.email}`}>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </SlideInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <SlideInOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Our <span className="gradient-text">Certifications</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Recognized standards and certifications that validate our commitment to quality
              </p>
            </div>
          </SlideInOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {ABOUT_INFO.certifications.map((cert, index) => (
              <SlideInOnScroll key={index} delay={index * 0.2}>
                <Card className="glassmorphism p-6 text-center hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{cert.name}</h3>
                  <p className="text-muted-foreground mb-2">{cert.description}</p>
                  <Badge variant="secondary">{cert.year}</Badge>
                </Card>
              </SlideInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SlideInOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Frequently Asked <span className="gradient-text">Questions</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Common questions about AgriConnect and our mission
              </p>
            </div>
          </SlideInOnScroll>

          <div className="max-w-4xl mx-auto space-y-4">
            {FAQ_DATA.map((faq, index) => (
              <SlideInOnScroll key={index} delay={index * 0.1}>
                <Card className="glassmorphism">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </Card>
              </SlideInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <SlideInOnScroll>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Join Our Mission?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Be part of the agricultural revolution in Rwanda. Connect, trade, and grow with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg" asChild>
                <a href="/auth/register">Get Started Today</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-primary bg-transparent"
                asChild
              >
                <a href="/contact">Contact Us</a>
              </Button>
            </div>
            <div className="flex items-center justify-center space-x-8 text-sm opacity-80">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span>Join 7,500+ users</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                <span>Secure & trusted</span>
              </div>
            </div>
          </SlideInOnScroll>
        </div>
      </section>
    </div>
  )
}
