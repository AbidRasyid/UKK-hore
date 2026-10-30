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
          Back to reports
        </Link>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              Operations
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              Daily report detail
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Review the teller&apos;s end-of-day balance and approval status.
            </p>
          </div>
          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-inset ${
              statusStyles[status] || statusStyles.pending
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status}
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
                <h2 className="text-sm font-semibold text-gray-900">Report information</h2>
              </div>
            </div>
            <DetailField label="Report date" value={formatDate(report.data.report_date)} />
            <DetailField label="Report ID" value={`#${report.data.id ?? report_id}`} />
            <DetailField label="Teller" value={report.teller ?? "-"} />
            <DetailField
              label="Approved by"
              value={report.supervisor ?? "Not approved"}
            />
          </div>

          <div className="grid gap-6 border-b border-[#e5e7eb] px-6 py-7 sm:grid-cols-2 lg:px-8">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900">Balance summary</h2>
              </div>
            </div>
            <DetailField label="Opening balance" value={formatCurrency(report.data.opening_balance)} />
            <DetailField label="System balance" value={formatCurrency(report.data.system_balance)} />
            <DetailField label="Total deposits" value={formatCurrency(report.data.total_deposits)} />
            <DetailField label="Total withdrawals" value={formatCurrency(report.data.total_withdrawals)} />
            <DetailField label="Physical balance" value={formatCurrency(report.data.physical_balance)} />
            <DetailField
              label="Balance difference"
              value={formatCurrency(Number(report.data.physical_balance) - Number(report.data.system_balance))}
            />
          </div>

          <div className="flex flex-col justify-between gap-4 px-6 py-6 sm:flex-row sm:items-center lg:px-8">
            <div className="flex items-start gap-3 text-sm text-gray-500">
              <UserRound className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {status === "approved"
                  ? "This report has been reviewed and approved."
                  : "This report is waiting for supervisor approval."}
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
                {isApproving ? "Approving..." : "Approve report"}
              </button>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="border-b border-[#e5e7eb] px-6 py-5 lg:px-8">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Transactions</h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {transactions.length} transaction{transactions.length === 1 ? "" : "s"} included in this report.
            </p>
          </div>

          {transactions.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-gray-500 lg:px-8">
              No transactions were recorded for this report.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f8f9fa]">
                    {["No", "Transaction", "Customer", "Date", "Amount"].map((heading) => (
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
                  {transactions.map((transaction, index) => {
                    const transactionType = String(
                      transaction.transaction_type ?? "transaction"
                    ).toLowerCase();
                    const isDeposit = transactionType === "deposit";

                    return (
                      <tr key={transaction.id ?? `${transactionType}-${index}`}>
                        <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 text-sm font-medium capitalize text-gray-900">
                            {isDeposit ? (
                              <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-red-600" />
                            )}
                            {transactionType}
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