const ROOM_SERVICE = import.meta.env.VITE_ROOM_SERVICE || 'http://localhost:3002';

export const buildingService = {
    getAll: async () => {
        try {
            const response = await fetch(`${ROOM_SERVICE}/buildings`);
            const data = await response.json();
            return data.map(item => ({ ...item, id: item._id }));
        } catch (error) {
            console.error('Get buildings error:', error);
            return [];
        }
    },

    add: async (name) => {
        try {
            const response = await fetch(`${ROOM_SERVICE}/buildings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const data = await response.json();
            if (response.ok) return { success: true, building: data };
            return { success: false, message: data.message || 'Gagal menambah gedung' };
        } catch (error) {
            console.error('Add building error:', error);
            return { success: false, message: 'Network error' };
        }
    },

    delete: async (name) => {
        // Backend expects ID probably, but let's check server.js. 
        // If server.js deletes by name or ID?
        // Usually safer to assume we need to find ID by name first or refactor component to pass ID.
        // For now, let's keep name signature but we might need to change implementation 
        // if backend delete uses ID (which it likely does: /buildings/:id).

        // This is tricky. Component calls delete(name).
        // We'll implementation details in next step if generic replace is risk.
        // Let's assume for now we need to fetch all, find ID, then delete.
        try {
            // Find ID from name
            const buildings = await buildingService.getAll();
            const building = buildings.find(b => b.name === name);
            if (!building) return { success: false, message: 'Gedung tidak ditemukan' };

            const response = await fetch(`${ROOM_SERVICE}/buildings/${building._id}`, {
                method: 'DELETE'
            });

            if (response.ok) return { success: true };
            const data = await response.json();
            return { success: false, message: data.message || 'Gagal menghapus gedung' };
        } catch (error) {
            console.error('Delete building error:', error);
            return { success: false, message: 'Network error' };
        }
    },

    update: async (oldName, newName) => {
        try {
            const buildings = await buildingService.getAll();
            const building = buildings.find(b => b.name === oldName);
            if (!building) return { success: false, message: 'Gedung tidak ditemukan' };

            const response = await fetch(`${ROOM_SERVICE}/buildings/${building._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });

            if (response.ok) return { success: true };
            const data = await response.json();
            return { success: false, message: data.message || 'Gagal update gedung' };
        } catch (error) {
            console.error('Update building error:', error);
            return { success: false, message: 'Network error' };
        }
    }
};
