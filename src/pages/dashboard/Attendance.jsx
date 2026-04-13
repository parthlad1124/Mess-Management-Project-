import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { Card, Button, Spinner } from '../../components/ui/BaseComponents';
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Attendance = () => {
    const { user } = useAuth();
    const isAdminOrStaff = user?.role === 'Admin' || user?.role === 'Staff';

    const [attendances, setAttendances] = useState([]);
    const [loading, setLoading] = useState(true);

    // Admin/Staff specific
    const [targetDate, setTargetDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [markData, setMarkData] = useState({ userId: '', mealType: 'Lunch', status: 'Present' });

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            if (isAdminOrStaff) {
                const res = await axiosClient.get(`/attendance/date/${targetDate}`);
                setAttendances(res.data);
            } else {
                const res = await axiosClient.get(`/attendance/my`);
                setAttendances(res.data);
            }
        } catch (error) {
            toast.error('Failed to load attendance records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [targetDate, isAdminOrStaff]);

    const handleMarkAttendance = async (e) => {
        e.preventDefault();
        if (!markData.userId) return toast.warning("User ID is required!");

        try {
            await axiosClient.post('/attendance', {
                formatDate: targetDate, // Just send date format normally
                date: targetDate,
                userId: parseInt(markData.userId),
                mealType: markData.mealType,
                status: markData.status
            });
            toast.success("Attendance logged successfully!");
            setMarkData({ ...markData, userId: '' }); // Reset
            fetchAttendance(); // Refresh list
        } catch (error) {
            toast.error('Failed to mark. Does the User ID exist?');
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance Log</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {isAdminOrStaff ? "Track and mark daily attendance." : "View your personal attendance history."}
                    </p>
                </div>
            </div>

            {isAdminOrStaff && (
                <Card className="p-6 bg-gradient-to-br from-white to-blue-50/50">
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-4">Mark Student Attendance</h3>

                    <form onSubmit={handleMarkAttendance} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                            <input
                                type="number"
                                value={markData.userId}
                                onChange={(e) => setMarkData({ ...markData, userId: e.target.value })}
                                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="e.g. 2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Meal</label>
                            <select
                                value={markData.mealType}
                                onChange={(e) => setMarkData({ ...markData, mealType: e.target.value })}
                                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Dinner">Dinner</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={markData.status}
                                onChange={(e) => setMarkData({ ...markData, status: e.target.value })}
                                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="Present">Present (Ate)</option>
                                <option value="Absent">Absent (Missed)</option>
                            </select>
                        </div>
                        <div>
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Submit</Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card className="overflow-hidden">
                {loading ? (
                    <div className="h-64 flex items-center justify-center"><Spinner /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold">Meal Type</th>
                                    {isAdminOrStaff && <th className="p-4 font-semibold">Student Name</th>}
                                    {isAdminOrStaff && <th className="p-4 font-semibold">User ID</th>}
                                    <th className="p-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                {attendances.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">No attendance records found for this view.</td>
                                    </tr>
                                ) : (
                                    attendances.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 font-medium">{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                                            <td className="p-4">{record.mealType}</td>
                                            {isAdminOrStaff && <td className="p-4 font-medium text-gray-900">{record.userName || `User ${record.userId}`}</td>}
                                            {isAdminOrStaff && <td className="p-4 text-gray-500">#{record.userId}</td>}
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${record.status === 'Present'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {record.status === 'Present' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Attendance;
