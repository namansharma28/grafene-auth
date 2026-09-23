"use client";

import React, { Suspense } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignInForm } from "@/components/auth/SignInForm";
import { Loader2 } from "lucide-react";

export default function SignInPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12 glass-card rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF4B33]" />
          </div>
        }
      >
        <SignInForm />
      </Suspense>
    </AuthLayout>
  );
}
