import { storage } from './storage';

const API_URL = import.meta.env.VITE_BOOKING_SERVICE || 'http://localhost:3003';

export const bookingService = {
    getAll: async () => {
        try {
            const response = await fetch(`${API_URL}/bookings`);
            if (!response.ok) throw new Error('Failed to fetch bookings');
            return await response.json();
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return [];
        }
    },

    getUserBookings: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/bookings?userId=${userId}`);
            if (!response.ok) throw new Error('Failed to fetch user bookings');
            const bookings = await response.json();
            return bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            return [];
        }
    },

    create: async (bookingData) => {
        try {
            const response = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData),
            });

            // Always return the JSON response, even for errors (409, 400, etc.)
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    },

    approve: async (bookingId, adminId) => {
        try {
            const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'approved', adminId }),
            });

            if (!response.ok) throw new Error('Failed to approve booking');

            await logAdminAction(adminId, 'APPROVE_BOOKING', `Approved booking ID ${bookingId}`);
            return true;
        } catch (error) {
            console.error('Error approving booking:', error);
            return false;
        }
    },

    reject: async (bookingId, adminId, reason) => {
        try {
            const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'rejected', adminId, reason }),
            });

            if (!response.ok) throw new Error('Failed to reject booking');

            await logAdminAction(adminId, 'REJECT_BOOKING', `Rejected booking ID ${bookingId}. Reason: ${reason}`);
            return true;
        } catch (error) {
            console.error('Error rejecting booking:', error);
            return false;
        }
    },

    update: async (bookingId, updateData) => {
        try {
            const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) throw new Error('Failed to update booking');
            return await response.json();
        } catch (error) {
            console.error('Error updating booking:', error);
            return null;
        }
    },

    delete: async (bookingId) => {
        try {
            const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete booking');
            return true;
        } catch (error) {
            console.error('Error deleting booking:', error);
            return false;
        }
    },

    cancel: async (bookingId) => {
        try {
            const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'cancelled' }),
            });

            if (!response.ok) throw new Error('Failed to cancel booking');
            return true;
        } catch (error) {
            console.error('Error cancelling booking:', error);
            return false;
        }
    }
};

async function logAdminAction(adminId, action, details) {
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
