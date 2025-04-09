import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
// import { error } from "console";

const Signup = () => {
  const [formData, setFormData] = useState<{
    username: string;
    fullname: string;
    email: string;
    password: string;
    profilePic: File | null;
  }>({
    username: "",
    fullname: "",
    email: "",
    password: "",
    profilePic: null,
  });

  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const [preview, setPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Regular Expressions for Validation
  const usernameRegex = /^[a-zA-Z0-9]{3,20}$/; // 3-20 chars, no special symbols
  const fullnameRegex = /^[a-zA-Z][a-zA-Z\s]{1,18}[a-zA-Z]$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard email validation
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  // At least 1 uppercase, 1 lowercase, 1 number, 1 special char, min 8 chars

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log(file);
    if (file) {
      setFormData({ ...formData, profilePic: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!usernameRegex.test(formData.username)) {
      toast.error(
        "Username must be 3-20 characters long without special symbols!"
      );
      return false;
    }
    if (!fullnameRegex.test(formData.fullname)) {
      toast.error(
        "Fullname must be 3-20 characters long without special symbols!"
      );
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid email address!");
      return false;
    }
    if (!passwordRegex.test(formData.password)) {
      toast.error(
        "Password must have at least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special character!"
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    setLoading(true); // Show loading state
    
    try {
      const response = await axios.post(
        `${process.env.VITE_BACKEND_URL}/api/users/send-otp`,
        {
          email: formData.email,
          username: formData.username,
        }
      );
      toast.success("OTP sent to your email. Please check your inbox.", {
        icon: "📩",
      });

      if (response.data.success) {
        setGeneratedOtp(response.data.otp);
        setUserEmail(formData.email);
        setIsOtpSent(true);
        setLoading(false); // Hide loading state
      }
      if (!response.data.success) {
        setLoading(false); // Hide loading state
      }
    } catch (error: any) {
      toast.error(error.response.data.message || "Failed to send OTP!");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp === generatedOtp) {
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username);
      formDataToSend.append("fullName", formData.fullname);
      formDataToSend.append("email", userEmail);
      formDataToSend.append("password", formData.password);

      if (formData.profilePic) {
        // console.log("Uploading File:", formData.profilePic); // Debug log
        formDataToSend.append("profilePic", formData.profilePic); // Append file
      } else {
        console.log("No File Selected");
      }

      try {
        const response = await axios.post(
         `${process.env.VITE_BACKEND_URL}/api/users/signup`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" }, // Important for file upload
          }
        );
        toast.success("Account Created Successfully!");
        console.log(response);
        navigate("/login");
      } catch (error) {
        toast.error("Error creating account!");
      }
    } else {
      toast.error("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="flex flex-col w-full justify-center items-center min-h-screen bg-zinc-900/75 py-4">
      <div className="bg-transparent p-4 text-white rounded-lg w-full min-h-screen max-w-sm">
        <div className="flex flex-col items-center gap-4 mb-8">
          {preview ? (
            <img
              src={preview}
              alt="Profile Preview"
              className="size-16 rounded-full mx-auto"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          ) : (
            <img
              src="/bb.png"
              alt="BeatBuzz"
              className="size-12 animate-bounce rounded-full"
            />
          )}
          <h2 className="text-5xl mb-4 text-center normal-case font-bold">
            Sign up to <br /> start listening
          </h2>
        </div>
        {!isOtpSent ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username.toLowerCase().trim()}
                onChange={handleChange}
                required
                className="p-2 rounded bg-transparent text-white border-2 border-green-400 outline-none"
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="fullname">Full Name</label>
              <input
                type="text"
                name="fullname"
                placeholder="Full Name"
                value={formData.fullname}
                onChange={handleChange}
                required
                className="p-2 rounded bg-transparent text-white border-2 border-green-400 outline-none"
                autoComplete="off"
              />
            </div>
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
              <div className="w-full relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
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
            <div className="flex flex-col gap-1">
              <label htmlFor="profilePic">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                name="profilePic"
                onChange={handleFileChange}
                className="p-2 rounded bg-transparent text-white border-2 border-green-400 outline-none"
              />
            </div>

            <button
              type="submit"
              className="bg-green-400 text-white p-2 rounded-full mt-5"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Sign Up"}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-2">
            <p>Enter the OTP sent to your email</p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="p-2 rounded bg-transparent text-white border-2 border-green-400 outline-none"
            />
            <button
              onClick={handleVerifyOtp}
              className="bg-green-400 text-white p-2 rounded-full mt-5"
            >
              Verify OTP & Sign Up
            </button>
          </div>
        )}

        <p className="text-start max-sm:text-center mt-4 max-sm:text-sm">
          Already have an account?{" "}
          <Link to="/login" className="underline text-green-400">
            Log in
          </Link>
        </p>
        <hr className="border-t-2 border-green-400 mt-4 mb-4" />
        <p className="max-sm:text-sm max-sm:text-center">
          By signing up, you agree to our{" "}
          <span className="underline text-green-400">Terms of Service</span> and{" "}
          <span className="underline text-green-400">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default Signup;
