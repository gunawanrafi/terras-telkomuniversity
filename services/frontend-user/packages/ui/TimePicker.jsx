import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { cn } from '../core';

export const TimePicker = React.forwardRef(({
    label,
    value,
    onChange,
    required,
    min = "05:00",
    max = "22:00",
    className,
    placeholder = "Pilih waktu",
    ...props
}, ref) => {
    const [showPicker, setShowPicker] = useState(false);
    const containerRef = useRef(null);

    // Generate hours from 05 to 22 (inclusive)
    const hours = Array.from({ length: 18 }, (_, i) => (i + 5).toString().padStart(2, '0'));
    const minutes = ['00', '15', '30', '45'];

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTimeSelect = (type, selectedValue) => {
        let currentHour = '05';
        let currentMinute = '00';

        if (value) {
            [currentHour, currentMinute] = value.split(':');
        }

        let newTime;
        if (type === 'hour') {
            newTime = `${selectedValue}:${currentMinute}`;
        } else {
            newTime = `${currentHour}:${selectedValue}`;
        }

        // Validate range just in case (though UI restricts it)
        const [h, m] = newTime.split(':').map(Number);
        if (h < 5 || h > 22) return;

        // Simulate event for parent onChange
        onChange({ target: { value: newTime } });
    };

    const [currentHour, currentMinute] = value ? value.split(':') : ['', ''];

    return (
        <div className="w-full space-y-1 relative" ref={containerRef}>
            {label && (
                <label className="text-sm font-medium text-slate-700 block">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div
                className={cn(
                    "relative cursor-pointer group",
                    showPicker && "z-50"
                )}
                onClick={() => setShowPicker(!showPicker)}
            >
                <input
                    type="text"
                    readOnly
                    required={required}
                    value={value || ''}
                    placeholder={placeholder}
                    className={cn(
                        "flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 pr-10 text-sm shadow-sm transition-colors",
                        "placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-red cursor-pointer",
                        showPicker && "border-primary-red ring-1 ring-primary-red",
                        className
                    )}
                    {...props}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center text-slate-400 group-hover:text-slate-600 transition-colors">
                    <Clock className="h-4 w-4" />
                </div>
            </div>

            {showPicker && (
                <div className="absolute top-full left-0 w-48 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                    <div className="grid grid-cols-2 gap-2 h-48">
                        {/* Hours Column */}
                        <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar p-1">
                            <span className="text-xs font-semibold text-slate-500 text-center mb-1 sticky top-0 bg-white">
                                Jam
                            </span>
                            {hours.map((hour) => (
                                <button
                                    key={hour}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTimeSelect('hour', hour);
                                    }}
                                    className={cn(
                                        "px-2 py-1.5 text-sm rounded bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors",
                                        currentHour === hour && "bg-slate-900 text-white hover:bg-slate-800"
                                    )}
                                >
                                    {hour}
                                </button>
                            ))}
                        </div>

                        {/* Minutes Column */}
                        <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar p-1 border-l border-slate-100">
                            <span className="text-xs font-semibold text-slate-500 text-center mb-1 sticky top-0 bg-white">
                                Menit
                            </span>
                            {minutes.map((minute) => (
                                <button
                                    key={minute}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTimeSelect('minute', minute);
                                        // Auto close only if hour is also selected? 
                                        // Better to let user click outside or click again to close
                                        // or close after minute selection if value is complete?
                                        // Let's keep it open for easy adjustment.
                                    }}
                                    className={cn(
                                        "px-2 py-1.5 text-sm rounded bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors",
                                        currentMinute === minute && "bg-slate-900 text-white hover:bg-slate-800"
                                    )}
                                >
                                    {minute}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <p className="text-xs text-slate-500 mt-1">
                Pilih waktu (Jam 05:00 - 22:00)
            </p>
        </div>
    );
});

TimePicker.displayName = "TimePicker";
