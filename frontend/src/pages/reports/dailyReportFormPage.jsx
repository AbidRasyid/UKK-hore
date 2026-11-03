import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Landmark,
  Receipt,
  Save,
} from "lucide-react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import api from "../../api/axios";
import { formatCurrency, formatDate } from "../../utils/format";
import CurrencyInput from "react-currency-input-field";
import { useLanguage } from "../../hooks/useLanguage";

const getUserId = (user) => user?.id ?? user?.user_id;

export default function DailyReportFormPage() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const userId = getUserId(user);
  const [summary, setSummary] = useState(null);
  const [openingBalance, setOpeningBalance] = useState("");
  const [physicalBalance, setPhysicalBalance] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!userId) {
      return;
    }

    let isMounted = true;
    const fetchSummary = async () => {
      try {
        const response = await api.get(`/api/daily-report/${userId}/initiate`);
        const data = response.data?.data;

        if (!data || !Array.isArray(data.transactions)) {
          throw new Error("The daily report summary has an invalid format.");
        }

        if (isMounted) setSummary(data);
      } catch (error) {
        console.error("Failed to load daily report summary", error);
        if (isMounted) {
          setErrorMessage(
            error.response?.data?.message ||
            t("daily_report_summary_error")
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, [userId, t]);
  
  const totalDeposits = Number(summary?.total_deposits) || 0;
  const totalWithdrawals = Number(summary?.total_withdrawals) || 0;
  const systemBalance = Number(summary?.system_balance) || totalDeposits - totalWithdrawals;
  const transactions = summary?.transactions ?? [];
  const displayedError =
    errorMessage ||
    (!userId ? t("user_session_unidentified") : "");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const opening = Number(openingBalance) || 0;
    const physical = Number(physicalBalance) || 0;
    
    if (!Number.isInteger(opening) || opening < 0) {
      setErrorMessage(t("err_opening_balance"));
      return;
    }
    
    if (!Number.isInteger(physical) || physical < 0) {
      setErrorMessage(t("err_physical_cash"));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await api.post(`/api/daily-report/${userId}/store`, {
        opening_balance: opening,
        total_deposits: totalDeposits,
        total_withdrawals: totalWithdrawals,
        system_balance: opening + totalDeposits - totalWithdrawals,
        physical_balance: physical,
      });
      navigate("/reports");
    } catch (error) {
      console.error("Failed to create daily report", error);
      setErrorMessage(
        error.response?.data?.message || t("daily_report_submit_error")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-8">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-96 animate-pulse rounded-lg bg-white" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f8f9fa]">
      <div className="border-b border-[#e5e7eb] bg-white px-6 py-3.5 lg:px-8">
        <Link
          to="/reports"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back_to_reports")}
        </Link>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
            {t("report_management")}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {t("create_daily_report")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("daily_report_form_desc")}
          </p>
        </header>

        {displayedError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {displayedError}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label={t("todays_transactions")}
            value={transactions.length}
            suffix={transactions.length === 1 ? t("transaction") : t("transactions")}
          />
          <SummaryCard label={t("total_deposits")} value={formatCurrency(totalDeposits)} />
          <SummaryCard label={t("total_withdrawals")} value={formatCurrency(totalWithdrawals)} />
        </div>

        <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-5 lg:px-8">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-gray-500" />
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{t("todays_transactions")}</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {t("transactions_included_in_report")}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              {transactions.length} {t("total")}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f8f9fa]">
                  {[t("no"), t("date"), t("account_number"), t("type"), t("amount")].map((heading) => (
                    <th
                      key={heading}
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 lg:px-8"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500 lg:px-8">
                      {t("no_unreported_transactions")}
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction, index) => {
                    const isDeposit =
                      String(transaction.transaction_type ?? "").toLowerCase() === "deposit";

                    return (
                      <tr key={transaction.id ?? `${transaction.account_number}-${index}`}>
                        <td className="px-6 py-4 text-sm text-gray-500 lg:px-8">{index + 1}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 lg:px-8">
                          {formatDate(transaction.transaction_date)}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-700 lg:px-8">
                          {transaction.account_number || "-"}
                        </td>
                        <td className="px-6 py-4 lg:px-8">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isDeposit
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {isDeposit ? (
                              <ArrowDownLeft className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            )}
                            {isDeposit ? t("deposit") : t("withdrawal")}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 text-right font-mono text-sm font-semibold lg:px-8 ${
                            isDeposit ? "text-emerald-700" : "text-red-700"
                          }`}
                        >
                          {isDeposit ? "+" : "-"}{formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <form className="divide-y divide-[#e5e7eb]" onSubmit={handleSubmit}>
            <div className="grid gap-6 px-6 py-7 sm:grid-cols-2 lg:px-8">
              <div className="sm:col-span-2">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-gray-500" />
                  <h2 className="text-sm font-semibold text-gray-900">{t("report_balance")}</h2>
                </div>
              </div>
              <ReadOnlyField label={t("total_deposits")} value={formatCurrency(totalDeposits)} />
              <ReadOnlyField label={t("total_withdrawals")} value={formatCurrency(totalWithdrawals)} />
              <ReadOnlyField
                label={t("system_balance_before_opening")}
                value={formatCurrency(systemBalance)}
              />
              <ReadOnlyField
                label={t("transactions")}
                value={`${transactions.length} ${transactions.length === 1 ? t("transaction") : t("transactions")}`}
              />
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("opening_balance")}
                </span>
                <CurrencyInput
                  id="opening-balance"
                  name="opening_balance"
                  placeholder="Rp 0"
                  prefix="Rp "
                  decimalsLimit={0}
                  value={openingBalance}
                  onValueChange={(value) => setOpeningBalance(value)}
                  className="h-11 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("counted_physical_cash")}
                </span>
                <CurrencyInput
                  id="physical-balance"
                  name="physical_balance"
                  placeholder={t("enter_counted_cash")}
                  prefix="Rp "
                  decimalsLimit={0}
                  value={physicalBalance}
                  onValueChange={(value) => setPhysicalBalance(value)}
                  className="h-11 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  required
                />
              </label>
            </div>

            <div className="flex flex-col justify-between gap-4 px-6 py-6 sm:flex-row sm:items-center lg:px-8">
              <p className="text-sm text-gray-500">
                {t("report_pending_notice")}
              </p>
              <button
                type="submit"
                disabled={isSubmitting || !summary}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? t("submitting") : t("submit_daily_report")}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, suffix }) {
  return (
    <div className="rounded-lg border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
      {suffix && <p className="mt-1 text-xs text-gray-500">{suffix}</p>}
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <div className="flex h-11 items-center rounded-md border border-[#d1d5db] bg-[#f8f9fa] px-3 text-sm text-gray-900">
        {value}
      </div>
    </div>
  );
}
