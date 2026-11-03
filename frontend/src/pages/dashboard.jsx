import { useState } from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import TellerDashboard from '../components/dashboard/TellerDashboard';
import SupervisorDashboard from '../components/dashboard/SupervisorDashboard';
import { useOutletContext } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';

export default function Dashboard() {
  const { user } = useOutletContext();
  const { t } = useLanguage();

  const activeRoleView = (user?.role || '').toLowerCase().trim();

  const [headerSearch, setHeaderSearch] = useState('');

  const isTeller = activeRoleView === 'teller';
  const isSupervisor = activeRoleView === 'supervisor';
  const isAdmin = activeRoleView === 'administrator' || activeRoleView === 'admin';

  return (
    <div className="min-h-full flex flex-col bg-transparent font-sans">
      {/* Top Header Bar */}
      <DashboardHeader
        role={activeRoleView}
        searchValue={headerSearch}
        onSearchChange={setHeaderSearch}
        searchPlaceholder={isTeller ? t('search_customer') : t('search_all')}
        showSearch={!isSupervisor}
        searchOnLeft={isTeller}
        user={user}
      />

      {/* Main Role-Specific Dashboard Content */}
      <div className="flex-1">
        {isAdmin && <AdminDashboard />}
        {isTeller && <TellerDashboard />}
        {isSupervisor && <SupervisorDashboard />}
      </div>
    </div>
  );
}