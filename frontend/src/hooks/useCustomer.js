import { useState, useEffect } from "react";
import api from "../api/axios";
import { executeToogleStatus } from "../utils/toogleStatus";

export const useCustomers = () => {
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
  const handleDelete = async (customer) => {
    if (!window.confirm(`Delete the account for ${customer.student_name}?`)) return;

    try {
      await api.delete(`/api/customer/${customer.id}/delete`);
      setCustomers((current) => current.filter((item) => item.id !== customer.id));
    } catch (error) {
      console.error("Failed to delete customer account", error);
      alert("Customer account could not be deleted.");
    }
  };

  // 3. Fungsi Blokir (Block) - Pakai utility yang udah kita bikin tadi
  const handleBlock = async (customer) => {
    const isBlocked = customer.status === 'blocked';
    const nextStatus = isBlocked ? "active" : "blocked";
    const actionText = isBlocked ? "buka blokir" : "blokir";

    const isSuccess = await executeToogleStatus('/api/customer', customer.id, nextStatus, actionText);

    if (isSuccess) {
      setCustomers(prev => prev.map(c => c.id == customer.id ? { ...c, status: nextStatus } : c));
    }
  };

  // 4. Fungsi Simpan Banyak Data (Bulk Submit dari Modal)
  const handleBulkSubmit = async (customerRows, closeModal) => {
    const rows = customerRows.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([field, value]) => [field, value.trim()])
      )
    );

    if (rows.some((row) => Object.values(row).some((value) => !value))) {
      alert("Fill in every customer field before saving.");
      return;
    }

    const invalidPin = rows.find((row) => !/^\d{6}$/.test(row.pin));
    if (invalidPin) {
      alert("PIN must contain exactly 6 numbers.");
      return;
    }

    setIsSaving(true);
    try {
      await Promise.all(rows.map((row) => api.post("/api/customers", row)));
      alert(`${rows.length} customer account${rows.length > 1 ? "s" : ""} added successfully.`);
      await fetchCustomers(); 
      closeModal(); 
    } catch (error) {
      console.error("Failed to add customer accounts", error);
      alert("Customer accounts could not be added. Please check the data and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    customers,
    setCustomers,
    loading,
    isSaving,
    handleDelete,
    handleBlock,
    handleBulkSubmit,
    fetchCustomers,
  };
};