import { useEffect, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../api/axios";
import { useLanguage } from "../../hooks/useLanguage";
import { formatCurrency, formatDate } from "../../utils/format";
import FilterExportCard from "../../components/FilterExportCard";
import useListFilters from "../../hooks/useListFilters";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { exportToExcel } from "../../utils/exportToExcel";
import { fetchAllPages } from "../../utils/fetchAllPages";

export default function SupervisorTransactionsPage() {
  const { t } = useLanguage();
  const { search, setSearch, dateMode, setDateMode, dateValue, setDateValue, dateParams } = useListFilters();
  const requestSearch = useDebouncedValue(search);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchTransactions = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await api.get("/api/supervisor/transactions/history", {
          params: { ...dateParams, search: requestSearch, page },
        });
        const data = response.data;
        if (!Array.isArray(data?.data) || !Number.isInteger(data?.current_page)) {
          throw new Error("Invalid transactions response.");
        }

        if (isMounted) {
          setTransactions(data.data);
          setPage(data.current_page);
          setLastPage(Math.max(1, Number(data.last_page) || 1));
          setTotal(Number(data.total) || 0);
        }
      } catch {
        if (isMounted) setErrorMessage(t("supervisor_transactions_load_error"));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTransactions();
    return () => {
      isMounted = false;
    };
  }, [page, reloadKey, requestSearch, dateParams, t]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleDateModeChange = (value) => {
    setDateMode(value);
    setPage(1);
  };

  const handleDateValueChange = (value) => {
    setDateValue(value);
    setPage(1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setErrorMessage("");
    try {
      const allTransactions = await fetchAllPages(api, "/api/supervisor/transactions/history", {
        ...dateParams,
        search,
      });
      await exportToExcel({
        rows: allTransactions.map((transaction) => ({
          id: transaction.id,
          date: transaction.transaction_date,
          teller: transaction.teller_name || "",
          type: transaction.transaction_type,
          amount: transaction.amount,
        })),
        columns: [
          { header: t("reference_id"), key: "id", width: 18 },
          { header: t("date"), key: "date", width: 18 },
          { header: t("teller_name"), key: "teller", width: 24 },
          { header: t("transaction_type"), key: "type", width: 18 },
          { header: t("amount"), key: "amount", width: 18 },
        ],
        fileName: "transaction-history.xlsx",
        sheetName: "Transactions",
      });
    } catch {
      setErrorMessage(t("export_failed"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="min-h-full bg-[#f8f9fa] p-6 lg:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("transactions")}</h1>
          <p className="mt-2 text-sm text-gray-600">{t("supervisor_transactions_desc")}</p>
        </div>
      </div>

      <FilterExportCard
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={t("search_transaction")}
        dateMode={dateMode}
        onDateModeChange={handleDateModeChange}
        dateValue={dateValue}
        onDateValueChange={handleDateValueChange}
        onRefresh={() => setReloadKey((key) => key + 1)}
        isRefreshing={isLoading}
        onExport={handleExport}
        isExporting={isExporting}
        exportDisabled={total === 0}
      />

      {errorMessage && (
        <div role="alert" className="mb-6 flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMessage}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-100">
              {[t("reference_id"), t("date"), t("teller_name"), t("transaction_type"), t("amount")].map((heading) => (
                <th key={heading} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="5" className="px-5 py-10 text-center text-sm text-gray-500">{t("loading")}</td></tr>
            ) : errorMessage ? (
              <tr><td colSpan="5" className="px-5 py-10 text-center text-sm text-gray-500">{errorMessage}</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan="5" className="px-5 py-10 text-center text-sm text-gray-500">{t("no_transaction_history")}</td></tr>
            ) : transactions.map((transaction) => {
              const transactionType = String(transaction.transaction_type ?? "transaction").toLowerCase();
              const isDeposit = transactionType === "deposit";

              return (
                <tr key={transaction.id}>
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-sm text-gray-600">TRX-{transaction.id}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{formatDate(transaction.transaction_date)}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900">{transaction.teller_name || "-"}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm capitalize text-gray-700">{t(transactionType) || transactionType}</td>
                  <td className={`whitespace-nowrap px-5 py-4 text-right text-sm font-semibold ${isDeposit ? "text-emerald-700" : "text-red-700"}`}>
                    {isDeposit ? "+" : "-"}{formatCurrency(transaction.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        <p>{t("total_transactions")}: {total}</p>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={isLoading || page <= 1}
            aria-label={t("previous_page")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:border-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>{t("page")} {page} / {lastPage}</span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(lastPage, current + 1))}
            disabled={isLoading || page >= lastPage}
            aria-label={t("next_page")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:border-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}