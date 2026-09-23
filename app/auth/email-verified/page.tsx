"use client";

import React from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function EmailVerifiedPage() {
  return (
    <AuthLayout>
      <Card className="text-center">
        <CardHeader>
          <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl text-emerald-400">Email Verified!</CardTitle>
          <CardDescription>
            Your email address has been successfully verified. Your Grafene account is now active and ready.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-xs text-zinc-400">
            You can now sign in to access Gravitas, Teamlane, and all Grafene ecosystem applications seamlessly.
          </p>

          <Link href="/auth/signin" className="block w-full">
            <Button variant="primary" className="w-full">
              Proceed to Sign In <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-xs text-zinc-500">&copy; Grafene Community</p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
