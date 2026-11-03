import { useLanguage } from "../hooks/useLanguage";

export default function SettingsPage() {
  const { t } = useLanguage();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">{t("settings")}</h1>
      <p className="mt-2 text-sm text-gray-600">{t("settings_system")}</p>
    </div>
  );
}
