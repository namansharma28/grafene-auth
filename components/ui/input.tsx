import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Grafene-portfolio style: transparent bg, bold white border, pill, big text
          "flex h-12 w-full",
          "bg-transparent border-[3px] border-white",
          "text-white placeholder:text-zinc-500",
          "rounded-full px-6 text-base",
          "font-[var(--font-poppins)] font-medium",
          "transition-colors duration-150",
          "focus:outline-none focus:border-[#FF4B33]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          error && "border-red-400 focus:border-red-400",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
