import { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  History,
  Download
} from 'lucide-react';
import axios from '../api/axios';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const [issueData, setIssueData] = useState({
    studentId: '',
    items: [{ productId: '', quantity: 1 }],
    academicSession: '2023-2024',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
  });

  const [purchaseData, setPurchaseData] = useState({
    productId: '',
    quantity: 0,
    purchasePrice: 0,
    supplier: '',
    invoiceNumber: '',
    notes: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/inventory/products');
      setProducts(response.data.data);
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueItems = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/inventory/issue', issueData);
      alert('Items issued successfully and bill generated!');
      setShowIssueModal(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to issue items');
    }
  };

  const handlePurchaseStock = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/inventory/purchase', purchaseData);
      alert('Stock purchased and updated!');
      setShowPurchaseModal(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to purchase stock');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory & Stock</h2>
          <p className="text-gray-500">Manage school materials, uniforms, and stationary stock.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="btn bg-white border hover:bg-gray-50 flex items-center"
          >
            <ArrowUpRight className="h-4 w-4 mr-2" /> Add Stock
          </button>
          <button
            onClick={() => setShowIssueModal(true)}
            className="btn btn-primary flex items-center"
          >
            <ArrowDownLeft className="h-4 w-4 mr-2" /> Issue Items
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-500 font-medium">Total Items</p>
          <h3 className="text-2xl font-bold mt-1">{products.length}</h3>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 font-medium">Low Stock Alerts</p>
          <h3 className="text-2xl font-bold mt-1 text-red-600">
            {products.filter(p => p.quantity <= p.minStock).length}
          </h3>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 font-medium">Stock Value</p>
          <h3 className="text-2xl font-bold mt-1 text-green-600">
            ₹{(products.reduce((sum, p) => sum + (p.quantity * p.purchasePrice), 0) / 100).toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or code..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn bg-gray-100 hover:bg-gray-200">
            <Filter className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-sm font-medium text-gray-500">
                <th className="pb-4 px-4">Product</th>
                <th className="pb-4 px-4">Category</th>
                <th className="pb-4 px-4">Price (Sell)</th>
                <th className="pb-4 px-4">In Stock</th>
                <th className="pb-4 px-4">Status</th>
                <th className="pb-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="6" className="py-10 text-center text-gray-500">Loading products...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="6" className="py-10 text-center text-gray-500">No products found.</td></tr>
              ) : filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.code}</p>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{product.category?.name}</td>
                  <td className="py-4 px-4 text-sm">₹{(product.sellingPrice / 100).toLocaleString()}</td>
                  <td className="py-4 px-4 text-sm font-bold">{product.quantity}</td>
                  <td className="py-4 px-4">
                    {product.quantity <= 0 ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Out of Stock</span>
                    ) : product.quantity <= product.minStock ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center w-fit">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Available</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button className="p-1 hover:text-primary"><History className="h-4 w-4" /></button>
                    <button className="p-1 hover:text-primary"><Plus className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Issue Inventory to Student</h3>
            <form onSubmit={handleIssueItems} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Admission ID / MongoID *</label>
                <input
                  type="text" required className="input mt-1"
                  onChange={(e) => setIssueData({...issueData, studentId: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Items</label>
                  <button
                    type="button"
                    onClick={() => setIssueData({...issueData, items: [...issueData.items, { productId: '', quantity: 1 }]})}
                    className="text-xs text-primary font-bold"
                  >
                    + Add Item
                  </button>
                </div>
                {issueData.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <select
                      className="input flex-1 text-sm"
                      required
                      value={item.productId}
                      onChange={(e) => {
                        const newItems = [...issueData.items];
                        newItems[idx].productId = e.target.value;
                        setIssueData({...issueData, items: newItems});
                      }}
                    >
                      <option value="">Select Product</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id} disabled={p.quantity <= 0}>
                          {p.name} ({p.quantity} left)
                        </option>
                      ))}
                    </select>
                    <input
                      type="number" min="1" required className="input w-20 text-sm"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...issueData.items];
                        newItems[idx].quantity = parseInt(e.target.value);
                        setIssueData({...issueData, items: newItems});
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date for Payment</label>
                  <input
                    type="date" required className="input mt-1 text-sm"
                    value={issueData.dueDate}
                    onChange={(e) => setIssueData({...issueData, dueDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Session</label>
                  <input
                    type="text" required className="input mt-1 text-sm"
                    value={issueData.academicSession}
                    onChange={(e) => setIssueData({...issueData, academicSession: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="btn bg-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm & Generate Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Add New Stock (Purchase)</h3>
            <form onSubmit={handlePurchaseStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product *</label>
                <select
                  className="input mt-1" required
                  value={purchaseData.productId}
                  onChange={(e) => setPurchaseData({...purchaseData, productId: e.target.value})}
                >
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.code})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                  <input
                    type="number" min="1" required className="input mt-1"
                    onChange={(e) => setPurchaseData({...purchaseData, quantity: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Cost (₹) *</label>
                  <input
                    type="number" required className="input mt-1"
                    onChange={(e) => setPurchaseData({...purchaseData, purchasePrice: parseFloat(e.target.value) * 100})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
                <input
                  type="text" className="input mt-1"
                  onChange={(e) => setPurchaseData({...purchaseData, supplier: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                <input
                  type="text" className="input mt-1"
                  onChange={(e) => setPurchaseData({...purchaseData, invoiceNumber: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="btn bg-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Filter = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
);

export default Inventory;
