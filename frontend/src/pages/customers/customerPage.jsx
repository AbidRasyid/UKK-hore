import { useMemo, useRef, useState } from "react";
import { Download, FileSpreadsheet, Plus, X } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import CustomerRow from "../../components/accounts/accountRow";
import * as XLSX from "xlsx";
import { useCustomers } from "../../hooks/useCustomer";
import { useLanguage } from "../../hooks/useLanguage";

const normalize = (value) => String(value ?? "").toLowerCase().trim();

const createEmptyCustomer = () => ({
  student_name: "",
  student_id: "",
  student_class: "",
  password: "",
  pin: "",
});

export default function CustomerPage() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [headerSearch, setHeaderSearch] = useState("");
  const [isBulkFormOpen, setIsBulkFormOpen] = useState(false);
  const [customerRows, setCustomerRows] = useState([createEmptyCustomer()]);
  const fileInputRef = useRef(null);

const { 
  customers,
  loading,
  isSaving,
  handleDelete,
  handleBlock,
  handleBulkSubmit
 } = useCustomers()

  const activeRoleView = normalize(user?.role);

  const filteredCustomers = useMemo(() => {
    const query = normalize(headerSearch);

    if (!query) return customers;

    return customers.filter((customer) =>
      [
        customer.student_name,
        customer.student_id,
        customer.account_number,
        customer.student_class,
      ].some((value) => normalize(value).includes(query))
    );
  }, [customers, headerSearch]);

  const updateCustomerRow = (index, field, value) => {
    setCustomerRows((rows) =>
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );
  };

  const closeBulkForm = () => {
    if (isSaving) return;
    setIsBulkFormOpen(false);
    setCustomerRows([createEmptyCustomer()]);
  };

  const escapeCsvValue = (value) => {
    const stringValue = String(value ?? "");
    return `"${stringValue.replaceAll('"', '""')}"`;
  };

  const handleExport = () => {
    if (filteredCustomers.length === 0) {
      alert(t("no_accounts_to_export"));
      return;
    }

    const headers = ["ID", "Name", "Account number", "Student ID", "Class", "Status"];
    const rows = filteredCustomers.map((customer, index) => [
      index + 1,
      customer.student_name || "",
      customer.account_number || "",
      customer.student_id || "",
      customer.student_class || "",
      customer.status?.value ?? customer.status ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `customer-accounts-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
  };

  const handleExcelImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const importedRows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
      const headerMap = {
        name: "student_name",
        fullname: "student_name",
        studentname: "student_name",
        studentid: "student_id",
        class: "student_class",
        studentclass: "student_class",
        password: "password",
        pin: "pin",
      };

      const rows = importedRows.map((importedRow) => {
        const row = createEmptyCustomer();
        Object.entries(importedRow).forEach(([header, value]) => {
          const field = headerMap[normalize(header).replace(/[\s_-]/g, "")];
          if (field) row[field] = String(value).trim();
        });
        return row;
      });

      if (!rows.length || rows.every((row) => Object.values(row).every((value) => !value))) {
        alert(t("excel_no_rows"));
        return;
      }

      const missingFields = Object.keys(createEmptyCustomer()).filter((field) =>
        rows.some((row) => !row[field])
      );
      if (missingFields.length) {
        alert(`${t("missing_imported_values")} ${missingFields.join(", ")}`);
        return;
      }

      const invalidPin = rows.some((row) => !/^\d{6}$/.test(row.pin));
      if (invalidPin) {
        alert(t("pin_must_be_6_digits"));
        return;
      }

      setCustomerRows(rows);
      setIsBulkFormOpen(true);
    } catch (error) {
      console.error("Failed to import customer Excel file", error);
      alert(t("excel_read_error"));
    }
  };

  return (
    <div>
      <DashboardHeader
        role={activeRoleView}
        searchValue={headerSearch}
        onSearchChange={setHeaderSearch}
        searchPlaceholder={t("search_account_id_name")}
        showSearch={true}
        searchOnLeft={true}
        user={user}
      />

      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("accounts")}</h1>
            <p className="mt-2 text-sm text-gray-600">
              {t("manage_accounts")}
            </p>
          </div>
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelImport}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-500 hover:text-gray-900"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {t("import_excel")}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-500 hover:text-gray-900"
            >
              <Download className="h-4 w-4" />
              {t("export_excel")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/account/add")}
              className="inline-flex items-center gap-2 rounded-md bg-black px-5 py-2 text-sm text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              {t("add_customers")}
            </button>
          </div>
        </div>

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
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, index) => (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    index={index}
                    onDelete={handleDelete}
                    onBlock={handleBlock}
                    onEdit={(selectedCustomer) => navigate(`/account/${selectedCustomer.id}/edit`)}
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
      </div>

      {isBulkFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <section className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t("add_customer_accounts")}</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {t("bulk_customer_help")}
                </p>
              </div>
              <button type="button" onClick={closeBulkForm} aria-label={t("close")} className="text-gray-500 hover:text-gray-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="p-6">
              <div className="space-y-4">
                {customerRows.map((row, index) => (
                  <div key={index} className="rounded-md border border-gray-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">{t("customer_item")} {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => setCustomerRows((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}
                        disabled={customerRows.length === 1}
                        className="text-xs text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        {t("remove")}
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-5">
                      {[
                        ["student_name", t("name"), t("full_name")],
                        ["student_id", t("student_id"), t("student_id")],
                        ["student_class", t("class"), t("class")],
                        ["password", t("password"), t("password")],
                        ["pin", t("pin"), t("pin")],
                      ].map(([field, label, placeholder]) => (
                        <label key={field} className="block">
                          <span className="mb-1.5 block text-xs font-semibold text-gray-600">{label}</span>
                          <input
                            type={field === "pin" ? "password" : "text"}
                            inputMode={field === "pin" ? "numeric" : undefined}
                            minLength={field === "pin" ? 6 : undefined}
                            maxLength={field === "pin" ? 6 : undefined}
                            pattern={field === "pin" ? "\\d{6}" : undefined}
                            value={row[field]}
                            onChange={(event) => updateCustomerRow(index, field, event.target.value)}
                            placeholder={placeholder}
                            className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setCustomerRows((rows) => [...rows, createEmptyCustomer()])}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:border-gray-500"
                >
                  <Plus className="h-4 w-4" />
                  {t("add_another_row")}
                </button>
                <div className="flex gap-3 sm:justify-end">
                  <button type="button" onClick={closeBulkForm} className="h-10 rounded-md border border-gray-300 px-4 text-sm text-gray-700">
                    {t("cancel")}
                  </button>
                  <button type="submit" disabled={isSaving} className="h-10 rounded-md bg-black px-4 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60">
                    {isSaving ? t("saving") : t("save_customers")}
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
