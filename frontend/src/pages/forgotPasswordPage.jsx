import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { getSafeApiMessage } from "../utils/getSafeApiMessage";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      await api.post("/api/customer/forgot-password", { email });
      setIsError(false);
      setMessage("If the account is eligible, a reset code will be sent.");
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      setIsError(true);
      setMessage(getSafeApiMessage(error, "Unable to send a reset code."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f5f7] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">Forgot password</h1>
        <p className="mb-6 text-sm text-neutral-500">Enter your registered email to receive a password reset code.</p>
        {message && (
          <div className={`mb-4 rounded-md p-3 text-sm ${isError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {message}
          </div>
        )}
        <label htmlFor="email" className="mb-1.5 block text-sm text-neutral-700">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mb-5 h-11 w-full rounded-md border border-neutral-200 px-3 text-sm focus:border-neutral-400 focus:outline-none"
          required
        />
        <button type="submit" disabled={isLoading} className="mb-4 h-11 w-full rounded-md bg-black text-sm font-medium text-white hover:bg-neutral-900 disabled:opacity-60">
          {isLoading ? "Sending..." : "Send Reset Code"}
        </button>
        <Link to="/login" className="block text-center text-sm text-neutral-600 hover:text-black">Back to login</Link>
      </form>
    </main>
  );
};

export default ForgotPasswordPage;
