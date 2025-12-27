import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@core';
import { AppLayout } from '@ui';
import { Home } from './Home';
import { MyBookings } from './MyBookings';

const PrivateRoute = ({ children, roles = [] }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        // Hard redirect to login since it's a separate app
        // Hard redirect to login since it's a separate app
        window.location.href = `${import.meta.env.VITE_AUTH_APP_URL}/`;
        return null;
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const NotFound = () => {
    // Safety check: specific paths should hard reload specific entry points
    // if the SPA router catches them by mistake
    return <Navigate to="/" replace />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/my-bookings" element={
                            <PrivateRoute roles={['user', 'admin']}>
                                <MyBookings />
                            </PrivateRoute>
                        } />
                    </Route>
                    {/* Catch all with smart redirect */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
