import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@core';
import { AppLayout, ErrorBoundary } from '@ui';
import { AdminDashboard } from './Dashboard';
import { AdminApprovals } from './Approvals';
import { AdminRooms } from './Rooms';
import { Users } from './Users';

const PrivateRoute = ({ children, roles = [] }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        window.location.href = `${import.meta.env.VITE_AUTH_APP_URL}/`;
        return null;
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
        // Debugging: Show why access is denied
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
                <p>Required Role: {roles.join(', ')}</p>
                <p>Current Role: {user?.role || 'undefined'}</p>
                <p>User Name: {user?.name}</p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="mt-4 px-4 py-2 bg-slate-200 rounded"
                >
                    Go to Home
                </button>
            </div>
        );
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/admin" element={
                        <ErrorBoundary>
                            <AppLayout />
                        </ErrorBoundary>
                    }>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={
                            <PrivateRoute roles={['admin']}>
                                <AdminDashboard />
                            </PrivateRoute>
                        } />
                        <Route path="approvals" element={
                            <PrivateRoute roles={['admin']}>
                                <AdminApprovals />
                            </PrivateRoute>
                        } />
                        <Route path="rooms" element={
                            <PrivateRoute roles={['admin']}>
                                <AdminRooms />
                            </PrivateRoute>
                        } />
                        <Route path="users" element={
                            <PrivateRoute roles={['admin']}>
                                <Users />
                            </PrivateRoute>
                        } />
                    </Route>
                    {/* Catch all redirect to admin dashboard */}
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
