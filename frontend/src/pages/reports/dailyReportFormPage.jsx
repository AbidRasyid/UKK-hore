import { useEffect, useState } from "react";
import { ArrowLeft, Landmark, Save } from "lucide-react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import api from "../../api/axios";
import { formatCurrency } from "../../utils/format";

const getUserId = (user) => user?.id ?? user?.user_id;

export default function DailyReportFormPage() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const userId = getUserId(user);
  const [summary, setSummary] = useState(null);
  const [openingBalance, setOpeningBalance] = useState("0");
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
              "Daily report summary could not be loaded. Please try again."
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
  }, [userId]);

  const totalDeposits = Number(summary?.total_deposits) || 0;
  const totalWithdrawals = Number(summary?.total_withdrawals) || 0;
  const systemBalance = Number(summary?.system_balance) || totalDeposits - totalWithdrawals;
  const displayedError =
    errorMessage ||
    (!userId ? "Your user session could not be identified. Please sign in again." : "");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const opening = Number(openingBalance);
    const physical = Number(physicalBalance);

    if (!Number.isInteger(opening) || opening < 0) {
      setErrorMessage("Opening balance must be a whole number equal to or greater than zero.");
      return;
    }

    if (!Number.isInteger(physical) || physical < 0) {
      setErrorMessage("Physical cash must be a whole number equal to or greater than zero.");
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
        error.response?.data?.message || "Daily report could not be submitted. Please try again."
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
          Back to reports
        </Link>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
            Report management
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            Create daily report
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Count the physical cash and submit today&apos;s transactions for supervisor review.
          </p>
        </header>

        {displayedError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {displayedError}
          </div>
        )}

        <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <form className="divide-y divide-[#e5e7eb]" onSubmit={handleSubmit}>
            <div className="grid gap-6 px-6 py-7 sm:grid-cols-2 lg:px-8">
              <div className="sm:col-span-2">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-gray-500" />
                  <h2 className="text-sm font-semibold text-gray-900">Report balance</h2>
                </div>
              </div>
              <ReadOnlyField label="Total deposits" value={formatCurrency(totalDeposits)} />
              <ReadOnlyField label="Total withdrawals" value={formatCurrency(totalWithdrawals)} />
              <ReadOnlyField
                label="System balance before opening balance"
                value={formatCurrency(systemBalance)}
              />
              <ReadOnlyField
                label="Transactions"
                value={`${summary?.transactions?.length ?? 0} transactions`}
              />
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Opening balance
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={openingBalance}
                  onChange={(event) => setOpeningBalance(event.target.value)}
                  className="h-11 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Counted physical cash
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={physicalBalance}
                  onChange={(event) => setPhysicalBalance(event.target.value)}
                  placeholder="Enter counted cash"
                  className="h-11 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  required
                />
              </label>
            </div>

            <div className="flex flex-col justify-between gap-4 px-6 py-6 sm:flex-row sm:items-center lg:px-8">
              <p className="text-sm text-gray-500">
                The report will be marked pending until a supervisor reviews it.
              </p>
              <button
                type="submit"
                disabled={isSubmitting || !summary}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit daily report"}
              </button>
            </div>
          </form>
        </section>
      </div>
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
