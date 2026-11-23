import { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  Filter,
  CheckCircle,
  IndianRupee,
  ShoppingBag,
  UserCheck,
  AlertTriangle,
  FileText
} from 'lucide-react';
import axios from '../api/axios';

const ProductSales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [cartItems, setCartItems] = useState([
    { productId: '', quantity: 1, unitPrice: 0 }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, prodRes, stuRes] = await Promise.all([
        axios.get('/inventory/sales'),
        axios.get('/inventory/products'),
        axios.get('/students')
      ]);
      setSales(salesRes.data.data || []);
      setProducts(prodRes.data.data || []);
      setStudents(stuRes.data.data || []);
    } catch (err) {
      console.error('Failed to load sales data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (index, productId) => {
    const prod = products.find(p => p._id === productId);
    const updated = [...cartItems];
    updated[index].productId = productId;
    updated[index].unitPrice = prod ? prod.sellingPrice : 0;
    setCartItems(updated);
  };

  const handleQuantityChange = (index, qty) => {
    const updated = [...cartItems];
    updated[index].quantity = parseInt(qty) || 1;
    setCartItems(updated);
  };

  const addRow = () => {
    setCartItems([...cartItems, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeRow = (index) => {
    setCartItems(cartItems.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('Please select a student.');
      return;
    }
    const validItems = cartItems.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      alert('Please add at least one valid product.');
      return;
    }

    try {
      const payload = {
        studentId: selectedStudent,
        items: validItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        academicSession: '2026-2027'
      };

      await axios.post('/inventory/issue', payload);
      alert('Products successfully sold/issued! Stock automatically deducted and bill generated.');
      setShowModal(false);
      setSelectedStudent('');
      setCartItems([{ productId: '', quantity: 1, unitPrice: 0 }]);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete sale');
    }
  };

  const filtered = sales.filter((item) => {
    const stuName = item.student ? `${item.student.firstName} ${item.student.lastName}`.toLowerCase() : '';
    const adm = item.student?.admissionNumber?.toLowerCase() || '';
    const prod = item.product?.name?.toLowerCase() || '';
    const q = search.toLowerCase();
    return stuName.includes(q) || adm.includes(q) || prod.includes(q);
  });

  const totalSalesRevenue = sales.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const totalUnitsSold = sales.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Sales & Material Counter</h1>
          <p className="text-sm text-gray-500">Sell school uniforms, books, stationery & automatically deduct inventory</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Sell / Issue Materials
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Sales Revenue</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{totalSalesRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Items Sold</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalUnitsSold.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Sales Transactions</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{sales.length}</p>
        </div>
      </div>

      {/* Filter / Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name, admission #, product..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading sales counter history...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-gray-700">No product sales recorded yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "Sell / Issue Materials" to issue uniform or books to students.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4 text-center">Qty</th>
                  <th className="px-6 py-4">Unit Price</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Bill Ref</th>
                  <th className="px-6 py-4">Issued By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(item.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {item.student ? (
                        <div>
                          <p className="font-medium text-gray-900">{item.student.firstName} {item.student.lastName}</p>
                          <p className="text-xs text-gray-400">ADM: {item.student.admissionNumber}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {item.product?.name || 'Item'}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-800">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      ₹{item.unitPrice?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      ₹{item.totalPrice?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-primary">
                      {item.bill?.billNumber || 'Attached'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {item.issuedBy?.name || 'Staff'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Point of Sale: Issue Materials</h2>
            <p className="text-xs text-gray-500 mb-4">Stock will be automatically deducted from inventory.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Select Student *</label>
                <select
                  required
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="">Select Enrolled Student...</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName} (ADM: {s.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Cart Items</label>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border">
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => handleProductChange(index, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border rounded text-xs bg-white"
                      >
                        <option value="">Select Item...</option>
                        {products.map(p => (
                          <option key={p._id} value={p._id} disabled={p.quantity <= 0}>
                            {p.name} - ₹{p.sellingPrice} ({p.quantity <= 0 ? 'OUT OF STOCK' : `Stock: ${p.quantity}`})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className="w-16 px-2 py-1.5 border rounded text-xs text-center"
                        placeholder="Qty"
                      />

                      <span className="w-20 text-xs font-semibold text-right pr-2">
                        ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                      </span>

                      {cartItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          className="text-rose-500 hover:text-rose-700 text-xs px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addRow}
                  className="mt-2 text-xs text-primary font-semibold hover:underline"
                >
                  + Add Another Product
                </button>
              </div>

              <div className="pt-3 border-t flex justify-between items-center text-sm font-bold">
                <span>Total Invoice Value:</span>
                <span className="text-emerald-600 text-lg">
                  ₹{cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toLocaleString('en-IN')}
                </span>
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
                  Confirm Sale & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSales;
