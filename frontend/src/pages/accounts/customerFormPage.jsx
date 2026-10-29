import { useEffect, useState } from "react";
import { ArrowLeft, Check, KeyRound, LockKeyhole, UserRound } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

export default function CustomerFormPage() {
  const { customer_id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(customer_id);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [studentName, setStudentName] = useState("");
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
        const customer = response.data.customer ?? response.data.data;

        setStudentName(customer.student_name ?? "");
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
      student_id: studentId.trim(),
      student_class: studentClass.trim(),
      password: password.trim(),
      pin: pin.trim(),
      status,
    };

    if (!payload.student_name || !payload.student_id || !payload.student_class) {
      alert("Name, student ID, and class are required.");
      return;
    }

    if (!isEdit && !payload.password) {
      alert("Password is required.");
      return;
    }

    if (payload.pin && !/^\d{6}$/.test(payload.pin)) {
      alert("PIN must contain exactly 6 numbers.");
      return;
    }

    if (isEdit && !payload.password) {
      delete payload.password;
    }

    setIsSubmitting(true);

    try {
      if (isEdit) {
        await api.patch(`/api/customer/${customer_id}/edit`, payload);
      } else {
        await api.post("/api/customers", payload);
      }

      navigate("/accounts");
    } catch (error) {
      console.error("Failed to save customer account", error);
      if (error.response?.data?.error) {
        alert(`Backend Error: ${error.response.data.error}`);
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Customer account could not be saved.");
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
          Back to accounts
        </Link>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              Customer management
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              {isEdit ? "Edit customer" : "Add customer"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEdit
                ? "Update customer details and account status."
                : "Create a new customer account."}
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
                  <h3 className="text-sm font-semibold text-gray-900">Profile details</h3>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Full name
                </span>
                <input
                  type="text"
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                  placeholder="Enter full name"
                  required
                  className="h-11 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Student ID
                </span>
                <input
                  type="text"
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  placeholder="Enter student ID"
                  required
                  className="h-11 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Class
                </span>
                <input
                  type="text"
                  value={studentClass}
                  onChange={(event) => setStudentClass(event.target.value)}
                  placeholder="Enter class"
                  required
                  className="h-11 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />
              </label>
            </div>

            <div className="grid gap-6 px-6 py-7 sm:grid-cols-2 lg:px-8">
              <div className="sm:col-span-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900">Security details</h3>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {isEdit ? "Leave credentials blank to keep the current values." : "Set the credentials used by the customer."}
                </p>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Password
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
                    required={!isEdit}
                    className="h-11 w-full rounded-md border border-[#d1d5db] bg-white px-3 pr-20 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-900"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  PIN
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
                    placeholder={isEdit ? "Leave blank to keep current" : "6-digit PIN"}
                    required={!isEdit}
                    className="h-11 w-full rounded-md border border-[#d1d5db] bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Account status
                </span>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="h-11 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm capitalize text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                >
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 bg-[#fafafa] px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
              <div className="flex gap-3 sm:justify-end">
                <Link
                  to="/accounts"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-black px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
                >
                  <Check className="h-4 w-4" />
                  {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create customer"}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
