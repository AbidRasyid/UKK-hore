import { useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import api from "../../api/axios";
import { formatCurrency, formatDate } from "../../utils/format";
import { useLanguage } from "../../hooks/useLanguage";

const getUserId = (user) => user?.id ?? user?.user_id;

export default function TellerTransactionsPage() {
  const { user } = useOutletContext();
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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
                {[t("no"), t("account_number"), t("transaction"), t("date"), t("amount")].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                    {t("loading")}
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
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
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
