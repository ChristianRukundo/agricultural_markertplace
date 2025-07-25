"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Phone, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FadeIn } from "@/components/animations/fade-in"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/trpc/client"

export default function VerifyPhonePage() {
  const [otp, setOtp] = useState("")
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const router = useRouter()
  const searchParams = useSearchParams()
  const phoneNumber = searchParams.get("phone") || ""
  const { toast } = useToast()

  const verifyMutation = api.auth.verifyPhone.useMutation({
    onSuccess: () => {
      toast({
        title: "Phone Verified!",
        description: "Your account has been successfully verified.",
      })
      router.push("/auth/login")
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP.",
        variant: "destructive",
      })
      return
    }

    verifyMutation.mutate({
      phoneNumber,
      otp,
    })
  }

  const handleResendOTP = () => {
    setTimeLeft(300)
    toast({
      title: "OTP Resent",
      description: "A new OTP has been sent to your phone.",
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 dark:from-green-950 dark:via-blue-950 dark:to-yellow-950 flex items-center justify-center p-4">
      <FadeIn>
        <Card className="glassmorphism w-full max-w-md p-8">
          {/* Back Button */}
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Verify Your Phone</h1>
            <p className="text-muted-foreground">We've sent a 6-digit code to</p>
            <p className="font-medium">{phoneNumber}</p>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium mb-2">
                Enter OTP Code
              </label>
              <Input
                id="otp"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={verifyMutation.isPending || otp.length !== 6}
              className="w-full bg-gradient-primary text-white"
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify Phone"}
            </Button>
          </form>

          {/* Resend OTP */}
          <div className="text-center mt-6">
            {timeLeft > 0 ? (
              <p className="text-muted-foreground">Resend code in {formatTime(timeLeft)}</p>
            ) : (
              <Button variant="ghost" onClick={handleResendOTP} className="text-primary hover:underline">
                Resend OTP
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">Didn't receive the code? Check your SMS or try resending.</p>
          </div>
        </Card>
      </FadeIn>
    </div>
  )
}
