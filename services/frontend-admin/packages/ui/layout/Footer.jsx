import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
    return (
        <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    {/* HUBUNGI KAMI */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase">Hubungi Kami</h3>
                        <div className="space-y-3">
                            <h4 className="font-heading font-bold text-lg">Telkom University</h4>
                            <div className="flex items-start gap-3 text-sm text-slate-300">
                                <MapPin className="h-5 w-5 shrink-0 text-primary-red mt-0.5" />
                                <p className="leading-relaxed">
                                    Jl. Telekomunikasi No. 1, Terusan Buahbatu - <br />
                                    Bojongsoang, Bandung, Jawa Barat 40257
                                </p>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <Phone className="h-4 w-4 text-primary-red" />
                                <p>+62 22 7564108</p>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <Mail className="h-4 w-4 text-primary-red" />
                                <p>helpdesk@telkomuniversity.ac.id</p>
                            </div>
                        </div>
                    </div>

                    {/* QUICK LINKS */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li>
                                <Link to="#" className="hover:text-primary-red transition-colors duration-200">Tentang Kami</Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-primary-red transition-colors duration-200">Panduan Peminjaman</Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-primary-red transition-colors duration-200">Kebijakan & Privasi</Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-primary-red transition-colors duration-200">Bantuan & FAQ</Link>
                            </li>
                        </ul>
                    </div>

                    {/* SOCIAL MEDIA */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase">Social Media</h3>
                        <div className="flex gap-4">
                            <a href="#" className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-red transition-colors duration-300">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-red transition-colors duration-300">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-red transition-colors duration-300">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-red transition-colors duration-300">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                            Telkom University in modern campus system Telkom University
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Telkom University - TERRAS. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
