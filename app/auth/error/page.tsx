"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertOctagon, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (err: string | null) => {
    switch (err) {
      case "Configuration":
        return "There is a problem with the server configuration. Check if environment variables are set.";
      case "AccessDenied":
        return "You do not have permission to sign in with this account.";
      case "Verification":
        return "The verification link has expired or has already been used.";
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "EmailCreateAccount":
      case "Callback":
      case "OAuthAccountNotLinked":
        return "Could not sign in with Google or linked account. Try using email/password instead.";
      default:
        return "An unexpected authentication error occurred. Please try again.";
    }
  };

  return (
    <Card className="text-center">
      <CardHeader>
        <div className="w-16 h-16 rounded-full bg-red-950/60 border border-red-800 flex items-center justify-center text-red-500 mx-auto mb-3">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <CardTitle className="text-2xl text-red-400">Authentication Error</CardTitle>
        <CardDescription className="text-zinc-300 font-medium mt-1">
          {getErrorMessage(error)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-2.5 bg-black/40 border border-zinc-800 rounded-md text-xs font-mono text-zinc-400">
            Error Code: <span className="text-[#FF4B33] font-bold">{error}</span>
          </div>
        )}

        <Link href="/auth/signin" className="block w-full">
          <Button variant="primary" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Sign In
          </Button>
        </Link>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-xs text-zinc-500">&copy; Grafene Community</p>
      </CardFooter>
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12 bg-[#121215] border border-zinc-800 rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF4B33]" />
          </div>
        }
      >
        <AuthErrorContent />
      </Suspense>
    </AuthLayout>
  );
}
