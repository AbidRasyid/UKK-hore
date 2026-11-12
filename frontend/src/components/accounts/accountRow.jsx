import { Trash2, Pen, Ban, LockOpen } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";

export default function CustomerRow({ customer, index, onEdit, onBlock }) {
  const { t } = useLanguage();
  const rawStatus = customer.status?.value ?? customer.status ?? "-";
  const isBlocked = rawStatus === 'blocked';
  const displayStatus = rawStatus !== "-" ? (t(rawStatus.toLowerCase()) || rawStatus) : "-";

  return (
    <tr className="border-t border-gray-200">
      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{customer.student_name || "-"}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{customer.account_number || "-"}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{customer.student_id || "-"}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{customer.student_class?.toUpperCase() || "-"}</td>
      <td className="px-6 py-4 text-sm capitalize text-gray-900">{displayStatus}</td>
      <td className="px-6 py-4 text-sm text-gray-900 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(customer)}
          aria-label={t("edit")}
        >
          <span><Pen size={16}/></span>
        </button>
        <button
          type="button"
          onClick={() => onBlock(customer)}
          aria-label={isBlocked ? t("unblock") : t("block")}
        ><span>{isBlocked ? <LockOpen size={16}/> : <Ban size={16}/>}</span></button>
        {/* <button
          type="button"
          onClick={() => onDelete(customer)}
          className="text-red-600 hover:text-red-800"
          aria-label={`${t("delete")} ${customer.student_name}`}
        > */}
          {/* <Trash2 size={ 16 } />
        </button> */}
      </td>
    </tr>
  );
}