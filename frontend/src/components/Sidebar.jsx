import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import iconLogo from '../assets/Icon.svg';
import logoutIcon from '../assets/logoutIcon.svg';
import { getFilteredMenuItems } from '../config/sidebarConfig';
import { useOutletContext } from 'react-router-dom';
import { purgeBrowserStorageCredentials } from '../utils/cookies';
import { useLanguage } from '../hooks/useLanguage';

/**
 * Sidebar navigation component matching the Aside - SideNavBar design.
 * 
 * Props:
 * - role: Optional override for user role ('administrator', 'supervisor', 'teller').
 *         Defaults to current user's role in cookies.
 * - terminalId: Optional terminal label, default 'Terminal #042'
 * - onLogout: Optional callback when clicking Logout.
 */
export default function Sidebar({ terminalId = 'Terminal #042', onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const { t, toggleLanguage, lang } = useLanguage();

  // Determine user role (passed as prop or retrieved from cookies)
  const currentRole = (user?.role || undefined)?.toLowerCase().trim();

  // Filter menu items by role:
  // - administrator / admin: all buttons shown
  // - supervisor: only dashboard, report, and journal
  // - teller: only dashboard, accounts, and report
  const visibleItems = getFilteredMenuItems(currentRole);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    purgeBrowserStorageCredentials();
    navigate('/login');
  };

  return (
    <aside
      aria-label={t('sidebar_navigation')}
      className="w-64 min-w-[16rem] h-screen bg-white border-r border-[#e5e7eb] flex flex-col justify-between select-none shrink-0"
    >
      {/* Top Section: Header & Menu Navigation */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#e5e7eb] flex items-center gap-3">
          <div className="w-8 h-8 shrink-0 flex items-center justify-center">
            <img
              src={iconLogo}
              alt={t('e_teller_auth_logo')}
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-base font-bold text-gray-900 leading-tight truncate">
              {t('e_teller_auth')}
            </h1>
            <span className="text-xs text-gray-500 font-normal leading-tight mt-0.5 truncate">
              {terminalId}
            </span>
          </div>
        </div>
        <button onClick={toggleLanguage}>
        {lang === 'en' ? t('switch_to_indonesian') : t('switch_to_english')}
        </button>

        {/* Navigation List */}
        <nav className="flex-1 py-1 overflow-y-auto">
          <ul className="space-y-0.5">
            {visibleItems.map((item) => {
              // Dashboard active match for either '/' or '/dashboard'
              const isDashboard = item.id === 'dashboard';
              const isCurrentRouteActive = isDashboard
                ? location.pathname === '/' || location.pathname === '/dashboard'
                : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    className={`relative flex items-center gap-3.5 px-6 py-3.5 text-sm transition-colors ${
                      isCurrentRouteActive
                        ? 'bg-[#f0f2f5] text-gray-900 font-semibold border-r-[3.5px] border-black'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium'
                    }`}
                  >
                    <img
                      src={item.icon}
                      alt={`${t(item.titleKey)} icon`}
                      className={`w-5 h-5 object-contain transition-all shrink-0 ${
                        isCurrentRouteActive ? 'brightness-0' : 'opacity-80'
                      }`}
                    />
                    <span className="truncate">{t(item.titleKey)}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom Section: Logout */}
      <div className="border-t border-[#e5e7eb]">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-6 py-3.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer text-left"
        >
          <img
            src={logoutIcon}
            alt={`${t('logout')} icon`}
            className="w-5 h-5 object-contain opacity-80 hover:opacity-100 shrink-0"
          />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
