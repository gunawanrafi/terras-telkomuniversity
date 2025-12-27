import { storage } from './storage';

export const roomService = {
    getAll: () => {
        storage.init();
        return storage.get(storage.KEYS.ROOMS) || [];
    },

    getById: (id) => {
        const rooms = roomService.getAll();
        return rooms.find(r => r.id === parseInt(id));
    },

    add: (roomData) => {
        const rooms = roomService.getAll();
        const newId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
        const newRoom = { ...roomData, id: newId };
        rooms.push(newRoom);
        storage.set(storage.KEYS.ROOMS, rooms);

        // Log
        const currentUser = storage.get(storage.KEYS.SESSION);
        if (currentUser) {
            logAdminAction(currentUser.id, 'CREATE_ROOM', `Created room ${newRoom.name}`);
        }
        return newRoom;
    },

    update: (id, roomData) => {
        const rooms = roomService.getAll();
        const index = rooms.findIndex(r => r.id === parseInt(id));
        if (index !== -1) {
            rooms[index] = { ...rooms[index], ...roomData };
            storage.set(storage.KEYS.ROOMS, rooms);

            const currentUser = storage.get(storage.KEYS.SESSION);
            if (currentUser) {
                logAdminAction(currentUser.id, 'UPDATE_ROOM', `Updated room ${rooms[index].name}`);
            }
            return true;
        }
        return false;
    },

    delete: (id) => {
        // Check for active bookings
        const bookings = storage.get(storage.KEYS.BOOKINGS) || [];
        const hasActiveBooking = bookings.some(b =>
            b.roomId === parseInt(id) &&
            (b.status === 'pending' || b.status === 'approved')
        );

        if (hasActiveBooking) {
            return { success: false, message: 'Ruangan tidak dapat dihapus karena masih ada peminjaman aktif' };
        }

        const rooms = roomService.getAll();
        const newRooms = rooms.filter(r => r.id !== parseInt(id));
        storage.set(storage.KEYS.ROOMS, newRooms);

        const currentUser = storage.get(storage.KEYS.SESSION);
        if (currentUser) {
            logAdminAction(currentUser.id, 'DELETE_ROOM', `Deleted room ID ${id}`);
        }
        return { success: true };
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
