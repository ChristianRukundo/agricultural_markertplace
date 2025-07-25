"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FadeIn } from "@/components/animations/fade-in"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const error = searchParams.get("error")

  useEffect(() => {
    if (error) {
      const errorMessages: { [key: string]: string } = {
        CredentialsSignin: "Invalid email or password. Please try again.",
        OAuthSignin: "Error occurred during sign in. Please try again.",
        OAuthCallback: "Error occurred during sign in. Please try again.",
        OAuthCreateAccount: "Could not create account. Please try again.",
        EmailCreateAccount: "Could not create account. Please try again.",
        Callback: "Error occurred during sign in. Please try again.",
        OAuthAccountNotLinked: "Account already exists with different provider.",
        EmailSignin: "Check your email for the sign in link.",
        CredentialsSignup: "Account creation failed. Please try again.",
        SessionRequired: "Please sign in to access this page.",
      }

      toast({
        title: "Sign In Error",
        description: errorMessages[error] || "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }, [error, toast])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setErrors({ submit: "Invalid email or password. Please try again." })
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        })

        // Check if user needs to verify phone
        const session = await getSession()
        if (session?.user.phoneVerified === false) {
          router.push(`/auth/verify-phone?phone=${encodeURIComponent(session.user.phoneNumber || "")}`)
        } else {
          router.push(callbackUrl)
        }
      }
    } catch (error) {
      setErrors({ submit: "An unexpected error occurred. Please try again." })
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleDemoLogin = async (role: "FARMER" | "SELLER" | "ADMIN") => {
    const demoCredentials = {
      FARMER: { email: "farmer@demo.com", password: "demo123" },
      SELLER: { email: "seller@demo.com", password: "demo123" },
      ADMIN: { email: "admin@demo.com", password: "demo123" },
    }

    const credentials = demoCredentials[role]
    setFormData(credentials)

    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Demo Login Failed",
          description: "Demo account not available. Please use regular login.",
          variant: "destructive",
        })
      } else {
        toast({
          title: `Welcome ${role.toLowerCase()}!`,
          description: "You are now logged in with the demo account.",
        })
        router.push(callbackUrl)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login with demo account.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 dark:from-green-950 dark:via-blue-950 dark:to-yellow-950 flex items-center justify-center p-4">
      <FadeIn>
        <Card className="glassmorphism w-full max-w-md p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">A</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your AgriConnect account</p>
          </div>

          {/* Demo Accounts */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-3 text-center">Try Demo Accounts:</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("FARMER")}
                disabled={isLoading}
                className="text-xs"
              >
                Farmer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("SELLER")}
                disabled={isLoading}
                className="text-xs"
              >
                Seller
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("ADMIN")}
                disabled={isLoading}
                className="text-xs"
              >
                Admin
              </Button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Error */}
            {errors.submit && (
              <div className="flex items-center space-x-2 text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.submit}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <div className="flex items-center space-x-1 mt-1 text-destructive">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-xs">{errors.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.password && (
                  <div className="flex items-center space-x-1 mt-1 text-destructive">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-xs">{errors.password}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2"
                  disabled={isLoading}
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" disabled={isLoading} className="w-full bg-gradient-primary text-white">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-muted" />
            <span className="px-4 text-sm text-muted-foreground">or</span>
            <div className="flex-1 border-t border-muted" />
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <Button variant="outline" size="lg" className="w-full bg-transparent" disabled>
              <img src="/placeholder.svg?height=20&width=20&text=G" alt="Google" className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs">Your data is protected with end-to-end encryption</span>
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  )
}
