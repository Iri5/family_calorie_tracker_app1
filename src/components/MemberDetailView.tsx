import React, { useState, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { useProductName } from '../hooks/useProductName';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Trash2, Search, X, Check } from "lucide-react";
import { AppData, FamilyMember, MealEntry, MealType, Product, Recipe } from "../types";
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
import { Modal } from "./ui/Modal";

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
  const { t } = useTranslation();
  const { getProductName } = useProductName();
  const [addingTo, setAddingTo] = useState<MealType | null>(null);

  const dayN = useMemo(
    () => memberDayNutrition(member.id, date, data.meals, data.products, data.recipes),
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

  const addEntry = (mealType: MealType, entry: MealEntry) => {
    const meals = addOrMergeEntry(data.meals, member.id, date, mealType, entry);
    onUpdateData({ ...data, meals });
  };

  const overColor = over ? "text-destructive" : "text-primary";

  return (
    <div className="flex flex-col gap-5">
      {/* Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> {t('memberDetail.backToAll')}
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

      {/* Summary card */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative shrink-0">
            <CalorieRing value={dayN.calories} max={cg} size={64} stroke={6} />
            <div className="absolute inset-0 flex items-center justify-center">
              <MemberAvatar member={member} size="md" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-base text-foreground">{member.name}</h2>
            <p className="text-xs text-muted-foreground">
              {member.age} {t('memberDetail.yearsOld')} · {member.weight} {t('common.kg')} · {member.height} {t('common.cm')} · {t('memberDetail.goal')} {cg} {t('common.kcal')}/{t('memberDetail.day')}
            </p>
            <div className={`text-sm font-semibold mt-1.5 tabular-nums ${overColor}`}>
              {dayN.calories} {t('common.kcal')} {t('memberDetail.consumed')}
              <span className="font-normal text-muted-foreground ml-2 text-xs">
                {over
                  ? `· ${Math.abs(remaining)} ${t('memberDetail.overLimit')}`
                  : `· ${remaining} ${t('memberDetail.remaining')}`}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <MacroBar label={t('nutrition.protein')} value={dayN.protein} goal={mg.protein} colorClass="bg-blue-500" />
          <MacroBar label={t('nutrition.fat')} value={dayN.fat} goal={mg.fat} colorClass="bg-amber-500" />
          <MacroBar label={t('nutrition.carbs')} value={dayN.carbs} goal={mg.carbs} colorClass="bg-orange-500" />
        </div>
      </div>

      {/* Meal sections */}
      {MEAL_CONFIG.map(({ type, label }) => {
        const log = data.meals.find(
          m => m.memberId === member.id && m.date === date && m.mealType === type
        );
        const mealN = mealTypeNutrition(
          member.id, date, type, data.meals, data.products, data.recipes
        );

        return (
          <div key={type} className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{t(`meal.${type}`)}</span>
                {mealN.calories > 0 && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {mealN.calories} {t('common.kcal')}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="xs" onClick={() => setAddingTo(type)}>
                <Plus size={12} /> {t('meal.addFood')}
              </Button>
            </div>

            <div>
              {(!log || log.entries.length === 0) ? (
                <button
                  onClick={() => setAddingTo(type)}
                  className="w-full px-4 py-3 text-left text-xs text-muted-foreground hover:bg-muted/40 transition-colors flex items-center gap-2"
                >
                  <Plus size={11} className="opacity-40" /> {t('meal.tapToAdd')}
                </button>
              ) : (
                log.entries.map(entry => {
                  const n = entryNutrition(entry, data.products, data.recipes);
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
                          {entry.type === "product"
                            ? getProductName(data.products.find(p => p.id === entry.itemId)!)
                            : name ?? t('memberDetail.unknown')}
                          {entry.type === "recipe" && (
                            <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                              ({t('memberDetail.recipeLabel')})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground tabular-nums">
                          {entry.grams}{t('common.grams')} · {t('nutrition.protein')} {n.protein}{t('common.grams')} · {t('nutrition.fat')} {n.fat}{t('common.grams')} · {t('nutrition.carbs')} {n.carbs}{t('common.grams')}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-medium tabular-nums">{n.calories} {t('common.kcal')}</span>
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
          onAdd={entry => { addEntry(addingTo, entry); setAddingTo(null); }}
          products={data.products}
          recipes={data.recipes}
        />
      )}
    </div>
  );
}

// ─── Internal Add Food Modal ──────────────────────────────────────────────────

function AddFoodModal({
  open,
  onClose,
  onAdd,
  products,
  recipes,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (e: MealEntry) => void;
  products: Product[];
  recipes: Recipe[];
}) {
  const { t } = useTranslation();
  const { getProductName } = useProductName();
  const [tab, setTab] = useState<"products" | "recipes">("products");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ type: "product" | "recipe"; id: string } | null>(null);
  const [grams, setGrams] = useState("100");

  const filteredP = useMemo(
    () => products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );
  const filteredR = useMemo(
    () => recipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase())),
    [recipes, search]
  );

  const selProduct = selected?.type === "product" ? products.find(p => p.id === selected.id) : null;
  const selRecipe = selected?.type === "recipe" ? recipes.find(r => r.id === selected.id) : null;

  const preview = useMemo(() => {
    const g = parseFloat(grams);
    if (!selected || !g || g <= 0) return null;
    if (selected.type === "product" && selProduct) return productNutrition(selProduct, g);
    if (selected.type === "recipe" && selRecipe) {
      const p100 = recipePer100g(selRecipe, products);
      const f = g / 100;
      return { calories: Math.round(p100.calories * f), protein: p100.protein * f, fat: p100.fat * f, carbs: p100.carbs * f };
    }
    return null;
  }, [selected, grams, selProduct, selRecipe, products]);

  const handleAdd = () => {
    const g = parseFloat(grams);
    if (!selected || !g || g <= 0) return;
    onAdd({ id: uid(), type: selected.type, itemId: selected.id, grams: g });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md bg-card rounded-t-xl sm:rounded-xl shadow-2xl border border-border flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
          <span className="font-semibold text-sm">{t('addFoodModal.title')}</span>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground rounded">
            <X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 px-4 pt-3 shrink-0">
          {(["products", "recipes"] as const).map(tabKey => (
            <button
              key={tabKey}
              onClick={() => { setTab(tabKey); setSelected(null); }}
              className={[
                "px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors",
                tab === tabKey ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {t(`addFoodModal.tabs.${tabKey}`)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 pt-2 pb-1 shrink-0 relative">
          <Search size={12} className="absolute left-7 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('addFoodModal.searchPlaceholder', { tab })}
            className="w-full pl-8 pr-8 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
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

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {tab === "products" && filteredP.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected({ type: "product", id: p.id })}
              className={[
                "w-full text-left px-3 py-2.5 rounded-lg mb-0.5 flex items-center justify-between transition-colors",
                selected?.id === p.id && selected.type === "product"
                  ? "bg-accent/60 ring-1 ring-primary/20"
                  : "hover:bg-muted",
              ].join(" ")}
            >
              <div>
                <div className="text-sm font-medium">{getProductName(p)}</div>
                <div className="text-xs text-muted-foreground">{p.description}</div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 ml-2">{p.calories} {t('common.kcal')}</span>
            </button>
          ))}
          {tab === "products" && filteredP.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-6">{t('addFoodModal.noProductsFound')}</p>
          )}
          {tab === "recipes" && recipes.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-6">{t('addFoodModal.noRecipesYet')}</p>
          )}
          {tab === "recipes" && filteredR.map(r => (
            <button
              key={r.id}
              onClick={() => setSelected({ type: "recipe", id: r.id })}
              className={[
                "w-full text-left px-3 py-2.5 rounded-lg mb-0.5 flex items-center justify-between transition-colors",
                selected?.id === r.id && selected.type === "recipe"
                  ? "bg-accent/60 ring-1 ring-primary/20"
                  : "hover:bg-muted",
              ].join(" ")}
            >
              <span className="text-sm font-medium">{r.name}</span>
              {selected?.id === r.id && <Check size={13} className="text-primary" />}
            </button>
          ))}
        </div>

        {/* Grams + add */}
        {selected && (
          <div className="px-4 py-3 border-t border-border bg-muted/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {selProduct ? getProductName(selProduct) : selRecipe?.name}
                </div>
                {preview && (
                  <div className="text-xs text-muted-foreground tabular-nums">
                    {preview.calories} {t('common.kcal')} · {t('nutrition.protein')} {Math.round(preview.protein * 10) / 10}{t('common.grams')}
                  </div>
                )}
              </div>
              <input
                type="number"
                value={grams}
                onChange={e => setGrams(e.target.value)}
                min={1}
                className="w-16 text-right px-2 py-1.5 rounded border border-border bg-card text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-xs text-muted-foreground">{t('common.grams')}</span>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!grams || parseFloat(grams) <= 0}
              >
                <Check size={12} /> {t('addFoodModal.addButton')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}