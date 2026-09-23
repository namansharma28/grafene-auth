"use client";

import React from "react";
import { GrafeneLogo } from "./GrafeneLogo";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[#09090b]">
      {/* Left Side Hero Panel */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col justify-between p-12 relative text-white">
        {/* Top Header */}
        <div className="flex items-center gap-3">
          <GrafeneLogo size="lg" />
        </div>

        {/* Center Headline */}
        <div className="my-auto space-y-6 max-w-md">
          <div className="w-12 h-1 bg-[#FF4B33]" />
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight font-[var(--font-poppins)]">
            Unified Identity for<br />
            <span className="text-[#FF4B33]">Grafene</span> Applications
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            One account connects you to Gravitas, Teamlane, and all Grafene ecosystem applications.
          </p>
        </div>

        {/* Bottom Footer */}
        
      </div>

      {/* Right Side Form Panel — no card box, form on background directly */}
      <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center items-center px-6 py-12 sm:px-12 lg:px-16 w-full">
        {/* Mobile Header Logo */}
        <div className="flex lg:hidden justify-center mb-10">
          <GrafeneLogo size="md" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-105"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};
