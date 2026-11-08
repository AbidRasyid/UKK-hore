import { Search } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

/**
 * Top bar matching the header in admin_dashboard.png, teller_dashboard.png, and supervisor_dashboard.png
 */
export default function DashboardHeader({
  searchValue = '',
  onSearchChange,
  searchPlaceholder,
  onSearchSubmit,
  showSearch = true,
  searchOnLeft = false,
  title = '',
}) {
  const { t } = useLanguage();
  const effectivePlaceholder = searchPlaceholder || t('search_all');

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
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSearchSubmit?.(e.currentTarget.value);
              }}
              placeholder={effectivePlaceholder}
              className="w-56 sm:w-96 h-9 pl-9 pr-3 bg-[#f1f3f5] border border-transparent rounded-md text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
            />
          </div>
        ) : (
          <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        )}
      </div>

      {showSearch && !searchOnLeft && (
        <div className="relative hidden sm:flex items-center">
          <span className="absolute left-3 text-gray-400 pointer-events-none flex items-center">
            <Search className="w-4 h-4 text-gray-400" />
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearchSubmit?.(e.currentTarget.value);
            }}
            placeholder={effectivePlaceholder}
            className="w-56 sm:w-64 h-9 pl-9 pr-3 bg-white border border-[#e5e7eb] rounded-md text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
      )}
    </header>
  );
}
