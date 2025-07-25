"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Phone, MapPin, Clock, Send, Search, FileText, MessageSquare, Users, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/animations/fade-in"
import { SlideInOnScroll } from "@/components/animations/slide-in-on-scroll"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/trpc/client"

const CONTACT_INFO = {
  email: "hello@agriconnect.rw",
  phone: "+250 788 123 456",
  whatsapp: "+250 788 123 456",
  address: "KG 15 Ave, Kigali Innovation City, Kigali, Rwanda",
  hours: {
    weekdays: "Monday - Friday: 8:00 AM - 6:00 PM",
    saturday: "Saturday: 9:00 AM - 4:00 PM",
    sunday: "Sunday: Closed",
  },
  social: {
    facebook: "https://facebook.com/agriconnect",
    twitter: "https://twitter.com/agriconnect",
    instagram: "https://instagram.com/agriconnect",
    linkedin: "https://linkedin.com/company/agriconnect",
  },
}

const CONTACT_METHODS = [
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Email Support",
    description: "Get help via email within 24 hours",
    contact: CONTACT_INFO.email,
    action: "Send Email",
    href: `mailto:${CONTACT_INFO.email}`,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  {
    icon: <Phone className="w-6 h-6" />,
    title: "Phone Support",
    description: "Speak directly with our team",
    contact: CONTACT_INFO.phone,
    action: "Call Now",
    href: `tel:${CONTACT_INFO.phone}`,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "WhatsApp",
    description: "Quick support via WhatsApp",
    contact: CONTACT_INFO.whatsapp,
    action: "Chat Now",
    href: `https://wa.me/${CONTACT_INFO.whatsapp.replace(/\s+/g, "")}`,
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Community Forum",
    description: "Connect with other users",
    contact: "community.agriconnect.rw",
    action: "Join Forum",
    href: "#",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
]

const FAQ_DATA = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How do I register as a farmer on AgriConnect?",
        answer:
          "Click 'Get Started' and select 'Farmer' during registration. You'll need to provide your farm details, location, and verification documents. Our team will verify your account within 24-48 hours.",
      },
      {
        question: "What documents do I need to verify my account?",
        answer:
          "For farmers: National ID, farm registration certificate (if available), and photos of your farm. For sellers: National ID, business license, and tax registration certificate.",
      },
      {
        question: "Is there a fee to join AgriConnect?",
        answer:
          "Registration is completely free! We only charge a small transaction fee (2.5%) when you successfully complete a sale. There are no monthly fees or hidden charges.",
      },
    ],
  },
  {
    category: "Buying & Selling",
    questions: [
      {
        question: "How do I verify the quality of products before buying?",
        answer:
          "All farmers are verified, and we have a comprehensive rating system. You can view farmer profiles, read reviews, request additional photos, and communicate directly with farmers before purchasing.",
      },
      {
        question: "What payment methods are accepted?",
        answer:
          "We accept Mobile Money (MTN Mobile Money, Airtel Money), bank transfers, and cash on delivery for local transactions. All payments are secure and protected.",
      },
      {
        question: "How does delivery work?",
        answer:
          "Farmers can arrange their own delivery or use our network of delivery partners. Delivery costs and timeframes are clearly shown before you complete your purchase.",
      },
    ],
  },
  {
    category: "Technical Support",
    questions: [
      {
        question: "I'm having trouble with the mobile app. What should I do?",
        answer:
          "First, try updating to the latest version. If issues persist, contact our technical support team at support@agriconnect.rw or call our helpline. We provide support in Kinyarwanda, English, and French.",
      },
      {
        question: "How do I reset my password?",
        answer:
          "Click 'Forgot Password' on the login page and enter your email or phone number. You'll receive a reset link via email or SMS. If you don't receive it, check your spam folder or contact support.",
      },
    ],
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
    priority: "normal",
  })
  const [faqSearch, setFaqSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const { toast } = useToast()

  const contactMutation = api.contact.send.useMutation({
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      })
      setFormData({ name: "", email: "", phone: "", subject: "", category: "", message: "", priority: "normal" })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (!formData.email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    contactMutation.mutate(formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const filteredFAQs = FAQ_DATA.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        (selectedCategory === "" || category.category === selectedCategory) &&
        (faqSearch === "" ||
          q.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
          q.answer.toLowerCase().includes(faqSearch.toLowerCase())),
    ),
  })).filter((category) => category.questions.length > 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 dark:from-green-950 dark:via-blue-950 dark:to-yellow-950 py-20">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Get In <span className="gradient-text">Touch</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
              <div className="flex items-center justify-center space-x-8 text-sm">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-green-500 mr-2" />
                  <span>24h response time</span>
                </div>
                <div className="flex items-center">
                  <Headphones className="w-4 h-4 text-blue-500 mr-2" />
                  <span>Multilingual support</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-purple-500 mr-2" />
                  <span>Dedicated team</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SlideInOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Preferred Contact Method</h2>
              <p className="text-xl text-muted-foreground">We're here to help through multiple channels</p>
            </div>
          </SlideInOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {CONTACT_METHODS.map((method, index) => (
              <SlideInOnScroll key={index} delay={index * 0.1}>
                <Card className="glassmorphism hover:scale-105 transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${method.color}`}
                    >
                      {method.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{method.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{method.description}</p>
                    <p className="font-medium mb-4">{method.contact}</p>
                    <Button size="sm" className="w-full" asChild>
                      <a href={method.href} target={method.href.startsWith("http") ? "_blank" : undefined}>
                        {method.action}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </SlideInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Enhanced Contact Form */}
            <SlideInOnScroll direction="left">
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Send className="w-6 h-6 mr-3" />
                    Send us a Message
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                          Full Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-2">
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+250 788 123 456"
                        />
                      </div>
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium mb-2">
                          Category
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-input bg-background rounded-md"
                        >
                          <option value="">Select category</option>
                          <option value="general">General Inquiry</option>
                          <option value="technical">Technical Support</option>
                          <option value="billing">Billing & Payments</option>
                          <option value="partnership">Partnership</option>
                          <option value="feedback">Feedback</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Brief description of your inquiry"
                      />
                    </div>

                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium mb-2">
                        Priority Level
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      >
                        <option value="low">Low - General question</option>
                        <option value="normal">Normal - Standard inquiry</option>
                        <option value="high">High - Urgent issue</option>
                        <option value="critical">Critical - System down</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Please provide as much detail as possible about your inquiry..."
                      />
                    </div>

                    <div className="flex items-start space-x-2">
                      <input type="checkbox" id="consent" required className="mt-1" />
                      <label htmlFor="consent" className="text-sm text-muted-foreground">
                        I agree to the processing of my personal data for the purpose of responding to my inquiry. *
                      </label>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={contactMutation.isPending}
                      className="w-full bg-gradient-primary text-white"
                    >
                      {contactMutation.isPending ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </SlideInOnScroll>

            {/* Enhanced Contact Information */}
            <SlideInOnScroll direction="right">
              <div className="space-y-6">
                {/* Office Information */}
                <Card className="glassmorphism">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">Visit Our Office</h3>
                        <p className="text-muted-foreground mb-4">
                          Come visit us at our headquarters in Kigali Innovation City.
                        </p>
                        <p className="font-medium mb-4">{CONTACT_INFO.address}</p>
                        <Button variant="outline" size="sm" asChild>
                          <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                            Get Directions
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Business Hours */}
                <Card className="glassmorphism">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-4">Business Hours</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Monday - Friday:</span>
                            <span className="font-medium">8:00 AM - 6:00 PM</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Saturday:</span>
                            <span className="font-medium">9:00 AM - 4:00 PM</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sunday:</span>
                            <span className="font-medium">Closed</span>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-sm text-green-700 dark:text-green-300">
                            <strong>Emergency Support:</strong> Available 24/7 for critical issues
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="glassmorphism">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                    <div className="space-y-3">
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <a href="/help">
                          <FileText className="w-4 h-4 mr-3" />
                          Help Center
                        </a>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <a href="/community">
                          <Users className="w-4 h-4 mr-3" />
                          Community Forum
                        </a>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <a href="/status">
                          <Headphones className="w-4 h-4 mr-3" />
                          System Status
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </SlideInOnScroll>
          </div>
        </div>
      </section>

      {/* Enhanced FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SlideInOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Frequently Asked <span className="gradient-text">Questions</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Find quick answers to common questions about AgriConnect
              </p>
            </div>
          </SlideInOnScroll>

          {/* FAQ Search and Filter */}
          <SlideInOnScroll delay={0.2}>
            <div className="max-w-4xl mx-auto mb-12">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Search FAQs..."
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 rounded-md border bg-background min-w-[200px]"
                >
                  <option value="">All Categories</option>
                  {FAQ_DATA.map((category) => (
                    <option key={category.category} value={category.category}>
                      {category.category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </SlideInOnScroll>

          {/* FAQ Content */}
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.map((category, categoryIndex) => (
              <SlideInOnScroll key={category.category} delay={categoryIndex * 0.1}>
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <Badge variant="secondary" className="mr-3">
                      {category.category}
                    </Badge>
                    <h3 className="text-xl font-semibold">{category.category}</h3>
                  </div>
                  <div className="space-y-4">
                    {category.questions.map((faq, index) => (
                      <Card key={index} className="glassmorphism">
                        <CardContent className="p-6">
                          <h4 className="font-semibold text-lg mb-3">{faq.question}</h4>
                          <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </SlideInOnScroll>
            ))}

            {filteredFAQs.length === 0 && (
              <SlideInOnScroll>
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No FAQs Found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search terms or browse all categories.
                  </p>
                  <Button
                    onClick={() => {
                      setFaqSearch("")
                      setSelectedCategory("")
                    }}
                  >
                    Clear Search
                  </Button>
                </div>
              </SlideInOnScroll>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
