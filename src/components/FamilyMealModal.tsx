import React, { useState, useMemo, useEffect } from "react";
import { Search, Check, X } from "lucide-react";
import { AppData, FamilyMember, MealEntry, MealType, Product, Recipe } from "../types";
import {
  productNutrition,
  recipePer100g,
  uid,
  MEAL_CONFIG,
} from "../lib/utils";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { MemberAvatar } from "./ui/MemberAvatar";

interface FamilyMealModalProps {
  open: boolean;
  onClose: () => void;
  familyMembers: FamilyMember[];
  data: AppData;
  date: string;
  onLog: (entries: { memberId: string; mealType: MealType; entry: MealEntry }[]) => void;
}

type FoodItem = { type: "product"; item: Product } | { type: "recipe"; item: Recipe };

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
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [memberGrams, setMemberGrams] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelected(null);
      setMemberGrams({});
      setTab("products");
    }
  }, [open]);

  useEffect(() => {
    if (selected) {
      const initial: Record<string, string> = {};
      familyMembers.forEach(m => { initial[m.id] = ""; });
      setMemberGrams(initial);
    }
  }, [selected, familyMembers]);

  const filteredProducts = useMemo(
    () => data.products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
    [data.products, search]
  );

  const filteredRecipes = useMemo(
    () => data.recipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase())),
    [data.recipes, search]
  );

  const getPreviewCalories = (memberId: string): number | null => {
    const g = parseFloat(memberGrams[memberId]);
    if (!selected || !g || g <= 0) return null;
    if (selected.type === "product") {
      return productNutrition(selected.item as Product, g).calories;
    }
    const p100 = recipePer100g(selected.item as Recipe, data.products);
    return Math.round(p100.calories * (g / 100));
  };

  const handleLog = () => {
    if (!selected) return;
    const results: { memberId: string; mealType: MealType; entry: MealEntry }[] = [];

    familyMembers.forEach(m => {
      const g = parseFloat(memberGrams[m.id]);
      if (!g || g <= 0) return;
      results.push({
        memberId: m.id,
        mealType,
        entry: {
          id: uid(),
          type: selected.type,
          itemId: selected.type === "product"
            ? (selected.item as Product).id
            : (selected.item as Recipe).id,
          grams: g,
        },
      });
    });

    if (results.length === 0) return;
    onLog(results);
    setSelected(null);
    setMemberGrams({});
    setSearch("");
  };

  const totalLogged = Object.values(memberGrams).filter(v => parseFloat(v) > 0).length;
  const canLog = selected !== null && totalLogged > 0;

  const foodName =
    selected?.type === "product"
      ? (selected.item as Product).name
      : selected?.type === "recipe"
      ? (selected.item as Recipe).name
      : "";

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
          <Button onClick={handleLog} disabled={!canLog}>
            Добавить для {totalLogged} участника 
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Meal type */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Приём пищи</p>
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

        {/* Food selection */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Продукт/рецепт</p>

          {selected ? (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-primary/25 bg-accent/40">
              <Check size={14} className="text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{foodName}</span> ///////аамаавиавиаи
                {selected.type === "product" && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {(selected.item as Product).calories} ккал/100г
                  </span>
                )}
              </div>
              <button
                onClick={() => { setSelected(null); setMemberGrams({}); }}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <div>
              {/* Tabs */}
              <div className="flex gap-1 mb-2">
                {(["products", "recipes"] as const).map(t => ( ////////////////////
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={[
                      "px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors",
                      tab === t
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    ].join(" ")}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative mb-2">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`Поиск ${tab}…`}
                  className="w-full pl-8 pr-8 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
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

              {/* List */}
              <div className="max-h-44 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                {tab === "products" && filteredProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelected({ type: "product", item: p })}
                    className="w-full text-left px-3 py-2.5 hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="text-sm font-medium">{p.name}</span> ///////////
                      <span className="text-xs text-muted-foreground ml-2">{p.description}</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-3">
                      {p.calories} ккал/100г
                    </span>
                  </button>
                ))}
                {tab === "products" && filteredProducts.length === 0 && (
                  <p className="px-3 py-4 text-sm text-muted-foreground text-center">Продукты не найдены.</p>
                )}
                {tab === "recipes" && data.recipes.length === 0 && (
                  <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                    Пока нет рецептов. Создайте их в разделе «Рецепты».
                  </p>
                )}
                {tab === "recipes" && filteredRecipes.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelected({ type: "recipe", item: r })}
                    className="w-full text-left px-3 py-2.5 hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <span className="text-sm font-medium">{r.name}</span>
                    <span className="text-xs text-muted-foreground">{r.ingredients.length} ингредиентов</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Member portions */}
        {selected && familyMembers.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Порции для каждого члена семьи
              <span className="font-normal ml-1">(оставьте пустым, чтобы пропустить)</span>
            </p>
            <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
              {/* Header */}
              <div className="grid grid-cols-[1fr_100px_80px] px-3 py-2 bg-muted/40 text-xs font-medium text-muted-foreground">
                <span>Участник</span>
                <span className="text-right">Граммы</span>
                <span className="text-right">Калории</span>
              </div>
              {familyMembers.map(m => {
                const cal = getPreviewCalories(m.id);
                return (
                  <div
                    key={m.id}
                    className="grid grid-cols-[1fr_100px_80px] items-center px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <MemberAvatar member={m} size="sm" />
                      <span className="text-sm font-medium truncate">{m.name}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <input
                        type="number"
                        value={memberGrams[m.id] ?? ""}
                        onChange={e =>
                          setMemberGrams(prev => ({ ...prev, [m.id]: e.target.value }))
                        }
                        min={0}
                        placeholder="0"
                        className="w-16 text-right px-2 py-1 rounded border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 tabular-nums"
                      />
                      <span className="text-xs text-muted-foreground">г</span>
                    </div>
                    <div className="text-right">
                      {cal !== null ? (
                        <span className="text-sm font-medium tabular-nums">{cal}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
