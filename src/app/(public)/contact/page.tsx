"use client";

import { FadeIn } from "@/components/animations/FadeIn";
import { SlideInOnScroll } from "@/components/animations/SlideInOnScroll";
import { Card } from "@/components/ui/Card";
import { ContactForm } from "./_components/ContactForm";
import { CONTACT_INFO } from "@/lib/constants";

export default function ContactPage() {
  const contactMethods = [
    {
      title: "Email Us",
      description: "Send us an email and we'll respond within 24 hours",
      value: CONTACT_INFO.email,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Call Us",
      description: "Speak directly with our support team",
      value: CONTACT_INFO.phone,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
    },
    {
      title: "Visit Us",
      description: "Come to our office in Kigali",
      value: CONTACT_INFO.address,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  const faqs = [
    {
      question: "How do I become a farmer on AgriConnect?",
      answer:
        "Simply register for an account, complete your farmer profile with your location and farming details, and start listing your products. Our team will verify your account within 24 hours.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept Mobile Money (MTN Mobile Money, Airtel Money), bank transfers, and cash on delivery for certain locations.",
    },
    {
      question: "How do you ensure product quality?",
      answer:
        "We work closely with farmers to maintain quality standards, provide training on best practices, and have a review system where buyers can rate products and sellers.",
    },
    {
      question: "Do you deliver nationwide?",
      answer:
        "We currently deliver to all 30 districts in Rwanda. Delivery times vary by location, with same-day delivery available in Kigali and next-day delivery in most other areas.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Get in{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {contactMethods.map((method, index) => (
              <SlideInOnScroll key={method.title} delay={index * 0.1}>
                <Card className="text-center p-8 h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white mx-auto mb-6">
                    {method.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {method.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {method.description}
                  </p>
                  <p className="text-primary-600 dark:text-primary-400 font-medium">
                    {method.value}
                  </p>
                </Card>
              </SlideInOnScroll>
            ))}
          </div>

          {/* Contact Form and Map */}
          <div className="grid lg:grid-cols-2 gap-16">
            <SlideInOnScroll direction="left">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Send us a Message
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Fill out the form below and we'll get back to you within 24
                  hours.
                </p>
                <ContactForm />
              </div>
            </SlideInOnScroll>

            <SlideInOnScroll direction="right">
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Office Hours
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Monday - Friday
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        8:00 AM - 6:00 PM
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Saturday
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        9:00 AM - 4:00 PM
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Sunday
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        Closed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl p-8 text-white">
                  <h3 className="text-xl font-bold mb-4">Emergency Support</h3>
                  <p className="mb-4">
                    For urgent issues related to orders or payments, call our
                    24/7 emergency line:
                  </p>
                  <p className="text-2xl font-bold">+250 788 123 456</p>
                </div>
              </div>
            </SlideInOnScroll>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Quick answers to common questions about AgriConnect
              </p>
            </div>
          </FadeIn>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <SlideInOnScroll key={index} delay={index * 0.1}>
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {faq.answer}
                  </p>
                </Card>
              </SlideInOnScroll>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
