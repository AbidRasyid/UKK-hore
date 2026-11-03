import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import TellerDashboard from '../components/dashboard/TellerDashboard';
import SupervisorDashboard from '../components/dashboard/SupervisorDashboard';
import { useLanguage } from '../hooks/useLanguage';

export default function Dashboard() {
  const { user } = useOutletContext();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const activeRoleView = (user?.role || '').toLowerCase().trim();

  const [headerSearch, setHeaderSearch] = useState('');

  const isTeller = activeRoleView === 'teller';
  const isSupervisor = activeRoleView === 'supervisor';
  const isAdmin = activeRoleView === 'administrator' || activeRoleView === 'admin';

  const handleSearchSubmit = (value) => {
    if (isTeller) {
      const query = (value !== undefined ? value : headerSearch).trim();
      navigate(query ? `/accounts?s=${encodeURIComponent(query)}` : '/accounts', {
        state: { search: query },
      });
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-transparent font-sans">
      {/* Top Header Bar */}
      <DashboardHeader
        role={activeRoleView}
        searchValue={headerSearch}
        onSearchChange={setHeaderSearch}
        onSearchSubmit={handleSearchSubmit}
        searchPlaceholder={isTeller ? t('search_customer') : t('search_all')}
        showSearch={isTeller}
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