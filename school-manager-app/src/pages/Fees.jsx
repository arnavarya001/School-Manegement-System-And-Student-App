import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  IndianRupee,
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import axios from '../api/axios';

const Fees = () => {
  const location = useLocation();
  const studentIdParam = location.state?.studentId;

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMode: 'Cash',
    referenceNumber: '',
    notes: ''
  });

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const url = studentIdParam ? `/bills/student/${studentIdParam}` : '/bills';
      const response = await axios.get(url);
      setBills(response.data.data || []);
    } catch (err) {
      console.error('Error fetching bills', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = (bill) => {
    setSelectedBill(bill);
    setPaymentData({
      ...paymentData,
      amount: bill.dueAmount
    });
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/payments/offline', {
        billId: selectedBill._id,
        ...paymentData
      });
      alert('Payment recorded successfully!');
      setShowPaymentModal(false);
      fetchBills();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record payment');
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.billNumber.toLowerCase().includes(search.toLowerCase()) ||
                          bill.student?.firstName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === '' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fee Management</h2>
          <p className="text-gray-500">Track student bills, collections, and pending dues.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn bg-white border hover:bg-gray-50 flex items-center">
            <Download className="h-4 w-4 mr-2" /> Export Report
          </button>
          <button className="btn btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" /> Generate Bills
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase">Total Collected</p>
              <h3 className="text-2xl font-bold mt-1">₹452,000</h3>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
          </div>
        </div>
        <div className="card border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase">Pending Amount</p>
              <h3 className="text-2xl font-bold mt-1">₹128,500</h3>
            </div>
            <Clock className="h-8 w-8 text-yellow-500 opacity-20" />
          </div>
        </div>
        <div className="card border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase">Overdue Bills</p>
              <h3 className="text-2xl font-bold mt-1">24</h3>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by bill number or student name..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-48"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-sm font-medium text-gray-500">
                <th className="pb-4 px-4">Bill Details</th>
                <th className="pb-4 px-4">Student</th>
                <th className="pb-4 px-4">Total Amount</th>
                <th className="pb-4 px-4">Due Balance</th>
                <th className="pb-4 px-4">Due Date</th>
                <th className="pb-4 px-4">Status</th>
                <th className="pb-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="7" className="py-10 text-center text-gray-500">Loading bills...</td></tr>
              ) : filteredBills.length === 0 ? (
                <tr><td colSpan="7" className="py-10 text-center text-gray-500">No matching bills found.</td></tr>
              ) : filteredBills.map((bill) => (
                <tr key={bill._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-medium text-sm">{bill.billNumber}</p>
                    <p className="text-xs text-gray-500">{bill.billType}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-medium">{bill.student?.firstName} {bill.student?.lastName}</p>
                    <p className="text-xs text-gray-500">{bill.student?.admissionNumber}</p>
                  </td>
                  <td className="py-4 px-4 text-sm">₹{(bill.payableAmount / 100).toLocaleString()}</td>
                  <td className="py-4 px-4 text-sm font-bold text-red-600">₹{(bill.dueAmount / 100).toLocaleString()}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{new Date(bill.dueDate).toLocaleDateString()}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bill.status === 'Paid' ? 'bg-green-100 text-green-700' :
                      bill.status === 'Partially Paid' ? 'bg-blue-100 text-blue-700' :
                      bill.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    {bill.status !== 'Paid' && (
                      <button
                        onClick={() => handleOpenPayment(bill)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Record Pay
                      </button>
                    )}
                    <a
                      href={`/api/v1/bills/${bill._id}/download`}
                      target="_blank"
                      className="p-2 hover:bg-gray-100 rounded-full inline-block"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Record Payment - {selectedBill?.billNumber}</h3>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount (₹) *</label>
                <input
                  type="number" required className="input mt-1"
                  value={paymentData.amount / 100}
                  onChange={(e) => setPaymentData({...paymentData, amount: e.target.value * 100})}
                />
                <p className="text-xs text-gray-500 mt-1">Balance Due: ₹{selectedBill?.dueAmount / 100}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Mode *</label>
                <select
                  className="input mt-1"
                  value={paymentData.paymentMode}
                  onChange={(e) => setPaymentData({...paymentData, paymentMode: e.target.value})}
                >
                  <option>Cash</option>
                  <option>Cheque</option>
                  <option>Bank Transfer</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reference No. (e.g. Cheque No.)</label>
                <input
                  type="text" className="input mt-1"
                  value={paymentData.referenceNumber}
                  onChange={(e) => setPaymentData({...paymentData, referenceNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  className="input mt-1" rows="2"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="btn bg-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Record Success
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
