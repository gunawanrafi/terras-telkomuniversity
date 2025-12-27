import React, { useState, useEffect } from 'react';
import { bookingService, useAuth } from '@core';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, Tabs, TabsList, TabsTrigger, TabsContent } from '@ui';
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye, ArrowRight, Check, X, Download, Calendar, FileText } from 'lucide-react';
import { RoomSchedule } from './components/RoomSchedule';

export const AdminApprovals = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
    const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });

    // Modals
    // Modals
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    // Tab state

    // Tab state
    const [activeTab, setActiveTab] = useState('detail');
    const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const all = await bookingService.getAll();
        // Sort by date desc
        all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(all);

        // Update counts
        setCounts({
            pending: all.filter(b => b.status === 'pending').length,
            approved: all.filter(b => b.status === 'approved').length,
            rejected: all.filter(b => b.status === 'rejected').length
        });
    };

    const hasConflict = (booking) => {
        const overlapping = bookings.filter(b =>
            b.id !== booking.id &&
            b.roomId === booking.roomId &&
            b.status === 'approved' &&
            b.startDate === booking.startDate && // Assuming single day check for simplicity
            ((b.startTime < booking.endTime) && (b.endTime > booking.startTime))
        );
        return overlapping.length > 0;
    };

    const getConflicts = (booking) => {
        return bookings.filter(b =>
            b.id !== booking.id &&
            b.roomId === booking.roomId &&
            b.status === 'approved' &&
            b.startDate === booking.startDate &&
            ((b.startTime < booking.endTime) && (b.endTime > booking.startTime))
        );
    };

    const handleApprove = (booking) => {
        if (hasConflict(booking)) {
            setSelectedBooking(booking);
            setIsConflictModalOpen(true);
            return;
        }

        setSelectedBooking(booking);
        setIsApproveModalOpen(true);
    };

    const confirmApprove = async () => {
        if (selectedBooking) {
            const targetName = `${selectedBooking.activityName} (${selectedBooking.roomName})`;
            await bookingService.approve(selectedBooking.id, user.id, user.name, targetName);
            loadData();
            setIsDetailModalOpen(false);
            setIsApproveModalOpen(false);
        }
    };

    const handleRejectClick = (booking) => {
        setSelectedBooking(booking);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const confirmReject = async (e) => {
        e.preventDefault();
        if (selectedBooking && rejectReason) {
            const targetName = `${selectedBooking.activityName} (${selectedBooking.roomName})`;
            await bookingService.reject(selectedBooking.id, user.id, rejectReason, user.name, targetName);
            setIsRejectModalOpen(false);
            setIsDetailModalOpen(false);
            loadData();
        }
    };

    const handleDownload = (booking) => {
        if (!booking.fileData) {
            alert('File tidak ditemukan atau rusak.');
            return;
        }
        const link = document.createElement('a');
        link.href = booking.fileData;
        link.download = booking.fileName || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredBookings = bookings.filter(b => statusFilter === 'all' || b.status === statusFilter);

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            default: return 'warning';
        }
    };

    const formatBookingDate = (start, end) => {
        const formatDate = (dateStr) => {
            return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        };

        if (!end || start === end) {
            return formatDate(start);
        }
        return `${formatDate(start)} - ${formatDate(end)}`;
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <h1 className="text-3xl font-bold font-heading">Persetujuan Peminjaman</h1>

            {/* Counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusCounter
                    label="MENUNGGU PERSETUJUAN"
                    count={counts.pending}
                    description="Sedang direview oleh admin"
                    isActive={statusFilter === 'pending'}
                    onClick={() => setStatusFilter('pending')}
                    color="orange"
                    icon={<Clock />}
                />
                <StatusCounter
                    label="DISETUJUI"
                    count={counts.approved}
                    description="Reservasi aktif siap digunakan"
                    isActive={statusFilter === 'approved'}
                    onClick={() => setStatusFilter('approved')}
                    color="green"
                    icon={<CheckCircle />}
                />
                <StatusCounter
                    label="DITOLAK"
                    count={counts.rejected}
                    description="Cek keterangan untuk alasan"
                    isActive={statusFilter === 'rejected'}
                    onClick={() => setStatusFilter('rejected')}
                    color="red"
                    icon={<XCircle />}
                />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                {['all', 'pending', 'approved', 'rejected'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${statusFilter === status
                            ? 'border-primary-red text-primary-red'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        {status === 'all' && 'Semua Pengajuan'}
                        {status === 'pending' && 'Menunggu'}
                        {status === 'approved' && 'Disetujui'}
                        {status === 'rejected' && 'Ditolak'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <Card className="shadow-sm hover:shadow-sm hover:border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Pemohon</th>
                                <th className="px-6 py-4">Kegiatan & Jenis</th>
                                <th className="px-6 py-4">Ruangan & Gedung</th>
                                <th className="px-6 py-4">Waktu</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                        Tidak ada data pengajuan.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-slate-50 group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{booking.userName}</div>
                                            {/* ID Removed as requested */}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{booking.activityName}</div>
                                            <Badge variant="secondary" className="mt-1 text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 border-none">
                                                {booking.activityType}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">{booking.roomName}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                Gedung {booking.buildingName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-700 font-medium">
                                                {formatBookingDate(booking.startDate, booking.endDate)}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {booking.startTime} - {booking.endTime}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant={getStatusColor(booking.status)} className="capitalize">
                                                {booking.status === 'pending' ? 'Menunggu' : booking.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button size="sm" variant="outline" className="h-8 text-xs border-slate-300 text-slate-600 hover:bg-slate-50" onClick={() => { setSelectedBooking(booking); setIsDetailModalOpen(true); }}>
                                                    <Eye className="mr-1 h-3.5 w-3.5" /> Detail
                                                </Button>
                                                {booking.status === 'pending' && (
                                                    <>
                                                        <Button size="sm" className="bg-green-100 hover:bg-green-200 text-green-700 border border-green-200 h-8 text-xs font-medium" onClick={() => handleApprove(booking)}>
                                                            Setujui
                                                        </Button>
                                                        <Button size="sm" className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 h-8 text-xs font-medium" onClick={() => handleRejectClick(booking)}>
                                                            Tolak
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Detail Modal with Tabs */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => { setIsDetailModalOpen(false); setActiveTab('detail'); }}
                title="Detail Pengajuan"
                className="max-w-3xl"
            >
                {selectedBooking && (
                    <Tabs>
                        {/* Tab Navigation */}
                        <TabsList>
                            <TabsTrigger
                                active={activeTab === 'detail'}
                                onClick={() => setActiveTab('detail')}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Detail
                            </TabsTrigger>
                            <TabsTrigger
                                active={activeTab === 'schedule'}
                                onClick={() => {
                                    setActiveTab('schedule');
                                    setScheduleDate(selectedBooking.startDate);
                                }}
                            >
                                <Calendar className="h-4 w-4 mr-2" />
                                Jadwal Ruangan
                                {hasConflict(selectedBooking) && (
                                    <span className="ml-2 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                        !
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        {/* Detail Tab */}
                        <TabsContent value="detail" activeValue={activeTab}>
                            <div className="space-y-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{selectedBooking.activityName}</h3>
                                        <p className="text-sm text-slate-500">{selectedBooking.activityType}</p>
                                    </div>
                                    <Badge variant={getStatusColor(selectedBooking.status)} className="uppercase tracking-wider text-xs">
                                        {selectedBooking.status}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <div>
                                        <span className="block text-slate-400 text-xs mb-0.5">Pemohon</span>
                                        <span className="font-medium">{selectedBooking.userName}</span>
                                    </div>
                                    <div>
                                        <span className="block text-slate-400 text-xs mb-0.5">Ruangan</span>
                                        <span className="font-medium">{selectedBooking.roomName}</span>
                                    </div>
                                    <div>
                                        <span className="block text-slate-400 text-xs mb-0.5">Tanggal</span>
                                        <span className="font-medium">{formatBookingDate(selectedBooking.startDate, selectedBooking.endDate)}</span>
                                    </div>
                                    <div>
                                        <span className="block text-slate-400 text-xs mb-0.5">Waktu</span>
                                        <span className="font-medium">{selectedBooking.startTime} - {selectedBooking.endTime}</span>
                                    </div>
                                </div>

                                <div>
                                    <span className="block text-slate-500 text-sm font-medium mb-2">Deskripsi Kegiatan</span>
                                    <p className="text-slate-700 text-sm leading-relaxed">{selectedBooking.description}</p>
                                </div>

                                {selectedBooking.status === 'rejected' && selectedBooking.rejectionReason && (
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                        <span className="block text-red-700 text-sm font-bold mb-1">Alasan Penolakan</span>
                                        <p className="text-red-600 text-sm">{selectedBooking.rejectionReason}</p>
                                    </div>
                                )}

                                {selectedBooking.fileName && (
                                    <div>
                                        <span className="block text-slate-500 text-sm font-medium mb-2">Lampiran File</span>
                                        <div
                                            className="flex items-center gap-2 p-3 border rounded-md bg-slate-50 text-sm text-blue-600 hover:underline cursor-pointer hover:bg-slate-100 transition-colors"
                                            onClick={() => handleDownload(selectedBooking)}
                                        >
                                            <Download className="h-4 w-4" />
                                            <span className="font-medium">{selectedBooking.fileName}</span>
                                        </div>
                                    </div>
                                )}

                                {selectedBooking.status === 'pending' && (
                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                        <Button variant="danger" onClick={() => handleRejectClick(selectedBooking)}>
                                            Tolak Pengajuan
                                        </Button>
                                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(selectedBooking)}>
                                            Setujui Pengajuan
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Schedule Tab */}
                        <TabsContent value="schedule" activeValue={activeTab}>
                            <div className="space-y-4">
                                <RoomSchedule
                                    roomId={selectedBooking.roomId}
                                    date={scheduleDate}
                                    highlightedBookingId={selectedBooking.id || selectedBooking._id}
                                    onDateChange={setScheduleDate}
                                />

                                {/* Conflict Status */}
                                {(() => {
                                    const conflicts = getConflicts(selectedBooking);
                                    return conflicts.length > 0 ? (
                                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                                            <div className="flex items-start gap-2">
                                                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="font-bold text-red-800 text-sm">Konflik Terdeteksi</h4>
                                                    <p className="text-red-700 text-sm mt-1">Booking ini bentrok dengan jadwal yang sudah disetujui:</p>
                                                    <ul className="mt-2 space-y-1">
                                                        {conflicts.map(c => (
                                                            <li key={c.id} className="text-red-600 text-xs">
                                                                • {c.activityName} ({c.startTime} - {c.endTime})
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                <p className="text-green-800 text-sm font-medium">✓ Tidak ada konflik jadwal terdeteksi</p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </Modal>

            {/* Approve Modal */}
            <Modal
                isOpen={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                title="Konfirmasi Persetujuan"
            >
                <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg flex gap-3 text-green-800 text-sm">
                        <CheckCircle className="h-5 w-5 shrink-0" />
                        <p>Anda akan menyetujui pengajuan ini. Pastikan jadwal tidak bentrok dan semua persyaratan telah terpenuhi.</p>
                    </div>
                    <p className="text-slate-600 text-sm">
                        Menyetujui kegiatan <strong>{selectedBooking?.activityName}</strong>?
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setIsApproveModalOpen(false)}>Batal</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={confirmApprove}>Ya, Setujui</Button>
                    </div>
                </div>
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                title="Tolak Pengajuan"
            >
                <form onSubmit={confirmReject} className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg flex gap-3 text-red-800 text-sm">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <p>Anda akan menolak pengajuan ini. Mohon sertakan alasan penolakan untuk diketahui oleh pemohon.</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Alasan Penolakan <span className="text-red-500">*</span></label>
                        <textarea
                            required
                            className="w-full h-32 rounded-md border border-slate-300 p-3 text-sm focus:ring-1 focus:ring-red-500 outline-none"
                            placeholder="Contoh: Jadwal bentrok dengan kegiatan fakultas..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Batal</Button>
                        <Button type="submit" variant="danger">Konfirmasi Penolakan</Button>
                    </div>
                </form>
            </Modal>

            {/* Conflict Warning Modal */}
            <Modal
                isOpen={isConflictModalOpen}
                onClose={() => setIsConflictModalOpen(false)}
                title="⚠️ Konflik Jadwal Terdeteksi"
            >
                {selectedBooking && (
                    <div className="space-y-4">
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <div className="flex items-start">
                                <AlertTriangle className="h-6 w-6 text-red-600 mr-3 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-red-800 text-sm">Peringatan: Bentrok Jadwal</h4>
                                    <p className="text-red-700 text-sm mt-1">
                                        Anda tidak dapat menyetujui "<strong>{selectedBooking.activityName}</strong>" karena ruangan ini sedang digunakan pada waktu yang sama.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h5 className="font-medium text-slate-900 mb-2 text-sm">Jadwal yang bentrok:</h5>
                            <div className="space-y-2">
                                {getConflicts(selectedBooking).map(conflict => (
                                    <div key={conflict.id} className="p-3 bg-white border border-slate-200 rounded-md shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h6 className="font-semibold text-sm text-slate-800">{conflict.activityName}</h6>
                                                <p className="text-xs text-slate-500">{conflict.userName}</p>
                                            </div>
                                            <Badge variant="success" className="text-[10px] h-5">APPROVED</Badge>
                                        </div>
                                        <div className="mt-2 flex items-center text-xs text-slate-600 font-medium">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {conflict.startTime} - {conflict.endTime}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsConflictModalOpen(false)}
                            >
                                Tutup
                            </Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => {
                                    setIsConflictModalOpen(false);
                                    setIsDetailModalOpen(true);
                                    setActiveTab('schedule'); // Jump to schedule tab
                                    setScheduleDate(selectedBooking.startDate);
                                }}
                            >
                                <Calendar className="h-4 w-4 mr-2" />
                                Cek Jadwal Ruangan
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const StatusCounter = ({ label, count, description, isActive, onClick, color, icon }) => {
    const variants = {
        green: {
            wrapper: "bg-green-50 border-none",
            label: "text-green-700",
            value: "text-green-800",
            desc: "text-green-600",
            icon: "text-green-600"
        },
        orange: {
            wrapper: "bg-orange-50 border-none",
            label: "text-orange-700",
            value: "text-orange-800",
            desc: "text-orange-600",
            icon: "text-orange-600"
        },
        red: {
            wrapper: "bg-red-50 border-none",
            label: "text-red-700",
            value: "text-red-800",
            desc: "text-red-600",
            icon: "text-red-600"
        }
    };

    const theme = variants[color] || variants.green;

    return (
        <div
            onClick={onClick}
            className={`cursor-pointer overflow-hidden rounded-xl relative h-32 transition-all duration-300 ${theme.wrapper} hover:shadow-md`}
        >
            <div className="p-6 relative z-10 h-full flex flex-col justify-between">
                <div>
                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${isActive ? theme.label : 'text-slate-500'}`}>{label}</h3>
                    <div className={`text-4xl font-bold ${isActive ? theme.value : 'text-slate-800'}`}>{count}</div>
                </div>
                <p className={`text-xs font-medium ${isActive ? theme.desc : 'text-slate-400'}`}>{description}</p>
            </div>
            <div className={`absolute -right-6 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-500 ${isActive ? 'opacity-20' : 'opacity-10'}`}>
                {React.cloneElement(icon, { className: `h-32 w-32 ${theme.icon}` })}
            </div>
        </div>
    );
};
