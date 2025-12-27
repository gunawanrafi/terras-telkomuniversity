import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { storage } from '../services/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check session on load
        const sessionUser = authService.getCurrentUser();
        setUser(sessionUser);
        setLoading(false);
    }, []);

    const login = (email, password) => {
        const result = authService.login(email, password);
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

    const register = (userData) => {
        const result = authService.register(userData);
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
