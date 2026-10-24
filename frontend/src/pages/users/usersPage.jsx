import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import api from "../../api/axios";
import UserRow from "../../components/users/row";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try{
        const response = await (api.get('/api/users'))
        setUsers(response.data.data);
      }catch {
        return navigate('/404')
      }finally {
        setLoading(false);
      }
    };
    fetchData()
  }, [navigate]);
  const { user } = useOutletContext();

  const activeRoleView = (user?.role || '').toLowerCase().trim();

  const [headerSearch, setHeaderSearch] = useState('');

  const isTeller = activeRoleView === 'teller';
  return (
    <div>
      <DashboardHeader 
      role={activeRoleView}
        searchValue={headerSearch}
        onSearchChange={setHeaderSearch}
        searchPlaceholder={isTeller ? 'Search customer ID...' : 'Search ID, Name...'}
        showSearch={true}
        searchOnLeft={true}
        user={user}
      />
      <div className='p-8'>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="mt-2 text-sm text-gray-600">Manage User access, roles and teller status.</p>
          </div>
            <button className="bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800">+ Add User</button>
          </div>
        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  return <UserRow key={user.id} user={user} index={index}/>;
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
