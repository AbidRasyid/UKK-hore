import { Trash2, Pen, Ban, LockOpen } from "lucide-react";

export default function CustomerRow({ customer, index, onDelete, onEdit, onBlock }) {
  const status = customer.status?.value ?? customer.status ?? "-";
  const isBlocked = status === 'blocked';

  return (
    <tr className="border-t border-gray-200">
      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{customer.student_name || "-"}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{customer.account_number || "-"}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{customer.student_id || "-"}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{customer.student_class || "-"}</td>
      <td className="px-6 py-4 text-sm capitalize text-gray-900">{status}</td>
      <td className="px-6 py-4 text-sm text-gray-900 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(customer)}
        >
          <span><Pen size={16}/></span>
        </button>
        <button
          type="button"
          onClick={() => onBlock(customer)}
        ><span>{isBlocked ? <LockOpen size={16}/> : <Ban size={16}/>}</span></button>
        <button
          type="button"
          onClick={() => onDelete(customer)}
          className="text-red-600 hover:text-red-800"
          aria-label={`Delete ${customer.student_name}`}
        >
          <Trash2 size={ 16 } />
        </button>
      </td>
    </tr>
  );
}