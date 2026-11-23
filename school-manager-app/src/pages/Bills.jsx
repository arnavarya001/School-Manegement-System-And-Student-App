import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  IndianRupee,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await axios.get('/bills');
      setBills(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch bills', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = bills.filter((b) => {
    const sName = b.student ? `${b.student.firstName} ${b.student.lastName}`.toLowerCase() : '';
    const adm = b.student?.admissionNumber?.toLowerCase() || '';
    const bNo = b.billNumber?.toLowerCase() || '';
    const q = search.toLowerCase();
    const matchSearch = sName.includes(q) || adm.includes(q) || bNo.includes(q);
    const matchType = typeFilter ? b.billType === typeFilter : true;
    const matchStatus = statusFilter ? b.status === statusFilter : true;
    return matchSearch && matchType && matchStatus;
  });

  const totalInvoiced = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalPaid = bills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const totalDue = bills.reduce((sum, b) => sum + (b.dueAmount || 0), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" /> Paid</span>;
      case 'Partially Paid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1" /> Partial</span>;
      case 'Overdue':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800"><AlertCircle className="w-3 h-3 mr-1" /> Overdue</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Unpaid</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices & Bill History</h1>
          <p className="text-sm text-gray-500">Comprehensive ledger of all student demand bills and charges</p>
        </div>
        <Link
          to="/bill-generator"
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Bill
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Invoiced</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalInvoiced.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Collected</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{totalPaid.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Outstanding Dues</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">₹{totalDue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by bill #, student name, admission #..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
          >
            <option value="">All Bill Types</option>
            <option value="Tuition">Tuition</option>
            <option value="Admission">Admission</option>
            <option value="Inventory">Inventory / Books</option>
            <option value="Examination">Examination</option>
            <option value="Transport">Transport</option>
            <option value="Custom">Custom</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading bills...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-gray-700">No bills found</p>
            <p className="text-sm text-gray-400 mt-1">Use the "Create New Bill" button to issue bills to students.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Bill Number</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Session</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Due Balance</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map((bill) => (
                  <tr key={bill._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-primary">
                      {bill.billNumber}
                    </td>
                    <td className="px-6 py-4">
                      {bill.student ? (
                        <div>
                          <p className="font-medium text-gray-900">{bill.student.firstName} {bill.student.lastName}</p>
                          <p className="text-xs text-gray-400">ADM: {bill.student.admissionNumber}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {bill.billType || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {bill.academicSession || '2026-2027'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ₹{bill.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-rose-600">
                      ₹{bill.dueAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(bill.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(bill.status)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedBill(bill)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-xs font-medium"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </button>
                      <a
                        href={`http://localhost:5001/api/v1/bills/${bill._id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-2.5 py-1.5 bg-primary text-white hover:bg-primary-dark rounded text-xs font-medium"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" /> PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bill View Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-start pb-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Bill Breakdown</h2>
                <p className="text-xs font-mono text-gray-500">{selectedBill.billNumber}</p>
              </div>
              <div>{getStatusBadge(selectedBill.status)}</div>
            </div>

            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Student</p>
                  <p className="font-semibold text-gray-900">{selectedBill.student?.firstName} {selectedBill.student?.lastName}</p>
                  <p className="text-xs text-gray-500">Roll: {selectedBill.student?.rollNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Due Date</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedBill.dueDate).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">Session: {selectedBill.academicSession}</p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Line Items</p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedBill.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-medium">{item.description}</td>
                          <td className="p-2.5 text-center">{item.quantity || 1}</td>
                          <td className="p-2.5 text-right font-semibold">₹{(item.amount * (item.quantity || 1)).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Totals */}
              <div className="space-y-1.5 pt-2 text-sm border-t">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{selectedBill.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                {selectedBill.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-₹{selectedBill.discountAmount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t">
                  <span>Total Payable:</span>
                  <span>₹{selectedBill.payableAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Amount Paid:</span>
                  <span>₹{selectedBill.paidAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-rose-600 text-base">
                  <span>Remaining Balance:</span>
                  <span>₹{selectedBill.dueAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
              <a
                href={`http://localhost:5001/api/v1/bills/${selectedBill._id}/download`}
                target="_blank"
                rel="noreferrer"
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5"
              >
                <Download className="h-4 w-4" /> Download Official PDF
              </a>
              <button
                onClick={() => setSelectedBill(null)}
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

export default Bills;
