import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Dashboard Pages
import Home from '../pages/dashboard/Home';
import Menu from '../pages/dashboard/Menu';
import Attendance from '../pages/dashboard/Attendance';
import Payments from '../pages/dashboard/Payments';
import Feedback from '../pages/dashboard/Feedback';
import Leave from '../pages/dashboard/Leave';
import Inventory from '../pages/dashboard/Inventory';
import AdminUsers from "../pages/dashboard/AdminUsers";

// Protected Route Wrapper
const ProtectedRoute = ({ children, roles }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    // ✅ Role check
    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

const AppRouter = () => {
    return (
        <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Dashboard Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Home />} />
                <Route path="menu" element={<Menu />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="payments" element={<Payments />} />
                <Route path="feedback" element={<Feedback />} />
                <Route path="leave" element={<Leave />} />

                {/* Admin-only Inventory */}
                <Route
                    path="inventory"
                    element={
                        <ProtectedRoute roles={['Admin']}>
                            <Inventory />
                        </ProtectedRoute>
                    }
                />

                {/* ✅ Admin Users (FIXED) */}
                <Route
                    path="admin/users"
                    element={
                        <ProtectedRoute roles={['Admin']}>
                            <AdminUsers />
                        </ProtectedRoute>
                    }
                />
            </Route>

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default AppRouter;