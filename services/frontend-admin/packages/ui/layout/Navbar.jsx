import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../core';
import { Button } from '../FormElements';
import { Modal } from '../Modal';
import { LogOut, User, ChevronDown, Menu, X } from 'lucide-react';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
        setIsDropdownOpen(false);
    };

    const confirmLogout = () => {
        logout();
        window.location.href = '/login/';
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const NavLink = ({ to, children }) => {
        const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

        const currentIsAdmin = location.pathname.startsWith('/admin');
        const targetIsAdmin = to.startsWith('/admin');

        // Context Switch Logic:
        // 1. User App -> Admin App (Use <a> to load admin/index.html)
        // 2. Admin App -> User App (Use <a> to load index.html)
        // 3. Admin App -> Admin App (Use <Link> for SPA routing)
        // 4. User App -> User App (Use <Link> for SPA routing)
        const isContextSwitch = (currentIsAdmin && !targetIsAdmin) || (!currentIsAdmin && targetIsAdmin);

        if (isContextSwitch) {
            return (
                <a
                    href={to}
                    className={`text-sm font-medium transition-all duration-200 relative py-1 ${isActive ? 'text-primary-red' : 'text-slate-600 hover:text-primary-red'
                        }`}
                >
                    {children}
                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary-red transform transition-transform duration-200 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0'
                        }`} />
                </a>
            );
        }

        return (
            <Link
                to={to}
                className={`text-sm font-medium transition-all duration-200 relative py-1 ${isActive ? 'text-primary-red' : 'text-slate-600 hover:text-primary-red'
                    }`}
            >
                {children}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary-red transform transition-transform duration-200 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0'
                    }`} />
            </Link>
        );
    };

    return (
        <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center px-4 relative">
                {/* Left: Logo */}
                <div className="flex items-center gap-2 flex-1">
                    <div className="h-8 w-8 rounded bg-primary-red flex items-center justify-center text-white font-bold font-heading">
                        T
                    </div>
                    {location.pathname.startsWith('/admin') ? (
                        <a href="/" className="text-xl font-bold font-heading text-primary-red">TERRAS</a>
                    ) : (
                        <Link to="/" className="text-xl font-bold font-heading text-primary-red">TERRAS</Link>
                    )}
                </div>

                {/* Center: Navigation Links */}
                <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    {(!user || user.role !== 'admin') && (
                        <NavLink to="/">Home</NavLink>
                    )}
                    {user && user.role !== 'admin' && (
                        <NavLink to="/my-bookings">Peminjaman Saya</NavLink>
                    )}
                    {user && user.role === 'admin' && (
                        <>
                            <NavLink to="/admin/dashboard">Dashboard</NavLink>
                            <NavLink to="/admin/approvals">Persetujuan</NavLink>
                            <NavLink to="/admin/rooms">Kelola Ruangan</NavLink>
                            <NavLink to="/admin/users">Kelola User</NavLink>
                        </>
                    )}
                </div>

                {/* Right: User Profile / Login */}
                <div className="flex items-center justify-end gap-4 flex-1">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6 text-slate-700" />
                        ) : (
                            <Menu className="h-6 w-6 text-slate-700" />
                        )}
                    </button>

                    {/* Desktop User Section */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <>
                                <div className="relative ml-2" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-3 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors focus:outline-none"
                                    >
                                        <div className="flex flex-col items-end mr-1">
                                            <span className="text-sm font-semibold text-slate-700 leading-tight">{user.name}</span>
                                        </div>
                                        <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                            <User className="h-5 w-5 text-slate-600" />
                                        </div>
                                        <ChevronDown
                                            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50">
                                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Signed in as</p>
                                                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                                            </div>
                                            <button
                                                onClick={handleLogoutClick}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Log out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <a href={`${import.meta.env.VITE_AUTH_APP_URL}/`}>
                                <Button>Login</Button>
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Slide-in */}
            <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded bg-primary-red flex items-center justify-center text-white font-bold font-heading">
                                T
                            </div>
                            <span className="text-lg font-bold font-heading text-primary-red">TERRAS</span>
                        </div>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-slate-700" />
                        </button>
                    </div>

                    {/* Mobile Navigation Links */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-2">
                            {(!user || user.role !== 'admin') && (
                                <Link
                                    to="/"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Home
                                </Link>
                            )}
                            {user && user.role !== 'admin' && (
                                <Link
                                    to="/my-bookings"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Peminjaman Saya
                                </Link>
                            )}
                            {user && user.role === 'admin' && (
                                <>
                                    <Link
                                        to="/admin/dashboard"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/admin/approvals"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Persetujuan
                                    </Link>
                                    <Link
                                        to="/admin/rooms"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Kelola Ruangan
                                    </Link>
                                    <Link
                                        to="/admin/users"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Kelola User
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>

                    {/* Mobile User Section */}
                    <div className="p-4 border-t border-slate-200">
                        {user ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg">
                                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                                        <User className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                                        <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        handleLogoutClick();
                                    }}
                                    className="w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Log out
                                </button>
                            </div>
                        ) : (
                            <a href={`${import.meta.env.VITE_AUTH_APP_URL}/`} className="block">
                                <Button fullWidth onClick={() => setIsMobileMenuOpen(false)}>
                                    Login
                                </Button>
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                title="Konfirmasi Logout"
            >
                <div className="space-y-6">
                    <p className="text-slate-600">Apakah Anda yakin ingin keluar dari aplikasi?</p>
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setIsLogoutModalOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="danger" onClick={confirmLogout}>
                            Keluar
                        </Button>
                    </div>
                </div>
            </Modal>
        </nav>
    );
};
