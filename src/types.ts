export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "very" | "extra";
export type MealType = "breakfast" | "lunch" | "snack" | "dinner";
export type View = "dashboard" | "products" | "recipes" | "family";
export type UserRole = "admin" | "user";

export interface Macros {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  weight: number;   // kg
  height: number;   // cm
  sex: Sex;
  activityLevel: ActivityLevel;
  customCalorieGoal?: number;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  category: string;
  subcategory: string;
  calories: number;   // per 100g
  protein: number;
  fat: number;
  carbs: number;
  isCustom: boolean;
  barcode?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
  image: string;
}

export interface RecipeIngredient {
  productId: string;
  grams: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
}

export interface MealEntry {
  id: string;
  type: "product" | "recipe";
  itemId: string;
  grams: number;
}

export interface MealLog {
  id: string;
  memberId: string;
  date: string;
  mealType: MealType;
  entries: MealEntry[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  familyMembers: FamilyMember[];
}

export interface AppData {
  users: User[];
  products: Product[];
  recipes: Recipe[];
  meals: MealLog[];
}
