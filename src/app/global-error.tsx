"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";


export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 animate-fade-in">
          <div className="max-w-lg w-full text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white mx-auto mb-6">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Something went wrong!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                We encountered an unexpected error. Our team has been notified
                and is working to fix this issue.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => reset()}
                size="lg"
                className="w-full sm:w-auto"
              >
                Try Again
              </Button>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="ghost">
                  <a href="/">Return Home</a>
                </Button>
                <Button asChild variant="ghost">
                  <a href="/contact">Contact Support</a>
                </Button>
              </div>
            </div>

            {process.env.NODE_ENV === "development" && (
              <div className="mt-12 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-left">
                <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3">
                  Development Error Details
                </h2>
                <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                  <p>
                    <strong>Error:</strong> {error.message}
                  </p>
                  {error.digest && (
                    <p>
                      <strong>Digest:</strong> {error.digest}
                    </p>
                  )}
                  {error.stack && (
                    <details className="mt-4">
                      <summary className="cursor-pointer font-medium">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs overflow-auto bg-red-100 dark:bg-red-900/40 p-3 rounded">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
