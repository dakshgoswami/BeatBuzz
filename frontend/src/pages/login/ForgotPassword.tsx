import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const validateForm = () => {
    if (!email.trim()) {
      toast.error("Email is required!");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Enter a valid email address!");
      return false;
    }
    if (email.length < 6) {
      toast.error("Email must be at least 6 characters!");
      return false;
    }
    if (email.length > 50) {
      toast.error("Email must be less than 50 characters!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return; // Stop if validation fails

    setLoading(true); // Show loading state

    try {
      await axios.post(
        "http://localhost:5000/api/users/forgot-password",
        { email }
      );
      toast.success("Check your email for the reset link!", { icon: "📩" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong", { icon: "❌" });
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <div className="flex flex-col w-full justify-center items-center min-h-screen bg-zinc-900/75">
      <div className="bg-transparent p-4 text-white rounded-lg w-full h-auto max-w-sm">
        <div className="flex flex-col items-center gap-4 mb-8">
          <img src="/bb.png" alt="BeatBuzz" className="size-12 animate-bounce rounded-full" />
          <h2 className="text-5xl mb-4 text-center normal-case font-bold">
            Forgot<br /> Password
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={email.toLowerCase().trim()}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-2 rounded bg-transparent text-white border-2 border-green-400 outline-none"
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            className="bg-green-400 text-white p-2 rounded-full mt-5 hover:bg-green-500 transition duration-300 ease-in-out disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Processing..." : "Send Reset Link"}
          </button>
        </form>
        <div className="flex justify-between items-center mt-4 text-sm">
          <p className="text-center">
            Back To Login?{" "}
            <Link to="/login" className="underline text-green-400">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
