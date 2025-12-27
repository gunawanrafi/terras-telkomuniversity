const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;
const ROOM_SERVICE_URL = process.env.ROOM_SERVICE_URL || 'http://localhost:3002';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/terras_bookings', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected (Booking Service)'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schema
const bookingSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    userName: String,
    roomId: { type: String, required: true }, // Keeping consistent with frontend using IDs
    roomName: String,
    buildingName: String,
    startDate: { type: String, required: true }, // Format YYYY-MM-DD
    endDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    activityName: String,
    activityType: String,
    description: String,
    fileName: String,
    fileData: String, // Base64 encoded file
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
    approvedBy: Number,
    approvedAt: Date,
    rejectedBy: Number,
    rejectionReason: String,
    rejectedAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
});

const Booking = mongoose.model('Booking', bookingSchema);

// Activity Log Schema
const activityLogSchema = new mongoose.Schema({
    activityType: { type: String, required: true }, // 'user_register', 'booking_create', etc.
    actorId: { type: Number, required: true },
    actorName: { type: String, required: true },
    actorRole: { type: String, enum: ['user', 'admin'], required: true },
    action: { type: String, required: true }, // 'membuat', 'menyetujui', 'menolak', etc.
    targetType: { type: String, required: true }, // 'booking', 'room', 'user'
    targetName: String,
    targetId: String,
    details: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

// Helper function to log activity
const logActivity = async (activityData) => {
    try {
        const activity = new ActivityLog(activityData);
        await activity.save();
        return activity;
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

// Routes

// Get all bookings (with filters)
app.get('/bookings', async (req, res) => {
    try {
        const { userId, roomId, status } = req.query;
        const query = {};
        if (userId) query.userId = userId;
        if (roomId) query.roomId = roomId;
        if (status) query.status = status;

        const bookings = await Booking.find(query).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Booking
app.post('/bookings', async (req, res) => {
    try {
        const { roomId, startDate, startTime, endTime } = req.body;

        // 1. Validate Room Existence (Inter-service communication)
        try {
            await axios.get(`${ROOM_SERVICE_URL}/rooms/${roomId}`);
        } catch (error) {
            return res.status(404).json({ message: 'Room not found (verified by Room Service)' });
        }

        // 2. Validate Time Range (05:00 - 22:00)
        const timeToMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);
        const minAllowed = 5 * 60; // 05:00
        const maxAllowed = 22 * 60; // 22:00

        if (startMinutes < minAllowed || startMinutes > maxAllowed) {
            return res.status(400).json({
                message: 'Waktu mulai harus antara 05:00 dan 22:00'
            });
        }

        if (endMinutes < minAllowed || endMinutes > maxAllowed) {
            return res.status(400).json({
                message: 'Waktu selesai harus antara 05:00 dan 22:00'
            });
        }

        if (startMinutes >= endMinutes) {
            return res.status(400).json({
                message: 'Waktu selesai harus lebih besar dari waktu mulai'
            });
        }

        // 3. Check Conflicts (Date Range + Time Slot)
        // Helper function to get all dates in a range
        const getAllDatesInRange = (startDateStr, endDateStr) => {
            const dates = [];
            const current = new Date(startDateStr + 'T00:00:00');
            const end = new Date(endDateStr + 'T00:00:00');

            while (current <= end) {
                dates.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }
            return dates;
        };

        // Get all dates in the requested booking range
        const requestedDates = getAllDatesInRange(req.body.startDate, req.body.endDate);

        // Check for conflicts on each individual day in the range
        for (const date of requestedDates) {
            const conflict = await Booking.findOne({
                roomId,
                status: 'approved',
                // Check if this specific date falls within an existing booking's date range
                startDate: { $lte: date },
                endDate: { $gte: date },
                // Time Slot Overlap check
                $or: [
                    { startTime: { $lt: endTime, $gte: startTime } },
                    { endTime: { $gt: startTime, $lte: endTime } },
                    { startTime: { $lte: startTime }, endTime: { $gte: endTime } } // Encompasses
                ]
            });

            if (conflict) {
                return res.status(409).json({
                    message: 'Room is already booked for this time slot on one or more dates in your range (Verified by Admin)',
                    conflictDetails: {
                        date: date,
                        time: `${conflict.startTime} - ${conflict.endTime}`,
                        conflictingBooking: {
                            dateRange: `${conflict.startDate} - ${conflict.endDate}`,
                            activityName: conflict.activityName
                        }
                    }
                });
            }
        }

        // 4. Validate File (Size & Type)
        if (req.body.fileData) {
            // Approx check: Base64 is 4/3 of original size. 5MB * 1.33 = ~6.6MB
            // Let's be safe and check somewhat accurately or just rely on string length.
            const sizeInBytes = Buffer.byteLength(req.body.fileData, 'base64');
            if (sizeInBytes > 5 * 1024 * 1024) {
                return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
            }

            const allowedExtensions = ['.pdf', '.doc', '.docx'];
            const ext = req.body.fileName ? req.body.fileName.toLowerCase().slice(req.body.fileName.lastIndexOf('.')) : '';
            if (!allowedExtensions.includes(ext)) {
                return res.status(400).json({ message: 'Invalid file format. Only PDF, DOC, and DOCX are allowed.' });
            }
        }

        // 5. Create Booking
        const booking = new Booking(req.body);
        await booking.save();

        // Log Activity
        await logActivity({
            activityType: 'booking_create',
            actorId: booking.userId,
            actorName: booking.userName,
            actorRole: 'user',
            action: 'membuat',
            targetType: 'booking',
            targetName: booking.activityName,
            targetId: booking._id,
            details: {
                roomName: booking.roomName,
                date: booking.startDate,
                time: `${booking.startTime} - ${booking.endTime}`
            }
        });

        res.status(201).json(booking);
    } catch (err) {
        console.error('Create booking error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update Status (Approve/Reject)
app.patch('/bookings/:id/status', async (req, res) => {
    try {
        const { status, adminId, reason } = req.body;
        if (!['approved', 'rejected', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updateData = {
            status,
            updatedAt: new Date()
        };

        if (status === 'approved') {
            updateData.approvedBy = adminId;
            updateData.approvedAt = new Date();
        } else {
            updateData.rejectedBy = adminId;
            updateData.rejectedAt = new Date();
            updateData.rejectionReason = reason;
        }

        const booking = await Booking.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Log Activity
        let action = '';
        if (status === 'approved') action = 'menyetujui';
        else if (status === 'rejected') action = 'menolak';
        else if (status === 'cancelled') action = 'membatalkan';

        // Determine actor role (simplified logic, ideally passed from frontend/auth)
        const actorRole = status === 'cancelled' ? 'user' : 'admin';
        // For admin actions, we might want the admin name. 
        // For now using generic Admin if not provided, or updating request to include adminName
        const actorName = req.body.adminName || (status === 'cancelled' ? booking.userName : 'Admin');

        await logActivity({
            activityType: `booking_${status}`,
            actorId: adminId || booking.userId, // Use adminId if available, else booking user (for cancel)
            actorName: actorName,
            actorRole: actorRole,
            action: action,
            targetType: 'booking',
            targetName: booking.activityName,
            targetId: booking._id,
            details: {
                roomName: booking.roomName,
                status: status,
                reason: reason
            }
        });

        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Booking Details
app.put('/bookings/:id', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete Booking
app.delete('/bookings/:id', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json({ message: 'Booking deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Activity Log Endpoints

// Create Activity Log
app.post('/activities', async (req, res) => {
    try {
        const activity = await logActivity(req.body);
        res.status(201).json(activity);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Activity Logs (with pagination)
app.get('/activities', async (req, res) => {
    try {
        const { limit = 20, skip = 0, actorRole, activityType } = req.query;

        const query = {};
        if (actorRole) query.actorRole = actorRole;
        if (activityType) query.activityType = activityType;

        const activities = await ActivityLog.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await ActivityLog.countDocuments(query);

        res.json({ activities, total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Booking Service running on port ${PORT}`);
});
