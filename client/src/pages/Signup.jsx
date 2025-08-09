import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import ROUTES from "../routes/paths";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const { fullName, email } = formData;
    if (!formData.fullName || !formData.email) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/authentication/send-otp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "OTP sent successfully.");
        setStep(2);
      } else {
        toast.error(data.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      toast.error("Server error while sending OTP.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { fullName, email, password, confirmPassword, otp } = formData;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!otp) {
      toast.error("Enter the OTP sent to your email.");
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/authentication/signup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          otp,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Signup successful!");
        toast.info("Navigating to Sign In...", { autoClose: 1200 });
        setTimeout(() => {
          window.location.href = ROUTES.LOGIN;
        }, 1500);
      } else {
        toast.error(data.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Server error during signup.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="absolute top-6 left-6 text-indigo-600 text-xl font-bold tracking-wide cursor-pointer">
        Application Name
      </div>

      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-md relative">
        {step === 2 && (
          <button
            className="absolute top-4 left-4 text-gray-500 hover:text-indigo-600"
            onClick={() => setStep(1)}
          >
            <ArrowBackIcon />
          </button>
        )}

        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-8">
          Create an Account
        </h2>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="relative">
              <PersonIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="pl-10 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="relative">
              <EmailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="pl-10 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
            >
              Send OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSignup} className="space-y-5 mt-2">
            <div className="relative">
              <EmailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={handleChange}
                required
                className="pl-10 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="pl-10 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="pl-10 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
            >
              Sign Up
            </button>
          </form>
        )}

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <a href={ROUTES.LOGIN} className="text-indigo-600 hover:underline">
            Log in
          </a>
        </p>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Signup;
