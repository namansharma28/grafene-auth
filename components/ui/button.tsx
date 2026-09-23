import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, children, ...props }, ref) => {
    const baseStyles =
      // Grafene-portfolio submit-btn style: rounded-full, Poppins, solid fill on primary
      "inline-flex items-center justify-center font-semibold transition-colors duration-150 " +
      "focus:outline-none disabled:opacity-50 disabled:pointer-events-none " +
      "rounded-full cursor-pointer font-[var(--font-poppins)] w-full";

    const variants: Record<string, string> = {
      primary:
        "bg-[#FF4B33] text-white border-[3px] border-[#FF4B33] hover:bg-[#e63920] hover:border-[#e63920]",
      secondary:
        "bg-transparent text-white border-[3px] border-white hover:bg-white/10",
      outline:
        "bg-transparent text-white border-[3px] border-white hover:border-[#FF4B33] hover:text-[#FF4B33]",
      ghost:
        "bg-transparent text-zinc-300 border-[3px] border-transparent hover:text-white hover:bg-white/5",
      danger:
        "bg-transparent text-red-400 border-[3px] border-red-500 hover:bg-red-500/10 hover:border-red-400",
    };

    const sizes: Record<string, string> = {
      sm: "h-10 px-6 text-sm",
      md: "h-12 px-7 text-base",
      lg: "h-14 px-8 text-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
