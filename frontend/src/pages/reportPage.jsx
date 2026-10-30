import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, CheckCircle2, Clock3, RefreshCw } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import api from "../api/axios";

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getStatus = (report) => String(report.status ?? "pending").toLowerCase();

const statusLabel = (status) => {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
};

const statusClassName = (status) => {
  if (status === "approved") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  }

  if (status === "rejected") {
    return "bg-red-50 text-red-700 ring-red-600/20";
  }

  return "bg-amber-50 text-amber-700 ring-amber-600/20";
};

export default function ReportPage() {
  const { user } = useOutletContext();
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchReports = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get("/api/daily-reports");
      const data = response.data?.data;

      if (!Array.isArray(data)) {
        throw new Error("The daily reports response has an invalid format.");
      }

      setReports(data);
    } catch (error) {
      console.error("Failed to load daily reports", error);
      setErrorMessage("Daily reports could not be loaded. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const status = getStatus(report);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const matchesSearch =
        !query ||
        [report.report_date, report.id, status].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      return matchesStatus && matchesSearch;
    });
  }, [reports, search, statusFilter]);

  const summary = useMemo(
    () => ({
      total: reports.length,
      approved: reports.filter((report) => getStatus(report) === "approved").length,
      pending: reports.filter((report) => getStatus(report) !== "approved").length,
    }),
    [reports]
  );

  return (
    <div className="min-h-full bg-[#f8f9fa]">
      <DashboardHeader
        role={(user?.role || "").toLowerCase().trim()}
        user={user}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search report date or status..."
      />

      <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              Operations
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              Daily reports
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Review daily teller balances and report approval status.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchReports}
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard icon={CalendarDays} label="Total reports" value={summary.total} />
          <SummaryCard icon={CheckCircle2} label="Approved reports" value={summary.approved} />
          <SummaryCard icon={Clock3} label="Waiting approval" value={summary.pending} />
        </div>

        <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col gap-3 border-b border-[#e5e7eb] px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Report history</h2>
              <p className="mt-1 text-sm text-gray-500">
                {filteredReports.length} report{filteredReports.length === 1 ? "" : "s"} found
              </p>
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              aria-label="Filter reports by status"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {errorMessage ? (
            <div className="flex items-center gap-3 px-6 py-10 text-sm text-red-700 lg:px-8">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1050px] w-full">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f8f9fa]">
                    {["No", "Report date", "Opening balance", "Deposits", "Withdrawals", "System balance", "Physical balance", "Status"].map((heading) => (
                      <th key={heading} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {isLoading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-10 text-center text-sm text-gray-500">
                        Loading daily reports...
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-10 text-center text-sm text-gray-500">
                        No daily reports found.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report, index) => {
                      const status = getStatus(report);

                      return (
                        <tr key={report.id ?? `${report.report_date}-${index}`} className="text-sm text-gray-700">
                          <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">{formatDate(report.report_date)}</td>
                          <td className="px-6 py-4">{formatCurrency(report.opening_balance)}</td>
                          <td className="px-6 py-4">{formatCurrency(report.total_deposits)}</td>
                          <td className="px-6 py-4">{formatCurrency(report.total_withdrawals)}</td>
                          <td className="px-6 py-4">{formatCurrency(report.system_balance)}</td>
                          <td className="px-6 py-4">{formatCurrency(report.physical_balance)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusClassName(status)}`}>
                              {statusLabel(status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
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

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
    </div>
  );
}
