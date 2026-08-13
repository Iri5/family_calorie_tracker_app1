import React from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AppData, FamilyMember, User } from "../types";
import {
  memberDayNutrition,
  getCalGoal,
  getMacroGoals,
  formatDateLabel,
  shiftDate,
} from "../lib/utils";
import { MemberAvatar, MacroBar, CalorieRing } from "./ui/MemberAvatar";
import { Button } from "./ui/Button";

interface DashboardViewProps {
  user: User;
  data: AppData;
  date: string;
  onDateChange: (d: string) => void;
  onSelectMember: (id: string) => void;
  onAddFamilyMeal: () => void;
}

export function DashboardView({
  user,
  data,
  date,
  onDateChange,
  onSelectMember,
  onAddFamilyMeal,
}: DashboardViewProps) {
  if (user.familyMembers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <img
          src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=260&fit=crop&auto=format&q=75"
          alt="Family nutrition"
          className="w-48 h-32 object-cover rounded-xl opacity-70"
        />
        <h2 className="text-lg font-semibold text-foreground">No family members yet</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Go to Family to add members and set their daily nutrition goals.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">Family Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Daily nutrition summary</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date navigator */}
          <div className="flex items-center gap-0.5 border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => onDateChange(shiftDate(date, -1))}
              className="p-2 hover:bg-muted transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-3 text-xs font-medium min-w-[70px] text-center">
              {formatDateLabel(date)}
            </span>
            <button
              onClick={() => onDateChange(shiftDate(date, 1))}
              className="p-2 hover:bg-muted transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <Button size="sm" onClick={onAddFamilyMeal}>
            <Plus size={13} /> Add Meal
          </Button>
        </div>
      </div>

      {/* Member cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {user.familyMembers.map(member => (
          <MemberCard
            key={member.id}
            member={member}
            data={data}
            date={date}
            onClick={() => onSelectMember(member.id)}
          />
        ))}
      </div>
    </div>
  );
}

function MemberCard({
  member,
  data,
  date,
  onClick,
}: {
  member: FamilyMember;
  data: AppData;
  date: string;
  onClick: () => void;
}) {
  const n = memberDayNutrition(member.id, date, data.meals, data.products, data.recipes);
  const cg = getCalGoal(member);
  const mg = getMacroGoals(member);
  const remaining = cg - n.calories;
  const over = remaining < 0;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.12 }}
      className="bg-card rounded-xl border border-border p-4 text-left hover:border-primary/25 hover:shadow-sm transition-all"
    >
      {/* Header row */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative shrink-0">
          <CalorieRing value={n.calories} max={cg} size={52} stroke={5} />
          <div className="absolute inset-0 flex items-center justify-center">
            <MemberAvatar member={member} size="sm" />
          </div>
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="font-semibold text-sm text-foreground">{member.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {member.age} y · Goal {cg} kcal
          </div>
          <div
            className={`text-xs font-medium mt-1 tabular-nums ${
              over ? "text-destructive" : "text-primary"
            }`}
          >
            {n.calories} consumed ·{" "}
            {over ? `${Math.abs(remaining)} over` : `${remaining} remaining`}
          </div>
        </div>
        <ChevronRight size={14} className="text-muted-foreground shrink-0 mt-1" />
      </div>

      {/* Macro bars */}
      <div className="flex flex-col gap-2">
        <MacroBar label="Protein" value={n.protein} goal={mg.protein} colorClass="bg-blue-500" />
        <MacroBar label="Fat" value={n.fat} goal={mg.fat} colorClass="bg-amber-500" />
        <MacroBar label="Carbs" value={n.carbs} goal={mg.carbs} colorClass="bg-orange-500" />
      </div>
    </motion.button>
  );
}
