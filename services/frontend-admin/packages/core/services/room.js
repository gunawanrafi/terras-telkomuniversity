import { storage } from './storage';

const ROOM_SERVICE = import.meta.env.VITE_ROOM_SERVICE || 'http://localhost:3002';

export const roomService = {
    getAll: async () => {
        try {
            const response = await fetch(`${ROOM_SERVICE}/rooms`);
            const data = await response.json();
            return data.map(item => ({ ...item, id: item._id }));
        } catch (error) {
            console.error('Get rooms error:', error);
            return [];
        }
    },

    getById: async (id) => {
        try {
            const response = await fetch(`${ROOM_SERVICE}/rooms/${id}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Get room error:', error);
            return null;
        }
    },

    add: async (roomData) => {
        try {
            const response = await fetch(`${ROOM_SERVICE}/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roomData)
            });
            return await response.json();
        } catch (error) {
            console.error('Add room error:', error);
            throw error;
        }
    },

    update: async (id, roomData) => {
        try {
            const response = await fetch(`${ROOM_SERVICE}/rooms/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roomData)
            });
            return response.ok;
        } catch (error) {
            console.error('Update room error:', error);
            return false;
        }
    },

    delete: async (id) => {
        try {
            const response = await fetch(`${ROOM_SERVICE}/rooms/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) return { success: true };
            const data = await response.json();
            return { success: false, message: data.error || 'Failed to delete' };
        } catch (error) {
            console.error('Delete room error:', error);
            return { success: false, message: 'Network error' };
        }
    }
};

function logAdminAction(adminId, action, details) {
    const logs = storage.get(storage.KEYS.ADMIN_LOGS) || [];
    logs.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        adminId,
        action,
        details
    });
    storage.set(storage.KEYS.ADMIN_LOGS, logs);
}
