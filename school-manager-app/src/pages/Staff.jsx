import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Trash2,
  Briefcase,
  IndianRupee,
  Phone,
  Mail,
  GraduationCap
} from 'lucide-react';
import axios from '../api/axios';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    role: 'Teacher',
    department: 'Academics',
    email: '',
    phone: '',
    salary: 25000,
    qualification: 'B.Ed, M.Sc'
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get('/staff');
      setStaffList(res.data.data || []);
    } catch (err) {
      console.error('Failed to load staff list', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/staff', formData);
      alert('Staff member added successfully!');
      setShowModal(false);
      setFormData({
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        role: 'Teacher',
        department: 'Academics',
        email: '',
        phone: '',
        salary: 25000,
        qualification: 'B.Ed, M.Sc'
      });
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add staff member');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await axios.delete(`/staff/${id}`);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const filtered = staffList.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(q) || s.employeeId?.toLowerCase().includes(q) || s.department?.toLowerCase().includes(q);
    const matchRole = roleFilter ? s.role === roleFilter : true;
    return matchSearch && matchRole;
  });

  const totalPayroll = staffList.reduce((sum, s) => sum + (s.salary || 0), 0);
  const teachersCount = staffList.filter(s => s.role === 'Teacher').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers & School Staff</h1>
          <p className="text-sm text-gray-500">Manage teaching faculty, administrative employees & monthly payroll</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Employees</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{staffList.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Faculty / Teachers</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{teachersCount}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Monthly Payroll Budget</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{totalPayroll.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, employee ID, department..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
          >
            <option value="">All Job Roles</option>
            <option value="Teacher">Teacher</option>
            <option value="Accountant">Accountant</option>
            <option value="Clerk">Clerk / Admin</option>
            <option value="Librarian">Librarian</option>
            <option value="Security">Security Guard</option>
            <option value="Support">Support Staff</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading faculty directory...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-gray-700">No staff members found</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add Staff Member" to add teachers or administration staff.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Emp ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Role / Designation</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Monthly Salary</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-primary text-xs">
                      {s.employeeId}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.qualification || s.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        s.role === 'Teacher' ? 'bg-blue-100 text-blue-800' :
                        s.role === 'Accountant' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {s.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      {s.department || 'General'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      {s.phone || '—'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ₹{s.salary?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700 font-medium">
                        {s.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="text-gray-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Staff / Faculty Member</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="Teacher">Teacher</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Clerk">Clerk / Office</option>
                    <option value="Librarian">Librarian</option>
                    <option value="Security">Security Guard</option>
                    <option value="Support">Support Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Science, Mathematics"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="B.Ed, M.Sc"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email</label>
                <input
                  type="email"
                  placeholder="staff@stmichel.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="pt-2 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
