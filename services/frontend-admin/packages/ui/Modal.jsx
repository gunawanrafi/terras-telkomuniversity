import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../core';

export const Modal = ({ isOpen, onClose, title, children, className }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                className={cn(
                    "relative w-full max-w-lg rounded-lg bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200",
                    className
                )}
            >
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-slate-100"
                    >
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};
