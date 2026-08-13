import React from "react";

export const inputCls = [
  "w-full px-3 py-2 rounded-lg border border-border bg-input-background",
  "text-sm text-foreground placeholder:text-muted-foreground/50",
  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
  "transition-all",
].join(" ");

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground tracking-wide">
        {label}
      </label>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

export function TInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${inputCls} ${className}`}
      {...rest}
    />
  );
}

export function NInput({
  value,
  onChange,
  min,
  max,
  step,
  placeholder,
  className = "",
  ...rest
}: {
  value: string | number;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      className={`${inputCls} ${className}`}
      {...rest}
    />
  );
}

export function Sel({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={inputCls}
    >
      {children}
    </select>
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${inputCls} resize-none`}
    />
  );
}
