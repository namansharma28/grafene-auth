"use client";

import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, EyeOff, AlertTriangle, CheckCircle, ArrowRight, Loader2 } from "lucide-react";

export const SignInForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const verifiedParam = searchParams.get("verified");

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [googleWarning, setGoogleWarning] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    verifiedParam === "true" ? "Email verified successfully! You can now sign in." : null
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push(callbackUrl);
    }
  }, [status, session, callbackUrl, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrorMessage(null);
    setGoogleWarning(false);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setGoogleWarning(false);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("verify your email")) {
          setErrorMessage("Email verification required before signing in.");
          setTimeout(() => {
            router.push(
              `/auth/verify-otp?email=${encodeURIComponent(formData.email)}&type=email_verification`
            );
          }, 1500);
        } else if (result.error.includes("GOOGLE_ACCOUNT_EXISTS")) {
          setGoogleWarning(true);
          setErrorMessage("Account created with Google. Please use 'Continue with Google'.");
        } else {
          setErrorMessage("Invalid email or password. Please try again.");
        }
      } else if (result?.ok) {
        setSuccessMessage("Welcome back! Redirecting...");
        setTimeout(() => {
          router.push(callbackUrl);
        }, 800);
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      await signIn("google", { callbackUrl });
    } catch (error) {
      setErrorMessage("Failed to initiate Google sign-in. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
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

      <CardContent className="space-y-4">
        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="secondary"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full relative py-2.5 font-medium"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </Button>

        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-zinc-800 w-full" />
          <span className="bg-[#09090b] px-3 text-xs uppercase tracking-widest text-zinc-500 font-semibold absolute">
            Or continue with
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="user@domain.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-[#FF4B33] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {googleWarning && (
            <div className="p-3 bg-[#FF4B33]/10 border border-[#FF4B33]/30 rounded-md text-xs text-zinc-300 space-y-1.5">
              <p className="font-semibold text-white">Google Account Detected</p>
              <p className="text-zinc-400">
                You registered with Google. Click &quot;Continue with Google&quot; or set a password to use email sign in.
              </p>
              <Link
                href={`/auth/forgot-password?email=${encodeURIComponent(formData.email)}`}
                className="inline-flex items-center text-[#FF4B33] hover:underline font-medium text-xs mt-1"
              >
                Set a password now <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Sign In"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-xs text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href={`/auth/signup${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
            className="text-[#FF4B33] font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};
