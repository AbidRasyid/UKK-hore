export default function Dashboard() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();
  const userRole = localStorage.getItem('userRole') || user.role || 'user';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user.name || user.username || 'User'}! Active role: <span className="font-semibold text-gray-800 capitalize">{userRole}</span>
          </p>
        </div>
      </div>
    </div>
  );
}