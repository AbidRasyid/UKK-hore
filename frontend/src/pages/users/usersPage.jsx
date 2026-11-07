import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import api from "../../api/axios";
import UserRow from "../../components/users/userRow";
import { handleBlock } from "../../utils/handlers";
import { useLanguage } from "../../hooks/useLanguage";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const { t } = useLanguage();
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

  const block = async(user) => handleBlock(user, setUsers, '/api/user')

  const { user } = useOutletContext();

  const activeRoleView = (user?.role || '').toLowerCase().trim();

  const [headerSearch, setHeaderSearch] = useState('');
  const filteredUsers = useMemo(() => {
    const query = headerSearch.trim().toLowerCase();
    if (!query) return users;

    return users.filter((item) =>
      [item.id, item.fullname, item.username, item.role, item.status]
        .some((value) => String(value ?? '').toLowerCase().includes(query))
    );
  }, [headerSearch, users]);

  const isTeller = activeRoleView === 'teller';
  return (
    <div>
      <DashboardHeader 
      role={activeRoleView}
        searchValue={headerSearch}
        onSearchChange={setHeaderSearch}
        searchPlaceholder={isTeller ? t('search_customer') : t('search_all')}
        showSearch={true}
        searchOnLeft={true}
        user={user}
      />
      <div className='p-8'>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("users")}</h1>
            <p className="mt-2 text-sm text-gray-600">{t("manage_users_desc")}</p>
          </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/users/bulk')}
                className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:border-gray-500"
              >
                {t("bulk_create_users")}
              </button>
              <button
                onClick={() => navigate('/user/add')}
                className="rounded-md bg-black px-5 py-2 text-sm text-white hover:bg-gray-800"
              >
                + {t("add_user")}
              </button>
            </div>
          </div>
        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                {[t("no"), t("name"), t("role"), t("status"), t("actions")].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left text-sm font-medium text-gray-700">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    {t("loading")}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
                  return <UserRow key={user.id} user={user} index={index} onBlock={block}/>;
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
