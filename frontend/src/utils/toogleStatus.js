import api from "../api/axios";
import { dictionary } from "./dictionary";

export const executeToogleStatus = async (endpoint, id, nextStatus) => {
  const lang = localStorage.getItem("app_lang") || "en";
  const dict = dictionary[lang] || dictionary.en;
  const confirmMsg =
    nextStatus === "blocked"
      ? dict.confirm_block_user
      : dict.confirm_unblock_user;

  if (!confirm(confirmMsg)) return false;
  try {
    await api.patch(`${endpoint}/${id}/edit`, { status: nextStatus });
    alert(dict.user_status_updated);
    return true;
  } catch (error) {
    console.error("Failed to toggle status", error);
    return false;
  }
};