import { useEffect, useState } from "react";
import { ArrowLeft, Check, KeyRound, LockKeyhole, UserRound } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useLanguage } from "../../hooks/useLanguage";
import SearchableMajorSelect from "../../components/accounts/SearchableMajorSelect";
import { MAJORS, normalizeMajor } from "../../utils/majors";
import { useToast } from "../../hooks/useToast";
import { getSafeApiMessage } from "../../utils/getSafeApiMessage";

export default function CustomerFormPage() {
  const { customer_id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { success, error: showError } = useToast();
  const isEdit = Boolean(customer_id);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (!isEdit) return;

    const fetchCustomer = async () => {
      try {
        const response = await api.get(`/api/customer/${customer_id}`);
        const customer = response.data.data;

        setStudentName(customer.student_name ?? "");
        setEmail(customer.email ?? "");
        setStudentId(customer.student_id ?? "");
        setStudentClass(customer.student_class ?? "");
        setPassword("");
        setPin("");
        setStatus(customer.status?.value ?? customer.status ?? "active");
      } catch (error) {
        console.error("Failed to load customer account", error);
        navigate("/404");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [customer_id, isEdit, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      student_name: studentName.trim(),
      email: email.trim() || null,
      student_id: studentId.trim(),
      student_class: normalizeMajor(studentClass),
      password: password.trim(),
      pin: pin.trim(),
      status,
    };



    if (!payload.student_name || !payload.student_id || !payload.student_class) {
      showError(t("err_name_id_class_required"));
      return;
    }

    if (!MAJORS.includes(payload.student_class)) {
      showError(t("select_major"));
      return;
    }

    if (!isEdit && !payload.password) {
      showError(t("err_password_required"));
      return;
    }

    if (payload.pin && !/^\d{6}$/.test(payload.pin)) {
      showError(t("err_pin_must_be_6"));
      return;
    }

    if (isEdit && !payload.password) {
      delete payload.password;
    }

    if (isEdit && !payload.pin){
      delete payload.pin;
    }

    setIsSubmitting(true);

    try {
      if (isEdit) {
        await api.patch(`/api/customer/${customer_id}/edit`, payload);
      } else {
        await api.post("/api/customers", payload);
      }

      success(t("customer_account_saved"));
      navigate("/accounts");
    } catch (error) {
      console.error("Failed to save customer account", error);
      if (error.response?.data?.error) {
        showError(t("customer_account_save_error"));
      } else {
        showError(getSafeApiMessage(error, t("customer_account_save_error")));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
        <div className="mt-8 h-9 w-64 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-gray-100" />
        <div className="mt-8 h-96 animate-pulse rounded-lg border border-gray-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f8f9fa]">
      <div className="border-b border-[#e5e7eb] bg-white px-6 py-3.5 lg:px-8">
        <Link
          to="/accounts"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back_to_accounts")}
        </Link>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              {t("customer_management")}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              {isEdit ? t("edit_customer") : t("add_customer")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEdit
                ? t("customer_form_edit_desc")
                : t("customer_form_create_desc")}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        </header>

        <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <form className="divide-y divide-[#e5e7eb]" onSubmit={handleSubmit}>
            <div className="grid gap-6 px-6 py-7 sm:grid-cols-2 lg:px-8">
              <div className="sm:col-span-2">
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900">{t("profile_details")}</h3>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("full_name")}
                </span>
                <input
                  type="text"
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                  placeholder={t("enter_full_name")}
                  required
                  className="h-11 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="student@example.com"
                  className="h-11 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("student_id")}
                </span>
                <input
                  type="text"
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  placeholder={t("enter_student_id")}
                  required
                  className="h-11 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("major")}
                </span>
                <SearchableMajorSelect
                  id="student-major"
                  value={studentClass}
                  onChange={setStudentClass}
                  placeholder={t("search_major")}
                  required
                />
              </label>
            </div>

            <div className="grid gap-6 px-6 py-7 sm:grid-cols-2 lg:px-8">
              <div className="sm:col-span-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900">{t("security_details")}</h3>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {isEdit ? t("security_details_edit_desc") : t("security_details_create_desc")}
                </p>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("password")}
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={isEdit ? t("leave_blank_keep_current") : t("enter_password")}
                    required={!isEdit}
                    className="h-11 w-full rounded-md border border-[#d1d5db] bg-white px-3 pr-20 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-900"
                  >
                    {showPassword ? t("hide") : t("show")}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("pin")}
                </span>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    inputMode="numeric"
                    minLength={6}
                    maxLength={6}
                    pattern="\d{6}"
                    value={pin}
                    onChange={(event) => setPin(event.target.value)}
                    placeholder={isEdit ? t("leave_blank_keep_current") : t("six_digit_pin")}
                    required={!isEdit}
                    className="h-11 w-full rounded-md border border-[#d1d5db] bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("account_status")}
                </span>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="h-11 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm capitalize text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                >
                  <option value="active">{t("active")}</option>
                  <option value="blocked">{t("blocked")}</option>
                </select>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 bg-[#fafafa] px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
              <div className="flex gap-3 sm:justify-end">
                <Link
                  to="/accounts"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
                >
                  {t("cancel")}
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-black px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
                >
                  <Check className="h-4 w-4" />
                  {isSubmitting ? t("saving") : isEdit ? t("save_changes") : t("create_customer")}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
