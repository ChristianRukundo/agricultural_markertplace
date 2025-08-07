"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Confetti from "react-confetti";
import { useState, useEffect } from "react";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      <div className="container mx-auto py-20 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-10">
            <CheckCircle className="mx-auto w-20 h-20 text-green-500 mb-6" />
            <h1 className="text-3xl font-bold mb-4">
              Thank You For Your Order!
            </h1>
            <p className="text-muted-foreground mb-2">
              Your order has been placed successfully.
            </p>
            <p className="text-muted-foreground mb-8">
              Order ID:{" "}
              <span className="font-mono text-foreground">{orderId}</span>
            </p>
            <p className="mb-8">
              The farmer(s) have been notified. You can track the status of your
              order in the &quot;My Orders&quot; section.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <Link href={`/orders/${orderId}`}>View Order Details</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
