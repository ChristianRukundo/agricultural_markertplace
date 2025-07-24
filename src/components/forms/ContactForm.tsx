"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { trpc } from "@/lib/trpc/client"

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

type ContactFormData = z.infer<typeof contactSchema>

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const contactMutation = trpc.contact.send.useMutation({
    onSuccess: () => {
      setIsSubmitted(true)
      reset()
      setTimeout(() => setIsSubmitted(false), 5000)
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    try {
      await contactMutation.mutateAsync(data)
    } catch (error) {
      console.error("Contact form error:", error)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">Message Sent Successfully!</h3>
        <p className="text-gray-600 dark:text-gray-300">Thank you for contacting us. We'll get back to you soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Input {...register("name")} placeholder="Your Name" error={errors.name?.message} />
      </div>

      <div>
        <Input {...register("email")} type="email" placeholder="Your Email" error={errors.email?.message} />
      </div>

      <div>
        <Input {...register("subject")} placeholder="Subject" error={errors.subject?.message} />
      </div>

      <div>
        <textarea
          {...register("message")}
          placeholder="Your Message"
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
        />
        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || contactMutation.isPending}>
        {isSubmitting || contactMutation.isPending ? "Sending..." : "Send Message"}
      </Button>

      {contactMutation.error && (
        <p className="text-red-500 text-sm text-center">Failed to send message. Please try again.</p>
      )}
    </form>
  )
}
