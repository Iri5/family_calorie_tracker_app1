import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Search, X, Plus, Pencil, Trash2, Barcode } from "lucide-react";
import { AppData, Product } from "../types";
import { uid } from "../lib/utils";
import { CATEGORIES } from "../data/categories";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { Field, TInput, NInput, Sel } from "./ui/Fields";

interface ProductsViewProps {
  data: AppData;
  onUpdateData: (d: AppData) => void;
}

const emptyForm = {
  name: "", description: "", category: "protein", subcategory: "",
  calories: "", protein: "", fat: "", carbs: "", barcode: "",
};
type ProductForm = typeof emptyForm;

export function ProductsView({ data, onUpdateData }: ProductsViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);

  const setF = (k: keyof ProductForm, v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  const activeCat = CATEGORIES.find(c => c.id === selectedCategory);
  const subcategories = activeCat?.subcategories ?? [];

  const filtered = useMemo(() => {
    let list = data.products;
    if (selectedCategory !== "all") list = list.filter(p => p.category === selectedCategory);
    if (selectedSubcategory !== "all") list = list.filter(p => p.subcategory === selectedSubcategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return list;
  }, [data.products, selectedCategory, selectedSubcategory, search]);

  const openAdd = (barcode?: string) => {
    setForm({ ...emptyForm, barcode: barcode ?? "" });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, description: p.description, category: p.category,
      subcategory: p.subcategory, calories: String(p.calories), protein: String(p.protein),
      fat: String(p.fat), carbs: String(p.carbs), barcode: p.barcode ?? "",
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.calories) return;
    const p: Product = {
      id: editId ?? uid(),
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      subcategory: form.subcategory,
      calories: parseFloat(form.calories) || 0,
      protein: parseFloat(form.protein) || 0,
      fat: parseFloat(form.fat) || 0,
      carbs: parseFloat(form.carbs) || 0,
      isCustom: true,
      barcode: form.barcode.trim() || undefined,
    };
    onUpdateData({
      ...data,
      products: editId
        ? data.products.map(x => x.id === editId ? p : x)
        : [...data.products, p],
    });
    setShowForm(false);
  };

  const handleBarcodeFound = (barcode: string) => {
    setShowBarcodeModal(false);
    const existing = data.products.find(p => p.barcode === barcode);
    if (existing) {
      setSearch(existing.name);
      setSelectedCategory("all");
    } else {
      openAdd(barcode);
    }
  };

  const catImg = (catId: string) => CATEGORIES.find(c => c.id === catId)?.image ?? "";

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">Продукты</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{data.products.length} позиции ·значение на 100 г</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowBarcodeModal(true)}>
            <Barcode size={13} /> Сканировать штрихкод
          </Button>
          <Button size="sm" onClick={() => openAdd()}>
            <Plus size={13} /> Добавить продукт
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск продуктов…"
          className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Category grid */}
      {!search && (
        <div>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-3">
            <button
              onClick={() => { setSelectedCategory("all"); setSelectedSubcategory("all"); }}
              className={[
                "rounded-lg border p-2 text-xs font-medium transition-colors text-center",
                selectedCategory === "all"
                  ? "border-primary bg-accent/60 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted",
              ].join(" ")}
            >
              Все
            </button>
            {CATEGORIES.filter(c => c.id !== "custom").map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedSubcategory("all");
                }}
                className={[
                  "rounded-lg border overflow-hidden text-xs font-medium transition-all text-left",
                  selectedCategory === cat.id
                    ? "border-primary ring-1 ring-primary/30"
                    : "border-border hover:border-primary/20",
                ].join(" ")}
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-14 object-cover"
                  />
                ) : (
                  <div className="w-full h-14 bg-muted" />
                )}
                <div className="px-2 py-1.5 truncate">{cat.name}</div>
              </button>
            ))}
          </div>

          {/* Subcategory pills */}
          {selectedCategory !== "all" && subcategories.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setSelectedSubcategory("all")}
                className={[
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  selectedSubcategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary",
                ].join(" ")}
              >
                Все
              </button>
              {subcategories.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.id)}
                  className={[
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    selectedSubcategory === sub.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-secondary",
                  ].join(" ")}
                >
                  {sub.id}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Products table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid sm:grid-cols-[1fr_64px_72px_60px_72px_60px] px-4 py-2.5 bg-muted/40 border-b border-border text-xs font-medium text-muted-foreground">
          <span>Продукт</span>
          <span className="text-right">Ккал</span>
          <span className="text-right">Белки</span>
          <span className="text-right">Жиры</span>
          <span className="text-right">Углеводы</span>
          <span />
        </div>

        {filtered.map(p => (
          <div
            key={p.id}
            className="flex sm:grid sm:grid-cols-[1fr_64px_72px_60px_72px_60px] items-center px-4 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {catImg(p.category) && (
                  <img
                    src={catImg(p.category)}
                    alt=""
                    className="w-5 h-5 rounded object-cover shrink-0 opacity-70"
                  />
                )}
                <span className="text-sm font-medium text-foreground truncate">{p.name}</span>
                {p.isCustom && (
                  <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">
                    Пользовательский
                  </span>
                )}
              </div>
              {p.description && (
                <div className="text-xs text-muted-foreground truncate mt-0.5">{p.description}</div>
              )}
              <div className="sm:hidden text-xs text-muted-foreground tabular-nums mt-0.5">
                {p.calories} ккал · Б {p.protein}г · Ж {p.fat}г · У {p.carbs}г
              </div>
            </div>
            <span className="hidden sm:block text-sm text-right tabular-nums">{p.calories}</span>
            <span className="hidden sm:block text-sm text-right tabular-nums text-blue-600">{p.protein}г</span>
            <span className="hidden sm:block text-sm text-right tabular-nums text-amber-600">{p.fat}г</span>
            <span className="hidden sm:block text-sm text-right tabular-nums text-orange-600">{p.carbs}г</span>
            <div className="flex gap-1 justify-end shrink-0">
              {p.isCustom ? (
                <>
                  <button
                    onClick={() => openEdit(p)}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() =>
                      onUpdateData({ ...data, products: data.products.filter(x => x.id !== p.id) })
                    }
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              ) : (
                <div className="w-12" />
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            Продукты не найдены.
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editId ? "Редактировать" : "Новый продукт"}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowForm(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={!form.name.trim() || !form.calories}>
              {editId ? "Сохранить" : "Добавить продукт"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Название">
            <TInput value={form.name} onChange={v => setF("name", v)} placeholder="напр. Киноа, варёная" />
          </Field>
          <Field label="Описание">
            <TInput value={form.description} onChange={v => setF("description", v)} placeholder="Необязательное примечание" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Категория">
              <Sel value={form.category} onChange={v => { setF("category", v); setF("subcategory", ""); }}>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Sel>
            </Field>
            <Field label="Подкатегория">
              <Sel value={form.subcategory} onChange={v => setF("subcategory", v)}>
                <option value="">Нет</option> //////////////
                {(CATEGORIES.find(c => c.id === form.category)?.subcategories ?? []).map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.id}</option>
                ))}
              </Sel>
            </Field>
          </div>
          <Field label="Штрихкод (опционально)">
            <TInput value={form.barcode} onChange={v => setF("barcode", v)} placeholder="напр. 5449000000439" />
          </Field>
          <div className="bg-muted/40 rounded-lg p-3.5">
            <p className="text-xs font-medium text-muted-foreground mb-3">Пищевая ценность на 100 г</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Калории (ккал)">
                <NInput value={form.calories} onChange={v => setF("calories", v)} min={0} step={0.1} placeholder="0" />
              </Field>
              <Field label="Белки (г)">
                <NInput value={form.protein} onChange={v => setF("protein", v)} min={0} step={0.1} placeholder="0" />
              </Field>
              <Field label="Жиры (г)">
                <NInput value={form.fat} onChange={v => setF("fat", v)} min={0} step={0.1} placeholder="0" />
              </Field>
              <Field label="Углеводы (г)">
                <NInput value={form.carbs} onChange={v => setF("carbs", v)} min={0} step={0.1} placeholder="0" />
              </Field>
            </div>
          </div>
        </div>
      </Modal>

      {/* Barcode Modal */}
      {showBarcodeModal && (
        <BarcodeModal
          onScan={handleBarcodeFound}
          onClose={() => setShowBarcodeModal(false)}
        />
      )}
    </div>
  );
}

