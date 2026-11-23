import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Search, Check, X, Clock, AlertCircle, Save } from 'lucide-react';
import axios from '../api/axios';

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({}); // { studentId: { status: 'Present', remark: '' } }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/classes');
      setClasses(response.data.data);
    } catch (err) {
      console.error('Error fetching classes', err);
    }
  };

  const handleClassChange = async (classId) => {
    setSelectedClass(classId);
    setSelectedSection('');
    setStudents([]);
    try {
      const response = await axios.get(`/classes/${classId}/sections`);
      setSections(response.data.data);
    } catch (err) {
      console.error('Error fetching sections', err);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass || !selectedSection) return;
    setLoading(true);
    try {
      // In a real app, we'd have a filtered students endpoint
      // For now, I'll filter the main list
      const response = await axios.get('/students');
      const filtered = response.data.data.filter(s =>
        s.class._id === selectedClass && s.section._id === selectedSection
      );
      setStudents(filtered);

      // Check if attendance already exists for this date
      const attendanceRes = await axios.get(`/attendance?classId=${selectedClass}&sectionId=${selectedSection}&date=${date}`);

      const initialData = {};
      filtered.forEach(s => {
        const existing = attendanceRes.data.data.find(a => a.student._id === s._id);
        initialData[s._id] = {
          status: existing ? existing.status : 'Present',
          remark: existing ? existing.remark : ''
        };
      });
      setAttendanceData(initialData);
    } catch (err) {
      console.error('Error fetching students', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData({
      ...attendanceData,
      [studentId]: { ...attendanceData[studentId], status }
    });
  };

  const handleRemarkChange = (studentId, remark) => {
    setAttendanceData({
      ...attendanceData,
      [studentId]: { ...attendanceData[studentId], remark }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        classId: selectedClass,
        sectionId: selectedSection,
        date,
        attendanceData: Object.entries(attendanceData).map(([studentId, data]) => ({
          studentId,
          status: data.status,
          remark: data.remark
        }))
      };
      await axios.post('/attendance', payload);
      alert('Attendance saved successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Manage Attendance</h2>
        <p className="text-gray-500">Record daily student attendance by class and section.</p>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              className="input mt-1"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Class</label>
            <select
              className="input mt-1"
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
            >
              <option value="">Select Class</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Section</label>
            <select
              className="input mt-1"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="">Select Section</option>
              {sections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <button
            onClick={fetchStudents}
            disabled={!selectedClass || !selectedSection || loading}
            className="btn btn-primary"
          >
            {loading ? 'Loading...' : 'Fetch Students'}
          </button>
        </div>
      </div>

      {students.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold">Student List ({students.length})</h3>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <span className="h-3 w-3 bg-green-500 rounded-full"></span>
                <span>Present: {Object.values(attendanceData).filter(v => v.status === 'Present').length}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="h-3 w-3 bg-red-500 rounded-full"></span>
                <span>Absent: {Object.values(attendanceData).filter(v => v.status === 'Absent').length}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-sm font-medium text-gray-500">
                  <th className="pb-4 px-4">Roll</th>
                  <th className="pb-4 px-4">Student Name</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((student) => (
                  <tr key={student._id}>
                    <td className="py-4 px-4 text-sm">{student.rollNumber || '-'}</td>
                    <td className="py-4 px-4">
                      <p className="font-medium">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-gray-500">{student.admissionNumber}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStatusChange(student._id, 'Present')}
                          className={`p-2 rounded-lg transition-colors ${
                            attendanceData[student._id]?.status === 'Present'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          title="Present"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(student._id, 'Absent')}
                          className={`p-2 rounded-lg transition-colors ${
                            attendanceData[student._id]?.status === 'Absent'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          title="Absent"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(student._id, 'Leave')}
                          className={`p-2 rounded-lg transition-colors ${
                            attendanceData[student._id]?.status === 'Leave'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          title="Leave"
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <input
                        type="text"
                        placeholder="Add note..."
                        className="input text-xs py-1"
                        value={attendanceData[student._id]?.remark || ''}
                        onChange={(e) => handleRemarkChange(student._id, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
