import React, { useState, useMemo, useEffect } from "react";
import { Search, Check, X, Plus, Trash2 } from "lucide-react";
import {
  AppData,
  FamilyMember,
  MealEntry,
  MealType,
  Product,
  Recipe,
} from "../types";
import { productNutrition, recipePer100g, uid, MEAL_CONFIG } from "../lib/utils";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { MemberAvatar } from "./ui/MemberAvatar";

interface FamilyMealModalProps {
  open: boolean;
  onClose: () => void;
  familyMembers: FamilyMember[];
  data: AppData;
  date: string;
  onLog: (
    entries: { memberId: string; mealType: MealType; entry: MealEntry }[]
  ) => void;
}

type BasketItem = {
  key: string;
  type: "product" | "recipe";
  item: Product | Recipe;
  memberGrams: Record<string, string>;
};

export function FamilyMealModal({
  open,
  onClose,
  familyMembers,
  data,
  date,
  onLog,
}: FamilyMealModalProps) {
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [tab, setTab] = useState<"products" | "recipes">("products");
  const [search, setSearch] = useState("");
  const [basket, setBasket] = useState<BasketItem[]>([]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setBasket([]);
      setTab("products");
    }
  }, [open]);

  const filteredProducts = useMemo(
    () =>
      data.products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [data.products, search]
  );

  const filteredRecipes = useMemo(
    () =>
      data.recipes.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase())
      ),
    [data.recipes, search]
  );

  const addToBasket = (type: "product" | "recipe", item: Product | Recipe) => {
    const initial: Record<string, string> = {};
    familyMembers.forEach(m => {
      initial[m.id] = "";
    });
    setBasket(b => [...b, { key: uid(), type, item, memberGrams: initial }]);
    setSearch("");
  };

  const removeFromBasket = (key: string) =>
    setBasket(b => b.filter(i => i.key !== key));

  const setGrams = (key: string, memberId: string, value: string) =>
    setBasket(b =>
      b.map(i =>
        i.key === key
          ? {
              ...i,
              memberGrams: { ...i.memberGrams, [memberId]: value },
            }
          : i
      )
    );

  const itemCalories = (item: BasketItem, memberId: string): number | null => {
    const g = parseFloat(item.memberGrams[memberId]);
    if (!g || g <= 0) return null;
    if (item.type === "product") {
      return productNutrition(item.item as Product, g).calories;
    }
    const p100 = recipePer100g(item.item as Recipe, data.products);
    return Math.round(p100.calories * (g / 100));
  };

  const memberTotals = useMemo(() => {
    const totals: Record<string, { cal: number; count: number }> = {};
    familyMembers.forEach(m => {
      totals[m.id] = { cal: 0, count: 0 };
    });
    basket.forEach(item => {
      familyMembers.forEach(m => {
        const c = itemCalories(item, m.id);
        if (c !== null) {
          totals[m.id].cal += c;
          totals[m.id].count += 1;
        }
      });
    });
    return totals;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basket, familyMembers, data.products]);

  const handleLog = () => {
    if (basket.length === 0) return;
    const results: {
      memberId: string;
      mealType: MealType;
      entry: MealEntry;
    }[] = [];

    basket.forEach(item => {
      familyMembers.forEach(m => {
        const g = parseFloat(item.memberGrams[m.id]);
        if (!g || g <= 0) return;
        results.push({
          memberId: m.id,
          mealType,
          entry: {
            id: uid(),
            type: item.type,
            itemId: item.item.id,
            grams: g,
          },
        });
      });
    });

    if (results.length === 0) return;
    onLog(results);
    setBasket([]);
    setSearch("");
  };

  const participantsCount = familyMembers.filter(
    m => memberTotals[m.id].count > 0
  ).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Добавить приём для семьи"
      subtitle={date}
      wide
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            onClick={handleLog}
            disabled={basket.length === 0 || participantsCount === 0}
          >
            Добавить ({basket.length} поз. для {participantsCount} чел.)
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Тип приёма */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Приём пищи
          </p>
          <div className="flex gap-1.5">
            {MEAL_CONFIG.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => setMealType(type)}
                className={[
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  mealType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Поиск и добавление в корзину */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Добавить продукт/рецепт в корзину
          </p>

          <div className="flex gap-1 mb-2">
            {(["products", "recipes"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                  tab === t
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                ].join(" ")}
              >
                {t === "products" ? "Продукты" : "Рецепты"}
              </button>
            ))}
          </div>

          <div className="relative mb-2">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск…"
              className="w-full pl-8 pr-8 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="max-h-40 overflow-y-auto border border-border rounded-lg divide-y divide-border">
            {tab === "products" &&
              filteredProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => addToBasket("product", p)}
                  className="w-full text-left px-3 py-2 hover:bg-muted transition-colors flex items-center justify-between group"
                >
                  <div className="min-w-0">
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {p.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs text-muted-foreground">
                      {p.calories} ккал/100г
                    </span>
                    <Plus
                      size={13}
                      className="text-muted-foreground group-hover:text-primary"
                    />
                  </div>
                </button>
              ))}
            {tab === "products" && filteredProducts.length === 0 && (
              <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                Продукты не найдены.
              </p>
            )}
            {tab === "recipes" && filteredRecipes.map(r => (
              <button
                key={r.id}
                onClick={() => addToBasket("recipe", r)}
                className="w-full text-left px-3 py-2 hover:bg-muted transition-colors flex items-center justify-between group"
              >
                <span className="text-sm font-medium">{r.name}</span>
                <Plus
                  size={13}
                  className="text-muted-foreground group-hover:text-primary"
                />
              </button>
            ))}
            {tab === "recipes" && filteredRecipes.length === 0 && (
              <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                Рецепты не найдены.
              </p>
            )}
          </div>
        </div>

        {/* Корзина */}
        {basket.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Выбранные позиции · укажите граммы для каждого участника
            </p>
            <div className="flex flex-col gap-3">
              {basket.map(item => {
                const name =
                  item.type === "product"
                    ? (item.item as Product).name
                    : (item.item as Recipe).name;
                return (
                  <div
                    key={item.key}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-3 py-2 bg-muted/40">
                      <div className="flex items-center gap-2 min-w-0">
                        <Check size={13} className="text-primary shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {name}
                        </span>
                        {item.type === "product" && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {(item.item as Product).calories} ккал/100г
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromBasket(item.key)}
                        className="p-1 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="divide-y divide-border">
                      {familyMembers.map(m => {
                        const cal = itemCalories(item, m.id);
                        return (
                          <div
                            key={m.id}
                            className="grid grid-cols-[1fr_90px_70px] items-center px-3 py-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <MemberAvatar member={m} size="sm" />
                              <span className="text-sm truncate">{m.name}</span>
                            </div>
                            <div className="flex items-center gap-1 justify-end">
                              <input
                                type="number"
                                value={item.memberGrams[m.id] ?? ""}
                                onChange={e =>
                                  setGrams(item.key, m.id, e.target.value)
                                }
                                min={0}
                                placeholder="0"
                                className="w-14 text-right px-2 py-1 rounded border border-border bg-card text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary/20"
                              />
                              <span className="text-xs text-muted-foreground">
                                г
                              </span>
                            </div>
                            <div className="text-right text-sm tabular-nums">
                              {cal !== null ? (
                                cal
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  —
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 bg-accent/40 rounded-lg px-3 py-2.5">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Итого за приём
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {familyMembers.map(m => {
                  const t = memberTotals[m.id];
                  if (t.count === 0) return null;
                  return (
                    <span key={m.id} className="tabular-nums">
                      <span className="font-medium">{m.name}:</span> {t.cal} ккал
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}