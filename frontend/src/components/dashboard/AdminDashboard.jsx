import '../../utils/echo';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  User, 
  CreditCard, 
  AlertTriangle, 
  TrendingUp, 
  Plus,
  Minus
} from 'lucide-react';
import api from '../../api/axios';


export default function AdminDashboard() {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState(null);
  const [totalCustomers, setTotalCustomers] = useState(null);
  const [activeBankAccounts, setActiveBankAccounts] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Fetch logs from /api/activity-logs
        const logsPromise = await api.get('/api/activity-logs').catch(() => null);
        // Fetch users from /api/users
        const usersPromise = api.get('/api/users').catch(() => null);
        // Fetch customers from /api/customers
        const customersPromise = api.get('/api/customers').catch(() => null);

        const [usersRes, customersRes, logsRes] = await Promise.all([usersPromise, customersPromise, logsPromise]);

        if (!isMounted) return;

        if (usersRes?.data?.data && Array.isArray(usersRes.data.data)) {
          const usersList = usersRes.data.data;
          // Sum total operational users
          setTotalUsers(usersList.length);
        } else {
          setTotalUsers(12450);
        }

        if (customersRes?.data?.data && Array.isArray(customersRes.data.data)) {
          const customersList = customersRes.data.data;
          setTotalCustomers(customersList.length);

          // Sum active bank accounts based on status
          const activeCount = customersList.filter(
            (c) => String(c.status).toLowerCase() === 'active'
          ).length;
          setActiveBankAccounts(activeCount);
        } else {
          setTotalCustomers(845901);
          setActiveBankAccounts(1102440);
        }

        if (logsRes?.data?.data && Array.isArray(logsRes.data.data)){
          setLogs(logsRes.data.data)
        } else {
          setLogs(null)
        }
      } catch {
        if (!isMounted) return;
        setTotalUsers(12450);
        setTotalCustomers(845901);
        setActiveBankAccounts(1102440);
      }
    };

    // eslint-disable-next-line no-unused-vars
    const channel = window.Echo.private('admin.activity-logs')
      .listen('ActivityLogged', (e) => {
        console.log('log baru masuk', e);

        setLogs((prevLogs) => [e.log, ...prevLogs]);
      })

    fetchData();

    return () => {
      isMounted = false;
      window.Echo.leaveChannel('admin.activity-logs');
    };
  }, []);

  // Format large numbers with commas
  const formatCount = (val, fallback) => {
    if (val === null || val === undefined) {
      return Number(fallback).toLocaleString('en-US');
    }
    return Number(val).toLocaleString('en-US');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Page Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">
            System Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500 font-sans">
            Real-time administrative metrics and access
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={ () => {navigate('/user/add')} }
            className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-sm font-medium px-4 py-2.5 rounded-md transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Account</span>
          </button>
        </div>
      </div>

      {/* 2x2 Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* TOTAL USERS */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
              TOTAL USERS
            </span>
            <Users className="w-5 h-5 text-gray-700 stroke-[1.8]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-gray-900 tracking-tight font-sans">
              {formatCount(totalUsers, 12450)}
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-emerald-600 font-sans">
            <TrendingUp className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>+4.2% from last week</span>
          </div>
        </div>

        {/* TOTAL CUSTOMERS */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
              TOTAL CUSTOMERS
            </span>
            <User className="w-5 h-5 text-gray-700 stroke-[1.8]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-gray-900 tracking-tight font-sans">
              {formatCount(totalCustomers, 845901)}
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-emerald-600 font-sans">
            <TrendingUp className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>+1.8% from last week</span>
          </div>
        </div>

        {/* ACTIVE BANK ACCOUNTS */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
              ACTIVE BANK ACCOUNTS
            </span>
            <CreditCard className="w-5 h-5 text-gray-700 stroke-[1.8]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-gray-900 tracking-tight font-sans">
              {formatCount(activeBankAccounts, 1102440)}
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-normal text-gray-500 font-sans">
            <Minus className="w-3.5 h-3.5 stroke-2" />
            <span>Steady volume</span>
          </div>
        </div>

        {/* SYSTEM ACTIVITY ALERTS */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
              SYSTEM ACTIVITY ALERTS
            </span>
            <AlertTriangle className="w-5 h-5 text-amber-500 stroke-2" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-gray-900 tracking-tight font-sans">
              42
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-[#b45309] font-sans">
            <TrendingUp className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>+12 alerts pending review</span>
          </div>
        </div>
      </div>

      {/* Recent System Activity Table */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {/* Table Title Bar */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#e5e7eb]">
          <h2 className="text-base font-semibold text-gray-900 font-sans">
            Recent System Activity
          </h2>
          <button
            type="button"
            onClick={() => navigate('/journals')}
            className="text-sm font-medium text-gray-800 hover:text-black hover:underline cursor-pointer font-sans"
          >
            View All
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-transparent">
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
                  ID
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
                  TIMESTAMP
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
                  ACTION
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans">
                  DESCRIPTION
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 tracking-wider uppercase font-sans text-center">
                  IP ADDRESS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]/80">
              {logs.map((log, index) => {
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
