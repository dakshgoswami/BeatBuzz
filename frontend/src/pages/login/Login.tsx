import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validate form before submitting
  const validateForm = () => {
    if (!formData.email.trim()) {
      toast.error("Email is required!");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Enter a valid email address!");
      return false;
    }
    if (!formData.password.trim()) {
      toast.error("Password is required!");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return; // Stop if validation fails

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/users/login",
        formData
      );
      // console.log(data);
      // Save token to local storage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", JSON.stringify(data.user.id));

      toast.success("Login Successful! Redirecting...");
      setTimeout(() => navigate("/"), 1000); // Redirect after a short delay
    } catch (error: any) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Failed to login!");
      } else {
        toast.error("Something went wrong! Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col w-full justify-center items-center min-h-screen bg-zinc-900/75">
      <div className="bg-transparent p-4 text-white rounded-lg w-full h-auto max-w-sm">
        <div className="flex flex-col items-center gap-4 mb-8">
          <img
            src="/bb.png"
            alt="BeatBuzz"
            className="size-12 animate-bounce rounded-full"
          />
          <h2 className="text-5xl mb-4 text-center normal-case font-bold">
            Login to <br></br>start listening
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email.toLowerCase().trim()}
              onChange={handleChange}
              required
              className="p-2 rounded bg-transparent text-white border-2 border-green-400 outline-none"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password">Password</label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password.trim()}
                onChange={handleChange}
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
            type="submit"
            className="bg-green-400 text-white p-2 rounded-full mt-5"
          >
            Login
          </button>
        </form>
        <div className="flex-col justify-center items-center mt-4 text-sm gap-2">
          <p>
            <Link to="/forgot-password" className="underline text-green-400">
              Forgot Password?
            </Link>
          </p>
          <hr className="border-t-2 w-full border-green-400 mt-2 mb-2" />
          <p>
            Create an account?{" "}
            <Link to="/signup" className="underline text-green-400">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
