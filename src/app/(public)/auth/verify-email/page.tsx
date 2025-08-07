"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { api } from "@/lib/trpc/client";

function VerifyEmailComponent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    mutate: verifyEmail,
    isSuccess,
    isError,
    error,
    isPending,
  } = api.auth.verifyEmail.useMutation();

  useEffect(() => {
    if (token) {
      verifyEmail({ token });
    }
  }, [token, verifyEmail]);

  if (!token) {
    return (
      <div className="text-center text-red-500">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Invalid Link</h2>
        <p>
          No verification token was provided. Please check the link in your
          email.
        </p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary mx-auto"></div>
        <h2 className="text-2xl font-semibold mt-4">Verifying...</h2>
        <p className="text-muted-foreground">
          Please wait while we confirm your email.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Verification Failed</h2>
        <p>{error?.message || "An unknown error occurred."}</p>
        <Link
          href="/auth/register"
          className="mt-4 inline-block text-primary hover:underline"
        >
          Try signing up again
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center text-green-600">
        <CheckCircle className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Email Verified Successfully!</h2>
        <p>
          Your account is now active. You can now log in to access your
          dashboard.
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-block bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return null;
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyEmailComponent />
        </Suspense>
      </div>
    </div>
  );
}
