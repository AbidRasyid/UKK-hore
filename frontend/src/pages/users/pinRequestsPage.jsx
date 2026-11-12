import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import api from "../../api/axios";
import { formatDate } from "../../utils/format";
import { useLanguage } from "../../hooks/useLanguage";
import Pagination from "../../components/Pagination";
import useClientPagination from "../../hooks/useClientPagination";

const getStatus = (request) => String(request.status ?? "pending").toLowerCase();

const getCustomerName = (request) =>
  request.customer?.fullname ||
  request.customer?.name ||
  request.customer?.student_name ||
  request.customer_name ||
  request.customer?.username ||
  "-";

const getCustomerIdentifier = (request) =>
  request.customer?.account_number ||
  request.customer?.account_no ||
  request.customer?.id ||
  request.customer_id ||
  "-";

const statusClassName = (status) => {
  if (status === "approved") return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  if (status === "rejected") return "bg-red-50 text-red-700 ring-red-600/20";
  return "bg-amber-50 text-amber-700 ring-amber-600/20";
};

const loadPinRequests = async () => {
  const response = await api.get("/api/pin-requests");
  const data = response.data?.data;

  if (!Array.isArray(data)) {
    throw new Error("The pin requests response has an invalid format.");
  }

  return data;
};

function SummaryCard({ icon: Icon, label, value, iconClassName }) {
  return (
    <div className="rounded-lg border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <Icon className={`h-5 w-5 ${iconClassName}`} />
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
    </div>
  );
}

export default function PinRequestsPage() {
  const { user } = useOutletContext();
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      setRequests(await loadPinRequests());
    } catch (error) {
      console.error("Failed to load pin change requests", error);
      setErrorMessage(t("pin_requests_load_error"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let isMounted = true;

    const loadRequests = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await loadPinRequests();
        if (isMounted) setRequests(data);
      } catch (error) {
        console.error("Failed to load pin change requests", error);
        if (isMounted) setErrorMessage(t("pin_requests_load_error"));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadRequests();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const updateStatus = async (request, status) => {
    setUpdatingId(request.id);
    setErrorMessage("");

    try {
      const response = await api.patch(`/api/pin-change-request/${request.id}`, { status });
      const updatedRequest = response.data?.data;

      setRequests((currentRequests) =>
        currentRequests.map((item) =>
          item.id === request.id
            ? updatedRequest && typeof updatedRequest === "object"
              ? { ...item, ...updatedRequest }
              : { ...item, status }
            : item
        )
      );
    } catch (error) {
      console.error(`Failed to ${status} pin change request`, error);
      setErrorMessage(t("pin_request_update_error"));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const status = getStatus(request);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const matchesSearch =
        !query ||
        [
          request.id,
          request.customer_id,
          getCustomerName(request),
          getCustomerIdentifier(request),
          status,
        ].some((value) => String(value ?? "").toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [requests, search, statusFilter]);
  const { currentPage, setCurrentPage, pageItems, pageSize, startIndex } = useClientPagination(filteredRequests);

  const summary = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((request) => getStatus(request) === "pending").length,
      approved: requests.filter((request) => getStatus(request) === "approved").length,
      rejected: requests.filter((request) => getStatus(request) === "rejected").length,
    }),
    [requests]
  );

  return (
    <div className="min-h-full bg-[#f8f9fa]">
      <DashboardHeader
        role={(user?.role || "").toLowerCase().trim()}
        user={user}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("search_pin_requests")}
      />

      <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              {t("administration")}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              {t("pin_requests")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{t("pin_requests_description")}</p>
          </div>
          <button
            type="button"
            onClick={fetchRequests}
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("refresh")}
          </button>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard icon={Clock3} label={t("pending")} value={summary.pending} iconClassName="text-amber-600" />
          <SummaryCard icon={CheckCircle2} label={t("approved")} value={summary.approved} iconClassName="text-emerald-600" />
          <SummaryCard icon={XCircle} label={t("rejected")} value={summary.rejected} iconClassName="text-red-600" />
          <SummaryCard icon={RefreshCw} label={t("total_requests")} value={summary.total} iconClassName="text-gray-500" />
        </div>

        <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col gap-3 border-b border-[#e5e7eb] px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t("pin_request_history")}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {filteredRequests.length} {filteredRequests.length === 1 ? t("request_found") : t("requests_found")}
              </p>
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              aria-label={t("filter_pin_requests_status")}
            >
              <option value="all">{t("all_statuses")}</option>
              <option value="pending">{t("pending")}</option>
              <option value="approved">{t("approved")}</option>
              <option value="rejected">{t("rejected")}</option>
            </select>
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
                    {[t("no"), t("customer"), t("new_pin"), t("requested_at"), t("status"), t("actions")].map((heading) => (
                      <th key={heading} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {isLoading ? (
                    <tr><td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">{t("loading")}</td></tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">{t("no_pin_requests")}</td></tr>
                  ) : (
                    pageItems.map((request, index) => {
                      const status = getStatus(request);
                      const isUpdating = updatingId === request.id;

                      return (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{startIndex + index + 1}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <p className="font-medium">{getCustomerName(request)}</p>
                            <p className="mt-1 text-xs text-gray-500">#{getCustomerIdentifier(request)}</p>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm tracking-[0.2em] text-gray-900">
                            ••••••
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{formatDate(request.created_at)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusClassName(status)}`}>
                              {t(status) || status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {status === "pending" ? (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateStatus(request, "approved")}
                                  disabled={isUpdating}
                                  className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" /> {t("approve")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateStatus(request, "rejected")}
                                  disabled={isUpdating}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <XCircle className="h-3.5 w-3.5" /> {t("reject")}
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">{t("reviewed")}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
          <Pagination currentPage={currentPage} totalItems={filteredRequests.length} pageSize={pageSize} onPageChange={setCurrentPage} />
        </section>
      </div>
    </div>
  );
}
