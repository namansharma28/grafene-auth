"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, CheckCircle, KeyRound, Loader2 } from "lucide-react";

export const ForgotPasswordForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      setSuccessMessage("Password reset instructions & OTP code have been sent to your email.");
      setTimeout(() => {
        router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}&type=password_reset`);
      }, 1500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="w-12 h-12 rounded-xl bg-[#FF4B33]/10 border border-[#FF4B33]/30 flex items-center justify-center text-[#FF4B33] mx-auto mb-2">
          <KeyRound className="w-6 h-6" />
        </div>
        <CardTitle>Forgot Password?</CardTitle>
        <CardDescription>
          Enter your registered email address and we&apos;ll send you an OTP code to reset your password.
        </CardDescription>

        {successMessage && (
          <div className="flex items-center gap-2 p-3 mt-3 bg-emerald-950/60 border border-emerald-800 rounded-md text-emerald-300 text-xs font-medium">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 mt-3 bg-red-950/60 border border-red-800 rounded-md text-red-300 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="user@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Send Reset Code"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <Link href="/auth/signin" className="text-xs text-zinc-400 hover:text-white transition-colors">
          Remember password? <span className="text-[#FF4B33] font-semibold hover:underline">Sign in</span>
        </Link>
      </CardFooter>
    </Card>
  );
};
