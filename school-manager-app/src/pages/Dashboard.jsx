import { useState, useEffect } from 'react';
import {
  Users,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  UserPlus,
  ArrowUpRight,
  Package
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import axios from '../api/axios';

const StatCard = ({ title, value, icon: Icon, color, subValue }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={`p-4 rounded-2xl ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
      {subValue && <p className="text-xs text-gray-500 font-medium mt-0.5">{subValue}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/reports/dashboard-stats');
        setStats(response.data.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const chartData = [
    { name: 'Apr', amount: 45000 },
    { name: 'May', amount: 32000 },
    { name: 'Jun', amount: 28000 },
    { name: 'Jul', amount: 65000 },
    { name: 'Aug', amount: 48000 },
    { name: 'Sep', amount: 54000 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-gray-900">St. Michel School Manager Overview</h2>
        <p className="text-gray-500 text-sm mt-1">Real-time centralized operations, financial collection, and stock status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={Users}
          color="bg-blue-600"
          subValue="Active Enrolled"
        />
        <StatCard
          title="Today's Collection"
          value={`₹${((stats?.todayCollection || 0) / 100).toLocaleString()}`}
          icon={IndianRupee}
          color="bg-green-600"
          subValue="Verified Payments"
        />
        <StatCard
          title="Pending Dues"
          value={`₹${((stats?.totalPending || 0) / 100).toLocaleString()}`}
          icon={AlertTriangle}
          color="bg-amber-600"
          subValue="Outstanding Bills"
        />
        <StatCard
          title="Total Expenses"
          value={`₹${((stats?.totalExpenses || 0) / 100).toLocaleString()}`}
          icon={TrendingUp}
          color="bg-purple-600"
          subValue="Operations & Staff"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Fee Collection Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Payment Collections</h3>
          <div className="space-y-3">
            {stats?.recentPayments && stats.recentPayments.length > 0 ? (
              stats.recentPayments.map((p) => (
                <div key={p._id} className="flex items-center justify-between py-3 border-b last:border-0 border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-50 p-2.5 rounded-xl border border-green-100">
                      <CreditCard className="h-4 w-4 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {p.student?.firstName} {p.student?.lastName || 'Student'}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">
                        {p.paymentMode} • Receipt #{p.receiptNumber}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-green-600">+ ₹{p.amount / 100}</p>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400 text-sm font-medium">
                No recent payment transactions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
