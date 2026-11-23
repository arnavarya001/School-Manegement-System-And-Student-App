import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, PieChart } from 'lucide-react';
import axios from '../api/axios';

const Attendance = ({ activeStudent }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeStudent) {
      fetchAttendance();
    }
  }, [activeStudent]);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(`/attendance/student/${activeStudent._id}`);
      setAttendance(response.data.data);
    } catch (err) {
      console.error('Error fetching attendance', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    present: attendance.filter(a => a.status === 'Present').length,
    absent: attendance.filter(a => a.status === 'Absent').length,
    leave: attendance.filter(a => a.status === 'Leave').length,
    total: attendance.length || 1 // Avoid division by zero
  };

  const percentage = ((stats.present / stats.total) * 100).toFixed(1);

  if (loading) return <div className="py-10 text-center font-bold text-gray-500">Loading attendance...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Attendance</h2>

      {/* Summary Card */}
      <div className="card bg-primary text-white overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-blue-200 uppercase">Overall Attendance</p>
              <h3 className="text-4xl font-black mt-1">{percentage}%</h3>
            </div>
            <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center">
              <PieChart className="h-8 w-8" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-6">
            <div className="bg-white/10 p-2 rounded-xl text-center">
              <p className="text-[10px] font-bold text-blue-200 uppercase">Present</p>
              <p className="text-lg font-black">{stats.present}</p>
            </div>
            <div className="bg-white/10 p-2 rounded-xl text-center">
              <p className="text-[10px] font-bold text-blue-200 uppercase">Absent</p>
              <p className="text-lg font-black">{stats.absent}</p>
            </div>
            <div className="bg-white/10 p-2 rounded-xl text-center">
              <p className="text-[10px] font-bold text-blue-200 uppercase">Leave</p>
              <p className="text-lg font-black">{stats.leave}</p>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-white/5 rounded-full"></div>
      </div>

      {/* History */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">History</h3>
        <div className="space-y-3">
          {attendance.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No attendance records found.</p>
          ) : (
            attendance.map((record, i) => (
              <div key={i} className="card flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    record.status === 'Present' ? 'bg-green-50 text-green-500' :
                    record.status === 'Absent' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-500'
                  }`}>
                    {record.status === 'Present' ? <CheckCircle2 className="h-5 w-5" /> :
                     record.status === 'Absent' ? <XCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{new Date(record.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-xs font-medium text-gray-400 capitalize">{record.status}</p>
                  </div>
                </div>
                {record.remark && (
                  <div className="text-right">
                    <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-500">{record.remark}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
