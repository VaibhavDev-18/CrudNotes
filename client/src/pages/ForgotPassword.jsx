import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Email as EmailIcon } from "@mui/icons-material";
import ROUTES from "../routes/paths";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}authentication/forgot-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Reset link sent to your email.");
      } else {
        toast.error(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error("Server error.");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative px-4">
      <div className="absolute top-6 left-6 text-indigo-600 text-xl font-bold">
        Application Name
      </div>

      <div className="w-full max-w-md bg-white p-8 shadow-lg rounded">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <EmailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Back to{" "}
          <a href={ROUTES.LOGIN} className="text-indigo-600 hover:underline">
            Login
          </a>
        </p>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;
