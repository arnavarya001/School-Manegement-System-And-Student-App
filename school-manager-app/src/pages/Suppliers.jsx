import { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Building,
  UserCheck
} from 'lucide-react';
import axios from '../api/axios';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    category: 'Uniform & Stationery'
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get('/suppliers');
      setSuppliers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load suppliers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/suppliers', formData);
      alert('Supplier added successfully!');
      setShowModal(false);
      setFormData({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        category: 'Uniform & Stationery'
      });
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add supplier');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await axios.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.contactPerson?.toLowerCase().includes(q) || s.phone?.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors & Suppliers</h1>
          <p className="text-sm text-gray-500">Authorized partners for books, uniforms, sports & school equipment</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Supplier
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers by name, contact person, or phone..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Supplier Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading vendors...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-500">
          <Truck className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="font-medium text-gray-700">No suppliers registered yet</p>
          <p className="text-sm text-gray-400 mt-1">Add book publishers, uniform manufacturers, and stationery vendors.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <div key={s._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{s.name}</h3>
                    <span className="text-xs text-primary font-medium">{s.category || 'Vendor'}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(s._id)}
                  className="text-gray-400 hover:text-rose-600 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2 text-xs text-gray-600">
                {s.contactPerson && (
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-gray-400" />
                    <span>{s.contactPerson}</span>
                  </div>
                )}
                {s.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{s.phone}</span>
                  </div>
                )}
                {s.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{s.email}</span>
                  </div>
                )}
                {s.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{s.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Register New Supplier</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oxford University Press, Titan Uniforms"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Sharma"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="Uniform / Books"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="supplier@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Address</label>
                <textarea
                  rows="2"
                  placeholder="Factory / Warehouse location..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                ></textarea>
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
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
