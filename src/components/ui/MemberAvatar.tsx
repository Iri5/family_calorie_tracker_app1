import React from "react";
import { FamilyMember } from "../../types";

interface MemberAvatarProps {
  member: FamilyMember;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-base" };

export function MemberAvatar({ member, size = "md" }: MemberAvatarProps) {
  const initials = member.name
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
      style={{ backgroundColor: member.color }}
    >
      {initials}
    </div>
  );
}

export function MacroBar({
  label,
  value,
  goal,
  colorClass,
}: {
  label: string;
  value: number;
  goal: number;
  colorClass: string;
}) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums text-foreground">
          {value}
          <span className="text-muted-foreground font-normal">/{goal}g</span>
        </span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function CalorieRing({
  value,
  max,
  size = 72,
  stroke = 6,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circ * (1 - pct);
  const trackColor = value > max ? "#B91C1C" : value > max * 0.88 ? "#D97706" : "#1C4532";

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-muted"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={trackColor}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
      />
    </svg>
  );
}
