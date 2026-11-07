import { useMemo, useRef, useState } from "react";
import { Download, FileSpreadsheet, Plus, X } from "lucide-react";
import { useLocation, useOutletContext } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import CustomerRow from "../../components/accounts/accountRow";
import { useCustomers } from "../../hooks/useCustomer";
import { useLanguage } from "../../hooks/useLanguage";
import SearchableMajorSelect from "../../components/accounts/SearchableMajorSelect";
import { normalizeMajor } from "../../utils/majors";

const normalize = (value) => String(value ?? "").toLowerCase().trim();

const createEmptyCustomer = () => ({
  student_name: "",
  email: "",
  student_id: "",
  student_class: "",
  password: "",
  pin: "",
});

export default function CustomerPage() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [headerSearch, setHeaderSearch] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("s") || location.state?.search || "";
  });
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

  const handleExport = async () => {
    if (filteredCustomers.length === 0) {
      alert(t("no_accounts_to_export"));
      return;
    }

    try {
      const { default: ExcelJS } = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Customer Accounts");
      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Name", key: "name", width: 30 },
        { header: "Account number", key: "accountNumber", width: 22 },
        { header: "Student ID", key: "studentId", width: 18 },
        { header: "Major", key: "major", width: 16 },
        { header: "Status", key: "status", width: 16 },
      ];
      worksheet.addRows(
        filteredCustomers.map((customer, index) => ({
          id: index + 1,
          name: customer.student_name || "",
          accountNumber: customer.account_number || "",
          studentId: customer.student_id || "",
          major: customer.student_class || "",
          status: customer.status?.value ?? customer.status ?? "",
        }))
      );
      worksheet.getRow(1).font = { bold: true };
      worksheet.views = [{ state: "frozen", ySplit: 1 }];
      worksheet.autoFilter = "A1:F1";

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `customer-accounts-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
    } catch (error) {
      console.error("Failed to export customer accounts to Excel", error);
      alert(t("excel_export_error"));
    }
  };

  const handleExcelImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const { default: ExcelJS } = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        alert(t("excel_no_rows"));
        return;
      }

      const getCellText = (cell) => {
        const value = cell.value;
        if (value == null) return "";
        if (value instanceof Date) return value.toISOString();
        if (typeof value === "object") {
          if ("richText" in value) {
            return value.richText.map((part) => part.text).join("").trim();
          }
          if ("result" in value) return String(value.result ?? "").trim();
          if ("text" in value) return String(value.text ?? "").trim();
          return "";
        }
        return String(value).trim();
      };

      const headers = new Map();
      worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, columnNumber) => {
        headers.set(columnNumber, getCellText(cell));
      });
      const headerMap = {
        name: "student_name",
        fullname: "student_name",
        studentfullname: "student_name",
        namalengkap: "student_name",
        nama: "student_name",
        namasiswa: "student_name",
        studentname: "student_name",
        email: "email",
        studentid: "student_id",
        nis: "student_id",
        nomorinduksiswa: "student_id",
        class: "student_class",
        kelas: "student_class",
        major: "student_class",
        jurusan: "student_class",
        studentclass: "student_class",
        password: "password",
        katasandi: "password",
        pin: "pin",
      };

      const rows = [];
      worksheet.eachRow((worksheetRow, rowNumber) => {
        if (rowNumber === 1) return;
        const row = createEmptyCustomer();
        let nameHeaderPriority = 0;
        headers.forEach((header, columnNumber) => {
          const normalizedHeader = normalize(header).replace(/[\s_-]/g, "");
          const field = headerMap[normalizedHeader];
          if (field) {
            if (field === "student_name") {
              const priority = ["fullname", "namalengkap", "studentfullname"].includes(normalizedHeader) ? 2 : 1;
              if (priority < nameHeaderPriority) return;
              nameHeaderPriority = priority;
            }
            const value = getCellText(worksheetRow.getCell(columnNumber));
            row[field] =
              field === "student_class"
                ? normalizeMajor(value)
                : value;
          }
        });
        if (Object.values(row).some((value) => value !== "")) {
          rows.push(row);
        }
      });

      if (!rows.length || rows.every((row) => Object.values(row).every((value) => !value))) {
        alert(t("excel_no_rows"));
        return;
      }

      if (rows.length > 100) {
        alert(t("bulk_customer_limit"));
        return;
      }

      const requiredFields = ["student_name", "student_id", "student_class", "password", "pin"];
      const missingRequiredFields = requiredFields.filter((field) =>
        rows.some((row) => !row[field])
      );
      if (missingRequiredFields.length) {
        alert(`${t("missing_imported_values")} ${missingRequiredFields.join(", ")}`);
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
        <div className="mb-6">
          <div className="flex items-center justify-between">
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
              accept=".xlsx"
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
              onClick={() => setIsBulkFormOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-500 hover:text-gray-900"
            >
              <Plus className="h-4 w-4" />
              {t("bulk_create_customers")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/account/add")}
              className="inline-flex items-center gap-2 rounded-md bg-black px-5 py-2 text-sm text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              {t("add_customer")}
            </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">{t("bulk_customer_help")}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full rounded-lg border border-gray-200 bg-white">
            <thead>
              <tr className="bg-gray-100">
                {[t("no"), t("name"), t("account_number"), t("student_id"), t("major"), t("status"), t("actions")].map((heading) => (
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

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleBulkSubmit(customerRows, closeBulkForm);
              }}
              className="p-6"
            >
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
                    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                      {[
                        ["student_name", t("name"), t("full_name")],
                        ["email", t("email"), t("email")],
                        ["student_id", t("student_id"), t("student_id")],
                        ["student_class", t("major"), t("search_major")],
                        ["password", t("password"), t("password")],
                        ["pin", t("pin"), t("pin")],
                      ].map(([field, label, placeholder]) => (
                        <label key={field} className="block">
                          <span className="mb-1.5 block text-xs font-semibold text-gray-600">{label}</span>
                          {field === "student_class" ? (
                            <SearchableMajorSelect
                              id={`customer-major-${index}`}
                              value={row[field]}
                              onChange={(value) => updateCustomerRow(index, field, value)}
                              placeholder={placeholder}
                            />
                          ) : (
                            <input
                              type={field === "pin" ? "password" : field === "email" ? "email" : "text"}
                              inputMode={field === "pin" ? "numeric" : undefined}
                              minLength={field === "pin" ? 6 : undefined}
                              maxLength={field === "pin" ? 6 : undefined}
                              pattern={field === "pin" ? "\\d{6}" : undefined}
                              value={row[field]}
                              onChange={(event) => updateCustomerRow(index, field, event.target.value)}
                              placeholder={placeholder}
                              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                            />
                          )}
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
                  disabled={customerRows.length >= 100 || isSaving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
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
