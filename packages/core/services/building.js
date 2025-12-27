import { storage } from './storage';

export const buildingService = {
    getAll: () => {
        storage.init();
        return storage.get(storage.KEYS.BUILDINGS) || [];
    },

    add: (name) => {
        const buildings = buildingService.getAll();
        // Check duplicate
        if (buildings.some(b => b.name === name)) {
            return { success: false, message: 'Gedung sudah ada' };
        }

        const newId = buildings.length > 0 ? Math.max(...buildings.map(b => b.id)) + 1 : 1;
        const newBuilding = { id: newId, name };
        buildings.push(newBuilding);
        storage.set(storage.KEYS.BUILDINGS, buildings);

        // optional log
        return { success: true, building: newBuilding };
    },

    delete: (name) => {
        const buildings = buildingService.getAll();
        const updatedBuildings = buildings.filter(b => b.name !== name);

        if (updatedBuildings.length === buildings.length) {
            return { success: false, message: 'Gedung tidak ditemukan' };
        }

        storage.set(storage.KEYS.BUILDINGS, updatedBuildings);
        return { success: true };
    },

    update: (oldName, newName) => {
        const buildings = buildingService.getAll();

        // Check if new name already exists (and it's not the same building)
        if (oldName !== newName && buildings.some(b => b.name === newName)) {
            return { success: false, message: 'Nama gedung sudah digunakan' };
        }

        const updatedBuildings = buildings.map(b =>
            b.name === oldName ? { ...b, name: newName } : b
        );

        storage.set(storage.KEYS.BUILDINGS, updatedBuildings);
        return { success: true };
    }
};
