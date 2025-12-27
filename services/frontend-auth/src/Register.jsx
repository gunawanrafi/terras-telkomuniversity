import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@core';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@ui';
import { UserPlus, ArrowLeft } from 'lucide-react';

export const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Password dan konfirmasi password tidak cocok');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password minimal 6 karakter');
            return;
        }

        // Call register from AuthContext
        const result = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password
        });

        if (result.success) {
            setSuccess(true);
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } else {
            setError(result.message);
        }
    };

    if (success) {
        return (
            <div className="relative min-h-screen flex items-center justify-center">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: "url('/login-bg.png')" }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 z-0" />

                {/* Success Message */}
                <div className="container mx-auto px-4 flex items-center justify-center relative z-10 py-12">
                    <Card className="w-full max-w-md border-t-4 border-t-green-500 shadow-xl">
                        <CardContent className="text-center py-12">
                            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                                <UserPlus className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Registrasi Berhasil!</h2>
                            <p className="text-slate-600">
                                Akun Anda telah dibuat. Anda akan diarahkan ke halaman login...
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: "url('/login-bg.png')" }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 z-0" />

            {/* Content */}
            <div className="container mx-auto px-4 flex items-center justify-center relative z-10 py-12">
                <Card className="w-full max-w-md border-t-4 border-t-primary-red shadow-xl">
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto h-12 w-12 rounded bg-primary-red flex items-center justify-center text-white font-bold text-xl mb-4">
                            T
                        </div>
                        <CardTitle className="text-2xl font-bold text-primary-red">Daftar TERRAS</CardTitle>
                        <p className="text-sm text-slate-500">
                            Buat akun baru untuk sistem reservasi ruangan
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="rounded bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                                    {error}
                                </div>
                            )}
                            <Input
                                label="Nama Lengkap"
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="nama@student.telkomuniversity.ac.id"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="Minimal 6 karakter"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Konfirmasi Password"
                                name="confirmPassword"
                                type="password"
                                placeholder="Ulangi password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <Button type="submit" fullWidth className="mt-4">
                                Daftar Sekarang
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center border-t bg-slate-50 p-4">
                        <Link to="/" className="text-sm text-primary-red hover:underline flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            Sudah punya akun? Login di sini
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
