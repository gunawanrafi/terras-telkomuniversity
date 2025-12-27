// Mock storage using localStorage
// This will be replaced with actual API calls to backend microservices

const STORAGE_KEYS = {
    USERS: 'terras_users_v1',
    ROOMS: 'terras_rooms_v1',
    BOOKINGS: 'terras_bookings_v1',
    BUILDINGS: 'terras_buildings_v1',
    ADMIN_LOGS: 'terras_admin_logs_v1' // Also adding logs key
};

// Seed data - Real data from LOGAS Telkom University
const SEED_USERS = [
    { id: 1, name: 'John Doe', email: 'john@student.telkomuniversity.ac.id', password: 'user123', role: 'user' },
    { id: 2, name: 'Admin Telkom', email: 'admin@telkomuniversity.ac.id', password: 'admin123', role: 'admin' },
    { id: 3, name: 'Admin TERRAS', email: 'admin@terras.ac.id', password: 'admin123', role: 'admin' },
    { id: 4, name: 'Jane Smith', email: 'jane@student.telkomuniversity.ac.id', password: 'user123', role: 'user' }
];

const SEED_BUILDINGS = [
    { id: 1, name: 'GSG' },
    { id: 2, name: 'STUDENT CENTER' },
    { id: 3, name: 'SPORT CENTER' },
    { id: 4, name: 'MANTERAWU' },
    { id: 5, name: 'GEDUNG DAMAR' },
    { id: 6, name: 'TERAS PRIANGAN' },
    { id: 7, name: 'GREEN LOUNGE' },
    { id: 8, name: 'TULT' },
    { id: 9, name: 'TUCH' },
    { id: 10, name: 'MARATUA' },
    { id: 11, name: 'KAWALUSU' },
    { id: 12, name: 'SELARU' },
    { id: 13, name: 'SEBATIK' },
    { id: 14, name: 'BATEK' },
    { id: 15, name: 'TENNIS HALL' }
];

// Helper function to generate room code
const generateRoomCode = (buildingName, roomName, index) => {
    const buildingCode = buildingName.substring(0, 3).toUpperCase();
    const roomNumber = String(index + 1).padStart(3, '0');
    return `${buildingCode}-${roomNumber}`;
};

// Helper function to assign facilities based on room type and capacity
const assignFacilities = (roomName, capacity) => {
    const facilities = [];

    // Basic facilities for all rooms
    if (capacity >= 20) facilities.push('AC', 'Kursi', 'Meja');
    else facilities.push('Kursi', 'Meja');

    // Auditorium/Aula facilities
    if (roomName.toLowerCase().includes('auditorium') || roomName.toLowerCase().includes('aula')) {
        facilities.push('Proyektor', 'Sound System', 'Panggung', 'Lighting');
    }

    // Meeting room facilities
    if (roomName.toLowerCase().includes('rapat') || roomName.toLowerCase().includes('meeting')) {
        facilities.push('Proyektor', 'Whiteboard', 'TV');
    }

    // Sports facilities
    if (roomName.toLowerCase().includes('lapangan') || roomName.toLowerCase().includes('basket') ||
        roomName.toLowerCase().includes('futsal') || roomName.toLowerCase().includes('volley') ||
        roomName.toLowerCase().includes('tennis') || roomName.toLowerCase().includes('bulutangkis')) {
        return ['Lapangan', 'Lighting', 'Tribun'];
    }

    // Outdoor facilities
    if (roomName.toLowerCase().includes('outdoor') || roomName.toLowerCase().includes('taman') ||
        roomName.toLowerCase().includes('pendopo') || roomName.toLowerCase().includes('joglo')) {
        facilities.push('Outdoor', 'Tenda');
    }

    // Large capacity rooms
    if (capacity >= 100) {
        if (!facilities.includes('Proyektor')) facilities.push('Proyektor');
        if (!facilities.includes('Sound System')) facilities.push('Sound System');
    }

    // VIP rooms
    if (roomName.toLowerCase().includes('vip')) {
        facilities.push('Proyektor', 'TV', 'Sofa', 'Pantry');
    }

    return facilities.length > 0 ? facilities : ['Kursi', 'Meja'];
};