// ─── Barcode Scanner Modal ────────────────────────────────────────────────────

function BarcodeModal({
  onScan,
  onClose,
}: {
  onScan: (barcode: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const hasBarcodeAPI = typeof window !== "undefined" && "BarcodeDetector" in window;

  const stopCamera = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setScanning(false);
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (!hasBarcodeAPI) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setScanning(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detector = new (window as any).BarcodeDetector({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"],
      });

      intervalRef.current = setInterval(async () => {
        if (!videoRef.current) return;
        try {
          const results = await detector.detect(videoRef.current);
          if (results.length > 0) {
            stopCamera();
            onScan(results[0].rawValue);
          }
        } catch {}
      }, 400);
    } catch {
      setCameraError("Доступ к камере запрещён. Введите штрихкод вручную.");
    }
  }, [hasBarcodeAPI, onScan, stopCamera]);

  useEffect(() => {
    if (hasBarcodeAPI) startCamera();
    return () => stopCamera();
  }, []);

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) onScan(manualBarcode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-card rounded-xl border border-border overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <Barcode size={15} className="text-primary" />
            <span className="font-semibold text-sm">Сканирование штрихкода</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {/* Camera view */}
          {hasBarcodeAPI && !cameraError && (
            <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/3]">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              {/* Scanner overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-56 h-32 relative">
                  <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-white rounded-tl" />
                  <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-white rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-white rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-white rounded-br" />
                  {scanning && (
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary/80 animate-pulse" />
                  )}
                </div>
              </div>
              {!cameraActive && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="text-white text-sm">Запуск камеры…</span>
                </div>
              )}
            </div>
          )}

          {cameraError && (
            <div className="bg-destructive/8 border border-destructive/15 rounded-lg px-3 py-2.5 text-xs text-destructive">
              {cameraError}
            </div>
          )}

          {!hasBarcodeAPI && (
            <div className="bg-muted rounded-lg px-3 py-2.5 text-xs text-muted-foreground">
              Сканирование штрихкодов не поддерживается в этом браузере. Введите штрихкод вручную.
            </div>
          )}

          {/* Manual input */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {hasBarcodeAPI && !cameraError ? "Или введите вручную" : "Введите штрихкод"}
            </p>
            <div className="flex gap-2">
              <input
                value={manualBarcode}
                onChange={e => setManualBarcode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleManualSubmit()}
                placeholder="напр. 5449000000439"
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 tabular-nums"
                autoFocus={!hasBarcodeAPI || !!cameraError}
              />
              <Button
                size="sm"
                onClick={handleManualSubmit}
                disabled={!manualBarcode.trim()}
              >
                Найти
              </Button>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            Если штрихкод не найден в базе, вы можете добавить продукт вручную.
          </p>
        </div>
      </div>
    </div>
  );
}


