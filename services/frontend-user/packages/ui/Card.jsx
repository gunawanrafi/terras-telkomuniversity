import React from 'react';
import { cn } from '../core';

export const Card = ({ className, children, ...props }) => {
    return (
        <div
            className={cn(
                "rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-primary-red/20 hover:shadow-lg",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ className, children, ...props }) => (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ className, children, ...props }) => (
    <h3 className={cn("font-heading font-semibold leading-none tracking-tight", className)} {...props}>
        {children}
    </h3>
);

export const CardContent = ({ className, children, ...props }) => (
    <div className={cn("p-6 pt-0", className)} {...props}>
        {children}
    </div>
);

export const CardFooter = ({ className, children, ...props }) => (
    <div className={cn("flex items-center p-6 pt-0", className)} {...props}>
        {children}
    </div>
);
