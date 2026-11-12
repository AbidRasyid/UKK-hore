 
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";

export default function Pagination({ currentPage, totalItems, pageSize = 10, onPageChange }) {
  const { t } = useLanguage();
  if (totalItems === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav className="flex flex-col gap-3 border-t border-gray-200 px-5 py-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between" aria-label={t("pagination")}>
      <p>{t("showing_records")} {firstItem}-{lastItem} {t("of")} {totalItems}</p>
      <div className="flex items-center gap-3 self-end sm:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          aria-label={t("previous_page")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:border-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span>{t("page")} {currentPage} / {totalPages}</span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          aria-label={t("next_page")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:border-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}