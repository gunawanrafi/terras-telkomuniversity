import React, { useState, useRef, useEffect } from 'react';
import { cva } from 'class-variance-authority';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../core';

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary-red text-white hover:bg-primary-dark shadow-sm",
                secondary: "bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200",
                outline: "border border-slate-300 bg-transparent hover:bg-slate-100 text-slate-900",
                ghost: "hover:bg-slate-100 text-slate-700",
                danger: "bg-status-danger text-white hover:bg-red-700",
                link: "text-primary-red underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-10 rounded-md px-8",
                icon: "h-9 w-9",
            },
            fullWidth: {
                true: "w-full",
            }
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export const Button = React.forwardRef(({ className, variant, size, fullWidth, ...props }, ref) => {
    return (
        <button
            className={cn(buttonVariants({ variant, size, fullWidth, className }))}
            ref={ref}
            {...props}
        />
    );
});
Button.displayName = "Button";

export const Input = React.forwardRef(({ className, type, label, ...props }, ref) => {
    return (
        <div className="w-full space-y-1 relative">
            {label && <label className="text-sm font-medium text-slate-700 block">{label}</label>}
            <div className="relative">
                <input
                    type={type}
                    className={cn(
                        "flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-red disabled:cursor-not-allowed disabled:opacity-50",
                        // Add custom styles for date/time inputs to position icon on the right
                        (type === 'date' || type === 'time' || type === 'datetime-local') && "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        </div>
    );
});
Input.displayName = "Input";

// DatePicker Component
export const DatePicker = React.forwardRef(({ className, label, ...props }, ref) => {
    return (
        <div className="w-full space-y-1">
            {label && <label className="text-sm font-medium text-slate-700 block">{label}</label>}
            <input
                type="date"
                className={cn(
                    "flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-red disabled:cursor-not-allowed disabled:opacity-50",
                    "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
                    className
                )}
                ref={ref}
                {...props}
            />
        </div>
    );
});
DatePicker.displayName = "DatePicker";

// TimePicker Component
export const TimePicker = React.forwardRef(({ className, label, ...props }, ref) => {
    return (
        <div className="w-full space-y-1">
            {label && <label className="text-sm font-medium text-slate-700 block">{label}</label>}
            <input
                type="time"
                className={cn(
                    "flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-red disabled:cursor-not-allowed disabled:opacity-50",
                    "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
                    className
                )}
                ref={ref}
                {...props}
            />
        </div>
    );
});
TimePicker.displayName = "TimePicker";
