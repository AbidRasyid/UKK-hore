import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (password.length < 8) {
      setIsError(true);
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/api/customer/reset-password", {
        email: searchParams.get("email"),
        token: searchParams.get("token"),
        new_password: password,
      });
      setIsError(false);
      setMessage("Password reset successfully. Redirecting to login...");
      window.setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "Unable to reset your password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f5f7] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">Reset password</h1>
        <p className="mb-6 text-sm text-neutral-500">Enter a new password with at least 8 characters.</p>
        {message && (
          <div className={`mb-4 rounded-md p-3 text-sm ${isError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {message}
          </div>
        )}
        <label htmlFor="new-password" className="mb-1.5 block text-sm text-neutral-700">New password</label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mb-5 h-11 w-full rounded-md border border-neutral-200 px-3 text-sm focus:border-neutral-400 focus:outline-none"
          required
        />
        <button type="submit" disabled={isLoading || !searchParams.get("token") || !searchParams.get("email")} className="h-11 w-full rounded-md bg-black text-sm font-medium text-white hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60">
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </main>
  );
};

export default ResetPasswordPage;
