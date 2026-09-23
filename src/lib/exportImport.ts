import { AppData, Product, Recipe } from "../types";

// ─── Export ──────────────────────────────────────────────────────────────────

export interface CatalogExport {
  version: 1;
  exportedAt: string;
  app: "nutrifamily";
  products: Product[];
  recipes: Recipe[];
}

export const buildCatalogExport = (data: AppData): CatalogExport => ({
  version: 1,
  exportedAt: new Date().toISOString(),
  app: "nutrifamily",
  products: data.products,
  recipes: data.recipes,
});

export const downloadJSON = (obj: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportCatalog = (data: AppData) => {
  const payload = buildCatalogExport(data);
  const stamp = new Date().toISOString().split("T")[0];
  downloadJSON(payload, `nutrifamily-catalog-${stamp}.json`);
};

// ─── Import: parsing ─────────────────────────────────────────────────────────

export interface ImportResult {
  products: Product[];
  recipes: Recipe[];
  warnings: string[];
}

export const parseCatalogImport = (json: string): ImportResult => {
  const warnings: string[] = [];
  let parsed: any;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Файл не является корректным JSON.");
  }

  if (parsed?.app !== "nutrifamily") {
    throw new Error("Файл не является экспортом NutriFamily.");
  }

  const products: Product[] = Array.isArray(parsed.products)
    ? parsed.products
        .map((p: any, i: number) => {
          if (!p.id || !p.name || typeof p.calories !== "number") {
            warnings.push(`Продукт #${i} пропущен: не хватает полей.`);
            return null;
          }
          return {
            id: p.id,
            name: p.name,
            nameEn: p.nameEn,
            description: p.description ?? "",
            category: p.category ?? "custom",
            subcategory: p.subcategory ?? "user-added",
            calories: Number(p.calories) || 0,
            protein: Number(p.protein) || 0,
            fat: Number(p.fat) || 0,
            carbs: Number(p.carbs) || 0,
            isCustom: p.isCustom ?? true,
            barcode: p.barcode,
          } as Product;
        })
        .filter(Boolean)
    : [];

  const recipes: Recipe[] = Array.isArray(parsed.recipes)
    ? parsed.recipes
        .map((r: any, i: number) => {
          if (!r.id || !r.name || !Array.isArray(r.ingredients)) {
            warnings.push(`Рецепт #${i} пропущен.`);
            return null;
          }
          return {
            id: r.id,
            name: r.name,
            description: r.description ?? "",
            ingredients: r.ingredients
              .filter(
                (ing: any) =>
                  ing.productId && typeof ing.grams === "number"
              )
              .map((ing: any) => ({
                productId: ing.productId,
                grams: ing.grams,
              })),
          } as Recipe;
        })
        .filter(Boolean)
    : [];

  return { products, recipes, warnings };
};

// ─── Import: dedup helpers ───────────────────────────────────────────────────

const norm = (s: string) => s.trim().toLowerCase();

const recipeFingerprint = (r: Recipe): string => {
  const ings = [...r.ingredients]
    .map(i => `${i.productId}:${i.grams}`)
    .sort()
    .join("|");
  return `${norm(r.name)}::${ings}`;
};

// ─── Import: apply with dedup ────────────────────────────────────────────────

export type MergeStrategy = "merge" | "replace";

export interface ApplyImportReport {
  addedProducts: number;
  addedRecipes: number;
  skippedProducts: number;
  skippedRecipes: number;
  skippedProductNames: string[];
  skippedRecipeNames: string[];
}

export const applyImport = (
  data: AppData,
  imported: ImportResult,
  strategy: MergeStrategy
): { data: AppData; report: ApplyImportReport } => {
  const report: ApplyImportReport = {
    addedProducts: 0,
    addedRecipes: 0,
    skippedProducts: 0,
    skippedRecipes: 0,
    skippedProductNames: [],
    skippedRecipeNames: [],
  };

  // ─── Продукты ──────────────────────────────────────────────────────────────
  const baseProducts = strategy === "replace" ? [] : data.products;

  const existingIds = new Set(baseProducts.map(p => p.id));
  const existingBarcodes = new Set(
    baseProducts.map(p => p.barcode).filter(Boolean) as string[]
  );
  const existingNameCal = new Set(
    baseProducts.map(p => `${norm(p.name)}::${p.calories}`)
  );

  const seenInFileIds = new Set<string>();
  const seenInFileBarcodes = new Set<string>();
  const seenInFileNameCal = new Set<string>();

  const productsToAdd: Product[] = [];

  imported.products.forEach(p => {
    const nc = `${norm(p.name)}::${p.calories}`;
    let reason: string | null = null;

    if (existingIds.has(p.id)) reason = "уже существует (id)";
    else if (seenInFileIds.has(p.id)) reason = "дубль в файле (id)";
    else if (p.barcode && existingBarcodes.has(p.barcode))
      reason = "уже существует (штрихкод)";
    else if (p.barcode && seenInFileBarcodes.has(p.barcode))
      reason = "дубль в файле (штрихкод)";
    else if (existingNameCal.has(nc))
      reason = "уже существует (название + калорийность)";
    else if (seenInFileNameCal.has(nc))
      reason = "дубль в файле (название + калорийность)";

    if (reason) {
      report.skippedProducts++;
      report.skippedProductNames.push(`${p.name} — ${reason}`);
      return;
    }

    productsToAdd.push(p);
    seenInFileIds.add(p.id);
    if (p.barcode) seenInFileBarcodes.add(p.barcode);
    seenInFileNameCal.add(nc);
  });

  report.addedProducts = productsToAdd.length;

  // ─── Рецепты ───────────────────────────────────────────────────────────────
  const baseRecipes = strategy === "replace" ? [] : data.recipes;

  const existingRecipeIds = new Set(baseRecipes.map(r => r.id));
  const existingRecipeFps = new Set(baseRecipes.map(recipeFingerprint));

  const seenInFileRecipeIds = new Set<string>();
  const seenInFileRecipeFps = new Set<string>();

  const recipesToAdd: Recipe[] = [];

  imported.recipes.forEach(r => {
    const fp = recipeFingerprint(r);
    let reason: string | null = null;

    if (existingRecipeIds.has(r.id)) reason = "уже существует (id)";
    else if (seenInFileRecipeIds.has(r.id)) reason = "дубль в файле (id)";
    else if (existingRecipeFps.has(fp))
      reason = "уже существует (название + состав)";
    else if (seenInFileRecipeFps.has(fp))
      reason = "дубль в файле (название + состав)";

    if (reason) {
      report.skippedRecipes++;
      report.skippedRecipeNames.push(`${r.name} — ${reason}`);
      return;
    }

    recipesToAdd.push(r);
    seenInFileRecipeIds.add(r.id);
    seenInFileRecipeFps.add(fp);
  });

  report.addedRecipes = recipesToAdd.length;

  const newData: AppData = {
    ...data,
    products:
      strategy === "replace"
        ? productsToAdd
        : [...data.products, ...productsToAdd],
    recipes:
      strategy === "replace"
        ? recipesToAdd
        : [...data.recipes, ...recipesToAdd],
  };

  return { data: newData, report };
};