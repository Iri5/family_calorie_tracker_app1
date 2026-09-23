import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Search,
  X,
  Check,
} from "lucide-react";
import {
  AppData,
  FamilyMember,
  MealEntry,
  MealType,
  Product,
  Recipe,
} from "../types";
import {
  memberDayNutrition,
  mealTypeNutrition,
  getCalGoal,
  getMacroGoals,
  formatDateLabel,
  shiftDate,
  entryNutrition,
  uid,
  productNutrition,
  recipePer100g,
  addOrMergeEntry,
  MEAL_CONFIG,
} from "../lib/utils";
import { MemberAvatar, MacroBar, CalorieRing } from "./ui/MemberAvatar";
import { Button } from "./ui/Button";

interface MemberDetailViewProps {
  member: FamilyMember;
  data: AppData;
  date: string;
  onDateChange: (d: string) => void;
  onUpdateData: (d: AppData) => void;
  onBack: () => void;
}

export function MemberDetailView({
  member,
  data,
  date,
  onDateChange,
  onUpdateData,
  onBack,
}: MemberDetailViewProps) {
  const [addingTo, setAddingTo] = useState<MealType | null>(null);

  const dayN = useMemo(
    () =>
      memberDayNutrition(
        member.id,
        date,
        data.meals,
        data.products,
        data.recipes
      ),
    [member.id, date, data]
  );

  const cg = getCalGoal(member);
  const mg = getMacroGoals(member);
  const remaining = cg - dayN.calories;
  const over = remaining < 0;

  const removeEntry = (mealType: MealType, entryId: string) => {
    const meals = data.meals.map(m =>
      m.memberId === member.id && m.date === date && m.mealType === mealType
        ? { ...m, entries: m.entries.filter(e => e.id !== entryId) }
        : m
    );
    onUpdateData({ ...data, meals });
  };

  const addEntries = (mealType: MealType, entries: MealEntry[]) => {
    let meals = data.meals;
    entries.forEach(e => {
      meals = addOrMergeEntry(meals, member.id, date, mealType, e);
    });
    onUpdateData({ ...data, meals });
  };

  const overColor = over ? "text-destructive" : "text-primary";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Все участники
        </button>
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
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative shrink-0">
            <CalorieRing value={dayN.calories} max={cg} size={64} stroke={6} />
            <div className="absolute inset-0 flex items-center justify-center">
              <MemberAvatar member={member} size="md" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-base text-foreground">
              {member.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              {member.age} лет · {member.weight} кг · {member.height} см · Цель{" "}
              {cg} ккал/день
            </p>
            <div
              className={`text-sm font-semibold mt-1.5 tabular-nums ${overColor}`}
            >
              {dayN.calories} ккал потреблено
              <span className="font-normal text-muted-foreground ml-2 text-xs">
                {over
                  ? `· ${Math.abs(remaining)} превышение`
                  : `· ${remaining} осталось`}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <MacroBar
            label="Белки"
            value={dayN.protein}
            goal={mg.protein}
            colorClass="bg-blue-500"
          />
          <MacroBar
            label="Жиры"
            value={dayN.fat}
            goal={mg.fat}
            colorClass="bg-amber-500"
          />
          <MacroBar
            label="Углеводы"
            value={dayN.carbs}
            goal={mg.carbs}
            colorClass="bg-orange-500"
          />
        </div>
      </div>

      {MEAL_CONFIG.map(({ type, label }) => {
        const log = data.meals.find(
          m =>
            m.memberId === member.id &&
            m.date === date &&
            m.mealType === type
        );
        const mealN = mealTypeNutrition(
          member.id,
          date,
          type,
          data.meals,
          data.products,
          data.recipes
        );

        return (
          <div
            key={type}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {label}
                </span>
                {mealN.calories > 0 && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {mealN.calories} ккал
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setAddingTo(type)}
              >
                <Plus size={12} /> Добавить еду
              </Button>
            </div>

            <div>
              {!log || log.entries.length === 0 ? (
                <button
                  onClick={() => setAddingTo(type)}
                  className="w-full px-4 py-3 text-left text-xs text-muted-foreground hover:bg-muted/40 transition-colors flex items-center gap-2"
                >
                  <Plus size={11} className="opacity-40" /> Нажмите, чтобы
                  добавить
                </button>
              ) : (
                log.entries.map(entry => {
                  const n = entryNutrition(
                    entry,
                    data.products,
                    data.recipes
                  );
                  const name =
                    entry.type === "product"
                      ? data.products.find(p => p.id === entry.itemId)?.name
                      : data.recipes.find(r => r.id === entry.itemId)?.name;
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-muted/20 group transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {name ?? "Неизвестно"}
                          {entry.type === "recipe" && (
                            <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                              (рецепт)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground tabular-nums">
                          {entry.grams}г · Б {n.protein}г · Ж {n.fat}г · У{" "}
                          {n.carbs}г
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-medium tabular-nums">
                          {n.calories} ккал
                        </span>
                        <button
                          onClick={() => removeEntry(type, entry.id)}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}

      {addingTo && (
        <AddFoodModal
          open
          onClose={() => setAddingTo(null)}
          onAdd={entries => {
            addEntries(addingTo, entries);
            setAddingTo(null);
          }}
          products={data.products}
          recipes={data.recipes}
        />
      )}
    </div>
  );
}

// ─── Internal Add Food Modal (корзина) ────────────────────────────────────────

type BasketRow = {
  key: string;
  type: "product" | "recipe";
  itemId: string;
  grams: string;
};

function AddFoodModal({
  open,
  onClose,
  onAdd,
  products,
  recipes,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (entries: MealEntry[]) => void;
  products: Product[];
  recipes: Recipe[];
}) {
  const [tab, setTab] = useState<"products" | "recipes">("products");
  const [search, setSearch] = useState("");
  const [basket, setBasket] = useState<BasketRow[]>([]);

  const filteredP = useMemo(
    () =>
      products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );
  const filteredR = useMemo(
    () =>
      recipes.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase())
      ),
    [recipes, search]
  );

  const addRow = (type: "product" | "recipe", itemId: string) => {
    // не добавляем дважды одинаковую позицию
    if (basket.some(b => b.type === type && b.itemId === itemId)) return;
    setBasket(b => [
      ...b,
      { key: uid(), type, itemId, grams: "100" },
    ]);
    setSearch("");
  };

  const removeRow = (key: string) =>
    setBasket(b => b.filter(r => r.key !== key));

  const setRowGrams = (key: string, value: string) =>
    setBasket(b => b.map(r => (r.key === key ? { ...r, grams: value } : r)));

  const rowNutrition = (row: BasketRow) => {
    const g = parseFloat(row.grams);
    if (!g || g <= 0) return null;
    if (row.type === "product") {
      const p = products.find(x => x.id === row.itemId);
      return p ? productNutrition(p, g) : null;
    }
    const r = recipes.find(x => x.id === row.itemId);
    if (!r) return null;
    const p100 = recipePer100g(r, products);
    const f = g / 100;
    return {
      calories: Math.round(p100.calories * f),
      protein: p100.protein * f,
      fat: p100.fat * f,
      carbs: p100.carbs * f,
    };
  };

  const totalCalories = basket.reduce((sum, row) => {
    const n = rowNutrition(row);
    return sum + (n?.calories ?? 0);
  }, 0);

  const handleAdd = () => {
    const valid = basket.filter(r => parseFloat(r.grams) > 0);
    if (valid.length === 0) return;
    onAdd(
      valid.map(r => ({
        id: uid(),
        type: r.type,
        itemId: r.itemId,
        grams: parseFloat(r.grams),
      }))
    );
  };

  const rowName = (row: BasketRow) =>
    row.type === "product"
      ? products.find(p => p.id === row.itemId)?.name ?? ""
      : recipes.find(r => r.id === row.itemId)?.name ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/25 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="relative z-10 w-full sm:max-w-md bg-card rounded-t-xl sm:rounded-xl shadow-2xl border border-border flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
          <span className="font-semibold text-sm">Добавить еду</span>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex gap-1.5 px-4 pt-3 shrink-0">
          {(["products", "recipes"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {t === "products" ? "Продукты" : "Рецепты"}
            </button>
          ))}
        </div>

        <div className="px-4 pt-2 pb-1 shrink-0 relative">
          <Search
            size={12}
            className="absolute left-7 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
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
              className="absolute right-7 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-1">
          {tab === "products" &&
            filteredP.map(p => (
              <button
                key={p.id}
                onClick={() => addRow("product", p.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg mb-0.5 flex items-center justify-between hover:bg-muted transition-colors group"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.description}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-xs text-muted-foreground">
                    {p.calories} ккал
                  </span>
                  <Plus
                    size={13}
                    className="text-muted-foreground group-hover:text-primary"
                  />
                </div>
              </button>
            ))}
          {tab === "products" && filteredP.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-6">
              Продукты не найдены.
            </p>
          )}
          {tab === "recipes" &&
            filteredR.map(r => (
              <button
                key={r.id}
                onClick={() => addRow("recipe", r.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg mb-0.5 flex items-center justify-between hover:bg-muted transition-colors group"
              >
                <span className="text-sm font-medium">{r.name}</span>
                <Plus
                  size={13}
                  className="text-muted-foreground group-hover:text-primary"
                />
              </button>
            ))}
          {tab === "recipes" && filteredR.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-6">
              Рецепты не найдены.
            </p>
          )}
        </div>

        {/* Корзина */}
        {basket.length > 0 && (
          <div className="border-t border-border bg-muted/20 shrink-0 max-h-60 overflow-y-auto">
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Выбрано: {basket.length}
              </span>
              <span className="text-xs font-medium tabular-nums">
                ≈ {totalCalories} ккал
              </span>
            </div>
            <div className="divide-y divide-border">
              {basket.map(row => {
                const n = rowNutrition(row);
                return (
                  <div
                    key={row.key}
                    className="px-4 py-2 grid grid-cols-[1fr_80px_60px_24px] items-center gap-2"
                  >
                    <span className="text-sm truncate">{rowName(row)}</span>
                    <input
                      type="number"
                      value={row.grams}
                      onChange={e => setRowGrams(row.key, e.target.value)}
                      min={1}
                      className="w-full text-right px-2 py-1 rounded border border-border bg-card text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />
                    <span className="text-xs text-muted-foreground tabular-nums text-right">
                      {n ? `${n.calories} ккал` : "—"}
                    </span>
                    <button
                      onClick={() => removeRow(row.key)}
                      className="p-1 text-muted-foreground hover:text-destructive"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-card shrink-0 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={basket.filter(r => parseFloat(r.grams) > 0).length === 0}
          >
            <Check size={12} /> Добавить{" "}
            {basket.filter(r => parseFloat(r.grams) > 0).length > 0 &&
              `(${basket.filter(r => parseFloat(r.grams) > 0).length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}