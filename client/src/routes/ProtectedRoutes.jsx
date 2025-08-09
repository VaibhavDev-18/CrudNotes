import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ROUTES from "./paths";

const ProtectedRoute = ({ children }) => {
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setShouldRedirect(true);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsSessionExpired(true);
      }
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsSessionExpired(true);
    }
  }, []);

  const handleRedirect = () => {
    setIsSessionExpired(false);
    setShouldRedirect(true);
  };

  if (shouldRedirect) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <>
      {isSessionExpired ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md text-center max-w-sm">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              Session Expired
            </h2>
            <p className="mb-6 text-gray-700">
              Your session has expired. Please log in again to continue.
            </p>
            <button
              onClick={handleRedirect}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              Login Again
            </button>
          </div>
        </div>
      ) : (
        children
      )}
    </>
  );
};

export default ProtectedRoute;
