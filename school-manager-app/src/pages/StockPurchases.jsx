import { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Truck,
  IndianRupee,
  Calendar,
  CheckCircle,
  Package
} from 'lucide-react';
import axios from '../api/axios';

const StockPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 10,
    purchasePrice: 100,
    supplier: '',
    invoiceNumber: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [purchasesRes, productsRes, suppliersRes] = await Promise.all([
        axios.get('/inventory/purchases'),
        axios.get('/inventory/products'),
        axios.get('/suppliers')
      ]);
      setPurchases(purchasesRes.data.data || []);
      setProducts(productsRes.data.data || []);
      setSuppliers(suppliersRes.data.data || []);
    } catch (err) {
      console.error('Failed to load stock purchases', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity || !formData.purchasePrice) {
      alert('Please fill in product, quantity, and purchase price.');
      return;
    }
    try {
      await axios.post('/inventory/purchase', formData);
      alert('Stock purchase recorded and inventory updated successfully!');
      setShowModal(false);
      setFormData({
        productId: '',
        quantity: 10,
        purchasePrice: 100,
        supplier: '',
        invoiceNumber: '',
        notes: ''
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record purchase');
    }
  };

  const filtered = purchases.filter((p) => {
    const prodName = p.product?.name?.toLowerCase() || '';
    const supp = p.supplier?.toLowerCase() || '';
    const inv = p.invoiceNumber?.toLowerCase() || '';
    const q = search.toLowerCase();
    return prodName.includes(q) || supp.includes(q) || inv.includes(q);
  });

  const totalSpent = purchases.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0);
  const totalUnits = purchases.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Purchases & Procurement</h1>
          <p className="text-sm text-gray-500">Record incoming stock batches from suppliers & increase inventory</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Log Stock Purchase
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Procurement Cost</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalSpent.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Units Purchased</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalUnits.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Purchase Transactions</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{purchases.length}</p>
        </div>
      </div>

      {/* Filter / Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product, supplier, or invoice number..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading purchase ledger...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-gray-700">No stock purchases recorded yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "Log Stock Purchase" to add items from vendors.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Supplier / Vendor</th>
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4 text-center">Quantity</th>
                  <th className="px-6 py-4">Unit Cost</th>
                  <th className="px-6 py-4">Total Cost</th>
                  <th className="px-6 py-4">Received By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(item.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.product?.name || 'Deleted Product'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 font-medium">
                        {item.supplier || 'Direct'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {item.invoiceNumber || '—'}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-800">
                      +{item.quantity}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      ₹{item.purchasePrice?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ₹{(item.purchasePrice * item.quantity).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {item.receivedBy?.name || 'Manager'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Log New Stock Purchase</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Select Product *</label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => {
                    const prod = products.find(p => p._id === e.target.value);
                    setFormData({
                      ...formData,
                      productId: e.target.value,
                      purchasePrice: prod ? prod.purchasePrice : formData.purchasePrice
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="">Choose Product to Restock...</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (Current Stock: {p.quantity})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Purchase Cost (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Supplier / Vendor</label>
                <input
                  type="text"
                  placeholder="e.g. Oxford Book Depot, Star Uniforms"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Supplier Invoice Number</label>
                <input
                  type="text"
                  placeholder="e.g. INV-9982"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Notes / Remarks</label>
                <textarea
                  rows="2"
                  placeholder="Batch #, delivery notes, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  Confirm & Add to Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPurchases;
