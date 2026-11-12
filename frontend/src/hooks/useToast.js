import { useContext } from "react";
import ToastContext from "./toastContext";

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider.");

  const { notify, dismiss } = context;
  return {
    notify,
    dismiss,
    success: (message, options) => notify(message, "success", options),
    error: (message, options) => notify(message, "error", options),
    info: (message, options) => notify(message, "info", options),
  };
}
