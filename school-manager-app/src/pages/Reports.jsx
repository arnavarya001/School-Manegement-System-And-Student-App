import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Download,
  Filter,
  IndianRupee,
  Users,
  Package,
  Calendar
} from 'lucide-react';
import axios from '../api/axios';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('finance');
  const [financeData, setFinanceData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [activeTab]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'finance') {
        const response = await axios.get('/reports/finance');
        setFinanceData(response.data.data);
      } else if (activeTab === 'inventory') {
        const response = await axios.get('/reports/inventory');
        setInventoryData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching report data', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#1e3a8a', '#3b82f6', '#facc15', '#ef4444'];

  const financePieData = financeData ? [
    { name: 'Cash', value: financeData.summary.byMode.Cash },
    { name: 'Online', value: financeData.summary.byMode.Online },
    { name: 'Cheque', value: financeData.summary.byMode.Cheque },
    { name: 'Bank Transfer', value: financeData.summary.byMode.BankTransfer },
  ].filter(item => item.value > 0) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-500">Comprehensive view of school performance and data.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn bg-white border hover:bg-gray-50 flex items-center">
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </button>
          <button className="btn bg-white border hover:bg-gray-50 flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Date Filter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto">
        {[
          { id: 'finance', name: 'Financial Report', icon: IndianRupee },
          { id: 'inventory', name: 'Inventory Report', icon: Package },
          { id: 'students', name: 'Student Demographics', icon: Users },
          { id: 'attendance', name: 'Attendance Trends', icon: Calendar },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500">Generating report...</div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'finance' && financeData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="card">
                  <h3 className="font-bold mb-6">Collections by Payment Mode</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={financePieData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(val) => `₹${val/100}`} />
                        <Tooltip formatter={(val) => `₹${val/100}`} />
                        <Bar dataKey="value" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-bold mb-4">Detailed Transaction List</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b text-gray-500 font-medium">
                          <th className="pb-3 px-2">Date</th>
                          <th className="pb-3 px-2">Student</th>
                          <th className="pb-3 px-2">Mode</th>
                          <th className="pb-3 px-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {financeData.payments.map((p) => (
                          <tr key={p._id}>
                            <td className="py-3 px-2">{new Date(p.paymentDate).toLocaleDateString()}</td>
                            <td className="py-3 px-2 font-medium">{p.student?.firstName} {p.student?.lastName}</td>
                            <td className="py-3 px-2">{p.paymentMode}</td>
                            <td className="py-3 px-2 text-right font-bold text-green-600">₹{(p.amount / 100).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="card">
                  <h3 className="font-bold mb-4">Total Revenue</h3>
                  <div className="text-center py-6">
                    <p className="text-4xl font-black text-primary">₹{(financeData.summary.totalAmount / 100).toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-2">Total amount collected in period</p>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-bold mb-6">Revenue Split %</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={financePieData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {financePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => `₹${val/100}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && inventoryData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="font-bold mb-4">Inventory Value Summary</h3>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <div>
                      <p className="text-sm text-blue-600 font-bold">Total Stock Value (Cost)</p>
                      <h4 className="text-2xl font-black text-primary">₹{(inventoryData.totalValue / 100).toLocaleString()}</h4>
                    </div>
                    <Package className="h-10 w-10 text-primary opacity-20" />
                  </div>
                </div>
                <div className="card">
                  <h3 className="font-bold mb-4">Stock Availability</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{inventoryData.products.filter(p => p.quantity > p.minStock).length}</p>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Healthy</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{inventoryData.products.filter(p => p.quantity <= p.minStock && p.quantity > 0).length}</p>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Low</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{inventoryData.products.filter(p => p.quantity === 0).length}</p>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Out</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-bold mb-4">Product Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-gray-500 font-medium">
                        <th className="pb-3 px-2">Product Name</th>
                        <th className="pb-3 px-2">Category</th>
                        <th className="pb-3 px-2">Stock Level</th>
                        <th className="pb-3 px-2 text-right">Potential Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {inventoryData.products.map((p) => (
                        <tr key={p._id}>
                          <td className="py-3 px-2 font-medium">{p.name}</td>
                          <td className="py-3 px-2">{p.category?.name}</td>
                          <td className="py-3 px-2">
                             <div className="w-full bg-gray-100 h-2 rounded-full mt-1">
                               <div
                                 className={`h-full rounded-full ${p.quantity <= p.minStock ? 'bg-red-500' : 'bg-primary'}`}
                                 style={{ width: `${Math.min(100, (p.quantity / 100) * 100)}%` }}
                               ></div>
                             </div>
                             <p className="text-[10px] font-bold text-gray-400 mt-1">{p.quantity} In Stock</p>
                          </td>
                          <td className="py-3 px-2 text-right font-bold">₹{((p.quantity * p.sellingPrice) / 100).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
