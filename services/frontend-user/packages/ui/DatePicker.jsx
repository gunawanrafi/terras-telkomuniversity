import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../core';

export const DatePicker = React.forwardRef(({
    label,
    value,
    onChange,
    required,
    className,
    placeholder = "Pilih tanggal...",
    ...props
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const containerRef = useRef(null);
    const inputRef = useRef(null);

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

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleDateSelect = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        onChange({ target: { value: dateString } });
        setIsOpen(false);
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
        <div ref={containerRef} className="w-full space-y-1 relative">
            {label && (
                <label className="text-sm font-medium text-slate-700 block">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    readOnly
                    required={required}
                    value={value ? formatDate(value) : ''}
                    placeholder={placeholder}
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 pr-10 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-red cursor-pointer hover:border-primary-red/50",
                        className
                    )}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded transition-colors"
                >
                    <CalendarIcon className="h-4 w-4 text-slate-500" />
                </button>
            </div>

            {/* Calendar Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-full min-w-[320px] bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header with Month/Year Navigation */}
                    <div className="bg-gradient-to-r from-primary-red to-primary-dark text-white p-3 flex items-center justify-between">
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
                                    className="text-center text-xs font-semibold text-slate-500 py-1"
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
                                            "aspect-square flex items-center justify-center text-sm rounded-md transition-all font-medium",
                                            "hover:bg-primary-red/10 hover:scale-110 hover:shadow-md",
                                            isSelected && "bg-primary-red text-white hover:bg-primary-dark shadow-lg scale-105",
                                            isTodayDate && !isSelected && "bg-blue-50 text-blue-600 font-bold ring-2 ring-blue-200",
                                            !isSelected && !isTodayDate && "text-slate-700"
                                        )}
                                    >
                                        {date.getDate()}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Today Button */}
                        <div className="mt-3 pt-3 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => handleDateSelect(new Date())}
                                className="w-full py-2 px-3 text-xs font-medium text-primary-red hover:bg-primary-red/5 rounded-md transition-colors flex items-center justify-center gap-2"
                            >
                                <CalendarIcon className="h-3.5 w-3.5" />
                                Hari Ini
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

DatePicker.displayName = "DatePicker";
