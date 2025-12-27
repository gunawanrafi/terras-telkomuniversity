import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../core';

/**
 * ScheduleDatePicker - A specialized date picker for the schedule view
 * Designed to work within a dark header with inline calendar dropdown
 */
export const ScheduleDatePicker = ({
    value,
    onChange,
    className,
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const containerRef = useRef(null);

    // Parse the value (YYYY-MM-DD format) into a Date object
    const selectedDate = value ? new Date(value + 'T00:00:00') : null;

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Update current month when value changes externally
    useEffect(() => {
        if (value) {
            setCurrentMonth(new Date(value + 'T00:00:00'));
        }
    }, [value]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const handleDateSelect = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        onChange(dateString);
        setIsOpen(false);
    };

    const changeDate = (days) => {
        const d = new Date(value + 'T00:00:00');
        d.setDate(d.getDate() + days);
        onChange(d.toISOString().split('T')[0]);
    };

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const isSameDay = (date1, date2) => {
        if (!date1 || !date2) return false;
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const isToday = (date) => {
        return isSameDay(date, new Date());
    };

    const days = getDaysInMonth(currentMonth);
    const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    return (
        <div ref={containerRef} className={cn("relative flex items-center", className)}>
            {/* Navigation: Previous Day */}
            <button
                onClick={() => changeDate(-1)}
                className="p-1 hover:bg-slate-700 rounded-md transition-colors shrink-0"
                type="button"
            >
                <ChevronLeft className="h-3 w-3" />
            </button>

            {/* Date Display with Calendar Icon - Clickable */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-2 min-w-[110px] text-center hover:bg-slate-700 rounded-md transition-colors group"
                type="button"
            >
                <CalendarIcon className="h-3.5 w-3.5 text-slate-400 group-hover:text-white transition-colors" />
                <span className="text-xs font-medium select-none">
                    {formatDate(value)}
                </span>
            </button>

            {/* Navigation: Next Day */}
            <button
                onClick={() => changeDate(1)}
                className="p-1 hover:bg-slate-700 rounded-md transition-colors shrink-0"
                type="button"
            >
                <ChevronRight className="h-3 w-3" />
            </button>

            {/* Calendar Dropdown */}
            {isOpen && (
                <div className="absolute z-50 top-full right-0 mt-2 w-[280px] bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header with Month/Year Navigation */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-3 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={previousMonth}
                            className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="font-semibold text-sm">
                            {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </div>
                        <button
                            type="button"
                            onClick={nextMonth}
                            className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="p-3 bg-gradient-to-br from-slate-50 to-white">
                        {/* Week Day Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {weekDays.map((day) => (
                                <div
                                    key={day}
                                    className="text-center text-[10px] font-semibold text-slate-500 py-1"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((date, index) => {
                                if (!date) {
                                    return <div key={`empty-${index}`} className="aspect-square" />;
                                }

                                const isSelected = isSameDay(date, selectedDate);
                                const isTodayDate = isToday(date);

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleDateSelect(date)}
                                        className={cn(
                                            "aspect-square flex items-center justify-center text-xs rounded-md transition-all font-medium",
                                            "hover:bg-slate-800 hover:text-white hover:scale-110 hover:shadow-md",
                                            isSelected && "bg-slate-900 text-white hover:bg-slate-800 shadow-lg scale-105 ring-2 ring-slate-400",
                                            isTodayDate && !isSelected && "bg-blue-50 text-blue-600 font-bold ring-1 ring-blue-300",
                                            !isSelected && !isTodayDate && "text-slate-700"
                                        )}
                                    >
                                        {date.getDate()}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-3 pt-3 border-t border-slate-200 flex gap-2">
                            <button
                                type="button"
                                onClick={() => handleDateSelect(new Date())}
                                className="flex-1 py-1.5 px-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center justify-center gap-1.5"
                            >
                                <CalendarIcon className="h-3 w-3" />
                                Hari Ini
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

ScheduleDatePicker.displayName = "ScheduleDatePicker";
