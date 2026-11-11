import dashboardIcon from '../assets/dashboardIcon.svg';
import userIcon from '../assets/userIcon.svg';
import accountIcon from '../assets/accountIcon.svg';
import reportIcon from '../assets/reportIcon.svg';
import journalIcon from '../assets/journalIcon.svg';

export const menuItems = [
  {
    id: 'dashboard',
    titleKey: 'dashboard',
    path: '/',
    icon: dashboardIcon,
    roles: ['administrator', 'admin', 'supervisor', 'teller'],
  },
  {
    id: 'users',
    titleKey: 'users',
    path: '/users',
    icon: userIcon,
    roles: ['administrator', 'admin'],
  },
  {
    id: 'accounts',
    titleKey: 'accounts',
    path: '/accounts',
    icon: accountIcon,
    roles: ['administrator', 'admin', 'teller'],
  },
  {
    id: 'reports',
    titleKey: 'reports',
    path: '/reports',
    icon: reportIcon,
    roles: ['supervisor', 'teller'],
  },
  {
    id: 'journals',
    titleKey: 'journals',
    path: '/journals',
    icon: journalIcon,
    roles: ['administrator', 'admin', 'supervisor'],
  },
  {
    id: 'transactions',
    titleKey: 'transactions',
    path: '/transactions',
    icon: accountIcon,
    roles: ['teller'],
  },
  {
    id: 'supervisor-transactions',
    titleKey: 'transactions',
    path: '/supervisor/transactions',
    icon: accountIcon,
    roles: ['supervisor'],
  }
];

/**
 * Filter menu items based on user role.
 * - administrator / admin: all buttons are shown
 * - supervisor: only dashboard, report, and journal
 * - teller: only dashboard, transactions, and report
 */
export const getFilteredMenuItems = (role) => {
  const normalizedRole = (role || '').toLowerCase().trim();

  if (normalizedRole === 'administrator' || normalizedRole === 'admin') {
    return menuItems.filter((item) => ['dashboard', 'users', 'accounts', 'journals'].includes(item.id));
  }

  if (normalizedRole === 'supervisor') {
    return menuItems.filter((item) =>
      ['dashboard', 'reports', 'journals', 'supervisor-transactions'].includes(item.id)
    );
  }

  if (normalizedRole === 'teller') {
    return menuItems.filter((item) =>
      ['dashboard', 'transactions', 'reports'].includes(item.id)
    );
  }

  // Fallback: use item's roles array if defined, else show none/dashboard
  return menuItems.filter((item) => item.roles.includes(normalizedRole));
};