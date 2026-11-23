import { useState, useEffect } from 'react';
import {
  PieChart,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  CreditCard,
  Building2,
  Calendar
} from 'lucide-react';
import axios from '../api/axios';

const Accounts = () => {
  const [stats, setStats] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      const [statsRes, expRes, payRes] = await Promise.all([
        axios.get('/reports/dashboard-stats'),
        axios.get('/expenses'),
        axios.get('/payments')
      ]);
      setStats(statsRes.data.data);
      setExpenses(expRes.data.data || []);
      setPayments(payRes.data.data || []);
    } catch (err) {
      console.error('Failed to load accounts data', err);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = stats?.totalCollection || 0;
  const totalExpenses = stats?.totalExpenses || 0;
  const netBalance = totalIncome - totalExpenses;

  const cashIncome = payments.filter(p => p.paymentMode === 'Cash').reduce((sum, p) => sum + (p.amount || 0), 0);
  const onlineIncome = payments.filter(p => p.paymentMode === 'Online').reduce((sum, p) => sum + (p.amount || 0), 0);
  const bankIncome = payments.filter(p => p.paymentMode === 'Bank Transfer' || p.paymentMode === 'Cheque').reduce((sum, p) => sum + (p.amount || 0), 0);

  const cashExpense = expenses.filter(e => e.paymentMethod === 'Cash').reduce((sum, e) => sum + (e.amount || 0), 0);
  const bankExpense = expenses.filter(e => e.paymentMethod !== 'Cash').reduce((sum, e) => sum + (e.amount || 0), 0);

  const cashInHand = cashIncome - cashExpense;
  const bankBalance = (onlineIncome + bankIncome) - bankExpense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financial Accounts & Balance Sheet</h1>
        <p className="text-sm text-gray-500">Real-time ledger of institutional revenue, operational outlays & liquid cash balance</p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total School Revenue</p>
              <h2 className="text-3xl font-extrabold text-emerald-600 mt-2">₹{totalIncome.toLocaleString('en-IN')}</h2>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 flex items-center">
            <span className="text-emerald-600 font-semibold flex items-center mr-1">
              <ArrowUpRight className="h-4 w-4" /> Collected
            </span>
            From tuition, admissions & store
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Operational Expenses</p>
              <h2 className="text-3xl font-extrabold text-rose-600 mt-2">₹{totalExpenses.toLocaleString('en-IN')}</h2>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 flex items-center">
            <span className="text-rose-600 font-semibold flex items-center mr-1">
              <ArrowDownRight className="h-4 w-4" /> Disbursed
            </span>
            Utilities, salaries, supplies & maintenance
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Operating Surplus</p>
              <h2 className={`text-3xl font-extrabold mt-2 ${netBalance >= 0 ? 'text-primary' : 'text-amber-600'}`}>
                ₹{netBalance.toLocaleString('en-IN')}
              </h2>
            </div>
            <div className="p-3 bg-blue-50 text-primary rounded-xl">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 flex items-center">
            <span className="font-semibold text-gray-700 mr-1">Operating Margin:</span>
            {totalIncome > 0 ? `${((netBalance / totalIncome) * 100).toFixed(1)}%` : '0%'}
          </p>
        </div>
      </div>

      {/* Liquidity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Cash in Hand Ledger</h3>
              <p className="text-xs text-gray-500">Physical currency at school reception counter</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Cash Inflows (Fee & Sales Counter):</span>
              <span className="font-semibold text-emerald-600">+₹{cashIncome.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cash Outflows (Petty Cash Expenses):</span>
              <span className="font-semibold text-rose-600">-₹{cashExpense.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t flex justify-between items-center text-base font-bold">
              <span className="text-gray-800">Available Liquid Cash:</span>
              <span className="text-lg text-gray-900">₹{cashInHand.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Institutional Bank Account</h3>
              <p className="text-xs text-gray-500">State Bank of India • St. Michel School Trust</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Digital Inflows (OwnPay & Bank Transfers):</span>
              <span className="font-semibold text-emerald-600">+₹{(onlineIncome + bankIncome).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Direct Bank Outflows (Vendor NEFT & Wire):</span>
              <span className="font-semibold text-rose-600">-₹{bankExpense.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t flex justify-between items-center text-base font-bold">
              <span className="text-gray-800">Net Bank Reconciliation:</span>
              <span className="text-lg text-primary">₹{bankBalance.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Financial Transactions Stream */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">Consolidated Cash Flow Stream</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Reference / Name</th>
                <th className="px-4 py-3">Category / Mode</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Flow Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.slice(0, 5).map((p) => (
                <tr key={p._id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                      Income
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.student ? `${p.student.firstName} ${p.student.lastName}` : 'Fee Payment'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.paymentMode}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">
                    +₹{p.amount?.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              {expenses.slice(0, 5).map((e) => (
                <tr key={e._id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800">
                      Expense
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{e.title}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{e.category} ({e.paymentMethod})</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right font-bold text-rose-600">
                    -₹{e.amount?.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
