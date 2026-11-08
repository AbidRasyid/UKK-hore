import { useCallback, useMemo, useState } from "react";

const localDateParts = () => {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return { year, month, day };
};

const getDateValue = (mode) => {
  const { year, month, day } = localDateParts();
  if (mode === "day") return `${year}-${month}-${day}`;
  if (mode === "month") return `${year}-${month}`;
  if (mode === "year") return year;
  return "";
};

export default function useListFilters() {
  const [search, setSearch] = useState("");
  const [dateMode, setDateModeState] = useState("all");
  const [dateValue, setDateValue] = useState("");

  const setDateMode = (mode) => {
    setDateModeState(mode);
    setDateValue(getDateValue(mode));
  };

  const dateParams = useMemo(() => {
    if (dateMode === "day" && dateValue) {
      return { date_from: dateValue, date_to: dateValue };
    }
    if (dateMode === "month" && /^\d{4}-\d{2}$/.test(dateValue)) {
      const [year, month] = dateValue.split("-").map(Number);
      const lastDay = new Date(year, month, 0).getDate();
      return {
        date_from: `${dateValue}-01`,
        date_to: `${dateValue}-${String(lastDay).padStart(2, "0")}`,
      };
    }
    if (dateMode === "year" && /^\d{4}$/.test(dateValue)) {
      return { date_from: `${dateValue}-01-01`, date_to: `${dateValue}-12-31` };
    }
    return {};
  }, [dateMode, dateValue]);

  const matchesDate = useCallback((value) => {
    if (dateMode === "all") return true;
    const date = String(value ?? "").slice(0, 10);
    if (dateMode === "day") return date === dateValue;
    if (dateMode === "month") return date.slice(0, 7) === dateValue;
    if (dateMode === "year") return date.slice(0, 4) === dateValue;
    return true;
  }, [dateMode, dateValue]);

  return { search, setSearch, dateMode, setDateMode, dateValue, setDateValue, dateParams, matchesDate };
}