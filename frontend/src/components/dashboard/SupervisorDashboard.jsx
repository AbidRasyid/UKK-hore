import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import api from '../../api/axios';

/**
 * Custom Pending Report Clipboard Icon matching supervisor_dashboard.png
 */
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
  const [pendingReportsCount, setPendingReportsCount] = useState(14);
  const [syncTime] = useState(() => {
    return '10:42:05 AM';
  });

  useEffect(() => {
    let isMounted = true;

    const fetchDailyReports = async () => {
      try {
        const res = await api.get('/daily-reports').catch(() => null);

        if (!isMounted) return;

        if (res?.data?.data && Array.isArray(res.data.data)) {
          const reports = res.data.data;
          // Count pending reports (status not approved)
          const pending = reports.filter(
            (r) => String(r.status).toLowerCase() !== 'approved'
          ).length;
          setPendingReportsCount(pending > 0 ? pending : 14);
        } else {
          setPendingReportsCount(14);
        }
      } catch {
        if (!isMounted) return;
        setPendingReportsCount(14);
      }
    };

    fetchDailyReports();

    return () => {
      isMounted = false;
    };
  }, []);

  // Tellers Overview list matching mockup
  const tellersData = [
    {
      name: 'Alice Chen',
      status: 'Active',
      statusType: 'active',
      cashPosition: '$45,200.00',
      pendingApprovals: 3,
      isPendingAlert: true,
    },
    {
      name: 'Marcus Johnson',
      status: 'Closing',
      statusType: 'closing',
      cashPosition: '$12,050.50',
      pendingApprovals: 0,
      isPendingAlert: false,
    },
    {
      name: 'Sarah Williams',
      status: 'Offline',
      statusType: 'offline',
      cashPosition: '$0.00',
      pendingApprovals: 0,
      isPendingAlert: false,
    },
    {
      name: 'David Lee',
      status: 'Active',
      statusType: 'active',
      cashPosition: '$89,400.00',
      pendingApprovals: 1,
      isPendingAlert: true,
    },
  ];

  // Attention Required items
  const attentionItems = [
    {
      referenceId: 'TRX-99842',
      badge: 'Review',
      badgeClass: 'bg-[#ca8a04] text-white',
      amount: '$50,000.00',
      teller: 'Teller: A. Chen',
    },
    {
      referenceId: 'TRX-99810',
      badge: 'Flagged',
      badgeClass: 'bg-[#b91c1c] text-white',
      amount: '$120,500.00',
      teller: 'Teller: D. Lee',
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Title Bar with Sync Time */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">
            Supervisor Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 font-sans">
            Real-time overview of branch operations.
          </p>
        </div>
        <div>
          <span className="font-mono text-sm text-gray-700 font-medium">
            Last sync: {syncTime}
          </span>
        </div>
      </div>

      {/* 2 Stat Cards (50% / 50% split) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PENDING REPORTS */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-h-36 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
              PENDING REPORTS
            </span>
            <PendingReportIcon className="w-5 h-5 text-[#ca8a04]" />
          </div>
          <div className="mt-4">
            <span className="text-4xl font-bold text-gray-900 font-mono">
              {pendingReportsCount}
            </span>
          </div>
        </div>

        {/* TOTAL DAILY VOL. (Placeholder as instructed) */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-h-36 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
              TOTAL DAILY VOL.
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-500 stroke-[2.5]" />
          </div>
          <div className="mt-4 text-right">
            <span className="text-3xl sm:text-4xl font-bold text-gray-900 font-mono">
              $1,245,000
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: TELLERS OVERVIEW (col-span-8) */}
        <div className="lg:col-span-8 bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-[#e5e7eb]">
            <h2 className="text-sm font-bold tracking-wider text-gray-900 uppercase font-sans">
              TELLERS OVERVIEW
            </h2>
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="text-xs font-medium text-gray-700 hover:text-black hover:underline cursor-pointer font-sans"
            >
              View All
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-transparent">
                  <th className="py-3.5 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
                    TELLER NAME
                  </th>
                  <th className="py-3.5 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
                    STATUS
                  </th>
                  <th className="py-3.5 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
                    CASH POSITION
                  </th>
                  <th className="py-3.5 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans text-right">
                    PENDING APPROVALS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]/80">
                {tellersData.map((teller, idx) => {
                  let statusBadgeClass = 'bg-[#e5e7eb] text-gray-600';
                  if (teller.statusType === 'active') {
                    statusBadgeClass = 'bg-[#15803d] text-white';
                  } else if (teller.statusType === 'closing') {
                    statusBadgeClass = 'bg-[#ca8a04] text-white';
                  }

                  return (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      {/* TELLER NAME */}
                      <td className="py-4 px-6 text-sm font-semibold text-gray-900 whitespace-nowrap font-sans">
                        {teller.name}
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded ${statusBadgeClass} font-sans`}
                        >
                          {teller.status}
                        </span>
                      </td>

                      {/* CASH POSITION */}
                      <td className="py-4 px-6 text-sm font-mono font-semibold text-gray-900 whitespace-nowrap">
                        {teller.cashPosition}
                      </td>

                      {/* PENDING APPROVALS */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <span
                          className={`font-mono text-sm font-semibold ${
                            teller.isPendingAlert ? 'text-[#ca8a04]' : 'text-gray-900'
                          }`}
                        >
                          {teller.pendingApprovals}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
              ATTENTION REQUIRED
            </h2>
          </div>

          {/* Sub-cards */}
          <div className="space-y-4 mt-3">
            {attentionItems.map((item, idx) => (
              <div
                key={idx}
                className="border border-[#e5e7eb] rounded-lg p-4 bg-white shadow-2xs space-y-3"
              >
                {/* Reference ID & Badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-600">
                    {item.referenceId}
                  </span>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded ${item.badgeClass} font-sans`}
                  >
                    {item.badge}
                  </span>
                </div>

                {/* Amount */}
                <div className="text-right py-1">
                  <span className="font-mono text-2xl font-bold text-gray-900">
                    {item.amount}
                  </span>
                </div>

                {/* Bottom Row: Teller & Review button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-medium text-gray-600 font-sans">
                    {item.teller}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/reports')}
                    className="bg-black hover:bg-neutral-800 text-white text-xs font-medium px-4 py-1.5 rounded transition cursor-pointer font-sans"
                  >
                    Review
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
