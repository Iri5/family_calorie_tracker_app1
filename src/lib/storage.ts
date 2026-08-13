import { AppData, User } from "../types";
import { DEFAULT_PRODUCTS } from "../data/products";

const KEY = "nutrifamily-v2";

interface StoredData {
  users: User[];
  customProducts: typeof DEFAULT_PRODUCTS;
  recipes: AppData["recipes"];
  meals: AppData["meals"];
}

export const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { users: [], products: [...DEFAULT_PRODUCTS], recipes: [], meals: [] };
    const saved = JSON.parse(raw) as StoredData;
    return {
      ...saved,
      products: [...DEFAULT_PRODUCTS, ...(saved.customProducts ?? [])],
    };
  } catch {
    return { users: [], products: [...DEFAULT_PRODUCTS], recipes: [], meals: [] };
  }
};

export const saveData = (d: AppData): void => {
  const stored: StoredData = {
    users: d.users,
    customProducts: d.products.filter(p => p.isCustom),
    recipes: d.recipes,
    meals: d.meals,
  };
  localStorage.setItem(KEY, JSON.stringify(stored));
};
