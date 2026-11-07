import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useLanguage } from "../../hooks/useLanguage";

const createEmptyUser = () => ({
  fullname: "",
  username: "",
  password: "",
  role: "administrator",
  status: "active",
  class: "",
  phone_number: "",
});

export default function UserBulkCreatePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [users, setUsers] = useState([createEmptyUser()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateUser = (index, field, value) => {
    setUsers((current) =>
      current.map((user, userIndex) =>
        userIndex === index ? { ...user, [field]: value } : user
      )
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const rows = users.map((user) =>
      Object.fromEntries(
        Object.entries(user).map(([field, value]) => [field, value.trim()])
      )
    );

    if (rows.some((user) =>
      !user.fullname || !user.username || !user.password
      || (user.role === "teller" && (!user.class || !user.phone_number))
    )) {
      alert(t("bulk_user_required"));
      return;
    }

    const usernames = rows.map((user) => user.username);
    if (new Set(usernames).size !== usernames.length) {
      alert(t("bulk_user_duplicate"));
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/api/users/bulk", { users: rows });
      alert(`${rows.length} ${t("users_added_successfully")}`);
      navigate("/users");
    } catch (error) {
      console.error("Failed to add users", error);
      alert(error.response?.data?.message || t("err_data_send_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f8f9fa]">
      <div className="border-b border-[#e5e7eb] bg-white px-6 py-3.5 lg:px-8">
        <Link
          to="/users"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back_to_users")}
        </Link>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
            {t("user_management")}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {t("bulk_create_users")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{t("bulk_user_help")}</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {users.map((user, index) => (
            <section key={index} className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">
                  {t("user_item")} {index + 1}
                </h2>
                <button
                  type="button"
                  onClick={() => setUsers((current) => current.filter((_, rowIndex) => rowIndex !== index))}
                  disabled={users.length === 1 || isSubmitting}
                  className="text-sm text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {t("remove")}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-gray-600">{t("full_name")}</span>
                  <input
                    value={user.fullname}
                    onChange={(event) => updateUser(index, "fullname", event.target.value)}
                    required
                    className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-gray-600">{t("username")}</span>
                  <input
                    value={user.username}
                    onChange={(event) => updateUser(index, "username", event.target.value)}
                    required
                    autoComplete="off"
                    className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-gray-600">{t("password")}</span>
                  <input
                    type="password"
                    value={user.password}
                    onChange={(event) => updateUser(index, "password", event.target.value)}
                    required
                    autoComplete="new-password"
                    className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-gray-600">{t("role")}</span>
                  <select
                    value={user.role}
                    onChange={(event) => updateUser(index, "role", event.target.value)}
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm capitalize outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  >
                    <option value="administrator">{t("administrator")}</option>
                    <option value="supervisor">{t("supervisor")}</option>
                    <option value="teller">{t("teller")}</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-gray-600">{t("account_status")}</span>
                  <select
                    value={user.status}
                    onChange={(event) => updateUser(index, "status", event.target.value)}
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm capitalize outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  >
                    <option value="active">{t("active")}</option>
                    <option value="blocked">{t("blocked")}</option>
                  </select>
                </label>
                {user.role === "teller" && (
                  <>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-gray-600">{t("class")}</span>
                      <input
                        value={user.class}
                        onChange={(event) => updateUser(index, "class", event.target.value)}
                        required
                        className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-gray-600">{t("phone_number")}</span>
                      <input
                        type="tel"
                        value={user.phone_number}
                        onChange={(event) => updateUser(index, "phone_number", event.target.value)}
                        required
                        className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                      />
                    </label>
                  </>
                )}
              </div>
            </section>
          ))}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => setUsers((current) => [...current, createEmptyUser()])}
              disabled={users.length >= 100 || isSubmitting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {t("add_another_row")}
            </button>
            <div className="flex gap-3 sm:justify-end">
              <Link
                to="/users"
                className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-sm text-gray-700"
              >
                {t("cancel")}
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 rounded-md bg-black px-4 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
              >
                {isSubmitting ? t("saving") : t("save_users")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
