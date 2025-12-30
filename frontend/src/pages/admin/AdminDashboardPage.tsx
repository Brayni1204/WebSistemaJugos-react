// src/pages/admin/AdminDashboardPage.tsx
import { useState, useEffect } from 'react';
import { getDashboardStats, getSalesOverTime } from '@/api/dashboardApi';
import type { DashboardStats, SalesDataPoint } from '@/api/dashboardApi';
import { toast } from 'sonner';
import { DollarSign, ShoppingCart, Users, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminDashboardPage = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, salesData] = await Promise.all([
                    getDashboardStats(),
                    getSalesOverTime(),
                ]);
                setStats(statsData);
                setSalesData(salesData);
            } catch (error: any) {
                toast.error(error.message || "Failed to load dashboard data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return <p>Loading dashboard...</p>;
    }

    if (!stats) {
        return <p>Could not load dashboard data.</p>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                    title="Total Revenue" 
                    value={`S/ ${Number(stats.totalRevenue).toFixed(2)}`} 
                    icon={<DollarSign className="h-6 w-6 text-green-500" />} 
                    change={`S/ ${Number(stats.revenueLast7Days).toFixed(2)} in last 7 days`}
                />
                <StatsCard 
                    title="Total Orders" 
                    value={stats.totalOrders.toString()} 
                    icon={<ShoppingCart className="h-6 w-6 text-blue-500" />} 
                />
                <StatsCard 
                    title="Total Customers" 
                    value={stats.totalCustomers.toString()} 
                    icon={<Users className="h-6 w-6 text-purple-500" />}
                />
                 <StatsCard 
                    title="Revenue (30d)" 
                    value={`S/ ${Number(stats.revenueLast30Days).toFixed(2)}`} 
                    icon={<Activity className="h-6 w-6 text-orange-500" />} 
                />
            </div>

            {/* Charts */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                 <h2 className="text-lg font-semibold text-gray-700 mb-4">Sales Over Last 30 Days</h2>
                 <SalesChart data={salesData} />
            </div>
        </div>
    );
};

// --- Child Components ---

const StatsCard = ({ title, value, icon, change }: { title: string; value: string; icon: React.ReactNode; change?: string }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-gray-500 uppercase">{title}</h3>
            {icon}
        </div>
        <div className="mt-2">
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            {change && <p className="text-xs text-gray-500 mt-1">{change}</p>}
        </div>
    </div>
);

const SalesChart = ({ data }: { data: SalesDataPoint[] }) => (
    <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `S/ ${value}`} />
                <Tooltip formatter={(value) => {
                    if (typeof value === 'number') {
                        return [`S/ ${value.toFixed(2)}`, 'Sales'];
                    }
                    return [value, 'Sales'];
                }} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);


export default AdminDashboardPage;