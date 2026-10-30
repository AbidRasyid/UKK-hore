import api from "../api/axios";

export const executeToogleStatus = async(endpoint, id, nextStatus, actionText) => {
    if (!confirm(`apakah anda yakin ingin ${actionText} orang ini?`)) return false;
    try{
      await api.patch(`${endpoint}/${id}/edit`, {"status": nextStatus})
      alert(`user berhasil di-${actionText}`)
      return true;
    }catch (error) {
      console.error("gagal memblokir user", error)
      return false;
    }
  }