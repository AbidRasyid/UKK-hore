import { FileCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency, formatDate } from "../../utils/format";
import { useLanguage } from "../../hooks/useLanguage";

export default function ReportRow({ report = {}, index = 0 }) {
  const { t } = useLanguage();

  return (
    <tr className="border-t border-gray-200">
      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{formatDate(report.report_date)}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(report.opening_balance)}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(report.total_deposits)}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(report.total_withdrawals)}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(report.system_balance)}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(report.physical_balance)}</td>
      <td className="px-6 py-4 text-sm capitalize text-gray-900">{t(report.status?.toLowerCase()) || report.status}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{report.approved_by ?? ""}</td>
      <td className="px-6 py-4 text-sm text-gray-900 flex gap-2">
        <Link to={`/report/${report.id}`} aria-label={`${t("view_report")} ${report.id}`}>
          <span><FileCheck size={16} /></span>
        </Link>
      </td>
    </tr>
  );
}