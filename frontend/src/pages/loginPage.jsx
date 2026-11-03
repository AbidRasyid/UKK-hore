import { useState } from "react";
import { Lock, IdCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import api from "../api/axios.js"; 
import Icon from "../assets/Icon.svg";
import { useLanguage } from "../hooks/useLanguage";


const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

// Di dalam LoginPage.jsx Anda:
const handleLogin = async (e) => {
  e.preventDefault();
  setErrorMsg("");
  setInfoMsg("");
  setIsLoading(true);

  try {
    await api.get("/sanctum/csrf-cookie");
    
    // Asumsi endpoint login Laravel Anda mengembalikan data user yang login
    const response = await api.post("/api/login", { username, password });
    
    localStorage.setItem("token", response.data.token);

    navigate("/");
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    setErrorMsg(t("invalid_credentials"));
  } finally {
    setIsLoading(false);
  }
};


  const handleForgotPassword = (e) => {
    e.preventDefault();
    setInfoMsg(t("login_help"));
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col items-center justify-center px-4 py-12 antialiased select-none">
      {/* Top Branding Section */}
      <div className="flex flex-col items-center mb-7">
        <div className="w-13 h-13 bg-black rounded-xl flex items-center justify-center shadow-sm">
          <img src={Icon} alt={t("app_logo")} />
        </div>
        <h1 className="mt-4 text-[22px] font-bold tracking-tight text-neutral-900">
          {t("e_teller_system")}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 font-normal">
          {t("authorized_personnel_only")}
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-107.5 bg-white rounded-lg border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-7 sm:p-8">
        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-md bg-red-50 border border-red-200 text-xs text-red-600 font-medium text-center">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="mb-4 p-2.5 rounded-md bg-blue-50 border border-blue-200 text-xs text-blue-700 font-medium text-center">
            {infoMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Teller ID / Username */}
          <div>
            <label
              htmlFor="teller-id"
              className="block text-sm font-normal text-neutral-700 mb-1.5"
            >
              {t("username")}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-neutral-400 pointer-events-none flex items-center">
                <IdCard className="w-4 h-4 text-neutral-500"/>
              </span>
              <input
                id="teller-id"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("enter_id")}
                required
                disabled={isLoading}
                className="w-full h-11 pl-9 pr-3 bg-white border border-neutral-200 rounded-md text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors disabled:opacity-60 disabled:bg-neutral-50"
              />
            </div>
          </div>

          {/* Access PIN */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="access-pin"
                className="text-sm font-normal text-neutral-700"
              >
                {t("password")}
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-normal text-neutral-900 hover:text-black cursor-pointer focus:outline-none"
              >
                {t("forgot_pin")}
              </button>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-neutral-400 pointer-events-none flex items-center">
                <Lock className="w-4 h-4 text-neutral-500"/>
              </span>
              <input
                id="access-pin"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className={`w-full h-11 pl-9 pr-3 bg-white border border-neutral-200 rounded-md text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors disabled:opacity-60 disabled:bg-neutral-50 ${
                  password ? "tracking-widest" : ""
                }`}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-black hover:bg-neutral-900 active:bg-neutral-800 text-white font-medium rounded-md flex items-center justify-center gap-2 text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t("authenticating")}
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 stroke-[2.2]" />
                  <span>{t("login")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security Footer */}
      <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-neutral-500 font-normal">
        <Lock className="w-3.5 h-3.5 text-neutral-500"/>
        <span>{t("end_to_end_encrypted")}</span>
      </div>
    </div>
  );
};

export default LoginPage;