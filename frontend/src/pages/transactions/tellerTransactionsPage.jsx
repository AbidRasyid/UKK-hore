import { useEffect, useState } from "react";
import { AlertCircle, Printer } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/axios";
import { formatCurrency, formatDate } from "../../utils/format";
import { useLanguage } from "../../hooks/useLanguage";
import Pagination from "../../components/Pagination";
import FilterExportCard from "../../components/FilterExportCard";
import useListFilters from "../../hooks/useListFilters";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { exportToExcel } from "../../utils/exportToExcel";
import { fetchAllPages } from "../../utils/fetchAllPages";

const formatReceiptDate = (value, lang) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function TellerTransactionsPage() {
  const { user } = useOutletContext();
  const { lang, t } = useLanguage();
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
  const [receiptTransaction, setReceiptTransaction] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadTransactions = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await api.get("/api/teller/transactions/history", {
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
        if (isMounted) {
          setErrorMessage(t("teller_transactions_load_error"));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadTransactions();
    return () => {
      isMounted = false;
    };
  }, [page, reloadKey, requestSearch, dateParams, t]);

  useEffect(() => {
    if (!receiptTransaction) return undefined;

    const handleAfterPrint = () => setReceiptTransaction(null);
    window.addEventListener("afterprint", handleAfterPrint);
    const timeoutId = window.setTimeout(() => {
      try {
        window.print();
      } catch (error) {
        console.error("Failed to print transaction receipt", error);
        setErrorMessage(t("receipt_print_error"));
        setReceiptTransaction(null);
      }
    }, 100);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [receiptTransaction, t]);

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
    if (!total) return;
    setIsExporting(true);
    setErrorMessage("");
    try {
      const allTransactions = await fetchAllPages(api, "/api/teller/transactions/history", {
        ...dateParams,
        search,
      });
      await exportToExcel({
        rows: allTransactions.map((transaction) => ({
          id: transaction.id,
          account_number: transaction.account_number || "",
          type: transaction.transaction_type,
          date: transaction.transaction_date,
          amount: transaction.amount,
        })),
        columns: [
          { header: t("reference_id"), key: "id", width: 18 },
          { header: t("account_number"), key: "account_number", width: 20 },
          { header: t("transaction_type"), key: "type", width: 18 },
          { header: t("date"), key: "date", width: 18 },
          { header: t("amount"), key: "amount", width: 18 },
        ],
        fileName: "my-transactions.xlsx",
        sheetName: "Transactions",
      });
    } catch {
      setErrorMessage(t("export_failed"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f8f9fa]">
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("transactions")}</h1>
            <p className="mt-2 text-sm text-gray-600">
              {t("teller_transactions_desc")}
            </p>
          </div>
        </div>

        <FilterExportCard
          search={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder={t("search_account_number")}
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
          <div className="mb-6 flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {errorMessage}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full rounded-lg border border-gray-200 bg-white">
            <thead>
              <tr className="bg-gray-100">
                {[t("no"), t("account_number"), t("transaction"), t("date"), t("amount"), t("actions")].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                    {t("loading")}
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                    {t("no_teller_transactions")}
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, index) => {
                  const transactionType = String(transaction.transaction_type ?? "transaction").toLowerCase();
                  const isDeposit = transactionType === "deposit";

                  return (
                    <tr key={transaction.id ?? `${transaction.account_number}-${index}`} className="border-t border-gray-200">
                      <td className="px-6 py-4 text-sm text-gray-500">{(page - 1) * 10 + index + 1}</td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-900">{transaction.account_number || "-"}</td>
                      <td className="px-6 py-4 text-sm capitalize text-gray-900">{t(transactionType) || transactionType}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(transaction.transaction_date || transaction.created_at)}
                      </td>
                      <td className={`px-6 py-4 text-right text-sm font-semibold ${isDeposit ? "text-emerald-700" : "text-red-700"}`}>
                        {isDeposit ? "+" : "-"}{formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => setReceiptTransaction(transaction)}
                          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-gray-500 hover:text-gray-900"
                          aria-label={`${t("print_receipt")} ${transaction.account_number || ""}`}
                        >
                          <Printer className="h-4 w-4" />
                          {t("print_receipt")}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalItems={total} pageSize={10} onPageChange={setPage} />
      </div>
      {receiptTransaction && (
        <section id="receipt-print-area" className="receipt-print-area" aria-label={t("receipt")}>
          <header className="receipt-header">
            <h1>E-Teller</h1>
            <p>{t("receipt")}</p>
            <p className="receipt-confirmed">{t("transaction_confirmed")}</p>
          </header>
          <dl className="receipt-details">
            <div><dt>{t("reference_id")}</dt><dd>{receiptTransaction.reference_id || `TRX-${receiptTransaction.id ?? "-"}`}</dd></div>
            <div><dt>{t("account_number")}</dt><dd>{receiptTransaction.account_number || "-"}</dd></div>
            <div><dt>{t("transaction")}</dt><dd>{t(String(receiptTransaction.transaction_type ?? "transaction").toLowerCase())}</dd></div>
            <div><dt>{t("date")}</dt><dd>{formatReceiptDate(receiptTransaction.transaction_date || receiptTransaction.created_at, lang)}</dd></div>
            <div><dt>{t("processed_by")}</dt><dd>{user?.fullname || user?.username || "-"}</dd></div>
          </dl>
          <div className="receipt-amount">
            <span>{t("amount")}</span>
            <strong>{formatCurrency(receiptTransaction.amount)}</strong>
          </div>
          <p className="receipt-footer">{t("receipt_thank_you")}</p>
        </section>
      )}
      <style>{`
        .receipt-print-area { display: none; }
        @media print {
          @page { margin: 8mm; }
          body * { visibility: hidden !important; }
          #receipt-print-area,
          #receipt-print-area * { visibility: visible !important; }
          #receipt-print-area {
            display: block !important;
            position: fixed;
            inset: 0 auto auto 0;
            width: 72mm;
            padding: 4mm;
            color: #111;
            background: #fff;
            font: 12px/1.45 Arial, sans-serif;
          }
          .receipt-header { text-align: center; padding-bottom: 4mm; border-bottom: 1px dashed #555; }
          .receipt-header h1 { margin: 0; font-size: 19px; }
          .receipt-header p { margin: 1mm 0 0; }
          .receipt-confirmed { font-weight: 700; text-transform: uppercase; }
          .receipt-details { margin: 4mm 0; }
          .receipt-details div { display: flex; justify-content: space-between; gap: 4mm; margin: 2mm 0; }
          .receipt-details dt { color: #444; }
          .receipt-details dd { margin: 0; text-align: right; overflow-wrap: anywhere; }
          .receipt-amount { display: flex; justify-content: space-between; border-top: 1px dashed #555; padding-top: 3mm; font-size: 14px; }
          .receipt-footer { margin-top: 6mm; text-align: center; }
        }
      `}</style>
    </div>
  );
}
