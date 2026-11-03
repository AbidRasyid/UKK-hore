import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Receipt, 
  ArrowDown, 
  ArrowUp, 
  Search, 
  Info 
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
  const user = useOutletContext();
  const { t } = useLanguage();
  const [quickLookupId, setQuickLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Personalized session started time
  const [sessionStartTime] = useState(() => {
    return '08:42 AM';
  });

  

  // Recent personalized teller transactions (placeholder)
  const tellerTransactions = [
    {
      time: '10:42 AM',
      type: 'Deposit',
      account: '***4920',
      amount: 'Rp. 200.000',
      status: 'Completed',
    },
    {
      time: '10:15 AM',
      type: 'Withdrawal',
      account: '***1102',
      amount: 'Rp. 100.000',
      status: 'Completed',
    },
    {
      time: '09:30 AM',
      type: 'Deposit',
      account: '***4491',
      amount: 'Rp. 100.000',
      status: 'Completed',
    },
  ];

  const handleLookupSubmit = async (e) => {
    e.preventDefault();
    const query = quickLookupId.trim();
    if (!query) return;

    setIsLookingUp(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const response = await api.get(`/api/customer?s=${encodeURIComponent(query)}`);
      const customers = Array.isArray(response.data?.data)
        ? response.data.data
        : response.data?.data
          ? [response.data.data]
          : [];

      if (customers.length === 0) {
        setLookupError(t('no_customer_found'));
        return;
      }

      setLookupResult(customers[0]);
    } catch (error) {
      console.error('Failed to look up customer account', error);
      setLookupError(t('lookup_customer_error'));
    } finally {
      setIsLookingUp(false);
    }
  };

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
              3
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

      {/* 2-Column Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Transactions Table (col-span-8) */}
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
                {tellerTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    {/* TIME */}
                    <td className="py-4 px-6 text-xs font-mono font-medium text-gray-900 whitespace-nowrap">
                      {tx.time}
                    </td>

                    {/* TYPE */}
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap font-sans">
                      {t(tx.type.toLowerCase()) || tx.type}
                    </td>

                    {/* ACCOUNT */}
                    <td className="py-4 px-6 text-sm font-mono text-gray-700 whitespace-nowrap">
                      {tx.account}
                    </td>

                    {/* AMOUNT */}
                    <td className="py-4 px-6 text-sm font-mono font-bold text-gray-900 whitespace-nowrap">
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

        {/* Right Column: Quick Lookup + System Alerts (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Lookup Card */}
          <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <h2 className="text-base font-bold text-gray-900 font-sans">
              {t('quick_lookup')}
            </h2>
            <form onSubmit={handleLookupSubmit} className="mt-3">
              <label
                htmlFor="account-lookup-input"
                className="block text-xs font-normal text-gray-500 mb-1.5 font-sans"
              >
                {t('account_number_or_id')}
              </label>
              <div className="relative flex items-center border border-[#d1d5db] rounded-md overflow-hidden bg-white focus-within:border-gray-500 transition-colors">
                <input
                  id="account-lookup-input"
                  type="text"
                  value={quickLookupId}
                  onChange={(e) => setQuickLookupId(e.target.value)}
                  placeholder="000-000-0000"
                  className="w-full h-10 px-3 text-sm font-mono text-gray-800 placeholder:text-gray-400 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label={t('search_account')}
                  disabled={isLookingUp}
                  className="h-10 px-3.5 border-l border-[#e5e7eb] text-gray-600 hover:text-black hover:bg-gray-50 transition cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Search className="w-4 h-4 stroke-2" />
                </button>
              </div>
              {isLookingUp && (
                <p className="mt-2 text-xs text-gray-500 font-sans">{t('looking_up_customer')}</p>
              )}
              {lookupError && (
                <p className="mt-2 text-xs text-red-600 font-sans">{lookupError}</p>
              )}
              {lookupResult && (
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs font-sans">
                  <div>
                    <dt className="text-gray-500">{t('account_number')}</dt>
                    <dd className="mt-1 font-mono text-gray-900">{lookupResult.account_number || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">{t('student_id')}</dt>
                    <dd className="mt-1 text-gray-900">{lookupResult.student_id || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">{t('student_name')}</dt>
                    <dd className="mt-1 text-gray-900">{lookupResult.student_name || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">{t('class')}</dt>
                    <dd className="mt-1 text-gray-900">{lookupResult.student_class || '-'}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-gray-500">{t('balance')}</dt>
                    <dd className="mt-1 font-mono font-semibold text-gray-900">{lookupResult.balance ?? '-'}</dd>
                  </div>
                </dl>
              )}
            </form>
          </div>

          {/* System Alerts Card */}
          <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-h-64">
            <h2 className="text-base font-bold text-gray-900 font-sans">
              {t('system_alerts')}
            </h2>
            <div className="mt-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-gray-500 stroke-[1.8] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 font-sans leading-tight">
                  {t('system_update_scheduled')}
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-sans">
                  {t('system_update_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
