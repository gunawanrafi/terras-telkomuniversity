// Storage utility for Auth Tokens and Admin Logs only
// Replaces previous mock storage

const STORAGE_KEYS = {
    SESSION: 'terras_session',
    USERS: 'terras_users_v1', // Legacy, can be removed eventually
    ROOMS: 'terras_rooms_v1', // Legacy
    BOOKINGS: 'terras_bookings_v1', // Legacy
    BUILDINGS: 'terras_buildings_v1', // Legacy
    TOKEN: 'terras_token', // JWT Token
    ADMIN_LOGS: 'terras_admin_logs_v1'
};

export const storage = {
    KEYS: STORAGE_KEYS,

    init: () => {
        // No-op: No more seeding dummy data
    },

    get: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    set: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    },

    clear: () => {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },

    addLog: (adminName, action, target) => {
        const key = STORAGE_KEYS.ADMIN_LOGS;
        const logs = JSON.parse(localStorage.getItem(key) || '[]');
        const newLog = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            adminName,
            action,
            target
        };
        logs.unshift(newLog); // Add to beginning
        // Limit to 50 logs
        if (logs.length > 50) logs.pop();
        localStorage.setItem(key, JSON.stringify(logs));
    }
};
