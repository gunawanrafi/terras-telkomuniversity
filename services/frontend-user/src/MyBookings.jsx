import React, { useState, useEffect, useRef } from 'react';
import { useAuth, bookingService } from '@core';
import { Card, CardContent, Badge, Button, Input, Modal } from '@ui';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Edit2, UploadCloud, FileText, X, Eye, AlertCircle, Trash2 } from 'lucide-react';

export const MyBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({ approved: 0, pending: 0, rejected: 0 });

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [editForm, setEditForm] = useState({
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        activityName: '',
        activityType: '',
        description: '',
        fileName: ''
    });
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Detail Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);

    // Cancel Modal State
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);

    useEffect(() => {
        loadBookings();
    }, [user]);

    const loadBookings = async () => {
        if (user) {
            const userBookings = await bookingService.getUserBookings(user.id);
            setBookings(userBookings);

            const newStats = userBookings.reduce((acc, curr) => {
                if (curr.status === 'approved') acc.approved++;
                else if (curr.status === 'pending') acc.pending++;
                else if (curr.status === 'rejected') acc.rejected++;
                return acc;
            }, { approved: 0, pending: 0, rejected: 0 });
            setStats(newStats);
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            default: return 'warning'; // pending
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'approved': return 'Disetujui';
            case 'rejected': return 'Ditolak';
            default: return 'Menunggu';
        }
    };

    // --- Action Handlers ---
    const handleDetailClick = (booking) => {
        setSelectedBooking(booking);
        setIsDetailModalOpen(true);
    };

    const handleEditClick = (booking) => {
        setEditingBooking(booking);
        setEditForm({
            startDate: booking.startDate,
            endDate: booking.endDate || booking.startDate,
            startTime: booking.startTime,
            endTime: booking.endTime,
            activityName: booking.activityName,
            activityType: booking.activityType,
            description: booking.description,
            fileName: booking.fileName || ''
        });
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (booking) => {
        setBookingToDelete(booking);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (bookingToDelete) {
            await bookingService.delete(bookingToDelete._id || bookingToDelete.id);
            setIsDeleteModalOpen(false);
            setBookingToDelete(null);
            loadBookings();
        }
    };

    const handleCancelClick = (booking) => {
        setBookingToCancel(booking);
        setIsCancelModalOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (bookingToCancel) {
            await bookingService.cancel(bookingToCancel._id || bookingToCancel.id);
            setIsCancelModalOpen(false);
            setBookingToCancel(null);
            loadBookings();
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!editingBooking) return;

        const updateData = {
            startDate: editForm.startDate,
            endDate: editForm.endDate,
            startTime: editForm.startTime,
            endTime: editForm.endTime,
            activityName: editForm.activityName,
            activityType: editForm.activityType,
            description: editForm.description,
            fileName: editForm.fileName
        };

        await bookingService.update(editingBooking._id || editingBooking.id, updateData);
        setIsEditModalOpen(false);
        loadBookings();
    };

    // --- Drag and Drop Handlers ---
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            setEditForm(prev => ({ ...prev, fileName: file.name }));
        }
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            setEditForm(prev => ({ ...prev, fileName: files[0].name }));
        }
    };

    const removeFile = () => {
        setEditForm(prev => ({ ...prev, fileName: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // --- Formatting Helpers ---
    const formatDateRange = (start, end) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        const startDate = new Date(start).toLocaleDateString('id-ID', options);
        if (!end || start === end) return startDate;

        const endDate = new Date(end).toLocaleDateString('id-ID', options);
        return `${startDate} - ${endDate}`;
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold font-heading text-slate-800">Peminjaman Saya</h1>
                <p className="text-slate-500">Kelola dan pantau status peminjaman ruangan Anda.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-green-50 border-none relative overflow-hidden h-32">
                    <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">DISETUJUI</h3>
                            <div className="text-4xl font-bold text-green-800">{stats.approved}</div>
                        </div>
                        <p className="text-xs text-green-600 font-medium">Reservasi aktif siap digunakan</p>
                    </CardContent>
                    <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                        <CheckCircle className="h-32 w-32 text-green-600" />
                    </div>
                </Card>

                <Card className="bg-orange-50 border-none relative overflow-hidden h-32">
                    <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-1">MENUNGGU PERSETUJUAN</h3>
                            <div className="text-4xl font-bold text-orange-800">{stats.pending}</div>
                        </div>
                        <p className="text-xs text-orange-600 font-medium">Sedang direview oleh admin</p>
                    </CardContent>
                    <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                        <Clock className="h-32 w-32 text-orange-600" />
                    </div>
                </Card>

                <Card className="bg-red-50 border-none relative overflow-hidden h-32">
                    <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">DITOLAK</h3>
                            <div className="text-4xl font-bold text-red-800">{stats.rejected}</div>
                        </div>
                        <p className="text-xs text-red-600 font-medium">Cek detail untuk alasan</p>
                    </CardContent>
                    <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                        <XCircle className="h-32 w-32 text-red-600" />
                    </div>
                </Card>
            </div>

            {/* Bookings Table */}
            <Card className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-sm hover:border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">No</th>
                                <th className="px-6 py-4">Nama Kegiatan</th>
                                <th className="px-6 py-4">Ruangan</th>
                                <th className="px-6 py-4">Tanggal & Waktu</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 w-[200px] text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                                <Calendar className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-700 mb-1">Belum ada peminjaman</h3>
                                            <p className="text-sm">Anda belum mengajukan peminjaman ruangan apapun.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking, index) => (
                                    <tr key={booking._id || booking.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{booking.activityName}</div>
                                            <div className="text-xs text-slate-400 mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded border border-slate-200">
                                                {booking.activityType}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-700">{booking.roomName}</div>
                                            <div className="text-xs text-slate-500">{booking.buildingName}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-slate-700">
                                                    {formatDateRange(booking.startDate, booking.endDate)}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {booking.startTime} - {booking.endTime} WIB
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusVariant(booking.status)} className="capitalize shadow-none">
                                                {getStatusLabel(booking.status)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.status === 'pending' ? (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1 px-2 flex items-center justify-center gap-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200 transition-colors text-xs"
                                                        onClick={() => handleEditClick(booking)}
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1 px-2 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 transition-colors text-xs"
                                                        onClick={() => handleDeleteClick(booking)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Hapus
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full px-2 flex items-center justify-center gap-1.5 hover:bg-slate-100 text-slate-600 border-slate-300 transition-colors text-xs"
                                                        onClick={() => handleDetailClick(booking)}
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        Detail
                                                    </Button>
                                                    {booking.status === 'approved' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full px-2 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 transition-colors text-xs"
                                                            onClick={() => handleCancelClick(booking)}
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" />
                                                            Batalkan
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card >

            {/* Detail Modal */}
            < Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Detail Peminjaman"
            >
                {selectedBooking && (
                    <div className="space-y-6">
                        {/* Status Alert for Rejection */}
                        {selectedBooking.status === 'rejected' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start">
                                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-red-800 text-sm">Peminjaman Ditolak</h4>
                                    <p className="text-red-600 text-sm mt-1">{selectedBooking.rejectionReason || 'Tidak ada alasan spesifik.'}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-500 mb-1">Ruangan Digunakan</h4>
                                <div className="text-slate-800 font-bold">{selectedBooking.roomName}</div>
                                <div className="text-sm text-slate-500">{selectedBooking.buildingName}</div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-500 mb-1">Status</h4>
                                <Badge variant={getStatusVariant(selectedBooking.status)}>
                                    {getStatusLabel(selectedBooking.status)}
                                </Badge>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                            <h4 className="text-sm font-semibold text-slate-500 mb-3">Informasi Kegiatan</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-slate-400 text-xs">Nama Kegiatan</span>
                                    <span className="font-medium text-slate-800">{selectedBooking.activityName}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-400 text-xs">Jenis Kegiatan</span>
                                    <span className="font-medium text-slate-800">{selectedBooking.activityType}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-400 text-xs">Tanggal</span>
                                    <span className="font-medium text-slate-800">
                                        {formatDateRange(selectedBooking.startDate, selectedBooking.endDate)}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-slate-400 text-xs">Waktu</span>
                                    <span className="font-medium text-slate-800">
                                        {selectedBooking.startTime} - {selectedBooking.endTime} WIB
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="block text-slate-400 text-xs mb-1">Deskripsi</span>
                                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100">
                                    {selectedBooking.description}
                                </p>
                            </div>
                            {selectedBooking.fileName && (
                                <div className="mt-4">
                                    <span className="block text-slate-400 text-xs mb-1">Lampiran</span>
                                    <div className="flex items-center gap-2 text-sm text-primary-red bg-red-50 px-3 py-2 rounded border border-red-100 w-fit">
                                        <FileText className="h-4 w-4" />
                                        {selectedBooking.fileName}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Modal >

            {/* Edit Modal */}
            < Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Pengajuan Peminjaman"
            >
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Tanggal Awal"
                            required
                            value={editForm.startDate}
                            onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                        <Input
                            type="date"
                            label="Tanggal Akhir"
                            required
                            value={editForm.endDate}
                            onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="time"
                            label="Jam Mulai"
                            required
                            value={editForm.startTime}
                            onChange={(e) => setEditForm(prev => ({ ...prev, startTime: e.target.value }))}
                        />
                        <Input
                            type="time"
                            label="Jam Selesai"
                            required
                            value={editForm.endTime}
                            onChange={(e) => setEditForm(prev => ({ ...prev, endTime: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Jenis Kegiatan</label>
                        <select
                            className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm transition-colors focus:ring-1 focus:ring-primary-red outline-none"
                            value={editForm.activityType}
                            onChange={(e) => setEditForm(prev => ({ ...prev, activityType: e.target.value }))}
                        >
                            <option>Perkuliahan</option>
                            <option>Seminar</option>
                            <option>Workshop</option>
                            <option>Organisasi</option>
                            <option>Lainnya</option>
                        </select>
                    </div>

                    <Input
                        label="Nama Kegiatan"
                        required
                        value={editForm.activityName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, activityName: e.target.value }))}
                    />
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Deskripsi Kegiatan</label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-primary-red outline-none"
                            required
                            value={editForm.description}
                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    {/* Drag and Drop File Upload */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Lampiran Surat</label>
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
                                onChange={handleFileSelect}
                            />
                            {editForm.fileName ? (
                                <div className="flex items-center gap-2 text-primary-red bg-white px-3 py-2 rounded-md shadow-sm border border-red-100">
                                    <FileText className="h-5 w-5" />
                                    <span className="text-sm font-medium">{editForm.fileName}</span>
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
                                        PDF, DOC, atau Image (Maks. 5MB)
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit">
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </Modal >

            {/* Delete Confirmation Modal */}
            < Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Hapus Peminjaman"
                className="max-w-sm"
            >
                <div className="text-center space-y-4 pt-2">
                    <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                        <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">Yakin ingin menghapus?</h4>
                        <p className="text-sm text-slate-500 mt-1">
                            Peminjaman untuk kegiatan <span className="font-medium text-slate-700">{bookingToDelete?.activityName}</span> akan dihapus permanen.
                        </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button
                            fullWidth
                            variant="ghost"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            fullWidth
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleConfirmDelete}
                        >
                            Hapus
                        </Button>
                    </div>
                </div>
            </Modal >

            {/* Cancel Confirmation Modal */}
            < Modal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                title="Batalkan Peminjaman"
                className="max-w-sm"
            >
                <div className="text-center space-y-4 pt-2">
                    <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">Yakin ingin membatalkan?</h4>
                        <p className="text-sm text-slate-500 mt-1">
                            Peminjaman ruangan <span className="font-medium text-slate-700">{bookingToCancel?.roomName}</span> akan dibatalkan.
                        </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button
                            fullWidth
                            variant="ghost"
                            onClick={() => setIsCancelModalOpen(false)}
                        >
                            Kembali
                        </Button>
                        <Button
                            fullWidth
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleConfirmCancel}
                        >
                            Ya, Batalkan
                        </Button>
                    </div>
                </div>
            </Modal >
        </div >
    );
};
