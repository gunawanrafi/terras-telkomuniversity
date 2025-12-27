import { storage } from './storage';

export const authService = {
    login: (email, password) => {
        storage.init(); // Ensure data exists
        const users = storage.get(storage.KEYS.USERS) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            const sessionUser = { ...user };
            delete sessionUser.password; // Don't store password in session
            storage.set(storage.KEYS.SESSION, sessionUser);
            return { success: true, user: sessionUser };
        }
        return { success: false, message: 'Invalid email or password' };
    },

    logout: () => {
        localStorage.removeItem(storage.KEYS.SESSION);
    },

    register: ({ name, email, password }) => {
        storage.init(); // Ensure data exists
        const users = storage.get(storage.KEYS.USERS) || [];

        // Check if email already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return { success: false, message: 'Email sudah terdaftar' };
        }

        // Generate new ID
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

        // Create new user with default role 'user'
        const newUser = {
            id: newId,
            name,
            email,
            password, // In production, this should be hashed
            role: 'user' // Always default to user
        };

        // Save to storage
        users.push(newUser);
        storage.set(storage.KEYS.USERS, users);

        return { success: true, message: 'Registrasi berhasil' };
    },

    getCurrentUser: () => {
        return storage.get(storage.KEYS.SESSION);
    },

    isAuthenticated: () => {
        return !!storage.get(storage.KEYS.SESSION);
    }
};
