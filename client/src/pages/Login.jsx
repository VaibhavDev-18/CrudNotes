import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Email as EmailIcon, Lock as LockIcon } from "@mui/icons-material";
import ROUTES from "../routes/paths.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/authentication/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login successful!");
        localStorage.setItem("token", data.access);
        localStorage.setItem("user", JSON.stringify(data.user));

        toast.info("Navigating to Dashboard...", { autoClose: 1200 });
        setTimeout(() => {
          window.location.href = ROUTES.DASHBOARD;
        }, 1500);
      } else {
        toast.error(data.error || "Login failed.");
        setShowForgotPassword(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Server error while logging in.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="absolute top-6 left-6 text-indigo-600 text-xl font-bold tracking-wide">
        Application Name
      </div>

      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-md">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-8">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
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

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            Log In
          </button>

          {showForgotPassword && (
            <div className="text-right mt-2">
              <a
                href={ROUTES.FORGOT_PASSWORD}
                className="text-indigo-600 hover:underline text-sm"
              >
                Forgot Password?
              </a>
            </div>
          )}
        </form>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <a href={ROUTES.SIGNUP} className="text-indigo-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;
