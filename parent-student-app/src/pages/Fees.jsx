import { useState, useEffect } from 'react';
import {
  IndianRupee,
  Download,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import axios from '../api/axios';

const Fees = ({ activeStudent }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (activeStudent) {
      fetchBills();
    }
  }, [activeStudent]);

  const fetchBills = async () => {
    try {
      const response = await axios.get(`/bills/student/${activeStudent._id}`);
      setBills(response.data.data);
    } catch (err) {
      console.error('Error fetching bills', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayOnline = async (billId, amount) => {
    try {
      const response = await axios.post('/payments/initiate', { billId, amount });
      if (response.data.data.checkoutUrl) {
        window.location.href = response.data.data.checkoutUrl;
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Payment initiation failed');
    }
  };

  const pendingBills = bills.filter(b => b.status !== 'Paid');
  const paidBills = bills.filter(b => b.status === 'Paid');

  if (loading) return <div className="py-10 text-center font-bold text-gray-500">Loading your fee details...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Fee Dashboard</h2>
        <div className="bg-primary/5 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase">
          Session 2023-24
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-2xl">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'pending' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
        >
          Pending ({pendingBills.length})
        </button>
        <button
          onClick={() => setActiveTab('paid')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'paid' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
        >
          Paid History ({paidBills.length})
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'pending' ? (
          pendingBills.length === 0 ? (
            <div className="card text-center py-10">
              <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-bold text-gray-900">All Settled!</h3>
              <p className="text-sm text-gray-500">No pending dues for {activeStudent.firstName}.</p>
            </div>
          ) : (
            pendingBills.map(bill => (
              <div key={bill._id} className="card space-y-4 relative overflow-hidden">
                {bill.status === 'Overdue' && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase">
                    Overdue
                  </div>
                )}

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-gray-900">{bill.billType} Fee</h3>
                    <p className="text-xs font-bold text-gray-400 mt-0.5">Bill #{bill.billNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-primary">₹{(bill.dueAmount / 100).toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-red-500 uppercase mt-1 flex items-center justify-end">
                      <Clock className="h-3 w-3 mr-1" /> Due: {new Date(bill.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {bill.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="h-6 w-6 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[8px] font-bold">
                        {item.description[0]}
                      </div>
                    ))}
                    {bill.items.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold">
                        +{bill.items.length - 3}
                      </div>
                    )}
                  </div>
                  <button className="text-xs font-bold text-primary flex items-center">
                    View Details <ChevronRight className="h-3 w-3 ml-1" />
                  </button>
                </div>

                <div className="flex gap-3">
                  <a
                    href={`/api/v1/bills/${bill._id}/download`}
                    target="_blank"
                    className="flex-1 btn bg-gray-100 text-gray-700 text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" /> Bill
                  </a>
                  <button
                    onClick={() => handlePayOnline(bill._id, bill.dueAmount)}
                    className="flex-[2] btn btn-primary text-sm"
                  >
                    Pay Online <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          paidBills.map(bill => (
            <div key={bill._id} className="card flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{bill.billType} Fee</h3>
                  <p className="text-xs font-medium text-gray-400">#{bill.billNumber} • Fully Paid</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-gray-900">₹{(bill.payableAmount / 100).toLocaleString()}</p>
                <a
                  href={`/api/v1/bills/${bill._id}/download`}
                  target="_blank"
                  className="text-[10px] font-bold text-primary uppercase mt-1 block"
                >
                  Receipt
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Warning */}
      {pendingBills.some(b => b.status === 'Overdue') && (
        <div className="bg-red-50 p-4 rounded-2xl flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-red-800 leading-relaxed">
            Please pay your overdue bills to avoid late fees and maintain uninterrupted access to school services.
          </p>
        </div>
      )}
    </div>
  );
};

export default Fees;
