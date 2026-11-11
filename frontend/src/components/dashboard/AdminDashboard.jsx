import '../../utils/echo';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { Users, User, CreditCard, Plus } from 'lucide-react';
import api from '../../api/axios';
import { useLanguage } from '../../hooks/useLanguage';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [totalUsers, setTotalUsers] = useState(null);
  const [totalCustomers, setTotalCustomers] = useState(null);
  const [activeBankAccounts, setActiveBankAccounts] = useState(null);
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const [usersResult, customersResult, logsResult] = await Promise.allSettled([
        api.get('/api/users'),
        api.get('/api/customers'),
        api.get('/api/activity-logs'),
      ]);

      if (!isMounted) return;

      const users = usersResult.status === 'fulfilled' ? usersResult.value.data?.data : null;
      setTotalUsers(Array.isArray(users) ? users.length : null);

      const customers = customersResult.status === 'fulfilled'
        ? customersResult.value.data?.data
        : null;
      if (Array.isArray(customers)) {
        setTotalCustomers(customers.length);
        setActiveBankAccounts(
          customers.filter((customer) => String(customer.status).toLowerCase() === 'active').length
        );
      } else {
        setTotalCustomers(null);
        setActiveBankAccounts(null);
      }

      const activityLogs = logsResult.status === 'fulfilled'
        ? logsResult.value.data?.data
        : null;
      setLogs(Array.isArray(activityLogs) ? activityLogs : null);
    };

    window.Echo.private('admin.activity-logs')
      .listen('ActivityLogged', (e) => {
        setLogs((previousLogs) => [e.log, ...(Array.isArray(previousLogs) ? previousLogs : [])]);
      })

    fetchData();

    return () => {
      isMounted = false;
      window.Echo.leaveChannel('admin.activity-logs');
    };
  }, []);

  const formatCount = (value) => value === null ? '—' : value.toLocaleString('en-US');

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Page Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">
            {t('system_overview')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 font-sans">
            {t('realtime_admin_metrics')}
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={ () => {navigate('/user/add')} }
            className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-sm font-medium px-4 py-2.5 rounded-md transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t('new_account')}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* TOTAL USERS */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
              {t('total_users')}
            </span>
            <Users className="w-5 h-5 text-gray-700 stroke-[1.8]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-gray-900 tracking-tight font-sans">
              {formatCount(totalUsers)}
            </span>
          </div>
        </div>

        {/* TOTAL CUSTOMERS */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
              {t('total_customers')}
            </span>
            <User className="w-5 h-5 text-gray-700 stroke-[1.8]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-gray-900 tracking-tight font-sans">
              {formatCount(totalCustomers)}
            </span>
          </div>
        </div>

        {/* ACTIVE BANK ACCOUNTS */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
              {t('active_bank_accounts')}
            </span>
            <CreditCard className="w-5 h-5 text-gray-700 stroke-[1.8]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-gray-900 tracking-tight font-sans">
              {formatCount(activeBankAccounts)}
            </span>
          </div>
        </div>
      </div>

      {/* Recent System Activity Table */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {/* Table Title Bar */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#e5e7eb]">
          <h2 className="text-base font-semibold text-gray-900 font-sans">
            {t('recent_system_activity')}
          </h2>
          <button
            type="button"
            onClick={() => navigate('/journals')}
            className="text-sm font-medium text-gray-800 hover:text-black hover:underline cursor-pointer font-sans"
          >
            {t('view_all')}
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-transparent">
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
                  {t('id')}
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
                  {t('timestamp')}
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
                  {t('action')}
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
                  {t('description')}
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans text-center">
                  {t('ip_address')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]/80">
              {logs === null ? (
                <tr>
                  <td colSpan="5" className="py-8 px-6 text-center text-sm text-gray-500">
                    {t('dashboard_data_unavailable')}
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 px-6 text-center text-sm text-gray-500">
                    {t('no_recent_activity')}
                  </td>
                </tr>
              ) : logs.map((log, index) => {
                let badgeClass = '';
                if (log.statusType === 'completed') {
                  badgeClass = 'bg-[#15803d] text-white';
                } else if (log.statusType === 'processing') {
                  badgeClass = 'bg-[#c58b02] text-white';
                } else if (log.statusType === 'failed') {
                  badgeClass = 'bg-[#b91c1c] text-white';
                }

                return (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    {/* TIMESTAMP */}
                    <td className="py-4 px-6 text-sm font-mono text-gray-800 whitespace-nowrap">
                      {log.id}
                    </td>

                    {/* USER / TERMINAL */}
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap font-sans">
                      {log.created_at}
                    </td>

                    {/* ACTION */}
                    <td className="py-4 px-6 text-sm text-gray-800 whitespace-nowrap font-sans">
                      {log.action}
                    </td>

                    {/* REFERENCE ID */}
                    <td className="py-4 px-6 text-sm font-medium text-gray-600 font-sans max-w-md whitespace-normal warp-break-words">
  {log.description}
</td>

                    {/* STATUS */}
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <span
                        className={`inline-block min-w-22 text-center text-xs font-medium px-3.5 py-1 rounded-full ${badgeClass} font-sans`}
                      >
                        {log.ip_address}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
