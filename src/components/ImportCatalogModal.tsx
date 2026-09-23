import React, { useRef, useState } from "react";
import { Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import { AppData } from "../types";
import {
  applyImport,
  MergeStrategy,
  parseCatalogImport,
  ImportResult,
  ApplyImportReport,
} from "../lib/exportImport";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

interface Props {
  open: boolean;
  onClose: () => void;
  data: AppData;
  onUpdateData: (d: AppData) => void;
}

export function ImportCatalogModal({
  open,
  onClose,
  data,
  onUpdateData,
}: Props) {
  const [parsed, setParsed] = useState<ImportResult | null>(null);
  const [strategy, setStrategy] = useState<MergeStrategy>("merge");
  const [error, setError] = useState("");
  const [report, setReport] = useState<ApplyImportReport | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setParsed(null);
    setError("");
    setReport(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (file: File) => {
    setError("");
    setParsed(null);
    setReport(null);
    try {
      const text = await file.text();
      setParsed(parseCatalogImport(text));
    } catch (e: any) {
      setError(e.message ?? "Ошибка чтения файла.");
    }
  };

  const handleApply = () => {
    if (!parsed) return;
    const { data: newData, report } = applyImport(data, parsed, strategy);
    onUpdateData(newData);
    setReport(report);
  };

  // ─── Отчёт ─────────────────────────────────────────────────────────────────
  if (report) {
    const nothingAdded =
      report.addedProducts === 0 && report.addedRecipes === 0;
    return (
      <Modal
        open={open}
        onClose={handleClose}
        title="Импорт завершён"
        footer={<Button onClick={handleClose}>Готово</Button>}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm">
            {nothingAdded ? (
              <AlertTriangle size={16} className="text-amber-600" />
            ) : (
              <CheckCircle2 size={16} className="text-primary" />
            )}
            <span className="font-medium">
              {nothingAdded
                ? "Ничего не добавлено — все позиции уже есть в каталоге."
                : `Добавлено: ${report.addedProducts} продуктов, ${report.addedRecipes} рецептов.`}
            </span>
          </div>

          {report.skippedProducts > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Пропущено продуктов: {report.skippedProducts}
              </p>
              <ul className="text-xs bg-muted/40 rounded-md px-3 py-2 max-h-32 overflow-y-auto flex flex-col gap-0.5">
                {report.skippedProductNames.map((n, i) => (
                  <li key={i} className="text-muted-foreground">
                    • {n}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.skippedRecipes > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Пропущено рецептов: {report.skippedRecipes}
              </p>
              <ul className="text-xs bg-muted/40 rounded-md px-3 py-2 max-h-32 overflow-y-auto flex flex-col gap-0.5">
                {report.skippedRecipeNames.map((n, i) => (
                  <li key={i} className="text-muted-foreground">
                    • {n}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Modal>
    );
  }

  // ─── Форма импорта ─────────────────────────────────────────────────────────
  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Импорт каталога"
      subtitle="Загрузите ранее экспортированный JSON-файл"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button onClick={handleApply} disabled={!parsed}>
            Импортировать
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg py-8 text-center hover:bg-muted/40 transition-colors"
        >
          <Upload size={20} className="mx-auto mb-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Нажмите, чтобы выбрать JSON-файл
          </span>
        </button>

        {error && (
          <p className="text-xs text-destructive bg-destructive/8 border border-destructive/15 px-3 py-2 rounded-md">
            {error}
          </p>
        )}

        {parsed && (
          <div className="flex flex-col gap-3">
            <div className="bg-accent/40 rounded-lg px-3 py-2.5 text-sm">
              Найдено: <strong>{parsed.products.length}</strong> продуктов,{" "}
              <strong>{parsed.recipes.length}</strong> рецептов
            </div>

            {parsed.warnings.length > 0 && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 flex gap-2">
                <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  {parsed.warnings.slice(0, 5).map((w, i) => (
                    <span key={i}>{w}</span>
                  ))}
                  {parsed.warnings.length > 5 && (
                    <span>…и ещё {parsed.warnings.length - 5}</span>
                  )}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Стратегия импорта
              </p>
              <div className="flex flex-col gap-2">
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    className="mt-0.5"
                    checked={strategy === "merge"}
                    onChange={() => setStrategy("merge")}
                  />
                  <span>
                    <span className="font-medium">Объединить</span>
                    <span className="block text-xs text-muted-foreground">
                      Добавить только новые позиции. Существующие (по id,
                      штрихкоду или названию) будут пропущены.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    className="mt-0.5"
                    checked={strategy === "replace"}
                    onChange={() => setStrategy("replace")}
                  />
                  <span>
                    <span className="font-medium">Заменить</span>
                    <span className="block text-xs text-muted-foreground">
                      Полностью заменить каталог. Дубли внутри файла будут
                      отброшены.
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}