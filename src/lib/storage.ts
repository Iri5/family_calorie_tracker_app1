import { AppData, User } from "../types";
import { DEFAULT_PRODUCTS } from "../data/products";

const KEY = "nutrifamily-v2";

interface StoredData {
  users: User[];
  customProducts: typeof DEFAULT_PRODUCTS;
  recipes: AppData["recipes"];
  meals: AppData["meals"];
  defaultOverrides?: Record<string, Partial<typeof DEFAULT_PRODUCTS[number]>>;
  deletedDefaultIds?: string[];
}

export const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return {
        users: [],
        products: [...DEFAULT_PRODUCTS],
        recipes: [],
        meals: [],
      };
    }

    const saved = JSON.parse(raw) as StoredData;

    // Миграция пользователей: у старых записей нет role
    const users: User[] = (saved.users ?? []).map((u, i) => ({
      ...u,
      role:
        u.role ??
        // первый пользователь в старых данных становится админом
        (i === 0 ? "admin" : "user"),
    }));

    const overrides = saved.defaultOverrides ?? {};
    const deleted = new Set(saved.deletedDefaultIds ?? []);

    const defaults = DEFAULT_PRODUCTS
      .filter(p => !deleted.has(p.id))
      .map(p => (overrides[p.id] ? { ...p, ...overrides[p.id] } : p));

    return {
      users,
      products: [...defaults, ...(saved.customProducts ?? [])],
      recipes: saved.recipes ?? [],
      meals: saved.meals ?? [],
    };
  } catch {
    return {
      users: [],
      products: [...DEFAULT_PRODUCTS],
      recipes: [],
      meals: [],
    };
  }
};

export const saveData = (d: AppData): void => {
  // Разделяем продукты на базовые (из DEFAULT_PRODUCTS) и кастомные.
  // Для базовых сохраняем только overrides и удалённые id.
  const defaultIds = new Set(DEFAULT_PRODUCTS.map(p => p.id));
  const currentById = new Map(d.products.map(p => [p.id, p]));

  const defaultOverrides: StoredData["defaultOverrides"] = {};
  const deletedDefaultIds: string[] = [];

  DEFAULT_PRODUCTS.forEach(orig => {
    const current = currentById.get(orig.id);
    if (!current) {
      deletedDefaultIds.push(orig.id);
      return;
    }
    // Сравниваем с оригиналом — если отличается, сохраняем как override
    const diff: Partial<typeof orig> = {};
    (Object.keys(orig) as (keyof typeof orig)[]).forEach(k => {
      if (current[k] !== orig[k]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (diff as any)[k] = current[k];
      }
    });
    if (Object.keys(diff).length > 0) {
      defaultOverrides[orig.id] = diff;
    }
  });

  const customProducts = d.products.filter(p => !defaultIds.has(p.id));

  const stored: StoredData = {
    users: d.users,
    customProducts,
    recipes: d.recipes,
    meals: d.meals,
    defaultOverrides,
    deletedDefaultIds,
  };

  localStorage.setItem(KEY, JSON.stringify(stored));
};