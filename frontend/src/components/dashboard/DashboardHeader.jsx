import { Search, Bell, Settings } from 'lucide-react';

/**
 * Top bar matching the header in admin_dashboard.png, teller_dashboard.png, and supervisor_dashboard.png
 */
export default function DashboardHeader({
  role = 'administrator',
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search ID, Name...',
  showSearch = true,
  searchOnLeft = false,
  user = null,
  title = '',
}) {
  const isTeller = role === 'teller';
  const isAdmin = role === 'administrator' || role === 'admin';

  return (
    <header className="w-full bg-white border-b border-[#e5e7eb] px-6 lg:px-8 py-3.5 flex items-center justify-between select-none">
      {/* Left side: either Search (for teller) or the current dashboard label */}
      <div className="flex items-center gap-4">
        {showSearch && searchOnLeft ? (
          <div className="relative flex items-center">
            <span className="absolute left-3 text-gray-400 pointer-events-none flex items-center">
              <Search className="w-4 h-4 text-gray-400" />
            </span>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-56 sm:w-96 h-9 pl-9 pr-3 bg-[#f1f3f5] border border-transparent rounded-md text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
            />
          </div>
        ) : (
          <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        )}
      </div>

      {/* Right side: Search (if not on left), Notifications, Settings, User Avatar */}
      <div className="flex items-center gap-4 sm:gap-5">
        {showSearch && !searchOnLeft && (
          <div className="relative hidden sm:flex items-center">
            <span className="absolute left-3 text-gray-400 pointer-events-none flex items-center">
              <Search className="w-4 h-4 text-gray-400" />
            </span>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-56 sm:w-64 h-9 pl-9 pr-3 bg-white border border-[#e5e7eb] rounded-md text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
        )}

        {/* Bell Icon */}
        <button
          type="button"
          aria-label="Notifications"
          className="p-1.5 text-gray-700 hover:text-black hover:bg-gray-100 rounded-md transition cursor-pointer relative"
        >
          <Bell className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Settings Icon */}
        <button
          type="button"
          aria-label="Settings"
          className="p-1.5 text-gray-700 hover:text-black hover:bg-gray-100 rounded-md transition cursor-pointer"
        >
          <Settings className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Avatar */}
        {isTeller ? (
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-[#d8dcde] border border-[#cbd0d4] flex items-center justify-center shrink-0 shadow-xs"
            title="Teller Terminal"
          >
            <span className="font-mono text-xs font-semibold text-gray-600">
              {user?.username?.substring(0, 2).toUpperCase() || 'TL'}
            </span>
          </div>
        ) : isAdmin ? (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md overflow-hidden bg-neutral-200 border border-neutral-300 shrink-0 shadow-xs">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&h=128&q=80"
              alt="Administrator Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<span class="flex items-center justify-center w-full h-full text-xs font-bold text-gray-700 bg-neutral-200">AD</span>';
              }}
            />
          </div>
        ) : (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md overflow-hidden bg-neutral-200 border border-neutral-300 shrink-0 shadow-xs">
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=128&h=128&q=80"
              alt="Supervisor Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<span class="flex items-center justify-center w-full h-full text-xs font-bold text-gray-700 bg-neutral-200">SV</span>';
              }}
            />
          </div>
        )}
      </div>
    </header>
  );
}
