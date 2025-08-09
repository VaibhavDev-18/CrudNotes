import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ROUTES from "../routes/paths";

const Topbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) setUser(userData);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="bg-indigo-600 text-white flex items-center justify-between px-6 py-4 shadow">
      <div className="text-xl font-bold">Application Name</div>
      <div className="flex items-center gap-4">
        {user && <span className="text-sm">Welcome, {user.fullName}</span>}
        <button
          onClick={handleLogout}
          className="bg-indigo-800 px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Topbar;
