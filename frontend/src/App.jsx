import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login";
import StockSyncHero from "./components/hero";
import ProductManagement from "./components/ProductManager";
import EmployeeManagement from "./components/EmployeeManagement";
import InventoryRequestForm from "./components/InventoryRequestForm";
import AdminRequestManagement from "./components/AdminReqManagement";
import AssignedInventory from "./components/AssignedInventory";
export default function App() {
  // Helper to protect routes
  const PrivateRoute = ({ children, role }) => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (!token) {
      return <Navigate to="/login" replace />;
    }

    if (role && role !== userRole) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute role="admin">
              <StockSyncHero />
            </PrivateRoute>
          }
        />

        {/* Employee Dashboard */}
        <Route
          path="/employee-dashboard"
          element={
            <PrivateRoute role="employee">
              <StockSyncHero />
            </PrivateRoute>
          }
        />

        {/* Product Manager (Admin) */}
        <Route
          path="/products"
          element={
            <PrivateRoute role="admin">
              <ProductManagement />
            </PrivateRoute>
          }
        />

        {/* Employee Manager (Admin) */}
        <Route
          path="/employees"
          element={
            <PrivateRoute role="admin">
              <EmployeeManagement />
            </PrivateRoute>
          }
        />

        {/* Inventory Request (Employee) */}
        <Route
          path="/manage-products"
          element={
            <PrivateRoute role="employee">
              <InventoryRequestForm />
            </PrivateRoute>
          }
        />

        <Route
          path="/assigned-inventory"
          element={
            <PrivateRoute role="employee">
              <AssignedInventory />
            </PrivateRoute>
          }
        />



        {/* Admin Request Management */}
        <Route
          path="/req-management"
          element={
            <PrivateRoute role="admin">
              <AdminRequestManagement />
            </PrivateRoute>
          }
        />

        {/* Default route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
