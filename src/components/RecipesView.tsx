import React, { useState, useMemo, useRef } from "react";
import { Plus, Trash2, Pencil, Search, X } from "lucide-react";
import { AppData, Recipe, RecipeIngredient, User } from "../types";
import { recipePer100g, uid } from "../lib/utils";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { Field, TInput } from "./ui/Fields";

interface RecipesViewProps {
  data: AppData;
  onUpdateData: (d: AppData) => void;
  user: User;
}

type RecipeForm = {
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
};

const emptyForm: RecipeForm = { name: "", description: "", ingredients: [] };

export function RecipesView({ data, onUpdateData, user }: RecipesViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<RecipeForm>(emptyForm);
  const [ingSearch, setIngSearch] = useState("");
  const [showIngList, setShowIngList] = useState(false);
  const ingRef = useRef<HTMLInputElement>(null);

  const filteredIng = useMemo(
    () =>
      data.products
        .filter(
          p =>
            p.name.toLowerCase().includes(ingSearch.toLowerCase()) &&
            !form.ingredients.find(i => i.productId === p.id)
        )
        .slice(0, 8),
    [data.products, ingSearch, form.ingredients]
  );

  const preview = useMemo(() => {
    if (form.ingredients.length === 0) return null;
    const tmp: Recipe = {
      id: "",
      name: "",
      description: "",
      ingredients: form.ingredients,
    };
    return {
      per100: recipePer100g(tmp, data.products),
      total: form.ingredients.reduce((s, i) => s + i.grams, 0),
    };
  }, [form.ingredients, data.products]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
  };
  const openEdit = (r: Recipe) => {
    setForm({
      name: r.name,
      description: r.description,
      ingredients: [...r.ingredients],
    });
    setEditId(r.id);
    setShowForm(true);
  };

  const addIngredient = (productId: string) => {
    setForm(f => ({
      ...f,
      ingredients: [...f.ingredients, { productId, grams: 100 }],
    }));
    setIngSearch("");
    setShowIngList(false);
  };

  const updateGrams = (productId: string, grams: number) => {
    setForm(f => ({
      ...f,
      ingredients: f.ingredients.map(i =>
        i.productId === productId ? { ...i, grams } : i
      ),
    }));
  };

  const removeIngredient = (productId: string) => {
    setForm(f => ({
      ...f,
      ingredients: f.ingredients.filter(i => i.productId !== productId),
    }));
  };

  const handleSave = () => {
    if (!form.name.trim() || form.ingredients.length === 0) return;
    const r: Recipe = {
      id: editId ?? uid(),
      name: form.name.trim(),
      description: form.description.trim(),
      ingredients: form.ingredients,
    };
    onUpdateData({
      ...data,
      recipes: editId
        ? data.recipes.map(x => (x.id === editId ? r : x))
        : [...data.recipes, r],
    });
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">Рецепты</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data.recipes.length} сохранённых рецептов
          </p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus size={13} /> Новый рецепт
        </Button>
      </div>

      {data.recipes.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <img
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&auto=format&q=75"
            alt="Готовка"
            className="w-36 h-24 object-cover rounded-lg mx-auto mb-4 opacity-80"
          />
          <p className="font-semibold text-foreground">Нет рецептов</p>
          <p className="text-sm text-muted-foreground mt-1">
            Создайте рецепт из продуктов и добавляйте его в приёмы пищи.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {data.recipes.map(r => {
            const p100 = recipePer100g(r, data.products);
            const total = r.ingredients.reduce((s, i) => s + i.grams, 0);
            return (
              <div
                key={r.id}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">
                      {r.name}
                    </div>
                    {r.description && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {r.description}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0 ml-3">
                    <button
                      onClick={() => openEdit(r)}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() =>
                        onUpdateData({
                          ...data,
                          recipes: data.recipes.filter(x => x.id !== r.id),
                        })
                      }
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mb-2.5">
                  {r.ingredients.length} ингредиентов · {total}г общий вес
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {r.ingredients.map(ing => {
                    const p = data.products.find(x => x.id === ing.productId);
                    return p ? (
                      <span
                        key={ing.productId}
                        className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground"
                      >
                        {p.name} {ing.grams}г
                      </span>
                    ) : null;
                  })}
                </div>

                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="bg-muted px-2.5 py-1 rounded font-medium tabular-nums">
                    {p100.calories} ккал/100г
                  </span>
                  <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded tabular-nums">
                    Б {p100.protein}г
                  </span>
                  <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded tabular-nums">
                    Ж {p100.fat}г
                  </span>
                  <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded tabular-nums">
                    У {p100.carbs}г
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editId ? "Редактировать" : "Новый рецепт"}
        wide
        footer={
          <>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.name.trim() || form.ingredients.length === 0}
            >
              {editId ? "Сохранить" : "Создать рецепт"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Название рецепта">
            <TInput
              value={form.name}
              onChange={v => setForm(f => ({ ...f, name: v }))}
              placeholder="напр. Курица с рисом"
            />
          </Field>
          <Field label="Описание">
            <TInput
              value={form.description}
              onChange={v => setForm(f => ({ ...f, description: v }))}
              placeholder="Необязательное описание"
            />
          </Field>

          <Field label="Ингредиенты">
            <div className="flex flex-col gap-1.5 mb-2">
              {form.ingredients.map(ing => {
                const p = data.products.find(x => x.id === ing.productId);
                if (!p) return null;
                const rowKcal = Math.round((p.calories * ing.grams) / 100);
                return (
                  <div
                    key={ing.productId}
                    className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm flex-1 font-medium truncate">
                      {p.name}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums hidden sm:block">
                      {rowKcal} ккал
                    </span>
                    <input
                      type="number"
                      value={ing.grams}
                      onChange={e =>
                        updateGrams(
                          ing.productId,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min={1}
                      className="w-16 text-right px-2 py-1 rounded border border-border bg-card text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />
                    <span className="text-xs text-muted-foreground">г</span>
                    <button
                      onClick={() => removeIngredient(ing.productId)}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="relative">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                ref={ingRef}
                value={ingSearch}
                onChange={e => {
                  setIngSearch(e.target.value);
                  setShowIngList(true);
                }}
                onFocus={() => setShowIngList(true)}
                onBlur={() => setTimeout(() => setShowIngList(false), 150)}
                placeholder="Поиск и добавление ингредиента…"
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-dashed border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              />
              {showIngList && ingSearch && filteredIng.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 bg-card border border-border rounded-lg shadow-lg mt-1 overflow-hidden">
                  {filteredIng.map(p => (
                    <button
                      key={p.id}
                      onMouseDown={() => addIngredient(p.id)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors flex justify-between items-center"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {p.calories} ккал/100г
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>

          {preview && (
            <div className="bg-muted/40 rounded-lg px-3.5 py-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Пищевая ценность (предпросмотр)
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums">
                <span className="text-muted-foreground">
                  Общий вес:{" "}
                  <strong className="text-foreground">{preview.total}г</strong>
                </span>
                <span className="text-muted-foreground">
                  На 100 г:{" "}
                  <strong className="text-foreground">
                    {preview.per100.calories} ккал
                  </strong>
                </span>
                <span className="text-blue-600">
                  Б {preview.per100.protein}г
                </span>
                <span className="text-amber-600">
                  Ж {preview.per100.fat}г
                </span>
                <span className="text-orange-600">
                  У {preview.per100.carbs}г
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}