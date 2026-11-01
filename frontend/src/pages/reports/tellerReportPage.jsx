import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Eye, Plus, RefreshCw } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import api from "../../api/axios";
import { formatCurrency, formatDate } from "../../utils/format";

const statusStyles = {
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  pending: "bg-amber-50 text-amber-700",
  draft: "bg-gray-100 text-gray-700",
};

const getStatus = (report) => String(report?.status ?? "pending").toLowerCase();
const getUserId = (user) => user?.id ?? user?.user_id;

export default function TellerReportPage() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchReports = async () => {
    const userId = getUserId(user);
    if (!userId) {
      setErrorMessage("Your user session could not be identified. Please sign in again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await api.get(`/api/daily-reports/${userId}`);
      const data = response.data?.data;
      if (!Array.isArray(data)) throw new Error("Invalid daily reports response.");
      setReports(data);
    } catch (error) {
      console.error("Failed to load teller daily reports", error);
      setErrorMessage(
        error.response?.data?.message || "Daily reports could not be loaded. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      const userId = getUserId(user);
      if (!userId) {
        if (isMounted) {
          setErrorMessage("Your user session could not be identified. Please sign in again.");
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await api.get(`/api/daily-reports/${userId}`);
        const data = response.data?.data;
        if (!Array.isArray(data)) throw new Error("Invalid daily reports response.");
        if (isMounted) setReports(data);
      } catch (error) {
        console.error("Failed to load teller daily reports", error);
        if (isMounted) {
          setErrorMessage(
            error.response?.data?.message ||
              "Daily reports could not be loaded. Please try again."
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadReports();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return reports;
    return reports.filter((report) =>
      [report.id, report.report_date, getStatus(report)].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      )
    );
  }, [reports, search]);

  return (
    <div className="min-h-full bg-[#f8f9fa]">
      <DashboardHeader
        role="teller"
        user={user}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search report date or status..."
        searchOnLeft
      />
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily reports</h1>
            <p className="mt-2 text-sm text-gray-600">
              Create a report and track supervisor approval.
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={fetchReports} disabled={isLoading} className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-500 disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button type="button" onClick={() => navigate("/reports/create")} className="inline-flex items-center gap-2 rounded-md bg-black px-5 py-2 text-sm text-white hover:bg-gray-800">
              <Plus className="h-4 w-4" />
              Create report
            </button>
          </div>
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
                {["No", "Report date", "Deposits", "Withdrawals", "System balance", "Physical cash", "Status", "Actions"].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left text-sm font-medium text-gray-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : filteredReports.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-sm text-gray-500">No daily reports found.</td></tr>
              ) : (
                filteredReports.map((report, index) => {
                  const status = getStatus(report);
                  return (
                    <tr key={report.id ?? `${report.report_date}-${index}`} className="border-t border-gray-200">
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDate(report.report_date)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(report.total_deposits)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(report.total_withdrawals)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(report.system_balance)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(report.physical_balance)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[status] || statusStyles.pending}`}>{status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button type="button" onClick={() => navigate(`/report/${report.id}`)} aria-label={`View report ${report.id}`}>
                          <Eye className="h-4 w-4" />
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
    </div>
  );
}
