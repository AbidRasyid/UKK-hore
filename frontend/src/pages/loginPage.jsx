import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import axios from "axios";


const BankIcon = () => (
  <svg
    className="w-7 h-7 text-white"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    {/* Pediment / triangular roof */}
    <path d="M12 3.5L2.5 9h19L12 3.5z" />
    {/* Architrave bar below roof */}
    <rect x="2.5" y="9.6" width="19" height="1.4" rx="0.3" />
    {/* 3 Pillars */}
    <rect x="5.5" y="12" width="2.6" height="6.6" rx="0.4" />
    <rect x="10.7" y="12" width="2.6" height="6.6" rx="0.4" />
    <rect x="15.9" y="12" width="2.6" height="6.6" rx="0.4" />
    {/* Base floor */}
    <rect x="2.5" y="19.6" width="19" height="1.8" rx="0.4" />
  </svg>
);

// Solid ID badge icon matching the screenshot input field
const IdBadgeIcon = ({ className = "w-4 h-4 text-neutral-500" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 2a1.5 1.5 0 00-1.5 1.5V4H5a2.5 2.5 0 00-2.5 2.5v12A2.5 2.5 0 005 21h14a2.5 2.5 0 002.5-2.5v-12A2.5 2.5 0 0019 4h-3.5v-.5A1.5 1.5 0 0014 2h-4zm1.5 2h1v1h-1V4zM8.5 11.5a1.75 1.75 0 100-3.5 1.75 1.75 0 000 3.5zm-3.25 5.5a3.25 3.25 0 016.5 0H5.25zm8.5-5.25a.75.75 0 01.75-.75h4.25a.75.75 0 010 1.5H14.5a.75.75 0 01-.75-.75zm0 3.25a.75.75 0 01.75-.75h4.25a.75.75 0 010 1.5H14.5a.75.75 0 01-.75-.75z"
    />
  </svg>
);

// Solid padlock icon matching the screenshot access PIN field
const LockIcon = ({ className = "w-4 h-4 text-neutral-500" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8.5A2.5 2.5 0 006.5 21h11a2.5 2.5 0 002.5-2.5V12a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 5a3 3 0 116 0v3H9V7z"
    />
  </svg>
);

// Solid shield icon with keyhole cutout for the security note
const ShieldLockIcon = ({ className = "w-3.5 h-3.5 text-neutral-500" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2L4 5.2v5.892c0 5.012 3.415 9.71 8 10.908 4.585-1.198 8-5.896 8-10.908V5.2L12 2zm0 6a2 2 0 00-1 3.732V14.5a1 1 0 102 0v-2.768A2 2 0 0012 8z"
    />
  </svg>
);

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setIsLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

    try {
      const response = await axios.post(`${apiUrl}/login`, {
        username,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      if (user?.role) {
        localStorage.setItem("userRole", user.role);
      }
      navigate("/");
    } catch (error) {
      setErrorMsg(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Invalid username or password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setInfoMsg("Please contact your IT administrator or branch manager to reset your PIN.");
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col items-center justify-center px-4 py-12 antialiased select-none">
      {/* Top Branding Section */}
      <div className="flex flex-col items-center mb-7">
        <div className="w-13 h-13 bg-black rounded-xl flex items-center justify-center shadow-sm">
          <BankIcon />
        </div>
        <h1 className="mt-4 text-[22px] font-bold tracking-tight text-neutral-900">
          E-Teller System
        </h1>
        <p className="mt-1 text-sm text-neutral-500 font-normal">
          Authorized Personnel Only
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
              Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-neutral-400 pointer-events-none flex items-center">
                <IdBadgeIcon className="w-4 h-4 text-neutral-500" />
              </span>
              <input
                id="teller-id"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your ID"
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
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-normal text-neutral-900 hover:text-black cursor-pointer focus:outline-none"
              >
                Forgot PIN?
              </button>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-neutral-400 pointer-events-none flex items-center">
                <LockIcon className="w-4 h-4 text-neutral-500" />
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
                  Authenticating...
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 stroke-[2.2]" />
                  <span>Secure Login</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security Footer */}
      <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-neutral-500 font-normal">
        <ShieldLockIcon className="w-3.5 h-3.5 text-neutral-500" />
        <span>End-to-End Encrypted Terminal</span>
      </div>
    </div>
  );
};

export default LoginPage;