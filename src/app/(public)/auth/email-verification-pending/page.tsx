// src/app/(public)/auth/email-verification-pending/page.tsx
"use client";

import { CheckCircle, Mail, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { emailSchema } from "@/lib/utils/validation"; 
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { useGSAP } from "@/components/providers/gsap-provider";

const resendFormSchema = z.object({
  email: emailSchema,
});

type ResendFormType = z.infer<typeof resendFormSchema>;

export default function EmailVerificationPendingPage() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const gsap = useGSAP();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ResendFormType>({
    resolver: zodResolver(resendFormSchema),
  });

  const resendMutation = api.auth.requestEmailVerification.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Verification Link Sent",
        description: data.message,
      });
      reset();
    },
    onError: (error) => {
      toast({
        title: "Resend Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitResend = (data: ResendFormType) => {
    resendMutation.mutate(data);
  };

  useEffect(() => {
    gsap.fromTo(
      ".verification-pending-item",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.1 }
    );
  }, [gsap]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="verification-pending-item max-w-2xl w-full mx-auto text-center shadow-xl">
        <CardHeader>
          <CardTitle className="flex flex-col items-center justify-center text-3xl font-bold text-gray-900 dark:text-white mb-2">
            <Mail className="w-16 h-16 text-primary mb-4" />
            Email Verification Pending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="verification-pending-item text-lg text-muted-foreground">
            Thank you for registering! An email has been sent to your inbox.
            Please click the verification link in that email to activate your
            account.
          </p>
          <div className="verification-pending-item p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              **Important:** If you don't see the email, please check your spam
              or junk folder. It might take a few minutes to arrive.
            </p>
          </div>

          <div className="verification-pending-item space-y-4">
            <h3 className="text-xl font-semibold">Didn't receive the email?</h3>
            <form
              ref={formRef}
              onSubmit={handleSubmit(onSubmitResend)}
              className="space-y-4"
            >
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="resend-email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter your registered email address"
                  className={cn(
                    "pl-12 pr-4 py-3",
                    errors.email && "border-destructive"
                  )}
                  disabled={resendMutation.isPending}
                />
                {errors.email && (
                  <p className="text-xs text-destructive text-left mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={resendMutation.isPending}
              >
                {resendMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Resending...
                  </>
                ) : (
                  "Resend Verification Link"
                )}
              </Button>
            </form>
          </div>

          <div className="verification-pending-item text-center mt-6">
            <p className="text-muted-foreground">
              Already verified?{" "}
              <Link
                href="/auth/login"
                className="text-primary hover:underline font-medium"
              >
                Go to Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
