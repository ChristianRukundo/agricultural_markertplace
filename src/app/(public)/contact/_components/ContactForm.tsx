"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

type ContactFormData = z.infer<typeof contactSchema>

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("Contact form submitted:", data)
    setIsSubmitted(true)
    setIsSubmitting(false)
    reset()

    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000)
  }

  if (isSubmitted) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Message Sent Successfully!</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Thank you for contacting us. We'll get back to you within 24 hours.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
            <Input {...register("name")} placeholder="Your full name" error={errors.name?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
            <Input
              {...register("email")}
              type="email"
              placeholder="your.email@example.com"
              error={errors.email?.message}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
            <Input {...register("phone")} placeholder="+250 788 123 456" error={errors.phone?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject *</label>
            <Input {...register("subject")} placeholder="What is this about?" error={errors.subject?.message} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message *</label>
          <textarea
            {...register("message")}
            rows={6}
            placeholder="Tell us more about your inquiry..."
            className="w-full px-4 py-3 bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
          />
          {errors.message && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.message.message}</p>}
        </div>

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Sending Message..." : "Send Message"}
        </Button>
      </form>
    </Card>
  )
}
