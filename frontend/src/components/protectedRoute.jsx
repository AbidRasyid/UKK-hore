import { useState, useEffect } from 'react';
import { Navigate, Outlet } from "react-router-dom";
import api from '../api/axios';
import { useLanguage } from '../hooks/useLanguage';

const ProtectedRoute = ({ allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    // Menembak ke rute bebas role untuk mengambil profile user yang sedang memegang cookie
    api.get('/api/me')
      .then(response => {
        setUser(response.data); // Menyimpan objek data user asli dari DB ke RAM React
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []); // Menggunakan [] agar hanya dieksekusi 1 kali saat halaman dibuka
  
  if (loading) {
    return <div>{t('loading')}</div>;
  }

  // Ambil data role asli dari database (misal kolom 'role' di tabel users Anda)
  const userRole = user?.role?.toLowerCase() || '';
  const isAllowed = allowedRoles.map(role => role.toLowerCase()).includes(userRole);

  // Jika user tidak ditemukan di database atau rolenya tidak diizinkan masuk rute ini
  if (!user || !isAllowed) {
    return <Navigate to="/login" replace />;
  }

  // Jika lolos verifikasi server, buka halaman asli dan alirkan data user ke bawah
  return <Outlet context={{ user }} />;
};

export default ProtectedRoute;
