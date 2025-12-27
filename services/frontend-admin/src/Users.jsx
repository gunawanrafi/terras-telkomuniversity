import React, { useState, useEffect } from 'react';
import { useAuth, authService } from '@core';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Modal, Input } from '@ui';
import { Users as UsersIcon, Shield, UserX, Crown, Trash2, AlertCircle, Search } from 'lucide-react';
import { storage } from '@core/services/storage';

const SUPER_ADMIN_EMAIL = 'admin@terras.ac.id';

export const Users = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ total: 0, admins: 0, regularUsers: 0 });

    // Modal States
    const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
    const [isDemoteModalOpen, setIsDemoteModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        // Filter and sort users
        let result = [...users];

        // Search filter
        if (searchQuery) {
            result = result.filter(u =>
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort: Super Admin first, then Admins, then Users
        result.sort((a, b) => {
            // Super admin always first
            if (a.email === SUPER_ADMIN_EMAIL) return -1;
            if (b.email === SUPER_ADMIN_EMAIL) return 1;

            // Then by role (admin before user)
            if (a.role === 'admin' && b.role === 'user') return -1;
            if (a.role === 'user' && b.role === 'admin') return 1;

            // Same role, sort by name
            return a.name.localeCompare(b.name);
        });

        setFilteredUsers(result);
    }, [users, searchQuery]);

    const loadUsers = async () => {
        const allUsers = await authService.getAllUsers();
        setUsers(allUsers);

        const newStats = {
            total: allUsers.length,
            admins: allUsers.filter(u => u.role === 'admin').length,
            regularUsers: allUsers.filter(u => u.role === 'user').length
        };
        setStats(newStats);
    };

    const isSuperAdmin = (user) => user.email === SUPER_ADMIN_EMAIL;

    const handlePromoteClick = (user) => {
        setSelectedUser(user);
        setIsPromoteModalOpen(true);
    };

    const handleDemoteClick = (user) => {
        setSelectedUser(user);
        setIsDemoteModalOpen(true);
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const confirmPromote = async () => {
        if (!selectedUser) return;

        await authService.updateUserRole(selectedUser.id, 'admin', currentUser.name, selectedUser.name);
        setIsPromoteModalOpen(false);
        setSelectedUser(null);
        loadUsers();
    };

    const confirmDemote = async () => {
        if (!selectedUser) return;

        await authService.updateUserRole(selectedUser.id, 'user', currentUser.name, selectedUser.name);
        setIsDemoteModalOpen(false);
        setSelectedUser(null);
        loadUsers();
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;

        // Prevent deleting self
        if (selectedUser.id === currentUser.id) {
            alert('Tidak dapat menghapus akun Anda sendiri!');
            return;
        }

        await authService.deleteUser(selectedUser.id, currentUser.name, selectedUser.name);
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        loadUsers();
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold font-heading text-slate-800">Kelola Pengguna</h1>
                <p className="text-slate-500">Manage user accounts and permissions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-50 border-none relative overflow-hidden h-32">
                    <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">TOTAL PENGGUNA</h3>
                            <div className="text-4xl font-bold text-blue-800">{stats.total}</div>
                        </div>
                        <p className="text-xs text-blue-600 font-medium">Semua akun terdaftar</p>
                    </CardContent>
                    <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                        <UsersIcon className="h-32 w-32 text-blue-600" />
                    </div>
                </Card>

                <Card className="bg-purple-50 border-none relative overflow-hidden h-32">
                    <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">ADMINISTRATOR</h3>
                            <div className="text-4xl font-bold text-purple-800">{stats.admins}</div>
                        </div>
                        <p className="text-xs text-purple-600 font-medium">Akun dengan hak akses penuh</p>
                    </CardContent>
                    <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                        <Shield className="h-32 w-32 text-purple-600" />
                    </div>
                </Card>

                <Card className="bg-green-50 border-none relative overflow-hidden h-32">
                    <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">USER BIASA</h3>
                            <div className="text-4xl font-bold text-green-800">{stats.regularUsers}</div>
                        </div>
                        <p className="text-xs text-green-600 font-medium">Akun pengguna standar</p>
                    </CardContent>
                    <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                        <UsersIcon className="h-32 w-32 text-green-600" />
                    </div>
                </Card>
            </div>

            {/* Users Table */}
            <Card className="overflow-hidden border border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center justify-between gap-4">
                        <CardTitle className="text-lg">Daftar Pengguna</CardTitle>
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
                            <Input
                                type="text"
                                placeholder="Cari nama atau email..."
                                className="pl-9 h-9 text-sm border-slate-200 focus:border-primary-red focus:ring-primary-red bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">No</th>
                                    <th className="px-6 py-4">Nama</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            {searchQuery ? 'Tidak ada pengguna yang cocok dengan pencarian' : 'Tidak ada pengguna terdaftar'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, index) => {
                                        const isSuper = isSuperAdmin(user);
                                        const isCurrentUser = user.id === currentUser.id;
                                        const canModify = !isSuper && !isCurrentUser;

                                        return (
                                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">{index + 1}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-semibold text-slate-800">{user.name}</div>
                                                        {isSuper && (
                                                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 shadow-none text-xs">
                                                                Super Admin
                                                            </Badge>
                                                        )}
                                                        {isCurrentUser && !isSuper && (
                                                            <Badge variant="secondary" className="text-xs">Anda</Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    {user.role === 'admin' ? (
                                                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 shadow-none">
                                                            <Shield className="h-3 w-3 mr-1" />
                                                            Admin
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="shadow-none">
                                                            User
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isSuper ? (
                                                        <div className="text-center text-xs text-slate-400 italic">
                                                            Protected Account
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-2">
                                                            {user.role === 'user' ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="px-3 flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 transition-colors text-xs"
                                                                    onClick={() => handlePromoteClick(user)}
                                                                >
                                                                    <Crown className="h-3.5 w-3.5" />
                                                                    Jadikan Admin
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="px-3 flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 transition-colors text-xs"
                                                                    onClick={() => handleDemoteClick(user)}
                                                                    disabled={!canModify}
                                                                >
                                                                    <UserX className="h-3.5 w-3.5" />
                                                                    Turunkan ke User
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="px-3 flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 transition-colors text-xs"
                                                                onClick={() => handleDeleteClick(user)}
                                                                disabled={!canModify}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                Hapus
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Promote Modal */}
            <Modal
                isOpen={isPromoteModalOpen}
                onClose={() => setIsPromoteModalOpen(false)}
                title="Promosi ke Admin"
            >
                <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg flex gap-3 text-purple-800 text-sm">
                        <Crown className="h-5 w-5 shrink-0" />
                        <p>User ini akan mendapatkan hak akses penuh sebagai Administrator.</p>
                    </div>
                    <p className="text-slate-600 text-sm">
                        Promosi <strong>{selectedUser?.name}</strong> menjadi Admin?
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setIsPromoteModalOpen(false)}>Batal</Button>
                        <Button className="bg-purple-600 hover:bg-purple-700" onClick={confirmPromote}>Ya, Promosi</Button>
                    </div>
                </div>
            </Modal>

            {/* Demote Modal */}
            <Modal
                isOpen={isDemoteModalOpen}
                onClose={() => setIsDemoteModalOpen(false)}
                title="Turunkan ke User"
            >
                <div className="space-y-4">
                    <div className="bg-orange-50 p-4 rounded-lg flex gap-3 text-orange-800 text-sm">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p>Hak akses admin akan dicabut dan user ini akan menjadi pengguna biasa.</p>
                    </div>
                    <p className="text-slate-600 text-sm">
                        Turunkan <strong>{selectedUser?.name}</strong> ke role User?
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setIsDemoteModalOpen(false)}>Batal</Button>
                        <Button className="bg-orange-600 hover:bg-orange-700" onClick={confirmDemote}>Ya, Turunkan</Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Hapus Pengguna"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg flex gap-3 text-red-800 text-sm">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p>Akun pengguna akan dihapus permanen beserta semua data terkait.</p>
                    </div>
                    <p className="text-slate-600 text-sm">
                        Hapus akun <strong>{selectedUser?.name}</strong> ({selectedUser?.email})?
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Batal</Button>
                        <Button className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>Ya, Hapus</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
