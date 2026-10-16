import { Outlet, useOutletContext } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const outletContext = useOutletContext();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto">
        <Outlet context={outletContext} />
      </main>
    </div>
  );
}
