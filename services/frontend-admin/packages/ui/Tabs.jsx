import React from 'react';
import { cn } from '../core';

export const Tabs = ({ children, className, ...props }) => {
    return (
        <div className={cn("w-full", className)} {...props}>
            {children}
        </div>
    );
};

export const TabsList = ({ children, className, ...props }) => {
    return (
        <div
            className={cn(
                "inline-flex h-10 items-center justify-start rounded-none bg-transparent p-0 text-slate-500 border-b border-slate-200 w-full",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const TabsTrigger = ({ children, active, className, ...props }) => {
    return (
        <button
            type="button"
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-[1px] disabled:pointer-events-none disabled:opacity-50",
                active
                    ? "border-primary-red text-primary-red font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export const TabsContent = ({ children, value, activeValue, className, ...props }) => {
    if (value !== activeValue) return null;

    return (
        <div
            className={cn("mt-4 ring-offset-background focus-visible:outline-none", className)}
            {...props}
        >
            {children}
        </div>
    );
};
