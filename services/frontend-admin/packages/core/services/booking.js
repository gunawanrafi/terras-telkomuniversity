import { storage } from './storage';

const BOOKING_SERVICE = import.meta.env.VITE_BOOKING_SERVICE || 'http://localhost:3003';

export const bookingService = {
    getAll: async () => {
        try {
            const response = await fetch(`${BOOKING_SERVICE}/bookings`);
            const data = await response.json();
            return data.map(item => ({ ...item, id: item._id }));
        } catch (error) {
            console.error('Get all bookings error:', error);
            return [];
        }
    },

    getActivities: async () => {
        try {
            const response = await fetch(`${BOOKING_SERVICE}/activities?limit=10`);
            const data = await response.json();
            return data.activities || []; // Backend returns { activities: [], total: ... }
        } catch (error) {
            console.error('Get activities error:', error);
            return [];
        }
    },

    getUserBookings: async (userId) => {
        try {
            const response = await fetch(`${BOOKING_SERVICE}/bookings?userId=${userId}`);
            return await response.json();
        } catch (error) {
            console.error('Get user bookings error:', error);
            return [];
        }
    },

    create: async (bookingData) => {
        try {
            const response = await fetch(`${BOOKING_SERVICE}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            return await response.json();
        } catch (error) {
            console.error('Create booking error:', error);
            throw error;
        }
    },

    approve: async (bookingId, adminId, adminName, targetName) => {
        try {
            const response = await fetch(`${BOOKING_SERVICE}/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved', adminId, adminName })
            });
            if (response.ok) {
                storage.addLog(adminName, 'Menyetujui', targetName);
            }
            return response.ok;
        } catch (error) {
            console.error('Approve booking error:', error);
            return false;
        }
    },

    reject: async (bookingId, adminId, reason, adminName, targetName) => {
        try {
            const response = await fetch(`${BOOKING_SERVICE}/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected', adminId, reason, adminName })
            });
            if (response.ok) {
                storage.addLog(adminName, 'Menolak', targetName);
            }
            return response.ok;
        } catch (error) {
            console.error('Reject booking error:', error);
            return false;
        }
    },

    update: async (bookingId, updateData) => {
        // Note: Backend server.js doesn't seem to have a generic PUT/PATCH update endpoint other than status.
        // Assuming we might need to implement this or just warn.
        // For now, let's log a warning or check if we need to add it.
        // The frontend calls update for editing details. I will add this to the plan or implementation.
        // Let's check server.js again... ONLY PATCH STATUS and POST.
        // I will add a generic PATCH/PUT endpoint to the backend as well to support editing!

        try {
            const response = await fetch(`${BOOKING_SERVICE}/bookings/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            return await response.json();
        } catch (error) {
            console.error('Update booking error:', error);
            return null;
        }
    },

    delete: async (bookingId, adminName, targetName) => {
        try {
            const response = await fetch(`${BOOKING_SERVICE}/bookings/${bookingId}`, {
                method: 'DELETE'
            });
            if (response.ok && adminName && targetName) {
                storage.addLog(adminName, 'Menghapus Pengajuan', targetName);
            }
            return response.ok;
        } catch (error) {
            console.error('Delete booking error:', error);
            return false;
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
