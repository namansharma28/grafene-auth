"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, RefreshCw, Loader2, Mail } from "lucide-react";
import Link from "next/link";

export const VerifyOtpForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "email_verification";

  const rawCallback =
    searchParams.get("callbackUrl") ||
    searchParams.get("redirect_uri") ||
    searchParams.get("redirect") ||
    searchParams.get("ref");
  const callbackUrl = rawCallback && rawCallback !== "/" ? rawCallback : "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setErrorMessage(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: fullOtp, type }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setSuccessMessage("OTP verified successfully!");
      const cbParam = callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : "";
      setTimeout(() => {
        if (type === "password_reset") {
          router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&otp=${fullOtp}${cbParam}`);
        } else {
          router.push(`/auth/signin?verified=true${cbParam}`);
        }
      }, 1200);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      setSuccessMessage("A new 6-digit OTP code has been sent to your email.");
      setTimer(60);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to resend code. Try again later.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="w-12 h-12 rounded-xl bg-[#FF4B33]/10 border border-[#FF4B33]/30 flex items-center justify-center text-[#FF4B33] mx-auto mb-2">
          <Mail className="w-6 h-6" />
        </div>
        <CardTitle>Verify Email</CardTitle>
        <CardDescription>
          Enter the 6-digit OTP sent to <br />
          <span className="font-semibold text-white">{email || "your email"}</span>
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
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center items-center gap-2 sm:gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className="w-11 h-12 text-center text-xl font-mono font-bold rounded-lg border bg-zinc-900 text-white border-zinc-800 focus:border-[#FF4B33] focus:ring-2 focus:ring-[#FF4B33]/40 focus:outline-none transition-all"
              />
            ))}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading || otp.join("").length !== 6}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Verify Code"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col space-y-3 text-center">
        <div className="text-xs text-zinc-400">
          Didn&apos;t receive the code?{" "}
          {timer > 0 ? (
            <span className="text-zinc-500 font-mono">Resend code in {timer}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending}
              className="text-[#FF4B33] font-semibold hover:underline inline-flex items-center gap-1 ml-1"
            >
              {isResending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Resend OTP
            </button>
          )}
        </div>

        <Link href="/auth/signin" className="text-xs text-zinc-500 hover:text-white transition-colors">
          Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
};
