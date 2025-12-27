import { storage } from './storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const authService = {
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (data.success) {
                // Store token and user info
                localStorage.setItem(storage.KEYS.TOKEN, data.token);
                localStorage.setItem(storage.KEYS.SESSION, JSON.stringify(data.user));
                return { success: true, user: data.user, token: data.token };
            }
            return { success: false, message: data.message || 'Login failed' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error' };
        }
    },

    getAllUsers: async () => {
        try {
            const response = await fetch(`${API_URL}/users`);
            return await response.json();
        } catch (error) {
            console.error('Get all users error:', error);
            return [];
        }
    },

    updateUserRole: async (id, role, adminName, targetName) => {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role })
            });
            const result = await response.json();
            if (response.ok && adminName && targetName) {
                const action = role === 'admin' ? 'Upgrade ke Admin' : 'Downgrade ke User';
                storage.addLog(adminName, action, targetName);
            }
            return result;
        } catch (error) {
            console.error('Update user role error:', error);
            return { success: false };
        }
    },

    deleteUser: async (id, adminName, targetName) => {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (response.ok && adminName && targetName) {
                storage.addLog(adminName, 'Menghapus User', targetName);
            }
            return result;
        } catch (error) {
            console.error('Delete user error:', error);
            return { success: false };
        }
    },

    logout: () => {
        localStorage.removeItem(storage.KEYS.SESSION);
        localStorage.removeItem(storage.KEYS.TOKEN);
        // Optional: Call backend logout if needed
    },

    register: async ({ name, email, password }) => {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();

            if (data.success) {
                // Store token and user info (optional, usually require login after register, but here we can auto-login)
                // Based on backend implementation:
                /* 
                   res.json({
                       success: true,
                       user: { ... },
                       token
                   });
                */
                localStorage.setItem(storage.KEYS.TOKEN, data.token);
                localStorage.setItem(storage.KEYS.SESSION, JSON.stringify(data.user));
                return { success: true, message: 'Registrasi berhasil' };
            }
            return { success: false, message: data.message || 'Registrasi gagal' };
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: 'Network error' };
        }
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem(storage.KEYS.SESSION);
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem(storage.KEYS.TOKEN);
    },

    getToken: () => {
        return localStorage.getItem(storage.KEYS.TOKEN);
    }
};
