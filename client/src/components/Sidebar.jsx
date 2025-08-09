import React from "react";
import { NavLink } from "react-router-dom";
import { NoteAlt, Archive, Delete, Settings, Share } from "@mui/icons-material";
import ROUTES from "../routes/paths.js";

const Sidebar = () => {
  const navItemClass = ({ isActive }) =>
    `flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
      isActive ? "font-bold text-indigo-600" : "text-gray-600"
    }`;

  return (
    <aside className="w-64 bg-white shadow-lg p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-700">Dashboard</h2>

      <nav className="flex flex-col space-y-3">
        <NavLink to={ROUTES.DASHBOARD} className={navItemClass}>
          <NoteAlt fontSize="small" />
          My Notes
        </NavLink>

        <NavLink to={ROUTES.ARCHIVED} className={navItemClass}>
          <Archive fontSize="small" />
          Archive
        </NavLink>

        <NavLink to={ROUTES.TRASH} className={navItemClass}>
          <Delete fontSize="small" />
          Trash
        </NavLink>

        <NavLink to={ROUTES.SETTINGS} className={navItemClass}>
          <Settings fontSize="small" />
          Settings
        </NavLink>

        <NavLink to={ROUTES.SHARED_WITH_ME} className={navItemClass}>
          <Share fontSize="small" />
          Shared With Me
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
