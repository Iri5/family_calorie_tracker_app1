import { FamilyMember, Macros, MealEntry, MealLog, MealType, Product, Recipe } from "../types";

export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725, extra: 1.9,
};

export const MEMBER_COLORS = [
  "#1C4532", "#1D4ED8", "#B45309", "#7C3AED",
  "#BE185D", "#0F766E", "#9A3412", "#1E3A5F",
];

export const MEAL_CONFIG: { type: MealType; label: string }[] = [
  { type: "breakfast", label: "Breakfast" },
  { type: "lunch", label: "Lunch" },
  { type: "snack", label: "Snack" },
  { type: "dinner", label: "Dinner" },
];

export const ACTIVITY_OPTIONS: { value: string; label: string }[] = [
  { value: "sedentary", label: "Sedentary (little/no exercise)" },
  { value: "light", label: "Lightly active (1–3 days/week)" },
  { value: "moderate", label: "Moderately active (3–5 days/week)" },
  { value: "very", label: "Very active (6–7 days/week)" },
  { value: "extra", label: "Super active (physical job or twice/day)" },
];

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const r1 = (n: number) => Math.round(n * 10) / 10;

// ─── Date ────────────────────────────────────────────────────────────────────

export const todayStr = () => new Date().toISOString().split("T")[0];

export const dateStr = (d: Date) => d.toISOString().split("T")[0];

export const shiftDate = (s: string, n: number): string => {
  const d = new Date(s + "T12:00:00");
  d.setDate(d.getDate() + n);
  return dateStr(d);
};

export const formatDateLabel = (s: string): string => {
  const td = todayStr();
  if (s === td) return "Today";
  if (s === shiftDate(td, -1)) return "Yesterday";
  if (s === shiftDate(td, 1)) return "Tomorrow";
  return new Date(s + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
};

export const formatDateFull = (s: string): string =>
  new Date(s + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

// ─── Nutrition calculations ───────────────────────────────────────────────────

export const calcBMR = (m: FamilyMember): number => {
  const b = 10 * m.weight + 6.25 * m.height - 5 * m.age;
  return m.sex === "male" ? b + 5 : b - 161;
};

export const calcTDEE = (m: FamilyMember): number =>
  Math.round(calcBMR(m) * ACTIVITY_MULTIPLIERS[m.activityLevel]);

export const getCalGoal = (m: FamilyMember): number =>
  m.customCalorieGoal ?? calcTDEE(m);

export const getMacroGoals = (m: FamilyMember) => {
  const c = getCalGoal(m);
  return {
    protein: Math.round((c * 0.25) / 4),
    fat: Math.round((c * 0.30) / 9),
    carbs: Math.round((c * 0.45) / 4),
  };
};

export const productNutrition = (p: Product, g: number): Macros => {
  const f = g / 100;
  return {
    calories: Math.round(p.calories * f),
    protein: r1(p.protein * f),
    fat: r1(p.fat * f),
    carbs: r1(p.carbs * f),
  };
};

export const recipePer100g = (r: Recipe, products: Product[]): Macros => {
  const total = r.ingredients.reduce((s, i) => s + i.grams, 0);
  if (total === 0) return { calories: 0, protein: 0, fat: 0, carbs: 0 };
  const sum = r.ingredients.reduce(
    (acc, ing) => {
      const p = products.find(p => p.id === ing.productId);
      if (!p) return acc;
      const f = ing.grams / 100;
      return { calories: acc.calories + p.calories * f, protein: acc.protein + p.protein * f, fat: acc.fat + p.fat * f, carbs: acc.carbs + p.carbs * f };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );
  return {
    calories: Math.round((sum.calories / total) * 100),
    protein: r1((sum.protein / total) * 100),
    fat: r1((sum.fat / total) * 100),
    carbs: r1((sum.carbs / total) * 100),
  };
};

export const entryNutrition = (e: MealEntry, products: Product[], recipes: Recipe[]): Macros => {
  if (e.type === "product") {
    const p = products.find(p => p.id === e.itemId);
    return p ? productNutrition(p, e.grams) : { calories: 0, protein: 0, fat: 0, carbs: 0 };
  }
  const r = recipes.find(r => r.id === e.itemId);
  if (!r) return { calories: 0, protein: 0, fat: 0, carbs: 0 };
  const p100 = recipePer100g(r, products);
  const f = e.grams / 100;
  return {
    calories: Math.round(p100.calories * f),
    protein: r1(p100.protein * f),
    fat: r1(p100.fat * f),
    carbs: r1(p100.carbs * f),
  };
};

export const memberDayNutrition = (
  memberId: string,
  date: string,
  meals: MealLog[],
  products: Product[],
  recipes: Recipe[]
): Macros =>
  meals
    .filter(m => m.memberId === memberId && m.date === date)
    .flatMap(m => m.entries)
    .reduce(
      (acc, e) => {
        const n = entryNutrition(e, products, recipes);
        return {
          calories: acc.calories + n.calories,
          protein: r1(acc.protein + n.protein),
          fat: r1(acc.fat + n.fat),
          carbs: r1(acc.carbs + n.carbs),
        };
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );

export const mealTypeNutrition = (
  memberId: string,
  date: string,
  mealType: string,
  meals: MealLog[],
  products: Product[],
  recipes: Recipe[]
): Macros => {
  const log = meals.find(m => m.memberId === memberId && m.date === date && m.mealType === mealType);
  if (!log) return { calories: 0, protein: 0, fat: 0, carbs: 0 };
  return log.entries.reduce(
    (acc, e) => {
      const n = entryNutrition(e, products, recipes);
      return {
        calories: acc.calories + n.calories,
        protein: r1(acc.protein + n.protein),
        fat: r1(acc.fat + n.fat),
        carbs: r1(acc.carbs + n.carbs),
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );
};

export const addOrMergeEntry = (
  meals: MealLog[],
  memberId: string,
  date: string,
  mealType: MealType,
  entry: MealEntry
): MealLog[] => {
  const result = [...meals];
  const existing = result.find(m => m.memberId === memberId && m.date === date && m.mealType === mealType);
  if (existing) {
    existing.entries = [...existing.entries, entry];
  } else {
    result.push({ id: uid(), memberId, date, mealType, entries: [entry] });
  }
  return result;
};
