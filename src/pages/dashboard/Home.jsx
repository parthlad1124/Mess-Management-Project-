import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/BaseComponents';
import { Users, Utensils, CreditCard, MessageSquare, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axiosClient from '../../api/axiosClient';


const StatCard = ({ title, value, icon, colorClass, borderClass }) => (
    <Card className={`p-6 border-l-4 ${borderClass} hover:shadow-md transition-shadow`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                {icon}
            </div>
        </div>
    </Card>
);

const Home = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalStaff: 0,
        studentsOnLeave: 0,
        staffOnLeave: 0,
        expectedBreakfast: 0,
        expectedLunch: 0,
        expectedDinner: 0,
        expectedStaffToday: 0,
        paymentsTotal: 0,
        feedbackCount: 0,
        todayMenu: null
    });
    const [inventoryItems, setInventoryItems] = useState([]);

    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {

        const fetchInventory = async () => {
            try {
                const res = await axiosClient.get("/inventory");
                setInventoryItems(res.data);
            } catch (err) {
                console.error("Failed to load inventory", err);
            }
        };

        const fetchStats = async () => {
            try {
                setLoading(true);
                // Call the new dashboard API endpoint with the selected date
                const res = await axiosClient.get(`/dashboard/today-stats?date=${selectedDate}`);
                setStats(res.data);
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };


        fetchStats();
        fetchInventory();
    }, [selectedDate]);

    const adminStaffChartData = [
        { name: 'Monday', meals: 120 },
        { name: 'Tuesday', meals: 132 },
        { name: 'Wednesday', meals: 101 },
        { name: 'Thursday', meals: 143 },
        { name: 'Friday', meals: 90 },
        { name: 'Saturday', meals: 65 }, // Less on weekends
        { name: 'Sunday', meals: 85 }
    ];

    const studentChartData = [
        { name: 'Monday', meals: 3 },
        { name: 'Tuesday', meals: 2 },
        { name: 'Wednesday', meals: 3 },
        { name: 'Thursday', meals: 3 },
        { name: 'Friday', meals: 1 },
        { name: 'Saturday', meals: 0 },
        { name: 'Sunday', meals: 2 }
    ];

    const chartData = (user?.role === 'Admin' || user?.role === 'Staff') ? adminStaffChartData : studentChartData;

    const totalItems = inventoryItems.length;
    const lowStockItems = inventoryItems.filter(i => i.quantity <= i.minStockLevel).length;
    const availableItems = totalItems - lowStockItems;

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Here is the mess meal planning overview based on expected turnout.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm font-medium">
                        <span className="text-gray-600">Overview Date:</span>
                        <input
                            type="date"
                            className="bg-transparent border-none outline-none text-gray-900 cursor-pointer"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Admin Stats Grid (Meals & Totals) */}
            {user?.role === 'Admin' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Breakfast Expected"
                        value={loading ? "..." : stats.expectedBreakfast}
                        icon={<Utensils size={24} className="text-amber-600" />}
                        colorClass="bg-amber-100"
                        borderClass="border-amber-500"
                    />
                    <StatCard
                        title="Lunch Expected"
                        value={loading ? "..." : stats.expectedLunch}
                        icon={<Utensils size={24} className="text-orange-600" />}
                        colorClass="bg-orange-100"
                        borderClass="border-orange-500"
                    />
                    <StatCard
                        title="Dinner Expected"
                        value={loading ? "..." : stats.expectedDinner}
                        icon={<Utensils size={24} className="text-indigo-600" />}
                        colorClass="bg-indigo-100"
                        borderClass="border-indigo-500"
                    />
                    <StatCard
                        title="Total Students"
                        value={loading ? "..." : stats.totalStudents}
                        icon={<Users size={24} className="text-blue-600" />}
                        colorClass="bg-blue-100"
                        borderClass="border-blue-500"
                    />
                    <StatCard
                        title="Students On Leave Today"
                        value={loading ? "..." : stats.studentsOnLeave}
                        icon={<TrendingUp size={24} className="text-red-600 transform rotate-180" />}
                        colorClass="bg-red-100"
                        borderClass="border-red-500"
                    />
                    <StatCard
                        title="Total Staff"
                        value={loading ? "..." : stats.totalStaff}
                        icon={<Users size={24} className="text-emerald-600" />}
                        colorClass="bg-emerald-100"
                        borderClass="border-emerald-500"
                    />
                    <StatCard
                        title="Staff Expected"
                        value={loading ? "..." : stats.expectedStaffToday}
                        icon={<Utensils size={24} className="text-emerald-600" />}
                        colorClass="bg-emerald-100"
                        borderClass="border-emerald-500"
                    />
                    <StatCard
                        title="Staff On Leave Today"
                        value={loading ? "..." : stats.staffOnLeave}
                        icon={<TrendingUp size={24} className="text-red-600 transform rotate-180" />}
                        colorClass="bg-red-100"
                        borderClass="border-red-500"
                    />
                    <StatCard
                        title="Total Inventory Items"
                        value={loading ? "..." : totalItems}
                        icon={<Utensils size={24} className="text-purple-600" />}
                        colorClass="bg-purple-100"
                        borderClass="border-purple-500"
                    />

                    <StatCard
                        title="Low Stock Items"
                        value={loading ? "..." : lowStockItems}
                        icon={<TrendingUp size={24} className="text-red-600" />}
                        colorClass="bg-red-100"
                        borderClass="border-red-500"
                    />

                    <StatCard
                        title="Available Items"
                        value={loading ? "..." : availableItems}
                        icon={<Utensils size={24} className="text-green-600" />}
                        colorClass="bg-green-100"
                        borderClass="border-green-500"
                    />
                </div>
                
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Simplified view for End Users */}
                    <StatCard
                        title="Today's Expected Headcount"
                        value={loading ? "..." : (stats.expectedLunch + stats.expectedStaffToday)}
                        icon={<Users size={24} className="text-blue-600" />}
                        colorClass="bg-blue-100"
                        borderClass="border-blue-500"
                    />
                    <StatCard
                        title="My Dues"
                        value={loading ? "..." : `$${stats.paymentsTotal}`}
                        icon={<CreditCard size={24} className="text-emerald-600" />}
                        colorClass="bg-emerald-100"
                        borderClass="border-emerald-500"
                    />
                    <StatCard
                        title="Recent Feedback"
                        value={loading ? "..." : stats.feedbackCount}
                        icon={<MessageSquare size={24} className="text-purple-600" />}
                        colorClass="bg-purple-100"
                        borderClass="border-purple-500"
                    />
                </div>
            )}

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Attendance Trends</h3>
                        <p className="text-sm text-gray-500">
                            {user?.role === 'Admin' || user?.role === 'Staff'
                                ? "Number of meals served over the last 7 days"
                                : "Your meals attended over the last 7 days"}
                        </p>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="meals" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 1 ? '#F97316' : '#FFEDD5'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Quick Actions / Info pane */}
                <Card className="p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Role Information</h3>

                    <div className="flex-1 space-y-4">
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                            <h4 className="font-semibold text-orange-800 mb-1">Your Access Level: {user?.role}</h4>
                            <p className="text-sm text-orange-600">
                                {user?.role === 'Admin'
                                    ? "You have full control to manage menus, track attendance, enforce payments, and review feedback."
                                    : user?.role === 'Staff'
                                        ? "You can view the menu, manage daily attendance logs, and submit feedback."
                                        : "You can view the weekly menu, track your attendance, pay outstanding dues, and submit feedback."}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <h4 className="font-medium text-gray-700 mb-2">
                                {selectedDate === new Date().toISOString().split('T')[0]
                                    ? "Today's"
                                    : `${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}'s`} Menu Highlight
                            </h4>
                            {stats.todayMenu ? (
                                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 space-y-2">
                                    <div><span className="font-semibold text-gray-800">Breakfast:</span> {stats.todayMenu.breakfast}</div>
                                    <div><span className="font-semibold text-gray-800">Lunch:</span> {stats.todayMenu.lunch}</div>
                                    <div><span className="font-semibold text-gray-800">Dinner:</span> {stats.todayMenu.dinner}</div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-500 italic">
                                    {loading ? "Loading menu..." : "Menu not configured for this date."}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Home;
