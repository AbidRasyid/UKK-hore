import { useState, useEffect } from "react";
import api from "../api/axios";
import { executeToogleStatus } from "../utils/toogleStatus";
import { useLanguage } from "./useLanguage";
import { MAJORS, normalizeMajor } from "../utils/majors";

export const useCustomers = () => {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fungsi Ambil Data (Fetch)
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/customers");
      setCustomers(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Failed to load customer accounts", error);
    } finally {
      setLoading(false);
    }
  };

  // Panggil fetch pas komponen pertama kali dibuka
  useEffect(() => {
    let isMounted = true;
    const loadCustomers = async () => {
      try {
        const response = await api.get("/api/customers");
        if (isMounted) {
          setCustomers(Array.isArray(response.data.data) ? response.data.data : []);
        }
      } catch (error) {
        console.error("Failed to load customer accounts", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadCustomers();
    return () => { isMounted = false; };
  }, []);

  // 2. Fungsi Hapus (Delete)
  // const handleDelete = async (customer) => {
  //   if (!window.confirm(`${t("delete_customer_confirm")} ${customer.student_name}?`)) return;

  //   try {
  //     await api.delete(`/api/customer/${customer.id}/delete`);
  //     setCustomers((current) => current.filter((item) => item.id !== customer.id));
  //   } catch (error) {
  //     console.error("Failed to delete customer account", error);
  //     alert(t("customer_delete_error"));
  //   }
  // };

  // 3. Fungsi Blokir (Block) - Pakai utility yang udah kita bikin tadi
  const handleBlock = async (customer) => {
    const isBlocked = customer.status === 'blocked';
    const nextStatus = isBlocked ? "active" : "blocked";

    const isSuccess = await executeToogleStatus('/api/customer', customer.id, nextStatus);

    if (isSuccess) {
      setCustomers(prev => prev.map(c => c.id == customer.id ? { ...c, status: nextStatus } : c));
    }
  };

  // 4. Fungsi Simpan Banyak Data (Bulk Submit dari Modal)
  const handleBulkSubmit = async (customerRows, closeModal) => {
    const rows = customerRows.map((row) => {
      const trimmedRow = Object.fromEntries(
        Object.entries(row).map(([field, value]) => [field, value.trim()])
      );
      return {
        ...trimmedRow,
        email: trimmedRow.email || null,
        pin: trimmedRow.pin || null,
        student_class: normalizeMajor(trimmedRow.student_class),
      };
    });

    const requiredFields = ["student_name", "student_id", "student_class", "password"];
    if (rows.some((row) => requiredFields.some((field) => !row[field]))) {
      alert(t("fill_every_customer_field"));
      return;
    }

    if (rows.some((row) => !MAJORS.includes(normalizeMajor(row.student_class)))) {
      alert(t("select_major"));
      return;
    }

    const invalidPin = rows.find((row) => row.pin && !/^\d{6}$/.test(row.pin));
    if (invalidPin) {
      alert(t("err_pin_must_be_6"));
      return;
    }

    setIsSaving(true);
    try {
      await api.post("/api/customers/bulk", { customers: rows });
      alert(`${rows.length} ${t("accounts_added_successfully")}`);
      await fetchCustomers(); 
      closeModal(); 
    } catch (error) {
      console.error("Failed to add customer accounts", error);
      alert(error.response?.data?.message || t("accounts_add_error"));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    customers,
    setCustomers,
    loading,
    isSaving,
    // handleDelete,
    handleBlock,
    handleBulkSubmit,
    fetchCustomers,
  };
};