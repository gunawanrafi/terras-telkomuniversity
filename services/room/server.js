const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/terras_rooms', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected (Room Service)'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const buildingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: String,
    createdAt: { type: Date, default: Date.now }
});

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building' },
    buildingName: String, // Denormalized for easier query
    capacity: Number,
    type: String, // 'Aula', 'Kelas', etc.
    facilities: [String],
    image: String,
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const Building = mongoose.model('Building', buildingSchema);
const Room = mongoose.model('Room', roomSchema);

// Full Data from previous scraping
const RICH_BUILDINGS = [
    { name: 'GSG' },
    { name: 'STUDENT CENTER' },
    { name: 'SPORT CENTER' },
    { name: 'MANTERAWU' },
    { name: 'GEDUNG DAMAR' },
    { name: 'TERAS PRIANGAN' },
    { name: 'GREEN LOUNGE' },
    { name: 'TULT' },
    { name: 'TUCH' },
    { name: 'MARATUA' },
    { name: 'KAWALUSU' },
    { name: 'SELARU' },
    { name: 'SEBATIK' },
    { name: 'BATEK' },
    { name: 'TENNIS HALL' }
];

const RICH_ROOMS = [
    { name: 'Sayap Kanan lantai 3', code: 'GSG-001', buildingName: 'GSG', capacity: 100, type: 'Ruang Serbaguna', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor'], image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800' },
    { name: 'VIP C', code: 'GSG-002', buildingName: 'GSG', capacity: 60, type: 'VIP Room', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'TV', 'Sofa', 'Pantry'], image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800' },
    { name: 'Sayap kiri lantai 3', code: 'GSG-003', buildingName: 'GSG', capacity: 100, type: 'Ruang Serbaguna', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor'], image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800' },
    { name: 'Lapang samping timur GSG', code: 'GSG-004', buildingName: 'GSG', capacity: 600, type: 'Outdoor', facilities: ['Outdoor', 'Tenda', 'Sound System'], image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800' },
    { name: 'Lapangan Upacara', code: 'GSG-005', buildingName: 'GSG', capacity: 3000, type: 'Outdoor', facilities: ['Outdoor', 'Tribun', 'Sound System', 'Lighting'], image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800' },
    { name: 'VIP B', code: 'GSG-006', buildingName: 'GSG', capacity: 60, type: 'VIP Room', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'TV', 'Sofa', 'Pantry'], image: 'https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?w=800' },
    { name: 'VIP A', code: 'GSG-007', buildingName: 'GSG', capacity: 50, type: 'VIP Room', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'TV', 'Sofa', 'Pantry'], image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800' },
    { name: 'Aula Besar Lt 1', code: 'GSG-008', buildingName: 'GSG', capacity: 800, type: 'Aula', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting'], image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800' },
    { name: 'Lapangan Bulutangkis B', code: 'STU-001', buildingName: 'STUDENT CENTER', capacity: 12, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800' },
    { name: 'Lapangan Bulutangkis A', code: 'STU-002', buildingName: 'STUDENT CENTER', capacity: 12, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800' },
    { name: 'Skate Park', code: 'SPO-001', buildingName: 'SPORT CENTER', capacity: 6, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800' },
    { name: 'Lapangan Pickleball', code: 'SPO-002', buildingName: 'SPORT CENTER', capacity: 4, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800' },
    { name: 'Lapangan Basket 3X3 Utara', code: 'SPO-003', buildingName: 'SPORT CENTER', capacity: 5, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800' },
    { name: 'Lapangan Basket 3X3 Selatan', code: 'SPO-004', buildingName: 'SPORT CENTER', capacity: 6, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800' },
    { name: 'Lapangan Panahan', code: 'SPO-005', buildingName: 'SPORT CENTER', capacity: 20, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800' },
    { name: 'Lapangan Basket', code: 'SPO-006', buildingName: 'SPORT CENTER', capacity: 50, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800' },
    { name: 'Lapangan Volley', code: 'SPO-007', buildingName: 'SPORT CENTER', capacity: 50, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800' },
    { name: 'Lapangan Futsal', code: 'SPO-008', buildingName: 'SPORT CENTER', capacity: 50, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800' },
    { name: 'Aula Dekanat', code: 'MAN-001', buildingName: 'MANTERAWU', capacity: 300, type: 'Aula', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting'], image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800' },
    { name: 'Auditorium Gedung Damar', code: 'GED-001', buildingName: 'GEDUNG DAMAR', capacity: 300, type: 'Auditorium', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting'], image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' },
    { name: 'Outdoor Class', code: 'TER-001', buildingName: 'TERAS PRIANGAN', capacity: 100, type: 'Outdoor', facilities: ['Outdoor', 'Tenda', 'Kursi', 'Meja'], image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800' },
    { name: 'Pendopo Priangan', code: 'TER-002', buildingName: 'TERAS PRIANGAN', capacity: 100, type: 'Outdoor', facilities: ['Outdoor', 'Tenda', 'Kursi', 'Meja', 'Sound System'], image: 'https://images.unsplash.com/photo-1519167758481-83f29da8c3a7?w=800' },
    { name: 'Teras Outdoor', code: 'TER-003', buildingName: 'TERAS PRIANGAN', capacity: 300, type: 'Outdoor', facilities: ['Outdoor', 'Tenda', 'Sound System'], image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800' },
    { name: 'Joglo', code: 'TER-004', buildingName: 'TERAS PRIANGAN', capacity: 40, type: 'Outdoor', facilities: ['Outdoor', 'Tenda', 'Kursi', 'Meja'], image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800' },
    { name: 'Taman Green Lounge', code: 'GRE-001', buildingName: 'GREEN LOUNGE', capacity: 50, type: 'Outdoor', facilities: ['Outdoor', 'Tenda', 'Kursi', 'Meja'], image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800' },
    { name: 'Ruangan Green Lounge', code: 'GRE-002', buildingName: 'GREEN LOUNGE', capacity: 20, type: 'Ruang Serbaguna', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor'], image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800' },
    { name: 'Ruang kecil 1605', code: 'TUL-001', buildingName: 'TULT', capacity: 4, type: 'Ruang Rapat', facilities: ['AC', 'Kursi', 'Meja', 'Whiteboard', 'TV'], image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800' },
    { name: 'Area Makan TULT Lt.16', code: 'TUL-002', buildingName: 'TULT', capacity: 50, type: 'Ruang Serbaguna', facilities: ['AC', 'Kursi', 'Meja'], image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800' },
    { name: 'Ruang Rapat 1601', code: 'TUL-003', buildingName: 'TULT', capacity: 20, type: 'Ruang Rapat', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Whiteboard', 'TV'], image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800' },
    { name: 'Ruang Rapat TULT 1604', code: 'TUL-004', buildingName: 'TULT', capacity: 20, type: 'Ruang Rapat', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Whiteboard', 'TV'], image: 'https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?w=800' },
    { name: 'Ruang Rapat TULT 1602', code: 'TUL-005', buildingName: 'TULT', capacity: 20, type: 'Ruang Rapat', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Whiteboard', 'TV'], image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800' },
    { name: 'Auditorium TULT Lantai 16', code: 'TUL-006', buildingName: 'TULT', capacity: 100, type: 'Auditorium', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting'], image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' },
    { name: 'Aula TULT Lt 2', code: 'TUL-007', buildingName: 'TULT', capacity: 400, type: 'Aula', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting'], image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800' },
    { name: 'Convention Hall', code: 'TUC-001', buildingName: 'TUCH', capacity: 3000, type: 'Convention Hall', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting', 'LED Screen'], image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800' },
    { name: 'Aula FEB Lantai 5', code: 'MAR-001', buildingName: 'MARATUA', capacity: 400, type: 'Aula', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting'], image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800' },
    { name: 'Aula FKS Lantai 5', code: 'KAW-001', buildingName: 'KAWALUSU', capacity: 400, type: 'Aula', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting'], image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800' },
    { name: 'Aula FIT Lantai 4', code: 'SEL-001', buildingName: 'SELARU', capacity: 800, type: 'Aula', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting'], image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800' },
    { name: 'Aula FIK Lantai 5', code: 'SEB-001', buildingName: 'SEBATIK', capacity: 400, type: 'Aula', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System', 'Panggung', 'Lighting'], image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800' },
    { name: 'Ruang MULMED Ged. C', code: 'BAT-001', buildingName: 'BATEK', capacity: 80, type: 'Ruang Serbaguna', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System'], image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800' },
    { name: 'Ruang MULMED Ged. A', code: 'BAT-002', buildingName: 'BATEK', capacity: 60, type: 'Ruang Serbaguna', facilities: ['AC', 'Kursi', 'Meja', 'Proyektor', 'Sound System'], image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800' },
    { name: 'Lapangan Tennis B', code: 'TEN-001', buildingName: 'TENNIS HALL', capacity: 10, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800' },
    { name: 'Lapangan Tennis A', code: 'TEN-002', buildingName: 'TENNIS HALL', capacity: 10, type: 'Lapangan', facilities: ['Lapangan', 'Lighting', 'Tribun'], image: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800' }
];

const seedData = async () => {
    try {
        const buildingCount = await Building.countDocuments();
        // If low count (dummy data only), replace with rich data
        if (buildingCount < 5) {
            console.log('Seeding rich data...');

            // Clean existing dummy data
            await Building.deleteMany({});
            await Room.deleteMany({});

            // 1. Insert Buildings
            const buildingsToInsert = RICH_BUILDINGS.map(b => ({
                name: b.name,
                code: b.name.substring(0, 3).toUpperCase() // simple code generation
            }));
            const insertedBuildings = await Building.insertMany(buildingsToInsert);
            console.log(`Seeded ${insertedBuildings.length} buildings.`);

            // 2. Insert Rooms with Relationship
            const roomsToInsert = RICH_ROOMS.map(room => {
                const relatedBuilding = insertedBuildings.find(b => b.name === room.buildingName);
                if (!relatedBuilding) {
                    console.warn(`Building not found for room: ${room.name}`);
                    return null;
                }
                return {
                    name: room.name,
                    code: room.code,
                    buildingId: relatedBuilding._id,
                    buildingName: room.buildingName,
                    capacity: room.capacity,
                    type: room.type,
                    facilities: room.facilities,
                    image: room.image,
                    active: true
                };
            }).filter(r => r !== null);

            await Room.insertMany(roomsToInsert);
            console.log(`Seeded ${roomsToInsert.length} rooms with relationships.`);
        }
    } catch (error) {
        console.error('Seed data error:', error);
    }
};

mongoose.connection.once('open', seedData);

// Building Routes
app.get('/buildings', async (req, res) => {
    try {
        const buildings = await Building.find();
        res.json(buildings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/buildings', async (req, res) => {
    try {
        if (!req.body.name) return res.status(400).json({ message: 'Name is required' });
        const building = new Building(req.body);
        await building.save();
        res.status(201).json(building);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/buildings/:id', async (req, res) => {
    try {
        const building = await Building.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!building) return res.status(404).json({ message: 'Building not found' });
        res.json(building);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/buildings/:id', async (req, res) => {
    try {
        // Optional: Check if rooms exist in this building before delete?
        // For now, allow delete.
        await Building.findByIdAndDelete(req.params.id);
        res.json({ message: 'Building deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Room Routes
app.get('/rooms', async (req, res) => {
    try {
        const { building } = req.query;
        const query = {};
        if (building) query.buildingName = building;

        const rooms = await Room.find(query);
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/rooms/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/rooms', async (req, res) => {
    try {
        // Basic validation
        if (!req.body.name || !req.body.code) {
            return res.status(400).json({ message: 'Name and Code are required' });
        }
        const room = new Room(req.body);
        await room.save();
        res.status(201).json(room);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/rooms/:id', async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(room);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/rooms/:id', async (req, res) => {
    try {
        await Room.findByIdAndDelete(req.params.id);
        res.json({ message: 'Room deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Room Service running on port ${PORT}`);
});
