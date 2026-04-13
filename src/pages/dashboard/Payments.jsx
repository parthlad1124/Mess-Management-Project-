import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { Card, Button, Spinner } from '../../components/ui/BaseComponents';
import { Search, DollarSign, ReceiptText, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Payments = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';

    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Admin form
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [invoiceData, setInvoiceData] = useState({ userId: '', amount: 1500, invoiceMonth: format(new Date(), 'MMMM yyyy') });

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const endpoint = isAdmin ? '/payment' : '/payment/my';
            const res = await axiosClient.get(endpoint);
            setPayments(res.data);
        } catch (error) {
            toast.error('Failed to load payments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [isAdmin]);

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/payment', {
                userId: parseInt(invoiceData.userId),
                amount: parseFloat(invoiceData.amount),
                invoiceMonth: invoiceData.invoiceMonth,
                status: 'Pending'
            });
            toast.success('Invoice created successfully.');
            setIsFormOpen(false);
            setInvoiceData({ ...invoiceData, userId: '' });
            fetchPayments();
        } catch (error) {
            toast.error('Failed to create invoice.');
        }
    };

    const handlePay = async (id) => {
        if (!window.confirm("Confirm payment processing?")) return;
        try {
            await axiosClient.put(`/payment/${id}/pay`);
            toast.success("Payment marked as paid!");
            fetchPayments();
        } catch (error) {
            toast.error('Payment processing failed.');
        }
    };

    const filteredPayments = payments.filter(p =>
        p.invoiceMonth.toLowerCase().includes(search.toLowerCase()) ||
        (p.userName && p.userName.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payments & Dues</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {isAdmin ? "Manage student invoices and track revenue." : "View your billing history and settle outstanding dues."}
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={isAdmin ? "Search by student or month..." : "Search by month..."}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    {isAdmin && (
                        <Button onClick={() => setIsFormOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 whitespace-nowrap">
                            <ReceiptText size={18} className="mr-2" />
                            New Invoice
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Side: Summary or Admin Tools */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
                        <div className="flex items-center gap-3 mb-4 text-emerald-100">
                            <DollarSign size={24} />
                            <h3 className="font-semibold uppercase tracking-wider text-sm">Overview</h3>
                        </div>
                        {isAdmin ? (
                            <div>
                                <p className="text-emerald-100 text-sm mb-1">Total Unpaid Invoices</p>
                                <h2 className="text-4xl font-bold mb-4">{payments.filter(p => p.status === 'Pending').length}</h2>
                            </div>
                        ) : (
                            <div>
                                <p className="text-emerald-100 text-sm mb-1">My Outstanding Balance</p>
                                <h2 className="text-4xl font-bold mb-4">
                                    ${payments.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0)}
                                </h2>
                            </div>
                        )}
                        <div className="pt-4 border-t border-emerald-400/30">
                            <p className="text-sm font-medium">Keep your account in good standing.</p>
                        </div>
                    </Card>
                </div>

                {/* Right Side: Data Table */}
                <Card className="lg:col-span-3 overflow-hidden flex flex-col min-h-[400px]">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center"><Spinner /></div>
                    ) : (
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                                        <th className="p-4 font-semibold">Invoice Month</th>
                                        {isAdmin && <th className="p-4 font-semibold">Student Name</th>}
                                        <th className="p-4 font-semibold">Amount</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                    {filteredPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center">
                                                <ReceiptText size={48} className="mx-auto text-gray-300 mb-3" />
                                                <p className="text-gray-500 font-medium text-lg">No payment records found.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPayments.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-4 font-medium text-gray-900">{payment.invoiceMonth}</td>
                                                {isAdmin && <td className="p-4">{payment.userName}</td>}
                                                <td className="p-4 font-bold text-gray-900">${payment.amount}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${payment.status === 'Paid'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {payment.status === 'Paid' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {payment.status === 'Pending' ? (
                                                        <Button
                                                            onClick={() => handlePay(payment.id)}
                                                            size="sm"
                                                            className="py-1.5 px-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0"
                                                        >
                                                            Pay Now
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs font-medium text-gray-400 block px-3 py-1.5">
                                                            Settled {payment.datePaid && format(new Date(payment.datePaid), 'MMM dd')}
                                                        </span>
                                                    )}
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

            {isFormOpen && isAdmin && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-sm bg-white shadow-2xl animate-fade-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Issue Invoice</h2>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                                <input
                                    type="number"
                                    required
                                    value={invoiceData.userId}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, userId: e.target.value })}
                                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                    placeholder="e.g. 2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                                <input
                                    type="number"
                                    required
                                    value={invoiceData.amount}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, amount: e.target.value })}
                                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Billing Month</label>
                                <input
                                    type="text"
                                    required
                                    value={invoiceData.invoiceMonth}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, invoiceMonth: e.target.value })}
                                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="pt-4">
                                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">Send Invoice</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Payments;
