import React, { useState, useEffect } from 'react';
import { bookingService, roomService, storage, useAuth } from '@core';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ui';
import { CheckCircle, XCircle, Clock, BarChart3, MapPin, RefreshCw, FilePlus, UserPlus, FileEdit, Trash2, AlertCircle } from 'lucide-react';

export const AdminDashboard = () => {
    // ... (state remains same)
    const { user } = useAuth();
    const [stats, setStats] = useState({ buildings: 0, rooms: 0, pending: 0 });
    const [logs, setLogs] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadData();

        // Auto-refresh every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        setIsRefreshing(true);
        try {
            // Load Stats
            const [allBookings, allRooms, activityLogs] = await Promise.all([
                bookingService.getAll(),
                roomService.getAll(),
                bookingService.getActivities()
            ]);

            const uniqueBuildings = new Set(allRooms.map(r => r.buildingName));

            setStats({
                buildings: uniqueBuildings.size,
                rooms: allRooms.length,
                pending: allBookings.filter(b => b.status === "pending").length,
            });

            // Set Activity Logs
            setLogs(activityLogs);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };



    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-heading">Admin Dashboard</h1>
                    <p className="text-slate-500">Overview & Health Check</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatsCard
                    title="TOTAL GEDUNG"
                    value={stats.buildings}
                    icon={<MapPin />}
                    color="indigo"
                    description="Gedung terdaftar dalam sistem"
                />
                <StatsCard
                    title="TOTAL RUANGAN"
                    value={stats.rooms}
                    icon={<BarChart3 />}
                    color="blue"
                    description="Ruangan siap digunakan"
                />
                <StatsCard
                    title="BOOKING PENDING"
                    value={stats.pending}
                    icon={<Clock />}
                    color="orange"
                    description="Menunggu persetujuan admin"
                />
            </div>

            {/* Activity Log Section */}
            <Card className="shadow-sm hover:shadow-sm hover:border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
                    <CardTitle>Log Aktivitas Terbaru</CardTitle>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-primary-red" onClick={loadData} disabled={isRefreshing}>
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                </CardHeader>
                <CardContent className="pt-0">
                    {logs.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <p>Belum ada aktivitas tercatat.</p>
                        </div>
                    ) : (
                        <div className="space-y-0 divide-y divide-slate-100">
                            {logs.map(log => {
                                let Icon = AlertCircle;
                                let iconColor = "text-slate-400";
                                let bgColor = "bg-slate-100";

                                if (log.activityType === 'booking_create') { Icon = FilePlus; iconColor = "text-blue-600"; bgColor = "bg-blue-100"; }
                                else if (log.activityType === 'booking_approved' || log.activityType === 'booking_approve') { Icon = CheckCircle; iconColor = "text-green-600"; bgColor = "bg-green-100"; }
                                else if (log.activityType === 'booking_rejected' || log.activityType === 'booking_reject') { Icon = XCircle; iconColor = "text-red-600"; bgColor = "bg-red-100"; }
                                else if (log.activityType === 'booking_cancelled') { Icon = XCircle; iconColor = "text-orange-600"; bgColor = "bg-orange-100"; }
                                else if (log.activityType === 'user_register') { Icon = UserPlus; iconColor = "text-indigo-600"; bgColor = "bg-indigo-100"; }
                                else if (log.activityType === 'booking_update') { Icon = FileEdit; iconColor = "text-amber-600"; bgColor = "bg-amber-100"; }
                                else if (log.activityType?.includes('delete')) { Icon = Trash2; iconColor = "text-red-600"; bgColor = "bg-red-100"; }

                                return (
                                    <div key={log._id || log.id} className="py-3 flex items-start hover:bg-slate-50 px-2 -mx-2 rounded transition-colors group">
                                        <div className={`mt-0.5 mr-3 p-1.5 rounded-full ${bgColor} shrink-0`}>
                                            <Icon className={`h-4 w-4 ${iconColor}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-800">
                                                <span className="font-semibold text-slate-900">{log.actorName}</span>
                                                {' '}
                                                <span className="text-slate-600">{log.action}</span>
                                                {' '}
                                                <span className="font-medium text-slate-900">{log.targetType === 'booking' ? 'booking' : ''} {log.targetName}</span>
                                            </p>
                                            {log.details && (log.details.reason || log.details.roomName) && (
                                                <p className="text-xs text-slate-500 mt-0.5 truncate">
                                                    {log.details.roomName && <span>{log.details.roomName}</span>}
                                                    {log.details.roomName && log.details.reason && <span> • </span>}
                                                    {log.details.reason && <span className="text-red-500 italic">"{log.details.reason}"</span>}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-400 whitespace-nowrap ml-4 mt-0.5">
                                            {new Date(log.timestamp).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const StatsCard = ({ title, value, icon, color, description }) => {
    const variants = {
        indigo: {
            wrapper: "bg-indigo-50 border-none",
            title: "text-indigo-700",
            value: "text-indigo-800",
            subtext: "text-indigo-600",
            icon: "text-indigo-600"
        },
        blue: {
            wrapper: "bg-blue-50 border-none",
            title: "text-blue-700",
            value: "text-blue-800",
            subtext: "text-blue-600",
            icon: "text-blue-600"
        },
        sky: {
            wrapper: "bg-sky-50 border-none",
            title: "text-sky-700",
            value: "text-sky-800",
            subtext: "text-sky-600",
            icon: "text-sky-600"
        },
        orange: {
            wrapper: "bg-orange-50 border-none",
            title: "text-orange-700",
            value: "text-orange-800",
            subtext: "text-orange-600",
            icon: "text-orange-600"
        },
        red: {
            wrapper: "bg-red-50 border-none",
            title: "text-red-700",
            value: "text-red-800",
            subtext: "text-red-600",
            icon: "text-red-600"
        },
        slate: {
            wrapper: "bg-slate-50 border-none",
            title: "text-slate-700",
            value: "text-slate-800",
            subtext: "text-slate-600",
            icon: "text-slate-600"
        }
    };

    const theme = variants[color] || variants.blue;

    return (
        <Card className={`${theme.wrapper} relative overflow-hidden h-32 transition-shadow hover:shadow-md group shadow-none`}>
            <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
                <div>
                    <p className={`text-xs font-bold ${theme.title} uppercase tracking-wider mb-1`}>{title}</p>
                    <h3 className={`text-4xl font-bold ${theme.value}`}>{value}</h3>
                </div>
                <p className={`text-xs ${theme.subtext} font-medium opacity-80`}>{description}</p>
            </CardContent>
            <div className={`absolute -right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500`}>
                {React.cloneElement(icon, { className: `h-32 w-32 ${theme.icon}` })}
            </div>
        </Card>
    );
};
