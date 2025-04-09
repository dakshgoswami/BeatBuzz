import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
const ResetPassword = () => {
  const { token } = useParams();
  console.log(token);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const validateForm = () => {
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must have at least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special character!"
      );
      return false;
    }

    if (!password.trim()) {
      toast.error("Password is required!");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!validateForm()) return; // Stop if validation fails
    try {
         await axios.post(
        `http://localhost:5000/api/users/reset-password/${token}`,
        { password }
      );
      toast.success("Password reset successfully!", { icon: "✅" });
      navigate("/login"); // Redirect to login page after successful password reset
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong", {
        icon: "❌",
      });
    }
  };

  {
    if (message) {
      toast.success(message, {
        duration: 4000,
        icon: "✅",
      });
    }
    if (error) {
      toast.error(error, {
        duration: 4000,
        icon: "❌",
      });
    }
  }
  return (
    // <div>
    //   <h2>Reset Password</h2>
    //   <form onSubmit={handleSubmit}>
    //     <input
    //       type="password"
    //       placeholder="Enter new password"
    //       value={password}
    //       onChange={(e) => setPassword(e.target.value)}
    //       required
    //     />
    //     <button type="submit">Reset Password</button>
    //   </form>
    //   {message && <p style={{ color: "green" }}>{message}</p>}
    //   {error && <p style={{ color: "red" }}>{error}</p>}
    // </div>
    <div className="flex flex-col w-full justify-center items-center min-h-screen bg-zinc-900/75">
      <div className="bg-transparent p-4 text-white rounded-lg w-full h-auto max-w-sm">
        <div className="flex flex-col items-center gap-4 mb-8">
          <img
            src="/bb.png"
            alt="BeatBuzz"
            className="size-12 animate-bounce rounded-full"
          />
          <h2 className="text-5xl mb-4 text-center normal-case font-bold">
            Enter New<br></br> Password
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="password">Password</label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={password.trim()}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="p-2 w-full rounded bg-transparent text-white border-2 border-green-400 outline-none"
                autoComplete="off"
              />
              {showPassword ? (
                <FaEye
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer size-4"
                  onClick={() => setShowPassword(!showPassword)}
                />
              ) : (
                <FaEyeSlash
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer size-4"
                  onClick={() => setShowPassword(!showPassword)}
                />
              )}
            </div>
          </div>

          <button
            className="bg-green-400 text-white p-2 rounded-full mt-5 hover:bg-green-500 transition duration-300 ease-in-out"
            onClick={handleSubmit}
          >
            Reset Password
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

export default ResetPassword;
