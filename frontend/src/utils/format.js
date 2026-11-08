const getLocale = () =>
  localStorage.getItem("app_lang") === "en" ? "en-US" : "id-ID";

export const formatCurrency = (value, locale = getLocale()) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatDate = (value, locale = getLocale()) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};