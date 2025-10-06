import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import SignIn from "./pages/Signin";
import ForgotPassword from "./pages/auth/ForgotPassword";
import CreatePassword from "./pages/auth/CreateNewPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/dashboard";
import AdminLayout from "./components/layout/AdminLayout";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔐 Public routes */}
        <Route path="/" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/create-new-password" element={<CreatePassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />

        {/* 🧭 Protected routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "Owner"]} />}>
          <Route path="/dashboard" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
          </Route>
          
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Worker"]} />}>
          <Route path="/worker-dashboard" element={<AdminLayout />}>
            <Route index element={<Dashboard />} /> {/* Reuse Dashboard or create WorkerDashboard */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;