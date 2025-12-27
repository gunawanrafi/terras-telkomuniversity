import { storage } from './storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const authService = {
    login: async (email, password) => {
        console.log('AuthService: Login initiated');
        console.log('AuthService: Using API URL:', API_URL);
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            console.log('AuthService: Fetch response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('AuthService: Check non-ok response:', errorText);
                throw new Error(`Server returned ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('AuthService: Parsed JSON data:', data);

            if (data.success) {
                // Store token and user info
                localStorage.setItem(storage.KEYS.TOKEN, data.token);
                localStorage.setItem(storage.KEYS.SESSION, JSON.stringify(data.user));
                return { success: true, user: data.user, token: data.token };
            }
            return { success: false, message: data.message || 'Login failed' };
        } catch (error) {
            console.error('AuthService: Login error details:', error);
            return { success: false, message: 'Network error or Server unreachable: ' + error.message };
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
