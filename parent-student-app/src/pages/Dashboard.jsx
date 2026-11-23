import { useState, useEffect } from 'react';
import {
  IndianRupee,
  Calendar,
  TrendingUp,
  ChevronRight,
  CreditCard,
  Users,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

const Dashboard = ({ user, activeStudent, setActiveStudent }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/auth/me');
        const { role } = response.data.data;
        const { profile } = response.data;

        let studentsList = [];
        if (role === 'parent') {
          studentsList = profile.students || [];
        } else if (role === 'student') {
          studentsList = profile ? [profile] : [];
        }

        setStudents(studentsList);

        // If no active student is set, set the first one
        if (!activeStudent && studentsList.length > 0) {
          const firstStudent = studentsList[0];
          setActiveStudent(firstStudent);
          localStorage.setItem('activeStudent', JSON.stringify(firstStudent));
        }

        // Fetch announcements
        const annRes = await axios.get('/announcements?target=' + (role === 'parent' ? 'Parents' : 'Students'));
        setAnnouncements(annRes.data.data);

        // Fetch bills for active student if exists
        const currentStudentId = activeStudent?._id || studentsList[0]?._id;
        if (currentStudentId) {
          const billsRes = await axios.get(`/bills/student/${currentStudentId}`);
          setBills(billsRes.data.data);
        }

      } catch (err) {
        console.error('Dashboard Data Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, activeStudent?._id, setActiveStudent]);

  const handleSwitchStudent = (student) => {
    setActiveStudent(student);
    localStorage.setItem('activeStudent', JSON.stringify(student));
  };

  if (loading) return <div className="py-20 text-center font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Dashboard...</div>;

  const pendingAmount = bills.reduce((sum, b) => sum + b.dueAmount, 0);
  const attendancePercentage = activeStudent?.attendancePercentage || 0;

  return (
    <div className="space-y-6">
      {/* Student Switcher (for Parents) */}
      {user.user.role === 'parent' && students.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
          {students.map(s => (
            <button
              key={s._id}
              onClick={() => handleSwitchStudent(s)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-sm font-black transition-all ${
                activeStudent?._id === s._id
                  ? 'bg-primary text-white shadow-xl shadow-blue-900/20'
                  : 'bg-white text-gray-400 border border-gray-100 hover:border-primary/20'
              }`}
            >
              {s.firstName}
            </button>
          ))}
        </div>
      )}

      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">
            Hi, {user.user.name.split(' ')[0]}!
          </h2>
          <p className="text-gray-400 font-bold text-sm">Update for {activeStudent?.firstName} ({activeStudent?.class?.name}-{activeStudent?.section?.name})</p>
        </div>
        <Link to="/announcements" className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center relative">
          <Bell className="h-6 w-6 text-gray-400" />
          {announcements.length > 0 && (
            <span className="absolute top-3 right-3 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          )}
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/fees" className="card bg-primary text-white block">
          <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <IndianRupee className="h-5 w-5 text-white" />
          </div>
          <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Pending Dues</p>
          <h3 className="text-xl font-black mt-1">₹{(pendingAmount / 100).toLocaleString()}</h3>
        </Link>
        <Link to="/attendance" className="card bg-secondary text-primary block">
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Attendance</p>
          <h3 className="text-xl font-black mt-1">{attendancePercentage.toFixed(1)}%</h3>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Pay Fee', icon: CreditCard, color: 'text-orange-500', bg: 'bg-orange-50', to: '/fees' },
          { label: 'Attendance', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50', to: '/attendance' },
          { label: 'Materials', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50', to: '/inventory' },
          { label: 'Notices', icon: Bell, color: 'text-pink-500', bg: 'bg-pink-50', to: '/announcements' },
        ].map((action, i) => (
          <Link key={i} to={action.to} className="flex flex-col items-center space-y-2 p-2">
            <div className={`h-14 w-14 ${action.bg} rounded-2xl flex items-center justify-center shadow-sm`}>
              <action.icon className={`h-6 w-6 ${action.color}`} />
            </div>
            <span className="text-[9px] font-black uppercase text-gray-500 text-center tracking-tight">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Announcements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Latest Notice</h3>
          <Link to="/announcements" className="text-xs font-bold text-primary">View All</Link>
        </div>
        {announcements.length > 0 ? (
          <div className="card border-l-4 border-primary bg-white">
            <p className="text-sm font-bold text-gray-800 leading-relaxed">
              {announcements[0].title}
            </p>
            <p className="text-xs text-gray-400 mt-2 font-medium">
              {new Date(announcements[0].createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        ) : (
          <div className="card text-center py-6">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No new notices</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest px-1">Recent Activity</h3>
        <div className="space-y-3">
          {bills.slice(0, 3).map((bill) => (
            <div key={bill._id} className="card flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  bill.status === 'Paid' ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'
                }`}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">{bill.billType} Fee</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {bill.status} • {new Date(bill.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-gray-900">₹{(bill.payableAmount / 100).toLocaleString()}</p>
                <ChevronRight className="h-4 w-4 text-gray-200 ml-auto mt-0.5" />
              </div>
            </div>
          ))}
          {bills.length === 0 && (
             <div className="text-center py-6 text-gray-400 font-bold text-xs uppercase tracking-widest">
               No billing activity yet
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
