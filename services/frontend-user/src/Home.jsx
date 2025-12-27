import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, roomService, bookingService } from '@core';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Input, Badge, Modal, DatePicker, ScheduleDatePicker, TimePicker } from '@ui';
import { Calendar, Clock, Users, MapPin, Search, Filter, UploadCloud, FileText, X, CheckCircle, ChevronLeft, ChevronRight, CalendarDays, AlertTriangle, AlertCircle } from 'lucide-react';

const RoomSchedule = ({ room, date, setDate, onClose, onBook }) => {
    const [bookings, setBookings] = React.useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            const allBookings = await bookingService.getAll();
            const relevantBookings = allBookings.filter(b =>
                (b.roomId === room._id || b.roomId === room.id) &&
                (date >= b.startDate && date <= b.endDate) &&
                (b.status === 'approved')
            );
            setBookings(relevantBookings);
        };
        fetchBookings();
    }, [room._id, date]);

    const hours = Array.from({ length: 18 }, (_, i) => i + 5); // 05:00 to 22:00

    const changeDate = (days) => {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        setDate(d.toISOString().split('T')[0]);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    return (
        <Card className="h-full flex flex-col border-primary-red/20 shadow-xl overflow-hidden animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-slate-900 text-white p-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <button onClick={onClose} className="hover:bg-slate-700 p-1 rounded-full transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h3 className="font-heading font-bold text-base leading-tight text-white mb-0.5">{room.name}</h3>
                        <p className="text-[10px] text-slate-300">{room.buildingName}</p>
                    </div>
                </div>
                <ScheduleDatePicker
                    value={date}
                    onChange={setDate}
                    className="bg-slate-800 rounded-lg p-0.5"
                />
            </div>

            {/* Timeline Scroll Area */}
            <div className="flex-grow overflow-y-auto relative bg-slate-50 custom-scrollbar">
                {/* Grid */}
                <div className="relative min-h-[600px] w-full">
                    {hours.map(hour => (
                        <div key={hour} className="flex h-10 border-b border-slate-200 w-full group">
                            {/* Time Label */}
                            <div className="w-12 shrink-0 border-r border-slate-200 bg-white sticky left-0 z-10 flex items-start justify-center pt-1">
                                <span className="text-[10px] font-medium text-slate-400 group-hover:text-primary-red transition-colors">
                                    {hour.toString().padStart(2, '0')}:00
                                </span>
                            </div>
                            {/* Slot Content Area */}
                            <div className="flex-grow relative bg-white/50 group-hover:bg-slate-50 transition-colors">
                                <div className="absolute top-1/2 w-full border-t border-slate-100 border-dashed" />
                            </div>
                        </div>
                    ))}

                    {/* Events */}
                    {bookings.map(booking => {
                        const startParts = booking.startTime.split(':');
                        const endParts = booking.endTime.split(':');
                        const startH = parseInt(startParts[0]) + parseInt(startParts[1]) / 60;
                        const endH = parseInt(endParts[0]) + parseInt(endParts[1]) / 60;

                        // Calculate Position: (Hour - 5) * 40px height
                        const top = (startH - 5) * 40;
                        const height = (endH - startH) * 40;

                        if (startH >= 23 || endH <= 5) return null; // Out of view bounds

                        const isApproved = booking.status === 'approved';

                        return (
                            <div
                                key={booking.id}
                                className={`absolute left-14 right-2 rounded-md border-l-4 p-1.5 text-xs shadow-sm z-20 flex flex-col justify-center overflow-hidden transition-all hover:z-30 hover:scale-[1.02] cursor-help
                                    ${isApproved
                                        ? 'bg-red-50 border-red-500 text-red-900 hover:bg-red-100 hover:shadow-md'
                                        : 'bg-amber-50 border-amber-500 text-amber-900 hover:bg-amber-100 hover:shadow-md'
                                    }`}
                                style={{ top: `${top}px`, height: `${height}px`, minHeight: '24px' }}
                            >
                                <div className="font-bold flex items-center justify-between">
                                    <span className="truncate">{booking.startTime} - {booking.endTime}</span>
                                    {isApproved && <CheckCircle className="h-3 w-3 text-red-600" />}
                                </div>
                                <div className="truncate font-semibold">{booking.activityName}</div>
                                <div className="truncate text-[10px] opacity-80">{booking.userName}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Action */}
            <div className="p-3 border-t border-slate-100 bg-white shrink-0">
                <Button fullWidth size="sm" onClick={onBook}>
                    Booking Tanggal Ini
                </Button>
            </div>
        </Card>
    );
};

export const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBuilding, setSelectedBuilding] = useState('All');

    // Schedule View State
    const [viewingScheduleId, setViewingScheduleId] = useState(null);
    const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);

    // Filter State
    const [filterCapacity, setFilterCapacity] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [bookingForm, setBookingForm] = useState({
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        activityName: '',
        activityType: 'Perkuliahan',
        description: '',
        fileName: ''
    });

    // Conflict Modal State
    const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
    const [conflictDetails, setConflictDetails] = useState(null);

    // Alert Modal State
    const [alertState, setAlertState] = useState({
        isOpen: false,
        title: '',
        message: '',
        variant: 'error' // 'error' | 'success' | 'warning'
    });

    const showAlert = (title, message, variant = 'error') => {
        setAlertState({ isOpen: true, title, message, variant });
    };

    // File Upload State
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        // Load Rooms
        const fetchRooms = async () => {
            const allRooms = await roomService.getAll();
            setRooms(allRooms);
            setFilteredRooms(allRooms);
        };
        fetchRooms();
    }, []);

    useEffect(() => {
        // Filter Logic
        let result = rooms;
        if (searchQuery) {
            result = result.filter(r =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.code.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (selectedBuilding !== 'All') {
            result = result.filter(r => r.buildingName === selectedBuilding);
        }
        if (filterCapacity) {
            result = result.filter(r => r.capacity >= parseInt(filterCapacity));
        }
        setFilteredRooms(result);
    }, [searchQuery, selectedBuilding, filterCapacity, rooms]);

    const buildings = ['All', ...new Set(rooms.map(r => r.buildingName))];

    const handleBookClick = (room, prefilledDate = null) => {
        if (!user) {
            window.location.href = '/login/';
            return;
        }
        setSelectedRoom(room);

        // Auto-fill dates
        const initialDate = prefilledDate || '';
        setBookingForm({
            startDate: initialDate,
            endDate: initialDate,
            startTime: '',
            endTime: '',
            activityName: '',
            activityType: 'Perkuliahan',
            description: '',
            fileName: ''
        });

        setIsModalOpen(true);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!user || !selectedRoom) return;

        // Validate Time Range (Start < End)
        if (bookingForm.startTime && bookingForm.endTime && bookingForm.startTime >= bookingForm.endTime) {
            showAlert('Waktu Tidak Valid', 'Waktu selesai harus lebih besar dari waktu mulai.', 'error');
            return;
        }

        const bookingData = {
            userId: user.id,
            userName: user.name,
            roomId: selectedRoom.id || selectedRoom._id,
            roomName: selectedRoom.name,
            buildingName: selectedRoom.buildingName,
            startDate: bookingForm.startDate,
            endDate: bookingForm.endDate,
            startTime: bookingForm.startTime,
            endTime: bookingForm.endTime,
            activityName: bookingForm.activityName,
            activityType: bookingForm.activityType,
            description: bookingForm.description,
            fileName: bookingForm.fileName,
            fileData: bookingForm.fileData
        };

        try {
            const response = await bookingService.create(bookingData);

            // Check if response contains an error message (if create doesn't throw but returns logic error)
            // But bookingService.create throws if fetch fails, let's verify if server returns < 200-299.
            // My booking.js implementation throws: "throw error".
            // However, fetch with 409 status doesn't strictly throw in standard fetch unless caught.
            // Let's verify booking.js creation.
            // It does: `const response = await fetch(...); return await response.json();`
            // It does NOT check response.ok! So it won't throw on 409. It returns the json.

            if (response.message && !response.id && !response._id) {
                // Assumption: specific error structure. Backend returns { message: ... } on error. Success has id.
                if (response.message.includes('booked')) {
                    setConflictDetails({
                        message: response.message,
                        date: response.conflictDetails ? response.conflictDetails.date : bookingForm.startDate,
                        time: response.conflictDetails ? response.conflictDetails.time : `${bookingForm.startTime} - ${bookingForm.endTime}`,
                        roomId: selectedRoom.id || selectedRoom._id
                    });

                    setIsConflictModalOpen(true);
                } else {
                    showAlert('Gagal Booking', response.message || 'Terjadi kesalahan sistem.');
                }
                return;
            }

            // Success
            setIsModalOpen(false);
            showAlert('Berhasil', 'Pengajuan booking Anda berhasil dibuat.', 'success');

            setBookingForm({
                startDate: '', endDate: '', startTime: '', endTime: '', activityName: '', activityType: 'Perkuliahan', description: '', fileName: '', fileData: ''
            });
            setTimeout(() => {
                navigate('/my-bookings');
            }, 1500); // Delay navigation to let user see success modal

        } catch (error) {
            console.error(error);
            showAlert('Error', 'Terjadi kesalahan saat mengajukan booking. Silakan coba lagi.');
        }
    };

    // Drag and Drop Handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const processFile = (file) => {
        if (file) {
            // Validation: Max 5MB
            if (file.size > 5 * 1024 * 1024) {
                showAlert('File Terlalu Besar', 'Maksimal ukuran file adalah 5MB.');
                return;
            }

            // Validation: Type (PDF, DOC, DOCX)
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            const allowedExts = ['.pdf', '.doc', '.docx'];
            const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

            if (!allowedTypes.includes(file.type) && !allowedExts.includes(fileExt)) {
                showAlert('Format File Tidak Valid', 'Hanya file PDF, DOC, dan DOCX yang diperbolehkan.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setBookingForm(prev => ({
                    ...prev,
                    fileName: file.name,
                    fileData: reader.result // Base64 string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    const removeFile = () => {
        setBookingForm(prev => ({ ...prev, fileName: '', fileData: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleViewScheduleFromConflict = () => {
        setIsConflictModalOpen(false);
        setIsModalOpen(false);
        if (conflictDetails && conflictDetails.roomId) {
            setViewingScheduleId(conflictDetails.roomId);
            // If the conflict is a range, just jump to the start date for simplicity or current date
            // The user wants to see the schedule, so let's set it to the booking start date
            setScheduleDate(bookingForm.startDate);
        }
    };

    return (
        <div className="min-h-screen pb-20">

            {/* Hero Wrapper containing Hero Image and Floating Filter */}
            <div className="relative mb-48 md:mb-52 lg:mb-40">
                {/* Hero Section */}
                <section className="relative -mt-8 h-[700px] w-full overflow-hidden bg-slate-900 text-white">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('/hero-bg.png')` }}
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative container mx-auto flex h-full flex-col justify-center px-4 items-center text-center pb-20">
                        <h1 className="text-4xl font-bold font-heading md:text-6xl drop-shadow-md text-white">
                            TERRAS - Room Booking System <br /> Telkom University
                        </h1>
                    </div>
                </section>

                {/* Floating Filter Bar */}
                <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-1/2">
                    <section className="container mx-auto px-4">
                        <Card className="p-8 shadow-2xl border-none rounded-3xl bg-white/95 backdrop-blur-sm">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                                {/* Search: Dominant Proportion */}
                                <div className="space-y-2 lg:col-span-5">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Search className="h-4 w-4 text-primary-red" />
                                        Cari Ruangan <span className="text-slate-400 font-normal text-xs">(Opsional)</span>
                                    </label>
                                    <Input
                                        placeholder="Ketik nama atau kode ruangan..."
                                        className="pl-4 h-11 text-base border-slate-200 focus:border-primary-red focus:ring-primary-red rounded-xl"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {/* Filter: Gedung */}
                                <div className="space-y-2 lg:col-span-3">
                                    <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> Gedung
                                    </label>
                                    <select
                                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-red"
                                        value={selectedBuilding}
                                        onChange={(e) => setSelectedBuilding(e.target.value)}
                                    >
                                        {buildings.map(b => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filter: Kapasitas */}
                                <div className="space-y-2 lg:col-span-2">
                                    <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                                        <Users className="h-4 w-4" /> Kapasitas
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="Min..."
                                        className="h-11 rounded-xl focus:border-primary-red focus:ring-primary-red bg-slate-50 border-slate-200"
                                        min="1"
                                        value={filterCapacity}
                                        onChange={(e) => setFilterCapacity(e.target.value)}
                                    />
                                </div>

                                {/* Action Button */}
                                <Button className="lg:col-span-2 h-11 w-full bg-primary-red hover:bg-primary-dark text-white font-bold transition-colors duration-300 rounded-xl shadow-lg shadow-primary-red/30">
                                    Cari
                                </Button>
                            </div>
                        </Card>
                    </section>
                </div>
            </div>

            {/* Room Grid */}
            <section className="container mx-auto px-4 pb-12 mt-8">
                <h2 className="mb-6 text-2xl font-bold text-slate-800">Daftar Ruangan Tersedia</h2>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredRooms.map(room => (
                        <div key={room._id} className="relative h-[520px]">
                            {viewingScheduleId === room._id ? (
                                <RoomSchedule
                                    room={room}
                                    date={scheduleDate}
                                    setDate={setScheduleDate}
                                    onClose={() => setViewingScheduleId(null)}
                                    onBook={() => handleBookClick(room, scheduleDate)}
                                />
                            ) : (
                                <Card className="group overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
                                    <div className="aspect-video w-full overflow-hidden bg-slate-100 relative shrink-0">
                                        <img
                                            src={room.image}
                                            alt={room.name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <Badge variant="secondary" className="absolute top-3 right-3 backdrop-blur-md bg-white/90 shadow-sm border-none text-xs font-semibold px-2.5 py-1">
                                            {room.type}
                                        </Badge>
                                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                            <MapPin className="h-3 w-3" />
                                            {room.buildingName}
                                        </div>
                                    </div>
                                    <CardHeader className="pb-2 pt-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="text-xs font-bold text-primary-red bg-red-50 px-2 py-0.5 rounded border border-red-100 inline-block">
                                                {room.code}
                                            </div>
                                        </div>
                                        <CardTitle className="text-lg leading-tight group-hover:text-primary-red transition-colors">
                                            {room.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-2 flex-grow">
                                        <div className="flex gap-4 text-sm text-slate-600 mb-3">
                                            <div className="flex items-center">
                                                <Users className="mr-1.5 h-4 w-4 text-slate-400" /> {room.capacity} Org
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {room.facilities.slice(0, 5).map((fac, idx) => (
                                                <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
                                                    {fac}
                                                </span>
                                            ))}
                                            {room.facilities.length > 5 && (
                                                <span className="text-[10px] text-slate-500 px-1 self-center">+{room.facilities.length - 5}</span>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="mt-auto mb-4 border-t border-slate-50">
                                        <div className="w-full flex flex-col gap-2">
                                            {/* Primary Action: Cek Jadwal */}
                                            <Button
                                                fullWidth
                                                onClick={() => {
                                                    setViewingScheduleId(room._id);
                                                    setScheduleDate(new Date().toISOString().split('T')[0]);
                                                }}
                                                className="flex items-center justify-center gap-2"
                                            >
                                                <CalendarDays className="h-4 w-4" />
                                                Cek Jadwal
                                            </Button>
                                            {/* Secondary Action: Quick Booking */}
                                            <button
                                                onClick={() => handleBookClick(room)}
                                                className="w-full px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border-2 border-slate-300 hover:border-slate-400 rounded-lg transition-colors"
                                            >
                                                Booking Langsung
                                            </button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            )}
                        </div>
                    ))}
                </div>
                {filteredRooms.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        Tidak ada ruangan yang ditemukan sesuai filter.
                    </div>
                )}
            </section>

            {/* Booking Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Booking ${selectedRoom?.name}`}
            >
                {selectedRoom && (
                    <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100 flex gap-4">
                        <div className="h-20 w-32 bg-slate-200 rounded-md overflow-hidden shrink-0">
                            <img src={selectedRoom.image} alt={selectedRoom.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs font-bold text-primary-red">{selectedRoom.code}</div>
                            <h4 className="font-bold text-slate-800">{selectedRoom.name}</h4>
                            <div className="flex gap-1 flex-wrap">
                                {selectedRoom.facilities.map((fac, i) => (
                                    <span key={i} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                                        {fac}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <DatePicker
                            label="Tanggal Awal"
                            required
                            value={bookingForm.startDate}
                            onChange={(e) => {
                                const newDate = e.target.value;
                                setBookingForm(prev => ({
                                    ...prev,
                                    startDate: newDate,
                                    endDate: prev.endDate ? prev.endDate : newDate
                                }));
                            }}
                        />
                        <DatePicker
                            label="Tanggal Akhir"
                            required
                            value={bookingForm.endDate}
                            onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <TimePicker
                            label="Jam Mulai"
                            required
                            value={bookingForm.startTime}
                            onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                            min="05:00"
                            max="22:00"
                        />
                        <TimePicker
                            label="Jam Selesai"
                            required
                            value={bookingForm.endTime}
                            onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                            min="05:00"
                            max="22:00"
                        />
                    </div>

                    <Input
                        label="Nama Kegiatan"
                        placeholder="contoh: Rapat Mingguan Himpunan"
                        required
                        value={bookingForm.activityName}
                        onChange={(e) => setBookingForm({ ...bookingForm, activityName: e.target.value })}
                    />

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Jenis Kegiatan</label>
                        <select
                            className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm transition-colors focus:ring-1 focus:ring-primary-red outline-none"
                            value={bookingForm.activityType}
                            onChange={(e) => setBookingForm({ ...bookingForm, activityType: e.target.value })}
                        >
                            <option>Perkuliahan</option>
                            <option>Seminar</option>
                            <option>Workshop</option>
                            <option>Organisasi</option>
                            <option>Lainnya</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Deskripsi Kegiatan</label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-primary-red outline-none"
                            placeholder="Jelaskan detail kegiatan..."
                            required
                            value={bookingForm.description}
                            onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                        />
                    </div>

                    {/* Drag and Drop File Upload */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Lampiran Surat (Opsional)</label>
                        <div
                            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors ${isDragging ? 'border-primary-red bg-red-50' : 'border-slate-300 hover:border-primary-red/50 hover:bg-slate-50'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileSelect}
                            />

                            {bookingForm.fileName ? (
                                <div className="flex items-center gap-2 text-primary-red bg-white px-3 py-2 rounded-md shadow-sm border border-red-100">
                                    <FileText className="h-5 w-5" />
                                    <span className="text-sm font-medium">{bookingForm.fileName}</span>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                                        className="ml-2 p-1 hover:bg-red-50 rounded-full"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-slate-100 p-3 rounded-full mb-3">
                                        <UploadCloud className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">
                                        Klik untuk upload atau drag & drop
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        PDF atau DOC/DOCX (Maks. 5MB)
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit">
                            Ajukan Peminjaman
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Conflict Warning Modal */}
            <Modal
                isOpen={isConflictModalOpen}
                onClose={() => setIsConflictModalOpen(false)}
                title="Jadwal Tidak Tersedia"
                className="max-w-sm"
            >
                <div className="text-center space-y-4 pt-2">
                    <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                        <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">Ruangan Sudah Dipesan</h4>
                        <p className="text-sm text-slate-500 mt-2">
                            Pada waktu yang Anda pilih, ruangan ini sudah terbooking.
                        </p>
                        {conflictDetails && (
                            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mt-3 text-sm text-left">
                                <div className="flex justify-between mb-1">
                                    <span className="text-slate-500 text-xs">Tanggal:</span>
                                    <span className="font-medium text-slate-700 max-w-[65%] text-right">{conflictDetails.date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-xs">Waktu:</span>
                                    <span className="font-medium text-slate-700">{conflictDetails.time}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button
                            fullWidth
                            variant="ghost"
                            onClick={() => setIsConflictModalOpen(false)}
                        >
                            Tutup
                        </Button>
                        <Button
                            fullWidth
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={handleViewScheduleFromConflict}
                        >
                            Cek Jadwal
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Alert Modal */}
            <Modal
                isOpen={alertState.isOpen}
                onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                title={alertState.title}
            >
                <div className="space-y-4">
                    <div className={`p-4 rounded border-l-4 ${alertState.variant === 'error' ? 'bg-red-50 border-red-500 text-red-700' :
                        alertState.variant === 'success' ? 'bg-green-50 border-green-500 text-green-700' :
                            'bg-orange-50 border-orange-500 text-orange-700'
                        }`}>
                        <div className="flex items-start">
                            {alertState.variant === 'error' && <AlertCircle className="h-5 w-5 mr-3 mt-0.5 shrink-0" />}
                            {alertState.variant === 'success' && <CheckCircle className="h-5 w-5 mr-3 mt-0.5 shrink-0" />}
                            {alertState.variant === 'warning' && <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 shrink-0" />}
                            <div>
                                <h4 className="font-bold text-sm mb-1">
                                    {alertState.variant === 'error' ? 'Kesalahan' :
                                        alertState.variant === 'success' ? 'Berhasil' : 'Peringatan'}
                                </h4>
                                <p className="text-sm">{alertState.message}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={() => setAlertState(prev => ({ ...prev, isOpen: false }))}>
                            Tutup
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
