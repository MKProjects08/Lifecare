import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import SignIn from "./pages/Signin";
import ForgotPassword from "./pages/auth/ForgotPassword";
import CreatePassword from "./pages/auth/CreateNewPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/dashboard";
import WorkerDashboard from "./pages/worker-dashboard";
import Products from "./pages/products";
import Alerts from "./pages/alerts";
import Billing from "./pages/billing";
import Orders from "./pages/orders";
import Settings from "./pages/settings";
import Sales from "./pages/sales";
import AdminLayout from "./components/layout/AdminLayout";
import Credits from "./pages/credits";
import Agency from "./pages/agencies";
import Customer from "./pages/customers";
import User from "./pages/users";

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
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/dashboard" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["worker"]} />}>
          <Route path="/worker-dashboard" element={<AdminLayout />}>
            <Route index element={<WorkerDashboard/>} />
          </Route>
        </Route>

        {/* Shared pages for admin and worker */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "worker"]} />}>
          <Route path="/products" element={<AdminLayout />}>
            <Route index element={<Products />} />
          </Route>
          <Route path="/billing" element={<AdminLayout />}>
            <Route index element={<Billing />} />
          </Route>
          <Route path="/alerts" element={<AdminLayout />}>
            <Route index element={<Alerts />} />
          </Route>
          <Route path="/orders" element={<AdminLayout />}>
            <Route index element={<Orders />} />
          </Route>
          <Route path="/settings" element={<AdminLayout />}>
            <Route index element={<Settings />} />
          </Route>
        </Route>

        
        {/*  pages for admin  */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/sales" element={<AdminLayout />}>
            <Route index element={<Sales />} />
          </Route>
          <Route path="/credits" element={<AdminLayout />}>
            <Route index element={<Credits />} />
          </Route>
          <Route path="/agencies" element={<AdminLayout />}>
            <Route index element={<Agency />} />
          </Route>
          <Route path="/customers" element={<AdminLayout />}>
            <Route index element={<Customer />} />
          </Route>
          <Route path="/users" element={<AdminLayout />}>
            <Route index element={<User />} />
          </Route>
        </Route>


      </Routes>
    </BrowserRouter>
  );
}

export default App;