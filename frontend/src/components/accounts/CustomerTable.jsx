import CustomerRow from "./accountRow";
import { useLanguage } from "../../hooks/useLanguage";

export default function CustomerTable({ loading, customers, onDelete }) {
  const { t } = useLanguage();
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full rounded-lg border border-gray-200 bg-white">
        <thead>
          <tr className="bg-gray-100">
            {[t("no"), t("name"), t("account_number"), t("student_id"), t("class"), t("status"), t("actions")].map((heading) => (
              <th key={heading} className="px-6 py-3 text-left text-sm font-medium text-gray-700">{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                {t("loading")}
              </td>
            </tr>
          ) : customers.length > 0 ? (
            customers.map((customer, index) => (
              <CustomerRow
                key={customer.id}
                customer={customer}
                index={index}
                onDelete={onDelete}
              />
            ))
          ) : (
            <tr>
              <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                {t("no_accounts")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
