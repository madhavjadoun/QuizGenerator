"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "glass" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const baseStyles =
    "relative inline-flex items-center justify-center font-semibold overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-500/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none active:scale-[0.98]";
  
  const variants = {
    primary:
      "btn-premium-shine",
    secondary:
      "bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-xs",
    glass:
      "bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-xs",
    ghost:
      "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/40",
    destructive:
      "bg-red-600 text-white hover:bg-red-500 shadow-xs border border-red-700/10",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  const radiusClass = variant === "primary" ? "rounded-[14px]" : "rounded-xl";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${radiusClass} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}
