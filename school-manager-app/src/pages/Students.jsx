import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import axios from '../api/axios';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/students');
      setStudents(response.data.data);
    } catch (err) {
      console.error('Error fetching students', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/classes');
      setClasses(response.data.data);
    } catch (err) {
      console.error('Error fetching classes', err);
    }
  };

  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) ||
                          student.admissionNumber.toLowerCase().includes(search.toLowerCase());
    const matchesClass = filterClass === '' || student.class._id === filterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Directory</h2>
          <p className="text-gray-500">Manage all students enrolled in St. Michel School.</p>
        </div>
        <Link to="/admission" className="btn btn-primary text-center">
          New Admission
        </Link>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or admission number..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select
              className="input w-40"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-sm font-medium text-gray-500">
                <th className="pb-4 px-4">Student</th>
                <th className="pb-4 px-4">Admission No</th>
                <th className="pb-4 px-4">Class/Section</th>
                <th className="pb-4 px-4">Parent Name</th>
                <th className="pb-4 px-4">Status</th>
                <th className="pb-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="6" className="py-10 text-center text-gray-500">Loading students...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan="6" className="py-10 text-center text-gray-500">No students found.</td></tr>
              ) : filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-gray-500">{student.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{student.admissionNumber}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {student.class?.name} - {student.section?.name}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {student.parent?.fullName}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/students/${student._id}`} className="p-1 hover:text-primary transition-colors">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button className="p-1 hover:text-yellow-600 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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

export default Students;
