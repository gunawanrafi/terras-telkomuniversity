import React, { useState, useEffect } from 'react';
import { roomService, buildingService } from '@core';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Modal } from '@ui';
import { Plus, Edit, Trash2, ArrowRight, Building } from 'lucide-react';

export const AdminRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState('All');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
    const [newBuildingName, setNewBuildingName] = useState('');

    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        name: '', code: '', buildingName: '', capacity: '', type: '', facilities: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterRooms();
    }, [rooms, selectedBuilding]);

    const loadData = async () => {
        const allRooms = await roomService.getAll();
        setRooms(allRooms);
        loadBuildings();
    };

    const loadBuildings = async () => {
        const data = await buildingService.getAll();
        // We use names for filtering and select to match existing room structure
        setBuildings(data.map(b => b.name).sort());
    };

    const handleAddBuildingSubmit = async (e) => {
        e.preventDefault();
        const result = await buildingService.add(newBuildingName);
        if (result.success) {
            setNewBuildingName('');
            setIsBuildingModalOpen(false);
            loadBuildings();
        } else {
            alert(result.message);
        }
    };

    const filterRooms = () => {
        if (selectedBuilding === 'All') {
            setFilteredRooms(rooms);
        } else {
            setFilteredRooms(rooms.filter(r => r.buildingName === selectedBuilding));
        }
    };

    // Grouping by Building - include all buildings even if empty
    const groupedRooms = {};

    // First, add all buildings (even empty ones)
    const buildingsToShow = selectedBuilding === 'All' ? buildings : [selectedBuilding];
    buildingsToShow.forEach(building => {
        groupedRooms[building] = [];
    });

    // Then, populate with rooms
    filteredRooms.forEach(room => {
        if (groupedRooms[room.buildingName]) {
            groupedRooms[room.buildingName].push(room);
        }
    });

    const buildingGroups = Object.keys(groupedRooms).sort();

    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    // Delete Building Modal State
    const [isDeleteBuildingModalOpen, setIsDeleteBuildingModalOpen] = useState(false);
    const [buildingToDelete, setBuildingToDelete] = useState(null);

    // Edit Building Modal State
    const [isEditBuildingModalOpen, setIsEditBuildingModalOpen] = useState(false);
    const [isEditConfirmModalOpen, setIsEditConfirmModalOpen] = useState(false);
    const [buildingToEdit, setBuildingToEdit] = useState(null);
    const [editBuildingName, setEditBuildingName] = useState('');

    // Dropdown state for each building
    const [openDropdown, setOpenDropdown] = useState(null);

    const handleEdit = (room) => {
        setEditingRoom(room);
        setFormData({
            ...room,
            facilities: room.facilities.join(', ')
        });
        setImagePreview(room.image);
        setSelectedImageFile(null);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingRoom(null);
        setFormData({ name: '', code: '', buildingName: '', capacity: '', type: '', facilities: '', image: '' });
        setImagePreview(null);
        setSelectedImageFile(null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (room) => {
        setRoomToDelete(room);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (roomToDelete) {
            const result = await roomService.delete(roomToDelete.id);
            if (result.success) {
                loadData();
                setIsDeleteModalOpen(false);
                setRoomToDelete(null);
            } else {
                setWarningMessage(result.message);
                setIsDeleteModalOpen(false);
                setIsWarningModalOpen(true);
                setRoomToDelete(null);
            }
        }
    };

    const handleDeleteBuildingClick = (buildingName) => {
        // Check if building has rooms
        const roomsInBuilding = rooms.filter(r => r.buildingName === buildingName);
        if (roomsInBuilding.length > 0) {
            setWarningMessage(`Tidak dapat menghapus gedung "${buildingName}" karena masih memiliki ${roomsInBuilding.length} ruangan. Hapus semua ruangan terlebih dahulu.`);
            setIsWarningModalOpen(true);
        } else {
            setBuildingToDelete(buildingName);
            setIsDeleteBuildingModalOpen(true);
        }
    };

    const confirmDeleteBuilding = async () => {
        if (buildingToDelete) {
            const result = await buildingService.delete(buildingToDelete);
            if (result.success) {
                loadBuildings();
                setIsDeleteBuildingModalOpen(false);
                setBuildingToDelete(null);
                if (selectedBuilding === buildingToDelete) {
                    setSelectedBuilding('All');
                }
            } else {
                setWarningMessage(result.message);
                setIsDeleteBuildingModalOpen(false);
                setIsWarningModalOpen(true);
                setBuildingToDelete(null);
            }
        }
    };

    const handleEditBuildingClick = (buildingName) => {
        setBuildingToEdit(buildingName);
        setEditBuildingName(buildingName);
        setIsEditConfirmModalOpen(true);
        setOpenDropdown(null);
    };

    const confirmEditBuilding = () => {
        setIsEditConfirmModalOpen(false);
        setIsEditBuildingModalOpen(true);
    };

    const handleEditBuildingSubmit = async (e) => {
        e.preventDefault();
        if (!buildingToEdit || !editBuildingName.trim()) return;

        const result = await buildingService.update(buildingToEdit, editBuildingName.trim());
        if (result.success) {
            // Update rooms with new building name
            const updatedRooms = rooms.map(room =>
                room.buildingName === buildingToEdit
                    ? { ...room, buildingName: editBuildingName.trim() }
                    : room
            );
            // Updating each room - usually backend handles this ref integrity or we do batch update
            // For now, iterate
            const roomsToUpdate = rooms.filter(r => r.buildingName === buildingToEdit);
            for (const room of roomsToUpdate) {
                await roomService.update(room.id, { ...room, buildingName: editBuildingName.trim() });
            }

            loadData();
            setIsEditBuildingModalOpen(false);
            setBuildingToEdit(null);
            setEditBuildingName('');

            if (selectedBuilding === buildingToEdit) {
                setSelectedBuilding(editBuildingName.trim());
            }
        } else {
            alert(result.message);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImageFile(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleDeleteImage = () => {
        setImagePreview(null);
        setSelectedImageFile(null);
        setFormData({ ...formData, image: '' });
    };

    const convertBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Image is mandatory
        if (!imagePreview && !selectedImageFile) {
            alert("Harap upload foto ruangan!");
            return;
        }

        const facilitiesArray = formData.facilities.split(',').map(f => f.trim()).filter(Boolean);

        let finalImageUrl = formData.image;
        if (selectedImageFile) {
            try {
                finalImageUrl = await convertBase64(selectedImageFile);
            } catch (error) {
                alert("Gagal memproses gambar");
                return;
            }
        } else if (!finalImageUrl && imagePreview) {
            // Case: Editing, didn't change image, but logic needs to plain keep it. 
            // formData.image usually has the old url from handleEdit. 
            // If imagePreview is set but no file, it's the old image.
            finalImageUrl = imagePreview;
        }

        const data = {
            ...formData,
            capacity: parseInt(formData.capacity),
            facilities: facilitiesArray,
            image: finalImageUrl
        };

        if (editingRoom) {
            await roomService.update(editingRoom.id, data);
        } else {
            await roomService.add(data);
        }

        setIsModalOpen(false);
        loadData();
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading">Kelola Ruangan</h1>
                    <p className="text-slate-500">Daftar ruangan inventaris kampus</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-red"
                        value={selectedBuilding}
                        onChange={(e) => { setSelectedBuilding(e.target.value); }}
                    >
                        <option value="All">Semua Gedung</option>
                        {buildings.map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                    <Button variant="outline" onClick={() => setIsBuildingModalOpen(true)} className="mr-2 bg-white">
                        <Building className="mr-2 h-4 w-4" /> Tambah Gedung
                    </Button>
                    <Button onClick={handleAdd}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Ruangan
                    </Button>
                </div>
            </div>

            <div className="space-y-8">
                {buildingGroups.map(building => (
                    <div key={building} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-slate-800">{building}</h2>
                                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {groupedRooms[building].length} Ruangan
                                </span>

                                {/* Dropdown Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setOpenDropdown(openDropdown === building ? null : building)}
                                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                        title="Opsi Gedung"
                                    >
                                        <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </button>

                                    {openDropdown === building && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setOpenDropdown(null)}
                                            />
                                            <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                                                <button
                                                    onClick={() => handleEditBuildingClick(building)}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    Edit Nama Gedung
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setOpenDropdown(null);
                                                        handleDeleteBuildingClick(building);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Hapus Gedung
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            {selectedBuilding === 'All' && groupedRooms[building].length > 3 && (
                                <Button variant="ghost" size="sm" className="text-primary-red hover:bg-red-50" onClick={() => setSelectedBuilding(building)}>
                                    Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        <div className={selectedBuilding === 'All'
                            ? "flex overflow-x-auto pb-6 gap-6 snap-x"
                            : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        }>
                            {groupedRooms[building].length === 0 ? (
                                <Card className="col-span-full">
                                    <CardContent className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                <Building className="h-10 w-10 text-slate-300" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-600 mb-2">Belum Ada Ruangan</h3>
                                            <p className="text-sm text-slate-500 mb-4">Gedung ini belum memiliki ruangan yang terdaftar.</p>
                                            <Button onClick={handleAdd} size="sm">
                                                <Plus className="mr-2 h-4 w-4" /> Tambah Ruangan
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                groupedRooms[building].map(room => (
                                    <Card key={room.id} className={`group relative hover:shadow-lg transition-shadow duration-200 ${selectedBuilding === 'All' ? 'min-w-[320px] max-w-[320px] snap-center' : ''}`}>
                                        <div className="aspect-video w-full overflow-hidden bg-slate-100 rounded-t-xl relative">
                                            <img src={room.image} alt={room.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold shadow-sm">
                                                {room.capacity} Orang
                                            </div>
                                        </div>
                                        <CardHeader className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="text-xs font-bold text-primary-red mb-0.5">{room.code}</div>
                                                    <CardTitle className="text-base font-bold text-slate-800 line-clamp-1">{room.name}</CardTitle>
                                                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-1">
                                                        <span className="bg-slate-50 border border-slate-100 px-1.5 rounded">{room.type}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 sm:static sm:bg-transparent">
                                                    <Button size="icon" variant="secondary" className="h-7 w-7 bg-white/90 sm:bg-slate-100 hover:bg-blue-50 hover:text-blue-600 shadow-sm" onClick={() => handleEdit(room)}>
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button size="icon" variant="secondary" className="h-7 w-7 bg-white/90 sm:bg-slate-100 hover:bg-red-50 hover:text-red-600 shadow-sm" onClick={() => handleDeleteClick(room)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingRoom ? "Edit Ruangan" : "Tambah Ruangan"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Foto Ruangan</label>
                        {imagePreview ? (
                            <div className="relative aspect-video w-full overflow-hidden rounded-md border border-slate-200 group">
                                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                <button
                                    type="button"
                                    onClick={handleDeleteImage}
                                    className="absolute top-2 right-2 bg-red-600/90 text-white p-2 rounded-full hover:bg-red-700 transition shadow-sm opacity-0 group-hover:opacity-100"
                                    title="Hapus Foto"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-slate-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-primary-red file:text-white
                                    hover:file:bg-red-700
                                    cursor-pointer bg-slate-50 p-2 rounded-md border border-slate-300"
                                    required
                                />
                                <p className="text-xs text-red-500">*Wajib upload foto ruangan.</p>
                            </div>
                        )}
                    </div>

                    <Input label="Nama Ruangan" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    <Input label="Kode Ruangan" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} required />
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Gedung</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-red disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.buildingName}
                            onChange={e => setFormData({ ...formData, buildingName: e.target.value })}
                            required
                        >
                            <option value="" disabled>Pilih Gedung</option>
                            {buildings.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Kapasitas" type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} required />
                        <Input label="Tipe Ruangan" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Fasilitas (pisahkan dengan koma)</label>
                        <textarea
                            className="flex min-h-[60px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-primary-red outline-none"
                            value={formData.facilities}
                            onChange={e => setFormData({ ...formData, facilities: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
                        <Button type="submit">Simpan</Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Konfirmasi Hapus"
            >
                <div className="space-y-6">
                    <p className="text-slate-600">
                        Apakah Anda yakin ingin menghapus ruangan <strong>{roomToDelete?.name}</strong>?
                        <br />
                        <span className="text-xs text-red-500">Tindakan ini tidak dapat dibatalkan.</span>
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            Hapus
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isBuildingModalOpen}
                onClose={() => setIsBuildingModalOpen(false)}
                title="Tambah Gedung Baru"
            >
                <form onSubmit={handleAddBuildingSubmit} className="space-y-4">
                    <Input
                        label="Nama Gedung"
                        placeholder="Contoh: Gedung Deli"
                        value={newBuildingName}
                        onChange={e => setNewBuildingName(e.target.value)}
                        required
                    />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsBuildingModalOpen(false)}>Batal</Button>
                        <Button type="submit">Tambah</Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isWarningModalOpen}
                onClose={() => setIsWarningModalOpen(false)}
                title="Gagal Menghapus"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-100 text-sm">
                        {warningMessage}
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={() => setIsWarningModalOpen(false)}>
                            Tutup
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Building Confirmation Modal */}
            <Modal
                isOpen={isEditConfirmModalOpen}
                onClose={() => setIsEditConfirmModalOpen(false)}
                title="Konfirmasi Edit Gedung"
            >
                <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-lg flex gap-3 text-yellow-800 text-sm">
                        <Edit className="h-5 w-5 shrink-0" />
                        <div>
                            <p className="font-semibold mb-1">Perhatian!</p>
                            <p>Mengubah nama gedung akan mempengaruhi:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Semua ruangan di gedung ini</li>
                                <li>Data peminjaman yang terkait</li>
                                <li>Filter dan pencarian</li>
                            </ul>
                        </div>
                    </div>
                    <p className="text-slate-600 text-sm">
                        Yakin ingin mengubah nama gedung <strong>{buildingToEdit}</strong>?
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setIsEditConfirmModalOpen(false)}>Batal</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={confirmEditBuilding}>Ya, Lanjutkan</Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Building Modal */}
            <Modal
                isOpen={isDeleteBuildingModalOpen}
                onClose={() => setIsDeleteBuildingModalOpen(false)}
                title="Hapus Gedung"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg flex gap-3 text-red-800 text-sm">
                        <Trash2 className="h-5 w-5 shrink-0" />
                        <div>
                            <p className="font-semibold mb-1">Peringatan!</p>
                            <p>Gedung akan dihapus permanen dari sistem dan tidak dapat dikembalikan.</p>
                        </div>
                    </div>
                    <p className="text-slate-600 text-sm">
                        Yakin ingin menghapus gedung <strong>{buildingToDelete}</strong>?
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setIsDeleteBuildingModalOpen(false)}>Batal</Button>
                        <Button className="bg-red-600 hover:bg-red-700" onClick={confirmDeleteBuilding}>Ya, Hapus Permanen</Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Building Modal */}
            <Modal
                isOpen={isEditBuildingModalOpen}
                onClose={() => setIsEditBuildingModalOpen(false)}
                title="Edit Nama Gedung"
            >
                <form onSubmit={handleEditBuildingSubmit} className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-800 text-sm">
                        <Edit className="h-5 w-5 shrink-0" />
                        <p>Mengubah nama gedung akan memperbarui semua ruangan yang terkait.</p>
                    </div>
                    <Input
                        label="Nama Gedung Baru"
                        placeholder="Contoh: Gedung Baru"
                        value={editBuildingName}
                        onChange={e => setEditBuildingName(e.target.value)}
                        required
                    />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setIsEditBuildingModalOpen(false)}>Batal</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Simpan Perubahan</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
