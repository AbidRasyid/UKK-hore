import { Plus, X } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";

const customerFields = [
  { field: "student_name", labelKey: "name", placeholderKey: "full_name" },
  { field: "student_id", labelKey: "student_id", placeholderKey: "student_id" },
  { field: "student_class", labelKey: "class", placeholderKey: "class" },
  { field: "password", labelKey: "password", placeholderKey: "password" },
  { field: "pin", labelKey: "pin", placeholderKey: "pin" },
];

export default function BulkCustomerForm({
  customerRows,
  isSaving,
  onClose,
  onSubmit,
  onUpdateRow,
  onRemoveRow,
  onAddRow,
}) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t("add_customer_accounts")}</h2>
            <p className="mt-1 text-xs text-gray-500">
              {t("bulk_customer_help")}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label={t("close")} className="text-gray-500 hover:text-gray-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="space-y-4">
            {customerRows.map((row, index) => (
              <div key={index} className="rounded-md border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800">{t("customer_item")} {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => onRemoveRow(index)}
                    disabled={customerRows.length === 1}
                    className="text-xs text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {t("remove")}
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-5">
                  {customerFields.map(({ field, labelKey, placeholderKey }) => (
                    <label key={field} className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-gray-600">{t(labelKey)}</span>
                      <input
                        type={field === "pin" ? "password" : "text"}
                        inputMode={field === "pin" ? "numeric" : undefined}
                        minLength={field === "pin" ? 6 : undefined}
                        maxLength={field === "pin" ? 6 : undefined}
                        pattern={field === "pin" ? "\\d{6}" : undefined}
                        value={row[field]}
                        onChange={(event) => onUpdateRow(index, field, event.target.value)}
                        placeholder={t(placeholderKey)}
                        className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={onAddRow}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:border-gray-500"
            >
              <Plus className="h-4 w-4" />
              {t("add_another_row")}
            </button>
            <div className="flex gap-3 sm:justify-end">
              <button type="button" onClick={onClose} className="h-10 rounded-md border border-gray-300 px-4 text-sm text-gray-700">
                {t("cancel")}
              </button>
              <button type="submit" disabled={isSaving} className="h-10 rounded-md bg-black px-4 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60">
                {isSaving ? t("saving") : t("save_customers")}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
