import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Landmark,
  Receipt,
  UserRound,
} from "lucide-react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import api from "../../api/axios";
import { formatCurrency, formatDate } from "../../utils/format";
import { useLanguage } from "../../hooks/useLanguage";
import Pagination from "../../components/Pagination";
import useClientPagination from "../../hooks/useClientPagination";

const getStatus = (report) => String(report?.status ?? "pending").toLowerCase();

const statusStyles = {
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  rejected: "bg-red-50 text-red-700 ring-red-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

export default function ReportDetail() {
  const { report_id } = useParams();
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const { t } = useLanguage();
  const [report, setReport] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchReport = async () => {
      try {
        const response = await api.get(`/api/daily-report/${report_id}`);
        const data = response.data;

        if (!data) {
          throw new Error("The daily report response has an invalid format.");
        }

        if (isMounted) {
          setReport(data);
          setTransactions(data.transactions ? data.transactions : []);
        }
      } catch (error) {
        console.error("Failed to load daily report", error);
        if (isMounted) {
          navigate("/404");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchReport();

    return () => {
      isMounted = false;
    };
  }, [navigate, report_id]);

  const handleApprove = async () => {
    if (!report || getStatus(report) === "approved") return;

    setIsApproving(true);
    setErrorMessage("");

    try {
      const response = await api.patch(`/api/daily-report/${report_id}/approve`);
      setReport((currentReport) => ({
        ...currentReport,
        data: response.data?.data ?? { ...currentReport.data, status: "approved" },
      }));
    } catch (error) {
      console.error("Failed to approve daily report", error);
      setErrorMessage(
        error.response?.data?.message || "Daily report could not be approved. Please try again."
      );
    } finally {
      setIsApproving(false);
    }
  };

  const { currentPage, setCurrentPage, pageItems, pageSize, startIndex } = useClientPagination(transactions);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mt-8 h-9 w-64 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-gray-100" />
        <div className="mt-8 h-96 animate-pulse rounded-lg border border-gray-200 bg-white" />
      </div>
    );
  }

  if (!report) return null;

  const status = getStatus(report.data);
  const isSupervisor = String(user?.role ?? "").toLowerCase() === "supervisor";
  const canApprove = isSupervisor && status !== "approved";

  return (
    <div className="min-h-full bg-[#f8f9fa]">
      <div className="border-b border-[#e5e7eb] bg-white px-6 py-3.5 lg:px-8">
        <Link
          to="/reports"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back_to_reports")}
        </Link>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              {t("operations")}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              {t("daily_report_detail")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t("daily_report_detail_desc")}
            </p>
          </div>
          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-inset ${
              statusStyles[status] || statusStyles.pending
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {t(status) || status}
          </span>
        </header>

        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="grid gap-6 border-b border-[#e5e7eb] px-6 py-7 sm:grid-cols-2 lg:px-8">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900">{t("report_information")}</h2>
              </div>
            </div>
            <DetailField label={t("report_date")} value={formatDate(report.data.report_date)} />
            <DetailField label={t("report_id")} value={`#${report.data.id ?? report_id}`} />
            <DetailField label={t("teller")} value={report.teller ?? "-"} />
            <DetailField
              label={t("approved_by")}
              value={report.supervisor ?? t("not_approved")}
            />
            {report.tellers?.length > 0 && (
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("shift_tellers")}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {report.tellers.map((teller, index) => (
                    <li key={`${teller}-${index}`} className="border border-gray-200 px-3 py-1.5 text-sm text-gray-700">
                      {teller}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="grid gap-6 border-b border-[#e5e7eb] px-6 py-7 sm:grid-cols-2 lg:px-8">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900">{t("balance_summary")}</h2>
              </div>
            </div>
            <DetailField label={t("opening_balance")} value={formatCurrency(report.data.opening_balance)} />
            <DetailField label={t("system_balance")} value={formatCurrency(report.data.system_balance)} />
            <DetailField label={t("total_deposits")} value={formatCurrency(report.data.total_deposits)} />
            <DetailField label={t("total_withdrawals")} value={formatCurrency(report.data.total_withdrawals)} />
            <DetailField label="Closing balance" value={formatCurrency(report.data.closing_balance ?? report.data.physical_balance)} />
            <DetailField
              label={t("balance_difference")}
              value={formatCurrency(Number(report.data.closing_balance ?? report.data.physical_balance) - Number(report.data.system_balance))}
            />
          </div>

          {report.cash_denominations?.length > 0 && (
            <div className="border-b border-[#e5e7eb] px-6 py-6 lg:px-8">
              <h2 className="text-sm font-semibold text-gray-900">Cash denomination count</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                {report.cash_denominations.map((denomination) => (
                  <li key={denomination.id} className="flex justify-between gap-4">
                    <span>{denomination.label}</span>
                    <span>{denomination.pivot?.quantity ?? 0} × {formatCurrency(denomination.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col justify-between gap-4 px-6 py-6 sm:flex-row sm:items-center lg:px-8">
            <div className="flex items-start gap-3 text-sm text-gray-500">
              <UserRound className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {status === "approved"
                  ? t("report_approved_message")
                  : t("report_pending_message")}
              </p>
            </div>
            {canApprove && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={isApproving}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-gray-900 px-4 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isApproving ? t("approving") : t("approve_report")}
              </button>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="border-b border-[#e5e7eb] px-6 py-5 lg:px-8">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">{t("transactions")}</h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {transactions.length} {transactions.length === 1 ? t("transaction_included_desc") : t("transactions_included_desc")}
            </p>
          </div>

          {transactions.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-gray-500 lg:px-8">
              {t("no_transactions_recorded")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f8f9fa]">
                    {[t("no"), t("transaction"), t("customer"), t("date"), t("amount")].map((heading) => (
                      <th
                        key={heading}
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {pageItems.map((transaction, index) => {
                    const transactionType = String(
                      transaction.transaction_type ?? "transaction"
                    ).toLowerCase();
                    const isDeposit = transactionType === "deposit";

                    return (
                      <tr key={transaction.id ?? `${transactionType}-${index}`}>
                        <td className="px-6 py-4 text-sm text-gray-500">{startIndex + index + 1}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 text-sm font-medium capitalize text-gray-900">
                            {isDeposit ? (
                              <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-red-600" />
                            )}
                            {t(transactionType) || transactionType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {transaction.customer?.student_name ??
                            transaction.customer?.name ??
                            transaction.customer_id ??
                            "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td
                          className={`px-6 py-4 text-right text-sm font-semibold ${
                            isDeposit ? "text-emerald-700" : "text-red-700"
                          }`}
                        >
                          {isDeposit ? "+" : "-"}{formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <Pagination currentPage={currentPage} totalItems={transactions.length} pageSize={pageSize} onPageChange={setCurrentPage} />
        </section>
      </div>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <div className="flex min-h-11 items-center gap-2 rounded-md border border-[#d1d5db] bg-[#f8f9fa] px-3 text-sm text-gray-900">
        {value}
      </div>
    </div>
  );
}