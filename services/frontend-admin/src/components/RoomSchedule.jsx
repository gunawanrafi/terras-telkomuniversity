import React, { useState, useEffect } from 'react';
import { bookingService, roomService } from '@core';
import { Card } from '@ui';
import { CheckCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export const RoomSchedule = ({ roomId, date, highlightedBookingId, onDateChange }) => {
    const [bookings, setBookings] = useState([]);
    const [room, setRoom] = useState(null);
    const [currentDate, setCurrentDate] = useState(date);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch room details
            const allRooms = await roomService.getAll();
            const foundRoom = allRooms.find(r => r._id === roomId || r.id === roomId);
            setRoom(foundRoom);

            // Fetch bookings for this room and date
            const allBookings = await bookingService.getAll();
            const relevantBookings = allBookings.filter(b =>
                (b.roomId === roomId) &&
                (currentDate >= b.startDate && currentDate <= b.endDate) &&
                (b.status === 'approved' || b.id === highlightedBookingId || b._id === highlightedBookingId)
            );
            setBookings(relevantBookings);
        };
        fetchData();
    }, [roomId, currentDate, highlightedBookingId]);

    const hours = Array.from({ length: 18 }, (_, i) => i + 5); // 05:00 to 22:00

    const changeDate = (days) => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + days);
        const newDate = d.toISOString().split('T')[0];
        setCurrentDate(newDate);
        if (onDateChange) onDateChange(newDate);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    if (!room) {
        return <div className="text-center py-8 text-slate-500">Loading schedule...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Room Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-900">{room.name}</h3>
                    <p className="text-sm text-slate-500">{room.buildingName}</p>
                </div>
                <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
                    <button
                        onClick={() => changeDate(-1)}
                        className="p-1.5 hover:bg-white rounded-md transition-colors"
                        type="button"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1.5 px-3">
                        <CalendarIcon className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-sm font-medium min-w-[100px] text-center">
                            {formatDate(currentDate)}
                        </span>
                    </div>
                    <button
                        onClick={() => changeDate(1)}
                        className="p-1.5 hover:bg-white rounded-md transition-colors"
                        type="button"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Timeline */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                <div className="relative min-h-[400px] max-h-[500px] overflow-y-auto custom-scrollbar">
                    {hours.map(hour => (
                        <div key={hour} className="flex h-12 border-b border-slate-200 last:border-b-0 group">
                            {/* Time Label */}
                            <div className="w-16 shrink-0 border-r border-slate-200 bg-white sticky left-0 z-10 flex items-center justify-center">
                                <span className="text-xs font-medium text-slate-500">
                                    {hour.toString().padStart(2, '0')}:00
                                </span>
                            </div>
                            {/* Slot Area */}
                            <div className="flex-grow relative bg-white group-hover:bg-slate-50 transition-colors">
                                <div className="absolute top-1/2 w-full border-t border-slate-100 border-dashed" />
                            </div>
                        </div>
                    ))}

                    {/* Booking Blocks */}
                    {bookings.map(booking => {
                        const startParts = booking.startTime.split(':');
                        const endParts = booking.endTime.split(':');
                        const startH = parseInt(startParts[0]) + parseInt(startParts[1]) / 60;
                        const endH = parseInt(endParts[0]) + parseInt(endParts[1]) / 60;

                        const top = (startH - 5) * 48; // 48px per hour
                        const height = (endH - startH) * 48;

                        if (startH >= 23 || endH <= 5) return null;

                        const isHighlighted = booking.id === highlightedBookingId || booking._id === highlightedBookingId;
                        const isApproved = booking.status === 'approved';

                        return (
                            <div
                                key={booking.id || booking._id}
                                className={`absolute left-16 right-2 rounded-md p-2 text-xs shadow-md z-20 flex flex-col justify-center overflow-hidden transition-all
                                    ${isHighlighted
                                        ? 'bg-amber-100 border-2 border-amber-500 text-amber-900 ring-4 ring-amber-200'
                                        : isApproved
                                            ? 'bg-red-50 border-l-4 border-red-500 text-red-900'
                                            : 'bg-blue-50 border-l-4 border-blue-500 text-blue-900'
                                    }`}
                                style={{ top: `${top}px`, height: `${height}px`, minHeight: '32px' }}
                            >
                                {isHighlighted && (
                                    <div className="absolute -top-2 right-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                        SEDANG DITINJAU
                                    </div>
                                )}
                                <div className="font-bold flex items-center justify-between">
                                    <span>{booking.startTime} - {booking.endTime}</span>
                                    {isApproved && <CheckCircle className="h-3 w-3" />}
                                </div>
                                <div className="font-semibold truncate">{booking.activityName}</div>
                                <div className="text-[10px] opacity-80 truncate">{booking.userName}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
