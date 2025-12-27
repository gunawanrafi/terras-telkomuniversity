import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../layout/Navbar';

import { Footer } from '../layout/Footer';

export const AppLayout = () => {
    return (
        <div className="min-h-screen bg-slate-light font-sans text-slate-dark flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};
