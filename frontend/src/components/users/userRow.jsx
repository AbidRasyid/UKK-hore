import { Pen, Ban, LockOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";

export default function UserRow({ user = {}, index = 0, onBlock }) {
  const { t } = useLanguage();
  const isBlocked = user.status === "blocked";

  return (
    <tr className="border-t border-gray-200">
      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{user.fullname}</td>
      <td className="px-6 py-4 text-sm capitalize text-gray-900">{t(user.role?.toLowerCase()) || user.role}</td>
      <td className="px-6 py-4 text-sm capitalize text-gray-900">{t(user.status?.toLowerCase()) || user.status}</td>
      <td className="px-6 py-4 text-sm text-gray-900 flex gap-2">
        <Link to={`/user/${user.id}/edit`} aria-label={t("edit")}>
          <span><Pen size={16} /></span>
        </Link>
        <button type="button" onClick={() => onBlock(user)} aria-label={isBlocked ? t("unblock") : t("block")}>
          <span>{isBlocked ? <LockOpen size={16} /> : <Ban size={16} />}</span>
        </button>
      </td>
    </tr>
  );
}