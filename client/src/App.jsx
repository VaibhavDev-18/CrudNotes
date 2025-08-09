import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../src/pages/Login.jsx";
import Signup from "../src/pages/Signup.jsx";
import Dashboard from "../src/pages/Dashboard.jsx";
import ForgotPassword from "../src/pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import NotFound from "../src/pages/NotFound.jsx";
import ROUTES from "../src/routes/paths.js";
import ProtectedRoute from "../src/routes/ProtectedRoutes.jsx";
import ArchiveNotes from "../src/pages/ArchiveNotes.jsx";
import TrashNotes from "../src/pages/TrashNotes.jsx";
import MyNotes from "../src/pages/MyNotes.jsx";
import SharedWithMe from "./pages/SharedWithMe.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.SIGNUP} element={<Signup />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />

        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<MyNotes />} />
          <Route path={ROUTES.ARCHIVED} element={<ArchiveNotes />} />
          <Route path={ROUTES.TRASH} element={<TrashNotes />} />
          <Route path={ROUTES.SHARED_WITH_ME} element={<SharedWithMe />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
