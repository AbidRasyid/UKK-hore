import { useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import api from "../api/axios";
import { formatCurrency, formatDate } from "../utils/format";
import { useLanguage } from "../hooks/useLanguage";

const normalize = (value) => String(value ?? "").toLowerCase().trim();

export default function JournalsPage() {
  const { user } = useOutletContext();
  const { t } = useLanguage();
  const [journals, setJournals] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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
      [
        journal.id,
        journal.transaction_id,
        journal.account_code,
        journal.position,
        journal.amount,
        journal.created_at,
      ].some((value) => normalize(value).includes(query))
    );
  }, [journals, search]);

  return (
    <div className="min-h-full bg-[#f8f9fa]">
      <DashboardHeader
        role={normalize(user?.role)}
        user={user}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("search_transaction")}
      />

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
          <button
            type="button"
            onClick={fetchJournals}
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("refresh")}
          </button>
        </header>

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
                    {[t("no"), t("journal_id"), t("transaction_id"), t("account_code"), t("position"), t("amount"), t("date")].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {isLoading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-sm text-gray-500">
                        {t("loading")}
                      </td>
                    </tr>
                  ) : filteredJournals.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-sm text-gray-500">
                        {t("no_journals")}
                      </td>
                    </tr>
                  ) : (
                    filteredJournals.map((journal, index) => (
                      <tr key={journal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{journal.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{journal.transaction_id}</td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-900">
                          {journal.account_code}
                        </td>
                        <td className="px-6 py-4 text-sm capitalize text-gray-900">
                          {t(journal.position?.toLowerCase()) || journal.position}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(journal.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(journal.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
