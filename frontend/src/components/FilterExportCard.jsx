import { CalendarDays, Download, RefreshCw, Search } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";

export default function FilterExportCard({
  search,
  onSearchChange,
  searchPlaceholder,
  dateMode,
  onDateModeChange,
  dateValue,
  onDateValueChange,
  onExport,
  onRefresh,
  isRefreshing = false,
  isExporting = false,
  exportDisabled = false,
  children,
}) {
  const { t } = useLanguage();
  const dateInputType = { day: "date", month: "month", year: "number" }[dateMode];
  const gridColumns = children
    ? "xl:grid-cols-[minmax(220px,1fr)_150px_190px_auto_auto_auto]"
    : "xl:grid-cols-[minmax(220px,1fr)_150px_190px_auto_auto]";

  return (
    <section className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sm:p-5">
      <div className={`grid items-end gap-3 md:grid-cols-2 ${gridColumns}`}>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{t("search")}</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-gray-600 focus:ring-2 focus:ring-gray-200"
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{t("date_period")}</span>
          <select
            value={dateMode}
            onChange={(event) => onDateModeChange(event.target.value)}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-gray-600 focus:ring-2 focus:ring-gray-200"
          >
            <option value="all">{t("all_dates")}</option>
            <option value="day">{t("day")}</option>
            <option value="month">{t("month")}</option>
            <option value="year">{t("year")}</option>
          </select>
        </label>

        {dateInputType ? (
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{t("select_date")}</span>
            <span className="relative block">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                type={dateInputType}
                value={dateValue}
                onChange={(event) => onDateValueChange(event.target.value)}
                max={dateMode === "year" ? new Date().getFullYear() : undefined}
                min={dateMode === "year" ? "2000" : undefined}
                className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-gray-600 focus:ring-2 focus:ring-gray-200"
              />
            </span>
          </label>
        ) : (
          <div className="hidden xl:block" aria-hidden="true" />
        )}

        {children}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label={t("refresh")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 transition hover:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        )}

        <button
          type="button"
          onClick={onExport}
          disabled={isExporting || exportDisabled}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-black px-4 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {isExporting ? t("exporting") : t("export_excel")}
        </button>
      </div>
    </section>
  );
}