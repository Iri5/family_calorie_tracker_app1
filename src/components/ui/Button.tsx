import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "xs" | "sm" | "md" | "lg";

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "text-foreground hover:bg-muted",
  outline: "border border-border text-foreground hover:bg-muted",
  danger: "text-destructive hover:bg-destructive/10",
};

const sizes: Record<Size, string> = {
  xs: "px-2 py-1 text-xs rounded",
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-5 py-2.5 text-base rounded-lg",
};

export function Button({
  onClick, children, variant = "primary", size = "md",
  className = "", disabled = false, type = "button", fullWidth = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer",
        "disabled:opacity-40 disabled:cursor-not-allowed select-none",
        variants[variant],
        sizes[size],
        fullWidth ? "w-full justify-center" : "",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
