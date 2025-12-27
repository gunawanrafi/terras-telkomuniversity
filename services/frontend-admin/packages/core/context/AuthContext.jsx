import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { storage } from '../services/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token in URL (cross-origin session sync)
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        const userFromUrl = urlParams.get('user');

        if (tokenFromUrl && userFromUrl) {
            try {
                const userData = JSON.parse(decodeURIComponent(userFromUrl));
                // Save to localStorage
                storage.set('terras_session', userData);
                setUser(userData);
                setLoading(false);

                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            } catch (e) {
                console.error('Failed to parse user from URL:', e);
            }
        }

        // Check session on load
        const sessionUser = authService.getCurrentUser();
        setUser(sessionUser);
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const result = await authService.login(email, password);
        if (result.success) {
            setUser(result.user);
            return { success: true };
        }
        return { success: false, message: result.message };
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const register = async (userData) => {
        const result = await authService.register(userData);
        return result;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
