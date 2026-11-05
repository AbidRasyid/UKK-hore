import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { formatCurrency } from "../../utils/format";
import CurrencyInput from "react-currency-input-field";

export default function DailyReportFormPage() {
  const navigate = useNavigate();
  const [shift, setShift] = useState(null);
  const [denominations, setDenominations] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [closingBalance, setClosingBalance] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchShift = async () => {
      try {
        const response = await api.get("/api/teller/shift");
        if (isMounted) {
          setShift(response.data?.data ?? null);
          setDenominations(response.data?.cash_denominations ?? []);
        }
      } catch (error) {
        console.error("Failed to load shift for closing", error);
        if (isMounted) {
          setErrorMessage(error.response?.data?.message || "Unable to load your open shift.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchShift();
    return () => {
      isMounted = false;
    };
  }, []);

  const countedBalance = useMemo(
    () => denominations.reduce(
      (total, denomination) =>
        total + denomination.value * (Number(quantities[denomination.id]) || 0),
      0
    ),
    [denominations, quantities]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const closing = Number(closingBalance);
    const cashDenominations = denominations
      .filter((denomination) => Number(quantities[denomination.id]) > 0)
      .map((denomination) => ({
        cash_denomination_id: denomination.id,
        quantity: Number(quantities[denomination.id]),
      }));

    if (!shift) {
      setErrorMessage("There is no open shift to close.");
      return;
    }
    if (!Number.isSafeInteger(closing) || closing < 0) {
      setErrorMessage("Enter a valid closing balance.");
      return;
    }
    if (cashDenominations.length === 0) {
      setErrorMessage("Enter the quantities of the cash denominations counted.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await api.post(`/api/teller/shift/${shift.id}/close`, {
        closing_balance: closing,
        system_balance: Number(shift.system_balance),
        cash_denominations: cashDenominations,
      });
      navigate("/reports");
    } catch (error) {
      console.error("Failed to close teller shift", error);
      setErrorMessage(error.response?.data?.message || "Unable to close your shift.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-sm text-gray-500">Loading open shift...</div>;
  }

  return (
    <div className="min-h-full bg-[#f8f9fa]">
      <div className="border-b border-[#e5e7eb] bg-white px-6 py-3.5 lg:px-8">
        <Link to="/reports" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Back to reports
        </Link>
      </div>

      <main className="mx-auto max-w-3xl space-y-6 p-6 lg:p-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Teller operations</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Close shift and submit daily report</h1>
          <p className="mt-2 text-sm text-gray-600">Count the cash and submit the shift closing balances for supervisor review.</p>
        </header>

        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
        )}

        {!shift ? (
          <section className="border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-700">No open shift was found.</p>
            <Link to="/" className="mt-4 inline-block text-sm font-medium underline">Open a shift</Link>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="grid gap-4 border border-gray-200 bg-white p-6 sm:grid-cols-2">
              <Balance label="Opening balance" value={shift.opening_balance} />
              <Balance label="Total deposits" value={shift.total_deposits} />
              <Balance label="Total withdrawals" value={shift.total_withdrawals} />
              <Balance label="System balance" value={shift.system_balance} />
              <div className="sm:col-span-2">
                <h2 className="text-sm font-semibold text-gray-900">Shift tellers</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {(shift.tellers ?? []).map((teller) => (
                    <li key={teller.id} className="border border-gray-200 px-3 py-1.5 text-sm text-gray-700">
                      {teller.name}
                    </li>
                  ))}
                </ul>
              </div>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-gray-700">Closing balance</span>
                <CurrencyInput
                  id="closing-balance"
                  name="closing_balance"
                  placeholder="Rp 0"
                  prefix="Rp "
                  decimalsLimit={0}
                  min={1}
                  required
                  value={closingBalance}
                  onValueChange={(value) => setClosingBalance(value)}
                  className="h-11 w-full border border-gray-300 px-3 text-sm outline-none focus:border-gray-600"
                />
              </label>
              <div className="sm:col-span-2">
                <h2 className="text-sm font-semibold text-gray-900">Cash denomination count</h2>
                <div className="mt-3 divide-y divide-gray-100 border border-gray-200">
                  {denominations.map((denomination) => (
                    <label key={denomination.id} className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm">
                      <span>{denomination.label} <span className="text-gray-500">({formatCurrency(denomination.value)})</span></span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={quantities[denomination.id] ?? ""}
                        onChange={(event) => setQuantities((current) => ({
                          ...current,
                          [denomination.id]: event.target.value,
                        }))}
                        aria-label={`${denomination.label} quantity`}
                        className="h-9 w-24 border border-gray-300 px-2 text-right"
                      />
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-right text-sm text-gray-600">Counted total: {formatCurrency(countedBalance)}</p>
              </div>
            </section>

            <button type="submit" disabled={isSubmitting} className="inline-flex h-11 items-center gap-2 bg-black px-5 text-sm font-medium text-white disabled:opacity-60">
              <Save className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Close shift and submit report"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

function Balance({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-gray-900">{formatCurrency(value)}</p>
    </div>
  );
}
