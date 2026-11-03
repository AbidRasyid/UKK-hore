import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Receipt, 
  ArrowDown, 
  ArrowUp, 
} from 'lucide-react';
import api from '../../api/axios';
import { useLanguage } from '../../hooks/useLanguage';

const CashDrawerIcon = ({ className = "w-5 h-5 text-gray-900" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M7 4h10l1.5 5H5.5L7 4z" />
    <rect x="8.5" y="6" width="7" height="1.2" rx="0.4" fill="white" />
    <rect x="3" y="10.5" width="18" height="9.5" rx="1.5" />
    <rect x="9.5" y="14" width="5" height="2" rx="0.5" fill="white" />
  </svg>
);

export default function TellerDashboard() {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useLanguage();

  // Personalized session started time
  const [sessionStartTime] = useState(() => {
    return '08:42 AM';
  });

  useEffect(() => {
    let isMounted = true;

    const fetchTransactions = async () => {
      if (!user?.id) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const response = await api.get(`/api/transactions/${user.id}`);
        const data = response.data?.data;

        if (!Array.isArray(data)) {
          throw new Error("Transactions response has an invalid format.");
        }

        if (isMounted) {
          setTransactions(data);
        }
      } catch (error) {
        console.error("Failed to load teller transactions", error);
        if (isMounted) {
          setErrorMessage(
            error.response?.data?.message ||
              "Transactions could not be loaded. Please try again."
          );
          setTransactions([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTransactions();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const tellerTransactions = transactions.slice(0, 10).map((transaction) => ({
    time: transaction.transaction_date,
    type: transaction.transaction_type,
    account: transaction.account_number,
    amount: transaction.amount,
    status: 'completed',
  }));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">
            {t('overview')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 font-sans">
            {t('session_started')} {sessionStartTime}
            {user?.fullname && (
              <span className="ml-2 text-gray-400">
                • {t('logged_in_as')} <span className="text-gray-700 font-medium">{user.fullname}</span>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 4 Stat Cards in 1 Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TODAY'S TRANSACTIONS */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-32">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase font-sans">
              {t('todays_transactions')}
            </span>
            <Receipt className="w-5 h-5 text-gray-700 stroke-[1.8]" />
          </div>
          <div className="mt-4 text-right">
            <span className="text-3xl font-bold text-gray-900 font-mono">
              {transactions.length}
            </span>
          </div>
        </div>

        {/* TOTAL DEPOSITS */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-32">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase font-sans">
              {t('total_deposits')}
            </span>
            <ArrowDown className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
          </div>
          <div className="mt-4 text-right">
            <span className="text-2xl lg:text-3xl font-bold text-gray-900 font-mono">
              Rp. 300.000
            </span>
          </div>
        </div>

        {/* TOTAL WITHDRAWALS */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-32">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase font-sans">
              {t('total_withdrawals')}
            </span>
            <ArrowUp className="w-5 h-5 text-[#b45309] stroke-[2.5]" />
          </div>
          <div className="mt-4 text-right">
            <span className="text-2xl lg:text-3xl font-bold text-gray-900 font-mono">
              Rp. 100.000
            </span>
          </div>
        </div>

        {/* DRAWER BALANCE */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-32">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase font-sans">
              {t('drawer_balance')}
            </span>
            <CashDrawerIcon className="w-5 h-5 text-gray-900" />
          </div>
          <div className="mt-4 text-right">
            <span className="text-2xl lg:text-3xl font-bold text-gray-900 font-mono">
              Rp. 5.000.000
            </span>
          </div>
        </div>
      </div>
        <div className="lg:col-span-8 bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col min-h-110">
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-[#e5e7eb]">
            <h2 className="text-base font-semibold text-gray-900 font-sans">
              {t('recent_transactions')}
            </h2>
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="text-xs font-medium text-gray-700 hover:text-black hover:underline cursor-pointer font-sans"
            >
              {t('view_all')}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-transparent">
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
                    {t('time')}
                  </th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
                    {t('type')}
                  </th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
                    {t('account')}
                  </th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
                    {t('amount')}
                  </th>
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans text-center">
                    {t('status')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]/80">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                      {t('loading')}
                    </td>
                  </tr>
                ) : errorMessage ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-red-600">
                      {errorMessage}
                    </td>
                  </tr>
                ) : tellerTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                      {t('no_transactions')}
                    </td>
                  </tr>
                ) : tellerTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    {/* TIME */}
                    <td className="py-4 px-6 text-xl font-mono font-medium text-gray-900 whitespace-nowrap">
                      {tx.time}
                    </td>

                    {/* TYPE */}
                    <td className="py-4 px-6 text-xl font-medium text-gray-900 whitespace-nowrap font-sans">
                      {t(tx.type.toLowerCase()) || tx.type}
                    </td>

                    {/* ACCOUNT */}
                    <td className="py-4 px-6 text-xl font-mono text-gray-700 whitespace-nowrap">
                      {tx.account}
                    </td>

                    {/* AMOUNT */}
                    <td className="py-4 px-6 text-xl font-mono font-bold text-gray-900 whitespace-nowrap">
                      {tx.amount}
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <span className="inline-block text-center text-xs font-medium px-3 py-1 rounded bg-[#15803d] text-white font-sans">
                        {t(tx.status.toLowerCase()) || tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
  );
}
