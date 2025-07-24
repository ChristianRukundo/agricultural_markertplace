import { FadeIn } from "@/components/animations/FadeIn"
import { SlideInOnScroll } from "@/components/animations/SlideInOnScroll"
import { Card } from "@/components/ui/Card"
import { ContactForm } from "./_components/ContactForm"
import { CONTACT_INFO } from "@/lib/constants"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <FadeIn>
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-12">
          <SlideInOnScroll direction="left">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white">
                    📍
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Address</h3>
                    <p className="text-gray-600 dark:text-gray-300">{CONTACT_INFO.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white">
                    📞
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Phone</h3>
                    <p className="text-gray-600 dark:text-gray-300">{CONTACT_INFO.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white">
                    ✉️
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h3>
                    <p className="text-gray-600 dark:text-gray-300">{CONTACT_INFO.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white">
                    🕒
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Business Hours</h3>
                    <p className="text-gray-600 dark:text-gray-300">{CONTACT_INFO.hours}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  {CONTACT_INFO.social.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-transform duration-200"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </Card>
          </SlideInOnScroll>

          <SlideInOnScroll direction="right">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h2>
              <ContactForm />
            </Card>
          </SlideInOnScroll>
        </div>
      </div>
    </div>
  )
}
