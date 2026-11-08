import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import api from "../../api/axios";
import ReportRow from "../../components/reports/reportRow";
import { useLanguage } from "../../hooks/useLanguage";
import Pagination from "../../components/Pagination";
import useClientPagination from "../../hooks/useClientPagination";
import useListFilters from "../../hooks/useListFilters";
import FilterExportCard from "../../components/FilterExportCard";
import { exportToExcel } from "../../utils/exportToExcel";

const getStatus = (report) => String(report.status ?? "pending").toLowerCase();

// const statusLabel = (status) => {
//   if (status === "approved") return "Approved";
//   if (status === "rejected") return "Rejected";
//   return "Pending";
// };

// const statusClassName = (status) => {
//   if (status === "approved") {
//     return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
//   }

//   if (status === "rejected") {
//     return "bg-red-50 text-red-700 ring-red-600/20";
//   }

//   return "bg-amber-50 text-amber-700 ring-amber-600/20";
// };

export default function ReportPage() {
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const { search, setSearch, dateMode, setDateMode, dateValue, setDateValue, matchesDate } = useListFilters();
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
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
      setErrorMessage(t("daily_reports_load_error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await api.get("/api/daily-reports");
        const data = response.data?.data;

        if (!Array.isArray(data)) {
          throw new Error("The daily reports response has an invalid format.");
        }

        if (isMounted) {
          setReports(data);
        }
      } catch (error) {
        console.error("Failed to load daily reports", error);
        if (isMounted) {
          setErrorMessage(t("daily_reports_load_error"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const status = getStatus(report);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const matchesPeriod = matchesDate(report.report_date);
      const matchesSearch =
        !query ||
        [report.report_date, report.id, status].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      return matchesStatus && matchesPeriod && matchesSearch;
    });
  }, [reports, search, statusFilter, matchesDate]);
  const { currentPage, setCurrentPage, pageItems, pageSize, startIndex } = useClientPagination(filteredReports);

  const summary = useMemo(() => {
    const periodReports = reports.filter((report) => matchesDate(report.report_date));
    return {
      total: periodReports.length,
      approved: periodReports.filter((report) => getStatus(report) === "approved").length,
      pending: periodReports.filter((report) => getStatus(report) !== "approved").length,
    };
  }, [reports, matchesDate]);

  const handleExport = async () => {
    if (!filteredReports.length) return;
    setIsExporting(true);
    try {
      await exportToExcel({
        rows: filteredReports.map((report) => ({
          id: report.id,
          report_date: report.report_date,
          opening_balance: report.opening_balance,
          deposits: report.total_deposits,
          withdrawals: report.total_withdrawals,
          system_balance: report.system_balance,
          closing_balance: report.closing_balance ?? report.physical_balance,
          status: getStatus(report),
          approved_by: report.approved_by ?? "",
        })),
        columns: [
          { header: t("report_id"), key: "id", width: 12 },
          { header: t("report_date"), key: "report_date", width: 18 },
          { header: t("opening_balance"), key: "opening_balance", width: 18 },
          { header: t("deposits"), key: "deposits", width: 18 },
          { header: t("withdrawals"), key: "withdrawals", width: 18 },
          { header: t("system_balance"), key: "system_balance", width: 18 },
          { header: "Closing balance", key: "closing_balance", width: 18 },
          { header: t("status"), key: "status", width: 14 },
          { header: t("approved_by"), key: "approved_by", width: 18 },
        ],
        fileName: "daily-reports.xlsx",
        sheetName: "Daily reports",
      });
    } catch {
      setErrorMessage(t("export_failed"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f8f9fa]">
      <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              {t("operations")}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              {t("daily_reports")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t("report_page_desc")}
            </p>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard icon={CalendarDays} label={`${t("daily_reports")} (${t("status")})`} value={summary.total} />
          <SummaryCard icon={CheckCircle2} label={t("approved")} value={summary.approved} />
          <SummaryCard icon={Clock3} label={t("pending")} value={summary.pending} />
        </div>

        <FilterExportCard
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={t("search_report")}
          dateMode={dateMode}
          onDateModeChange={setDateMode}
          dateValue={dateValue}
          onDateValueChange={setDateValue}
          onRefresh={fetchReports}
          isRefreshing={isLoading}
          onExport={handleExport}
          isExporting={isExporting}
          exportDisabled={filteredReports.length === 0}
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{t("status")}</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-gray-600 focus:ring-2 focus:ring-gray-200"
              aria-label={t("filter_reports_status")}
            >
              <option value="all">{t("all_statuses")}</option>
              <option value="pending">{t("pending")}</option>
              <option value="approved">{t("approved")}</option>
              <option value="rejected">{t("rejected")}</option>
            </select>
          </label>
        </FilterExportCard>

        <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col gap-3 border-b border-[#e5e7eb] px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t("report_history")}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {filteredReports.length} {filteredReports.length === 1 ? t("report_found") : t("reports_found")}
              </p>
            </div>
          </div>

          {errorMessage ? (
            <div className="flex items-center gap-3 px-6 py-10 text-sm text-red-700 lg:px-8">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-262.5 w-full">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f8f9fa]">
                    {[t("no"), t("report_date"), t("opening_balance"), t("deposits"), t("withdrawals"), t("system_balance"), "Closing balance", t("status"), t("approved_by"), t("actions")].map((heading) => (
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
                        {t("loading_daily_reports")}
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-10 text-center text-sm text-gray-500">
                        {t("no_daily_reports")}
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((report, index) => {
                      // const status = getStatus(report);

                      return (
                        <ReportRow
                        key={report.id ?? `${report.report_date}-${index}`}
                        report={report}
                        index={startIndex + index}
                        />
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
          <Pagination currentPage={currentPage} totalItems={filteredReports.length} pageSize={pageSize} onPageChange={setCurrentPage} />
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
