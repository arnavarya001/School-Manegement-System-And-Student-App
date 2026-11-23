import { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle,
  IndianRupee,
  Calendar,
  User,
  CreditCard
} from 'lucide-react';
import axios from '../api/axios';

const Receipts = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get('/payments');
      setPayments(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch payments', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter((p) => {
    const studentName = p.student ? `${p.student.firstName} ${p.student.lastName}`.toLowerCase() : '';
    const admNo = p.student?.admissionNumber?.toLowerCase() || '';
    const payNo = p.paymentNumber?.toLowerCase() || '';
    const q = search.toLowerCase();
    const matchSearch = studentName.includes(q) || admNo.includes(q) || payNo.includes(q);
    const matchMode = modeFilter ? p.paymentMode === modeFilter : true;
    return matchSearch && matchMode;
  });

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const cashTotal = payments.filter(p => p.paymentMode === 'Cash').reduce((sum, p) => sum + (p.amount || 0), 0);
  const onlineTotal = payments.filter(p => p.paymentMode === 'Online').reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Receipts Ledger</h1>
          <p className="text-sm text-gray-500">Official digital payment receipts & audit register</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Collected</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalCollected.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Cash Receipts</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{cashTotal.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Online / Gateway</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">₹{onlineTotal.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Transactions</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{payments.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by receipt #, student name, admission #..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
          >
            <option value="">All Payment Modes</option>
            <option value="Cash">Cash</option>
            <option value="Online">Online / OwnPay</option>
            <option value="Cheque">Cheque</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading receipts...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Receipt className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-gray-700">No payment receipts found</p>
            <p className="text-sm text-gray-400 mt-1">Receipts will appear here when fees are paid offline or online.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Receipt Number</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Bill Reference</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Mode</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Received By</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-primary">
                      {item.paymentNumber}
                    </td>
                    <td className="px-6 py-4">
                      {item.student ? (
                        <div>
                          <p className="font-medium text-gray-900">{item.student.firstName} {item.student.lastName}</p>
                          <p className="text-xs text-gray-400">ADM: {item.student.admissionNumber}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {item.bill?.billNumber || 'Direct'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(item.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.paymentMode === 'Online' ? 'bg-blue-100 text-blue-800' :
                        item.paymentMode === 'Cash' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.paymentMode}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      ₹{item.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {item.receivedBy?.name || 'System / Gateway'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(item)}
                        className="inline-flex items-center px-3 py-1.5 border border-primary text-primary hover:bg-primary/5 rounded-md text-xs font-medium transition"
                      >
                        <Printer className="h-3.5 w-3.5 mr-1" />
                        View / Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            {/* School Header */}
            <div className="text-center pb-4 border-b">
              <h2 className="text-xl font-bold tracking-tight text-gray-900">ST. MICHEL SCHOOL</h2>
              <p className="text-xs text-gray-500">Affiliated to State Education Board • Reg. No. SMS/2026/01</p>
              <p className="text-xs text-gray-400">Main Campus, St. Michel Road • Contact: +91 98765 43210</p>
              <div className="mt-3 inline-block px-3 py-1 bg-primary/10 text-primary font-bold rounded text-xs uppercase tracking-wider">
                Official Fee Receipt
              </div>
            </div>

            {/* Receipt Details */}
            <div className="py-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Receipt No:</span>
                <span className="font-mono font-bold text-gray-800">{selectedReceipt.paymentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium text-gray-800">{new Date(selectedReceipt.paymentDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Student Name:</span>
                <span className="font-bold text-gray-900">
                  {selectedReceipt.student?.firstName} {selectedReceipt.student?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Admission No:</span>
                <span className="font-mono text-gray-800">{selectedReceipt.student?.admissionNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bill Ref:</span>
                <span className="font-mono text-gray-800">{selectedReceipt.bill?.billNumber || 'Direct Payment'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Mode:</span>
                <span className="font-medium text-gray-800">{selectedReceipt.paymentMode}</span>
              </div>
              {selectedReceipt.referenceNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Ref / Txn ID:</span>
                  <span className="font-mono text-gray-800">{selectedReceipt.referenceNumber}</span>
                </div>
              )}

              <div className="border-t border-dashed my-3"></div>

              <div className="flex justify-between items-center text-base">
                <span className="font-bold text-gray-800">Amount Paid:</span>
                <span className="text-xl font-bold text-emerald-600">₹{selectedReceipt.amount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Received By:</span>
                <span>{selectedReceipt.receivedBy?.name || 'Authorized Cashier'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2"
              >
                <Printer className="h-4 w-4" /> Print Receipt
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receipts;
