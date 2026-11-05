import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Eye, Plus, RefreshCw } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import api from "../../api/axios";
import { formatCurrency, formatDate } from "../../utils/format";
import { useLanguage } from "../../hooks/useLanguage";

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
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchReports = async () => {
    const userId = getUserId(user);
    if (!userId) {
      setErrorMessage(t("user_session_unidentified"));
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
        error.response?.data?.message || t("daily_reports_load_error")
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
          setErrorMessage(t("user_session_unidentified"));
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
              t("daily_reports_load_error")
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
  }, [user, t]);

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
        searchPlaceholder={t("search_report")}
        searchOnLeft
      />
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("daily_reports")}</h1>
            <p className="mt-2 text-sm text-gray-600">
              {t("teller_report_desc")}
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={fetchReports} disabled={isLoading} className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-500 disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {t("refresh")}
            </button>
            <button type="button" onClick={() => navigate("/reports/create")} className="inline-flex items-center gap-2 rounded-md bg-black px-5 py-2 text-sm text-white hover:bg-gray-800">
              <Plus className="h-4 w-4" />
              {t("create_report")}
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
                {[t("no"), t("report_date"), t("deposits"), t("withdrawals"), t("system_balance"), "Closing balance", t("status"), t("actions")].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left text-sm font-medium text-gray-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-sm text-gray-500">{t("loading")}</td></tr>
              ) : filteredReports.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-sm text-gray-500">{t("no_daily_reports")}</td></tr>
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
                      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(report.closing_balance ?? report.physical_balance)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[status] || statusStyles.pending}`}>{t(status) || status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button type="button" onClick={() => navigate(`/report/${report.id}`)} aria-label={`${t("view_report")} ${report.id}`}>
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
