import { useState, useEffect } from 'react';
import { Zap, Search, Plus, TrendingUp, IndianRupee, FileText } from 'lucide-react';
import axios from '../api/axios';

const Electricity = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const [formData, setFormData] = useState({
    studentId: '',
    academicSession: '2023-2024',
    month: '',
    previousReading: 0,
    currentReading: 0,
    ratePerUnit: 1000, // ₹10.00
    fixedCharges: 0,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
  });

  const fetchHistory = async () => {
    if (!searchStudent) return;
    setLoading(true);
    try {
      const response = await axios.get(`/electricity/student/${searchStudent}`);
      setHistory(response.data.data);
    } catch (err) {
      console.error('Error fetching history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/electricity/generate', formData);
      alert('Electricity bill generated successfully!');
      setShowGenerateModal(false);
      if (searchStudent === formData.studentId) fetchHistory();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate bill');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Electricity Billing</h2>
          <p className="text-gray-500">Calculate and generate electricity bills for hostel students.</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" /> New Bill
        </button>
      </div>

      <div className="card">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Student ID to view history..."
              className="input pl-10"
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
            />
          </div>
          <button onClick={fetchHistory} className="btn btn-primary">Search</button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading history...</div>
        ) : history.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-sm font-medium text-gray-500">
                  <th className="pb-4 px-4">Month</th>
                  <th className="pb-4 px-4">Readings (Prev / Curr)</th>
                  <th className="pb-4 px-4">Units</th>
                  <th className="pb-4 px-4">Total Amount</th>
                  <th className="pb-4 px-4">Date</th>
                  <th className="pb-4 px-4 text-right">Bill</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-medium">{item.month}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{item.previousReading} / {item.currentReading}</td>
                    <td className="py-4 px-4 text-sm font-bold text-primary">{item.unitsConsumed} Units</td>
                    <td className="py-4 px-4 text-sm font-bold">₹{(item.totalAmount / 100).toLocaleString()}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-right">
                       <a href={`/api/v1/bills/${item.bill}/download`} target="_blank" className="p-2 hover:bg-gray-100 rounded-full inline-block">
                        <FileText className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : searchStudent && (
          <div className="py-10 text-center text-gray-500">No electricity records found for this student.</div>
        )}
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Generate Electricity Bill</h3>
            <form onSubmit={handleGenerateBill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student ID *</label>
                <input
                  type="text" required className="input mt-1"
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Month *</label>
                  <input
                    type="text" required placeholder="Sept 2023" className="input mt-1"
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date *</label>
                  <input
                    type="date" required className="input mt-1"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Previous Reading *</label>
                  <input
                    type="number" required className="input mt-1"
                    onChange={(e) => setFormData({...formData, previousReading: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Reading *</label>
                  <input
                    type="number" required className="input mt-1"
                    onChange={(e) => setFormData({...formData, currentReading: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rate per Unit (₹) *</label>
                  <input
                    type="number" step="0.01" required className="input mt-1"
                    defaultValue="10.00"
                    onChange={(e) => setFormData({...formData, ratePerUnit: parseFloat(e.target.value) * 100})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fixed Charges (₹)</label>
                  <input
                    type="number" className="input mt-1"
                    onChange={(e) => setFormData({...formData, fixedCharges: parseFloat(e.target.value) * 100})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowGenerateModal(false)} className="btn bg-gray-200">Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Bill</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Electricity;
