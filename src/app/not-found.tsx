"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations/fade-in"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center">
        <FadeIn>
          <div className="mb-8">
            <div className="text-9xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              404
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4 mb-4">Page Not Found</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the
              wrong URL.
            </p>
          </div>

          <div className="space-y-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/">Return Home</Link>
            </Button>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="ghost">
                <Link href="/products">Browse Products</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/5 dark:bg-black/5 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-xl">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Popular Pages</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Link
                href="/about"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
              >
                About Us
              </Link>
              <Link
                href="/farmers"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
              >
                Find Farmers
              </Link>
              <Link
                href="/auth/register"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
              >
                Join Us
              </Link>
              <Link
                href="/auth/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
