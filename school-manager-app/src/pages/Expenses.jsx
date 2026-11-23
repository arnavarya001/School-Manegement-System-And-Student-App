import { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Trash2,
  TrendingDown,
  IndianRupee,
  Calendar,
  Zap,
  Home,
  Wrench,
  FileSpreadsheet
} from 'lucide-react';
import axios from '../api/axios';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electricity',
    amount: 1000,
    paymentMethod: 'Bank Transfer',
    paidTo: '',
    invoiceNumber: '',
    notes: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('/expenses');
      setExpenses(res.data.data || []);
    } catch (err) {
      console.error('Failed to load expenses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/expenses', formData);
      alert('Expense recorded successfully!');
      setShowModal(false);
      setFormData({
        title: '',
        category: 'Electricity',
        amount: 1000,
        paymentMethod: 'Bank Transfer',
        paidTo: '',
        invoiceNumber: '',
        notes: ''
      });
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record expense');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense entry?')) return;
    try {
      await axios.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const filtered = expenses.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = e.title.toLowerCase().includes(q) || e.paidTo?.toLowerCase().includes(q) || e.invoiceNumber?.toLowerCase().includes(q);
    const matchCat = categoryFilter ? e.category === categoryFilter : true;
    return matchSearch && matchCat;
  });

  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const utilitiesSpent = expenses.filter(e => e.category === 'Electricity' || e.category === 'Rent').reduce((sum, e) => sum + (e.amount || 0), 0);
  const maintenanceSpent = expenses.filter(e => e.category === 'Maintenance' || e.category === 'Supplies').reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">School Expenses & Bills</h1>
          <p className="text-sm text-gray-500">Record electricity bills, campus maintenance, room rent & administrative outlays</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Record New Expense
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total School Expenses</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">₹{totalSpent.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Utilities & Rent</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">₹{utilitiesSpent.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Maintenance & Repairs</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">₹{maintenanceSpent.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses by title, payee, invoice #..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
          >
            <option value="">All Categories</option>
            <option value="Electricity">Electricity</option>
            <option value="Rent">Campus Rent</option>
            <option value="Maintenance">Maintenance & Repairs</option>
            <option value="Salaries">Staff Salaries</option>
            <option value="Supplies">School Supplies</option>
            <option value="Event">Events & Sports</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading expense ledger...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <TrendingDown className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-gray-700">No expenses recorded yet</p>
            <p className="text-sm text-gray-400 mt-1">Use "Record New Expense" to track school bills and disbursements.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Title / Purpose</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Paid To</th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      {item.paidTo || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {item.paymentMethod}
                    </td>
                    <td className="px-6 py-4 font-semibold text-rose-600">
                      ₹{item.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {item.invoiceNumber || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-gray-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Record School Expense</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electricity Bill - October, Generator Diesel, Lab Chemicals"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="Electricity">Electricity</option>
                    <option value="Rent">Campus Rent</option>
                    <option value="Maintenance">Maintenance & Repairs</option>
                    <option value="Salaries">Staff Salaries</option>
                    <option value="Supplies">School Supplies</option>
                    <option value="Event">Events & Sports</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Paid To / Payee</label>
                  <input
                    type="text"
                    placeholder="e.g. State Electricity Board"
                    value={formData.paidTo}
                    onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Invoice / Receipt #</label>
                <input
                  type="text"
                  placeholder="e.g. ELEC-OCT-2026-981"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Notes / Description</label>
                <textarea
                  rows="2"
                  placeholder="Additional details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                ></textarea>
              </div>

              <div className="pt-2 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