// Helper function to determine room type
const getRoomType = (roomName) => {
    const name = roomName.toLowerCase();

    if (name.includes('auditorium')) return 'Auditorium';
    if (name.includes('aula')) return 'Aula';
    if (name.includes('rapat') || name.includes('meeting')) return 'Ruang Rapat';
    if (name.includes('lapangan')) return 'Lapangan';
    if (name.includes('kelas') || name.includes('class')) return 'Ruang Kelas';
    if (name.includes('lab')) return 'Laboratorium';
    if (name.includes('outdoor') || name.includes('taman')) return 'Outdoor';
    if (name.includes('vip')) return 'VIP Room';
    if (name.includes('convention')) return 'Convention Hall';

    return 'Ruang Serbaguna';
};

// Seed rooms - Real data from LOGAS with dummy data for missing fields
const SEED_ROOMS = [
    // GSG (Gedung Serba Guna)
    { id: 1, name: 'Sayap Kanan lantai 3', code: 'GSG-001', buildingName: 'GSG', capacity: 100, type: 'Ruang Serbaguna', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor'], image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800' },
    { id: 2, name: 'VIP C', code: 'GSG-002', buildingName: 'GSG', capacity: 60, type: 'VIP Room', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'TV', 'Sofa', 'Pantry'], image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800' },
    { id: 3, name: 'Sayap kiri lantai 3', code: 'GSG-003', buildingName: 'GSG', capacity: 100, type: 'Ruang Serbaguna', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor'], image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800' },
    { id: 4, name: 'Lapang samping timur GSG', code: 'GSG-004', buildingName: 'GSG', capacity: 600, type: 'Outdoor', facilities: ['Outdoor', 'Tenda', 'Sound System'], image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800' },
    { id: 5, name: 'Lapangan Upacara', code: 'GSG-005', buildingName: 'GSG', capacity: 3000, type: 'Outdoor', facilities: ['Outdoor', 'Tribun', 'Sound System', 'Lighting'], image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800' },
    { id: 6, name: 'VIP B', code: 'GSG-006', buildingName: 'GSG', capacity: 60, type: 'VIP Room', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'TV', 'Sofa', 'Pantry'], image: 'https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?w=800' },
    { id: 7, name: 'VIP A', code: 'GSG-007', buildingName: 'GSG', capacity: 50, type: 'VIP Room', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'TV', 'Sofa', 'Pantry'], image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800' },
    { id: 8, name: 'Aula Besar Lt 1', code: 'GSG-008', buildingName: 'GSG', capacity: 800, type: 'Aula', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting'], image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800' },

    // STUDENT CENTER
    { id: 9, name: 'Lapangan Bulutangkis B', code: 'STU-001', buildingName: 'STUDENT CENTER', capacity: 12, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800' },
    { id: 10, name: 'Lapangan Bulutangkis A', code: 'STU-002', buildingName: 'STUDENT CENTER', capacity: 12, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800' },

    // SPORT CENTER
    { id: 11, name: 'Skate Park', code: 'SPO-001', buildingName: 'SPORT CENTER', capacity: 6, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800' },
    { id: 12, name: 'Lapangan Pickleball', code: 'SPO-002', buildingName: 'SPORT CENTER', capacity: 4, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800' },
    { id: 13, name: 'Lapangan Basket 3X3 Utara', code: 'SPO-003', buildingName: 'SPORT CENTER', capacity: 5, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800' },
    { id: 14, name: 'Lapangan Basket 3X3 Selatan', code: 'SPO-004', buildingName: 'SPORT CENTER', capacity: 6, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800' },
    { id: 15, name: 'Lapangan Panahan', code: 'SPO-005', buildingName: 'SPORT CENTER', capacity: 20, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800' },
    { id: 16, name: 'Lapangan Basket', code: 'SPO-006', buildingName: 'SPORT CENTER', capacity: 50, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800' },
    { id: 17, name: 'Lapangan Volley', code: 'SPO-007', buildingName: 'SPORT CENTER', capacity: 50, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800' },
    { id: 18, name: 'Lapangan Futsal', code: 'SPO-008', buildingName: 'SPORT CENTER', capacity: 50, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800' },

    // MANTERAWU
    { id: 19, name: 'Aula Dekanat', code: 'MAN-001', buildingName: 'MANTERAWU', capacity: 300, type: 'Aula', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting'], image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800' },

    // GEDUNG DAMAR
    { id: 20, name: 'Auditorium Gedung Damar', code: 'GED-001', buildingName: 'GEDUNG DAMAR', capacity: 300, type: 'Auditorium', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting'], image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' },

    // TERAS PRIANGAN
    { id: 21, name: 'Outdoor Class', code: 'TER-001', buildingName: 'TERAS PRIANGAN', capacity: 100, type: 'Outdoor', facilities: ['Outdoor', 'Tenda', 'Kursi', 'Meja'], image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800' },
    { id: 22, name: 'Pendopo Priangan', code: 'TER-002', buildingName: 'TERAS PRIANGAN', capacity: 100, type: 'Outdoor', facilities: ['Outdoor', 'Tenda', 'Kursi', 'Meja', 'Sound System'], image: 'https://images.unsplash.com/photo-1519167758481-83f29da8c3a7?w=800' },
    { id: 23, name: 'Teras Outdoor', code: 'TER-003', buildingName: 'TERAS PRIANGAN', capacity: 300, type: 'Outdoor', facilities: ['Outdoor', 'Tenda', 'Sound System'], image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800' },
    { id: 24, name: 'Joglo', code: 'TER-004', buildingName: 'TERAS PRIANGAN', capacity: 40, type: 'Outdoor', facilities: ['Outdoor', 'Tenda', 'Kursi', 'Meja'], image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800' },

    // GREEN LOUNGE
    { id: 25, name: 'Taman Green Lounge', code: 'GRE-001', buildingName: 'GREEN LOUNGE', capacity: 50, type: 'Outdoor', facilities: ['Outdoor', 'Tenda', 'Kursi', 'Meja'], image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800' },
    { id: 26, name: 'Ruangan Green Lounge', code: 'GRE-002', buildingName: 'GREEN LOUNGE', capacity: 20, type: 'Ruang Serbaguna', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor'], image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800' },

    // TULT (Telkom University Landmark Tower)
    { id: 27, name: 'Ruang kecil 1605', code: 'TUL-001', buildingName: 'TULT', capacity: 4, type: 'Ruang Rapat', facilities: ['AC', 'Kursi', 'Meja', 'Whiteboard', 'TV'], image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800' },
    { id: 28, name: 'Area Makan TULT Lt.16', code: 'TUL-002', buildingName: 'TULT', capacity: 50, type: 'Ruang Serbaguna', facilities: ['AC', 'Kursi', 'Meja'], image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800' },
    { id: 29, name: 'Ruang Rapat 1601', code: 'TUL-003', buildingName: 'TULT', capacity: 20, type: 'Ruang Rapat', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Whiteboard', 'TV'], image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800' },
    { id: 30, name: 'Ruang Rapat TULT 1604', code: 'TUL-004', buildingName: 'TULT', capacity: 20, type: 'Ruang Rapat', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Whiteboard', 'TV'], image: 'https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?w=800' },
    { id: 31, name: 'Ruang Rapat TULT 1602', code: 'TUL-005', buildingName: 'TULT', capacity: 20, type: 'Ruang Rapat', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Whiteboard', 'TV'], image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800' },
    { id: 32, name: 'Auditorium TULT Lantai 16', code: 'TUL-006', buildingName: 'TULT', capacity: 100, type: 'Auditorium', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting'], image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' },
    { id: 33, name: 'Aula TULT Lt 2', code: 'TUL-007', buildingName: 'TULT', capacity: 400, type: 'Aula', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting'], image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800' },

    // TUCH (Telkom University Convention Hall)
    { id: 34, name: 'Convention Hall', code: 'TUC-001', buildingName: 'TUCH', capacity: 3000, type: 'Convention Hall', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting', 'LED Screen'], image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800' },

    // MARATUA (FEB)
    { id: 35, name: 'Aula FEB Lantai 5', code: 'MAR-001', buildingName: 'MARATUA', capacity: 400, type: 'Aula', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting'], image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800' },

    // KAWALUSU (FKS)
    { id: 36, name: 'Aula FKS Lantai 5', code: 'KAW-001', buildingName: 'KAWALUSU', capacity: 400, type: 'Aula', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting'], image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800' },

    // SELARU (FIT)
    { id: 37, name: 'Aula FIT Lantai 4', code: 'SEL-001', buildingName: 'SELARU', capacity: 800, type: 'Aula', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting'], image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800' },

    // SEBATIK (FIK)
    { id: 38, name: 'Aula FIK Lantai 5', code: 'SEB-001', buildingName: 'SEBATIK', capacity: 400, type: 'Aula', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting'], image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800' },

    // BATEK (BTP)
    { id: 39, name: 'Ruang MULMED Ged. C', code: 'BAT-001', buildingName: 'BATEK', capacity: 80, type: 'Ruang Serbaguna', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System'], image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800' },
    { id: 40, name: 'Ruang MULMED Ged. A', code: 'BAT-002', buildingName: 'BATEK', capacity: 60, type: 'Ruang Serbaguna', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System'], image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800' },

    // TENNIS HALL
    { id: 41, name: 'Lapangan Tennis B', code: 'TEN-001', buildingName: 'TENNIS HALL', capacity: 10, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800' },
    { id: 42, name: 'Lapangan Tennis A', code: 'TEN-002', buildingName: 'TENNIS HALL', capacity: 10, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800' }
];

const SEED_BOOKINGS = [
    {
        id: 1,
        userId: 1,
        userName: 'John Doe',
        roomId: 32,
        roomName: 'Auditorium TULT Lantai 16',
        buildingName: 'TULT',
        activityName: 'Seminar Teknologi AI',
        activityType: 'Seminar',
        startDate: '2025-01-15',
        endDate: '2025-01-15',
        startTime: '09:00',
        endTime: '12:00',
        status: 'approved',
        rejectionReason: null,
        createdAt: '2025-01-10T10:00:00Z'
    },
    {
        id: 2,
        userId: 1,
        userName: 'John Doe',
        roomId: 8,
        roomName: 'Aula Besar Lt 1',
        buildingName: 'GSG',
        activityName: 'Workshop Cloud Computing',
        activityType: 'Workshop',
        startDate: '2025-01-20',
        endDate: '2025-01-20',
        startTime: '13:00',
        endTime: '17:00',
        status: 'pending',
        rejectionReason: null,
        createdAt: '2025-01-12T14:30:00Z'
    }
];

export const storage = {
    KEYS: STORAGE_KEYS,

    init: () => {
        // Initialize with seed data if not exists or if empty
        const initIfNeeded = (key, seedData) => {
            const current = localStorage.getItem(key);
            if (!current) {
                localStorage.setItem(key, JSON.stringify(seedData));
                return;
            }
            try {
                const parsed = JSON.parse(current);
                if (Array.isArray(parsed) && parsed.length === 0) {
                    localStorage.setItem(key, JSON.stringify(seedData));
                }
            } catch (e) {
                localStorage.setItem(key, JSON.stringify(seedData));
            }
        };

        initIfNeeded(STORAGE_KEYS.USERS, SEED_USERS);
        initIfNeeded(STORAGE_KEYS.BUILDINGS, SEED_BUILDINGS);
        initIfNeeded(STORAGE_KEYS.ROOMS, SEED_ROOMS);
        initIfNeeded(STORAGE_KEYS.BOOKINGS, SEED_BOOKINGS);
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
    }
};
