import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useLanguage } from "./useLanguage";
import ToastContext from "./toastContext";

const toastStyles = {
  success: {
    icon: CheckCircle2,
    container: "border-emerald-200 bg-white",
    iconColor: "text-emerald-600",
    titleKey: "toast_success",
  },
  error: {
    icon: AlertCircle,
    container: "border-red-200 bg-white",
    iconColor: "text-red-600",
    titleKey: "toast_error",
  },
  info: {
    icon: Info,
    container: "border-blue-200 bg-white",
    iconColor: "text-blue-600",
    titleKey: "toast_notice",
  },
};

export function ToastProvider({ children }) {
  const { t } = useLanguage();
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message, type = "info", options = {}) => {
    if (!message) return;

    const id = ++nextId.current;
    const toast = {
      id,
      message: String(message),
      type: toastStyles[type] ? type : "info",
    };

    setToasts((current) => [...current.slice(-3), toast]);
    timers.current.set(
      id,
      window.setTimeout(() => dismiss(id), options.duration ?? 4200)
    );
    return id;
  }, [dismiss]);

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
  }, []);

  return (
    <ToastContext.Provider value={{ notify, dismiss }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-3 px-4 sm:left-auto sm:right-5 sm:w-full sm:max-w-sm sm:items-stretch sm:px-0"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {toasts.map((toast) => {
          const style = toastStyles[toast.type];
          const Icon = style.icon;

          return (
            <div
              key={toast.id}
              role={toast.type === "error" ? "alert" : "status"}
              className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border p-4 shadow-xl shadow-gray-900/10 animate-[toast-in_180ms_ease-out] ${style.container}`}
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconColor}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{t(style.titleKey)}</p>
                <p className="mt-1 break-words text-sm leading-5 text-gray-600">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label={t("dismiss_notification")}
                className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
