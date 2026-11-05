import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Printer, RefreshCw } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import api from "../../api/axios";
import { formatCurrency, formatDate } from "../../utils/format";
import { useLanguage } from "../../hooks/useLanguage";

const getUserId = (user) => user?.id ?? user?.user_id;

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
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [receiptTransaction, setReceiptTransaction] = useState(null);

  const fetchTransactions = async () => {
    const tellerId = getUserId(user);
    if (!tellerId) {
      setErrorMessage(t("user_session_unidentified"));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await api.get(`/api/transactions/${tellerId}`);
      const data = response.data?.data;
      if (!Array.isArray(data)) {
        throw new Error("Invalid transactions response.");
      }
      setTransactions(data);
    } catch (error) {
      console.error("Failed to load teller transactions", error);
      setErrorMessage(
        error.response?.data?.message || t("teller_transactions_load_error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadTransactions = async () => {
      const tellerId = getUserId(user);
      if (!tellerId) {
        if (isMounted) {
          setErrorMessage(t("user_session_unidentified"));
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await api.get(`/api/transactions/${tellerId}`);
        const data = response.data?.data;
        if (!Array.isArray(data)) {
          throw new Error("Invalid transactions response.");
        }
        if (isMounted) setTransactions(data);
      } catch (error) {
        console.error("Failed to load teller transactions", error);
        if (isMounted) {
          setErrorMessage(
            error.response?.data?.message || t("teller_transactions_load_error")
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadTransactions();
    return () => {
      isMounted = false;
    };
  }, [user, t]);

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

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return transactions;

    return transactions.filter((transaction) =>
      String(transaction.account_number ?? "").toLowerCase().includes(query)
    );
  }, [transactions, search]);

  return (
    <div className="min-h-full bg-[#f8f9fa]">
      <DashboardHeader
        role="teller"
        user={user}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("search_account_number")}
        searchOnLeft
      />
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("transactions")}</h1>
            <p className="mt-2 text-sm text-gray-600">
              {t("teller_transactions_desc")}
            </p>
          </div>
          <button
            type="button"
            onClick={fetchTransactions}
            disabled={isLoading}
            className="inline-flex items-center gap-2 self-start rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-500 disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("refresh")}
          </button>
        </div>

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
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                    {t("no_teller_transactions")}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction, index) => {
                  const transactionType = String(transaction.transaction_type ?? "transaction").toLowerCase();
                  const isDeposit = transactionType === "deposit";

                  return (
                    <tr key={transaction.id ?? `${transaction.account_number}-${index}`} className="border-t border-gray-200">
                      <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
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
