import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Filter,
  LockKeyhole,
} from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import api from "../../api/axios";
import { formatCurrency, formatDate } from "../../utils/format";

const normalizeStatus = (value) => String(value ?? "active").toLowerCase();

export default function CustomerTransactionPage() {
  const { customer_id } = useParams();
  const { state } = useLocation();
  const [customer, setCustomer] = useState(state?.customer ?? null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [transactionType, setTransactionType] = useState(null);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPageData = async () => {
      try {
        const requests = [
          api.get(`/api/teller/customer/${customer_id}/transactions`),
        ];

        if (!state?.customer) {
          requests.push(api.get(`/api/customer/${customer_id}`));
        }

        const [transactionResponse, customerResponse] = await Promise.all(requests);
        const transactionData = transactionResponse.data?.data;

        if (!Array.isArray(transactionData)) {
          throw new Error("The transactions response has an invalid format.");
        }

        if (isMounted) {
          setTransactions(transactionData);
          if (customerResponse) {
            setCustomer(customerResponse.data?.data ?? null);
          }
        }
      } catch (error) {
        console.error("Failed to load customer transaction page", error);
        if (isMounted) {
          setErrorMessage("Customer transactions could not be loaded. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPageData();

    return () => {
      isMounted = false;
    };
  }, [customer_id, state]);

  const balance = Number(customer?.balance) || 0;
  const activeStatus = normalizeStatus(customer?.status?.value ?? customer?.status);
  const recentTransactions = useMemo(() => transactions.slice(0, 10), [transactions]);

  const handleTransaction = async (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount < 1) {
      alert("Enter a valid transaction amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/api/user/${customer_id}/transaction/initiate`, {
        transaction_type: transactionType,
        amount: numericAmount,
      });
      alert("Transaction request sent. Ask the customer to confirm with their PIN.");
      setTransactionType(null);
      setAmount("");
    } catch (error) {
      console.error("Failed to initiate customer transaction", error);
      alert(error.response?.data?.message || "Transaction could not be initiated.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-full bg-black p-8 text-sm text-gray-400">Loading customer profile...</div>;
  }

  if (!customer) {
    return (
      <div className="min-h-full bg-black p-8 text-sm text-red-400">
        Customer profile could not be found.
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <DashboardHeader title="E-Teller System" showSearch={false} role="teller" />

      <main className="mx-auto max-w-350 px-5 py-10 sm:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            to="/accounts"
            className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to customer search
          </Link>
          <span className="inline-flex items-center gap-2 bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold uppercase text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {activeStatus}
          </span>
        </div>

        <p className="mb-6 text-xs text-gray-400">
          Customer ID: {customer.account_number || customer.student_id || customer_id}
        </p>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
          <section className="bg-white p-6 text-gray-900">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center bg-gray-200 text-lg font-semibold text-gray-700">
                {(customer.student_name || "C").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-semibold">{customer.student_name || "-"}</h1>
                <p className="font-mono text-sm text-gray-500">
                  ID: {customer.account_number || "-"}
                </p>
              </div>
            </div>
            <div className="my-5 border-t border-gray-200" />
            <div className="grid gap-5 sm:grid-cols-2">
              <Detail label="Primary account" value={customer.account_number || "-"} />
              <Detail label="Account type" value="Customer Account" />
              <Detail label="Student ID" value={customer.student_id || "-"} />
              <Detail label="Class" value={customer.student_class || "-"} />
            </div>
          </section>

          <section className="bg-white p-6 text-gray-900">
            <p className="text-xs uppercase tracking-wide text-gray-500">Available balance</p>
            <p className="mt-2 font-mono text-3xl font-semibold">
              {formatCurrency(balance)}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
              <LockKeyhole className="h-3 w-3" />
              Holds: {formatCurrency(0)}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setTransactionType("deposit")}
                className="inline-flex h-10 items-center justify-center gap-2 bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <ArrowDown className="h-4 w-4" /> Deposit
              </button>
              <button
                type="button"
                onClick={() => setTransactionType("withdrawal")}
                className="inline-flex h-10 items-center justify-center gap-2 bg-black text-sm font-medium text-white hover:bg-gray-800"
              >
                <ArrowUp className="h-4 w-4" /> Withdrawal
              </button>
            </div>
          </section>
        </div>

        {errorMessage ? (
          <p className="mt-6 bg-red-950 px-5 py-4 text-sm text-red-300">{errorMessage}</p>
        ) : (
          <section className="mt-6 overflow-hidden bg-white text-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-semibold">Recent Transactions</h2>
              <button type="button" className="inline-flex items-center gap-2 border border-gray-300 px-3 py-2 text-xs text-gray-700">
                <Filter className="h-4 w-4" /> Filter View
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 text-[10px] uppercase text-gray-500">
                  <tr>
                    {["Date", "Type", "Reference ID", "Amount", "Balance"].map((heading) => (
                      <th key={heading} className="px-5 py-3 text-left font-medium">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {recentTransactions.length === 0 ? (
                    <tr><td colSpan="5" className="px-5 py-10 text-center text-gray-500">No transactions found.</td></tr>
                  ) : recentTransactions.map((transaction, index) => {
                    const isDeposit = String(transaction.transaction_type).toLowerCase() === "deposit";
                    return (
                      <tr key={transaction.id ?? index}>
                        <td className="whitespace-nowrap px-5 py-3">{formatDate(transaction.transaction_date || transaction.created_at)}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs ${isDeposit ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                            {isDeposit ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                            {isDeposit ? "Deposit" : "Withdrawal"}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-gray-600">{transaction.reference_id || `TRX-${transaction.id ?? "-"}`}</td>
                        <td className={`px-5 py-3 font-mono text-right ${isDeposit ? "text-emerald-700" : "text-red-600"}`}>
                          {isDeposit ? "+" : "-"}{formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-5 py-3 text-right font-mono">{formatCurrency(transaction.balance ?? balance)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {transactionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">
          <form onSubmit={handleTransaction} className="w-full max-w-sm bg-white p-6 text-gray-900">
            <h2 className="text-lg font-semibold capitalize">{transactionType} customer account</h2>
            <p className="mt-1 text-sm text-gray-500">
              The customer must confirm this request with their PIN.
            </p>
            <label className="mt-5 block text-sm font-medium">
              Amount
              <input
                autoFocus
                type="number"
                min="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="mt-2 h-11 w-full border border-gray-300 px-3 outline-none focus:border-black"
                required
              />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setTransactionType(null)} className="border border-gray-300 px-4 py-2 text-sm">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="bg-black px-4 py-2 text-sm text-white disabled:opacity-50">
                {isSubmitting ? "Sending..." : "Send request"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}