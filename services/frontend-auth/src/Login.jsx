import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, authService } from '@core';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@ui';

export const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Login attempt started for:', formData.email);
        setError('');

        try {
            const result = await login(formData.email, formData.password);
            console.log('Login result:', result);

            if (result.success) {
                const user = result.user || authService.getCurrentUser();
                const userEncoded = encodeURIComponent(JSON.stringify(user));
                const token = authService.getToken() || 'session_' + Date.now();

                let targetUrl;
                if (user?.role === 'admin') {
                    targetUrl = `${import.meta.env.VITE_ADMIN_APP_URL}/admin/dashboard?token=${token}&user=${userEncoded}`;
                } else {
                    targetUrl = `${import.meta.env.VITE_USER_APP_URL}/?token=${token}&user=${userEncoded}`;
                }
                console.log('Redirecting to:', targetUrl);
                window.location.href = targetUrl;
            } else {
                console.error('Login failed:', result.message);
                setError(result.message);
            }
        } catch (err) {
            console.error('Login exception:', err);
            setError('An unexpected error occurred');
        }
    };

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
                        <CardTitle className="text-2xl font-bold text-primary-red">Login TERRAS</CardTitle>
                        <p className="text-sm text-slate-500">
                            Masuk dengan akun Telkom University Anda
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
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <Button type="submit" fullWidth className="mt-4">
                                Sign In
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center border-t bg-slate-50 p-4 flex-col gap-2">
                        <p className="text-xs text-slate-400">
                            Gunakan akun dummy: john@... / user123
                        </p>
                        <Link to="/register" className="text-sm text-primary-red hover:underline font-medium">
                            Belum punya akun? Daftar di sini
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
