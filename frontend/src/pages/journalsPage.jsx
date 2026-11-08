import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import api from "../api/axios";
import { formatCurrency, formatDate } from "../utils/format";
import { useLanguage } from "../hooks/useLanguage";
import Pagination from "../components/Pagination";
import useClientPagination from "../hooks/useClientPagination";
import useListFilters from "../hooks/useListFilters";
import FilterExportCard from "../components/FilterExportCard";
import { exportToExcel } from "../utils/exportToExcel";

const normalize = (value) => String(value ?? "").toLowerCase().trim();

export default function JournalsPage() {
  const { t } = useLanguage();
  const [journals, setJournals] = useState([]);
  const { search, setSearch, dateMode, setDateMode, dateValue, setDateValue, matchesDate } = useListFilters();
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchJournals = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get("/api/accounting-journals");
      const data = response.data?.data;

      if (!Array.isArray(data)) {
        throw new Error("The accounting journals response has an invalid format.");
      }

      setJournals(data);
    } catch (error) {
      console.error("Failed to load accounting journals", error);
      setErrorMessage(t("journals_load_error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadJournals = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await api.get("/api/accounting-journals");
        const data = response.data?.data;

        if (!Array.isArray(data)) {
          throw new Error("The accounting journals response has an invalid format.");
        }

        if (isMounted) {
          setJournals(data);
        }
      } catch (error) {
        console.error("Failed to load accounting journals", error);
        if (isMounted) {
          setErrorMessage(t("journals_load_error"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadJournals();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const filteredJournals = useMemo(() => {
    const query = normalize(search);

    if (!query) return journals;

    return journals.filter((journal) =>
      matchesDate(journal.transaction?.transaction_date ?? journal.created_at) && [
        journal.id,
        journal.transaction_id,
        journal.account_code,
        journal.position,
        journal.amount,
        journal.transaction?.transaction_type,
        journal.transaction?.transaction_date,
      ].some((value) => normalize(value).includes(query))
    );
  }, [journals, search, matchesDate]);
  const { currentPage, setCurrentPage, pageItems, pageSize } = useClientPagination(filteredJournals);

  const handleExport = async () => {
    if (!filteredJournals.length) return;
    setIsExporting(true);
    try {
      await exportToExcel({
        rows: filteredJournals.map((journal) => {
          const position = normalize(journal.position);
          return {
            date: journal.transaction?.transaction_date ?? journal.created_at,
            account_code: journal.account_code,
            transaction_type: journal.transaction?.transaction_type ?? "",
            debit: position === "debit" ? journal.amount : "",
            credit: position === "credit" ? journal.amount : "",
          };
        }),
        columns: [
          { header: t("date"), key: "date", width: 20 },
          { header: t("account_code"), key: "account_code", width: 16 },
          { header: t("transaction_type"), key: "transaction_type", width: 20 },
          { header: t("debit"), key: "debit", width: 18 },
          { header: t("credit"), key: "credit", width: 18 },
        ],
        fileName: "journal-history.xlsx",
        sheetName: "Journal history",
      });
    } catch {
      setErrorMessage(t("export_failed"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f8f9fa]">
      <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              {t("accounting")}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              {t("journals")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t("journal_description")}
            </p>
          </div>
        </header>

        <FilterExportCard
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={t("search_transaction")}
          dateMode={dateMode}
          onDateModeChange={setDateMode}
          dateValue={dateValue}
          onDateValueChange={setDateValue}
          onRefresh={fetchJournals}
          isRefreshing={isLoading}
          onExport={handleExport}
          isExporting={isExporting}
          exportDisabled={filteredJournals.length === 0}
        />

        <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="border-b border-[#e5e7eb] px-6 py-5 lg:px-8">
            <h2 className="text-lg font-semibold text-gray-900">{t("journal_history")}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {filteredJournals.length} {filteredJournals.length === 1 ? t("entry_found") : t("entries_found")}
            </p>
          </div>

          {errorMessage ? (
            <div className="flex items-center gap-3 px-6 py-10 text-sm text-red-700 lg:px-8">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-225 w-full">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f8f9fa]">
                    {[
                      { label: t("date"), align: "text-left" },
                      { label: t("account_code"), align: "text-left" },
                      { label: t("transaction_type"), align: "text-left" },
                      { label: t("debit"), align: "text-right" },
                      { label: t("credit"), align: "text-right" },
                    ].map(({ label, align }) => (
                        <th
                          key={label}
                          className={`px-6 py-3 ${align} text-xs font-semibold uppercase tracking-wide text-gray-500`}
                        >
                          {label}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                        {t("loading")}
                      </td>
                    </tr>
                  ) : filteredJournals.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                        {t("no_journals")}
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((journal) => {
                      const position = normalize(journal.position);

                      return (
                        <tr key={journal.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatDate(journal.transaction?.transaction_date ?? journal.created_at)}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-gray-900">
                            {journal.account_code}
                          </td>
                          <td className="px-6 py-4 text-sm capitalize text-gray-900">
                            {t(normalize(journal.transaction?.transaction_type)) ||
                              journal.transaction?.transaction_type ||
                              "-"}
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-900">
                            {position === "debit" ? formatCurrency(journal.amount) : ""}
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-900">
                            {position === "credit" ? formatCurrency(journal.amount) : ""}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
          <Pagination currentPage={currentPage} totalItems={filteredJournals.length} pageSize={pageSize} onPageChange={setCurrentPage} />
        </section>
      </div>
    </div>
  );
}
