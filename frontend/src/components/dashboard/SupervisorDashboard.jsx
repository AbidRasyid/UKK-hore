import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { TrendingUp } from 'lucide-react';
import api from '../../api/axios';
import { useLanguage } from '../../hooks/useLanguage';
import { formatCurrency, formatDate } from '../../utils/format';

/**
 * Custom Pending Report Clipboard Icon matching supervisor_dashboard.png
 */
// eslint-disable-next-line no-unused-vars
const PendingReportIcon = ({ className = "w-6 h-6 text-[#ca8a04]" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Clipboard paper */}
    <rect x="4.5" y="4.5" width="15" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
    {/* Clip top */}
    <path d="M9 4.5V3a1 1 0 011-1h4a1 1 0 011 1v1.5H9z" fill="currentColor" />
    {/* Small clock at bottom right */}
    <circle cx="16" cy="16" r="4.5" fill="white" stroke="currentColor" strokeWidth="1.6" />
    <path d="M16 13.5V16L17.5 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const locale = lang === 'id' ? 'id-ID' : 'en-US';
  const [pendingReports, setPendingReports] = useState(null);
  const [pendingReportsCount, setPendingReportsCount] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [dailyVolume, setDailyVolume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncTime, setSyncTime] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      const [reportsResult, transactionsResult] = await Promise.allSettled([
        api.get('/api/daily-reports'),
        api.get('/api/supervisor/transactions'),
      ]);

      if (!isMounted) return;

      if (reportsResult.status === 'fulfilled') {
        const reports = reportsResult.value.data?.data;
        const pending = Array.isArray(reports)
          ? reports.filter((report) => String(report.status).toLowerCase() === 'draft')
          : [];
        setPendingReports(pending);
        setPendingReportsCount(pending.length);
      } else {
        setPendingReports(null);
        setPendingReportsCount(null);
      }

      if (transactionsResult.status === 'fulfilled') {
        const data = transactionsResult.value.data?.data;
        setTransactions(Array.isArray(data?.transactions) ? data.transactions : []);
        setDailyVolume(Number(data?.daily_volume) || 0);
      } else {
        setTransactions(null);
        setDailyVolume(null);
      }

      setSyncTime(new Date());
      setIsLoading(false);
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Title Bar with Sync Time */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">
            {t('supervisor_dashboard')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 font-sans">
            {t('realtime_branch_overview')}
          </p>
        </div>
        <div>
          <span className="font-mono text-sm text-gray-700 font-medium">
            {t('last_sync')} {syncTime ? new Intl.DateTimeFormat(locale, { timeStyle: 'medium' }).format(syncTime) : '—'}
          </span>
        </div>
      </div>

      {/* 2 Stat Cards (50% / 50% split) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PENDING REPORTS */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-h-36 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
              {t('pending_reports')}
            </span>
            <PendingReportIcon className="w-5 h-5 text-[#ca8a04]" />
          </div>
          <div className="mt-4">
            <span className="text-4xl font-bold text-gray-900 font-mono">
              {pendingReportsCount ?? '—'}
            </span>
          </div>
        </div>

        {/* TOTAL DAILY VOL. */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-h-36 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
              {t('total_daily_vol')}
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-500 stroke-[2.5]" />
          </div>
          <div className="mt-4 text-right">
            <span className="text-3xl sm:text-4xl font-bold text-gray-900 font-mono">
              {dailyVolume === null ? '—' : formatCurrency(dailyVolume, locale)}
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: TRANSACTION OVERVIEW (col-span-8) */}
        <div className="lg:col-span-8 bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-[#e5e7eb]">
            <h2 className="text-sm font-bold tracking-wider text-gray-900 uppercase font-sans">
              {t('tellers_overview')}
            </h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-transparent">
                  <th className="py-3.5 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">{t('transaction_date')}</th>
                  <th className="py-3.5 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">{t('teller_name')}</th>
                  <th className="py-3.5 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">{t('transaction_type')}</th>
                  <th className="py-3.5 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans text-right">
                    {t('transaction_amount')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]/80">
                {transactions === null || transactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 px-6 text-center text-sm text-gray-500">
                      {isLoading
                        ? t('loading_data')
                        : transactions === null
                          ? t('dashboard_data_unavailable')
                          : t('no_transactions_today')}
                    </td>
                  </tr>
                ) : transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-700 whitespace-nowrap">{formatDate(transaction.transaction_date, locale)}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-900 whitespace-nowrap">{transaction.teller_name || '—'}</td>
                    <td className="py-4 px-6 text-sm text-gray-700 whitespace-nowrap">
                      {t(String(transaction.transaction_type).toLowerCase()) || transaction.transaction_type}
                    </td>
                    <td className="py-4 px-6 text-right text-sm font-mono font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: ATTENTION REQUIRED (col-span-4) */}
        <div className="lg:col-span-4 bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          {/* Header */}
          <div className="flex items-center gap-1.5 pb-2 text-red-700">
            <span className="text-base font-black leading-none">!</span>
            <h2 className="text-sm font-bold tracking-wider uppercase font-sans">
              {t('attention_required')}
            </h2>
          </div>

          {/* Sub-cards */}
          <div className="space-y-4 mt-3">
            {pendingReports === null ? (
              <p className="py-6 text-center text-sm text-gray-500">
                {isLoading ? t('loading_data') : t('dashboard_data_unavailable')}
              </p>
            ) : pendingReports.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">{t('no_pending_reports')}</p>
            ) : pendingReports.slice(0, 3).map((report) => (
              <div
                key={report.id}
                className="border border-[#e5e7eb] rounded-lg p-4 bg-white shadow-2xs space-y-3"
              >
                {/* Reference ID & Badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-600">#{report.id} · {formatDate(report.report_date, locale)}</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-sans">{t('review')}</span>
                </div>

                {/* Amount */}
                <div className="text-right py-1">
                  <span className="font-mono text-2xl font-bold text-gray-900">
                    {formatCurrency(Number(report.total_deposits || 0) + Number(report.total_withdrawals || 0), locale)}
                  </span>
                  <p className="mt-1 text-xs text-gray-500">{t('report_gross_volume')}</p>
                </div>

                {/* Bottom Row: Teller & Review button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-medium text-gray-600 font-sans">
                    {report.user?.fullname || t('teller_name')}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/reports')}
                    className="bg-black hover:bg-neutral-800 text-white text-xs font-medium px-4 py-1.5 rounded transition cursor-pointer font-sans"
                  >
                    {t('review')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
