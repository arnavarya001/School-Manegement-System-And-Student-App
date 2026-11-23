import { useState, useEffect } from 'react';
import {
  FileText, Plus, Trash2, IndianRupee, User,
  Calendar, CheckCircle2, Download, Printer, ArrowRight
} from 'lucide-react';
import axios from '../api/axios';

const BillGenerator = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [feeCategories, setFeeCategories] = useState([]);

  // Bill items state
  const [billType, setBillType] = useState('Tuition');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
  const [items, setItems] = useState([
    { description: 'Tuition Fee - Quarter 1', amount: 5000, quantity: 1 }
  ]);
  const [discount, setDiscount] = useState(0);
  const [lateFee, setLateFee] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatedBill, setGeneratedBill] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get('/students'),
      axios.get('/inventory/products'),
      axios.get('/fees/categories')
    ]).then(([stuRes, prodRes, feeRes]) => {
      setStudents(stuRes.data.data || []);
      setProducts(prodRes.data.data || []);
      setFeeCategories(feeRes.data.data || []);
      if (stuRes.data.data?.length > 0) {
        setSelectedStudent(stuRes.data.data[0]);
      }
    }).catch(console.error);
  }, []);

  const addItem = () => {
    setItems([...items, { description: '', amount: 0, quantity: 1 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addInventoryProduct = (prod) => {
    setItems([
      ...items,
      {
        description: prod.name,
        amount: prod.sellingPrice / 100,
        quantity: 1,
        productId: prod._id
      }
    ]);
  };

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + ((parseFloat(it.amount) || 0) * (parseInt(it.quantity) || 1)), 0);
  const finalPayable = Math.max(0, subtotal - (parseFloat(discount) || 0) + (parseFloat(lateFee) || 0));

  const handleGenerateBill = async () => {
    if (!selectedStudent) {
      return alert('Please select a student');
    }
    if (items.length === 0 || !items[0].description) {
      return alert('Please add at least one line item with a description and amount');
    }

    setLoading(true);
    try {
      const defaultCatId = feeCategories[0]?._id;
      const formattedItems = items.map(it => ({
        feeCategory: it.feeCategory || defaultCatId,
        description: it.description,
        amount: Math.round((parseFloat(it.amount) || 0) * 100),
        quantity: parseInt(it.quantity) || 1
      }));

      const payload = {
        studentId: selectedStudent._id,
        academicSession: selectedStudent.academicSession || '2026-2027',
        items: formattedItems,
        dueDate: dueDate,
        discount: Math.round((parseFloat(discount) || 0) * 100),
        lateFee: Math.round((parseFloat(lateFee) || 0) * 100),
        billType: billType
      };

      const res = await axios.post('/bills/generate', payload);
      setGeneratedBill(res.data.data);
      alert(`Success! Bill #${res.data.data.billNumber} generated successfully.`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate bill');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.admissionNumber && s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-gray-900">Advanced Bill Generator</h2>
        <p className="text-gray-500 text-sm mt-1">
          Create official invoices for tuition fees, books, uniforms, bags, shoes, and school stationery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Student Selector */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              1. Select Student
            </h3>

            <input
              type="text"
              placeholder="Search by name or admission #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredStudents.map(s => (
                <div
                  key={s._id}
                  onClick={() => setSelectedStudent(s)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${
                    selectedStudent?._id === s._id
                      ? 'bg-blue-50 border-primary shadow-sm'
                      : 'hover:bg-gray-50 border-gray-100'
                  }`}
                >
                  <p className="font-bold text-gray-900 text-sm">{s.firstName} {s.lastName}</p>
                  <p className="text-xs text-gray-400 font-medium">
                    Class {s.class?.name || 'X'} • #{s.admissionNumber}
                  </p>
                </div>
              ))}
            </div>

            {selectedStudent && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs space-y-1.5 text-gray-600">
                <p><span className="font-bold">Parent:</span> {selectedStudent.parent?.fullName || 'Guardian'}</p>
                <p><span className="font-bold">Contact:</span> {selectedStudent.parent?.mobileNumber || '+91 98765 43210'}</p>
                <p><span className="font-bold">Address:</span> {selectedStudent.parent?.address || 'St. Michel Road'}</p>
              </div>
            )}
          </div>

          {/* Quick Add from Inventory */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Add from Stock</h3>
            <div className="flex flex-wrap gap-2">
              {products.map(p => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => addInventoryProduct(p)}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-blue-50 hover:border-primary border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition-colors"
                >
                  + {p.name} (₹{p.sellingPrice / 100})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Invoice Builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                2. Invoice Items & Schedule
              </h3>

              <div className="flex items-center space-x-3">
                <select
                  value={billType}
                  onChange={(e) => setBillType(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none"
                >
                  <option value="Tuition">Tuition Fee</option>
                  <option value="Admission">Admission Fee</option>
                  <option value="Inventory">Books & Uniform</option>
                  <option value="Room Rent">Room Rent</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Custom">Custom Invoice</option>
                </select>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none"
                />
              </div>
            </div>

            {/* Line items table */}
            <div className="space-y-3 mb-6">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center space-x-3 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Item description (e.g. Mathematics Book, Navy Blazer, Term Fee)"
                      value={it.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none"
                    />
                  </div>

                  <div className="w-20">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={it.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      className="w-full bg-white px-2 py-2 rounded-lg border border-gray-200 text-sm text-center font-bold text-gray-800 focus:outline-none"
                    />
                  </div>

                  <div className="w-28">
                    <div className="relative">
                      <span className="absolute left-2.5 top-2.5 text-xs text-gray-400">₹</span>
                      <input
                        type="number"
                        placeholder="Price"
                        value={it.amount}
                        onChange={(e) => updateItem(idx, 'amount', e.target.value)}
                        className="w-full bg-white pl-6 pr-2 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="w-24 text-right font-black text-gray-900 text-sm">
                    ₹{((parseFloat(it.amount) || 0) * (parseInt(it.quantity) || 1)).toLocaleString()}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addItem}
                className="w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-primary text-gray-500 hover:text-primary rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Another Line Item</span>
              </button>
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-gray-100 pt-6 space-y-2.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Discount / Concession (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-28 px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-right text-xs font-bold"
                />
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Late Fee / Fine (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={lateFee}
                  onChange={(e) => setLateFee(e.target.value)}
                  className="w-28 px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-right text-xs font-bold"
                />
              </div>

              <div className="flex justify-between text-lg font-black text-gray-900 pt-3 border-t border-gray-100">
                <span>Final Payable Amount</span>
                <span className="text-primary">₹{finalPayable.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleGenerateBill}
                disabled={loading}
                className="bg-primary hover:bg-blue-900 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center space-x-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>{loading ? 'Generating...' : 'Confirm & Generate Bill'}</span>
              </button>
            </div>
          </div>

          {/* Generated Bill Confirmation Box */}
          {generatedBill && (
            <div className="bg-green-50 border border-green-200 p-6 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-black text-green-900 text-base">Bill #{generatedBill.billNumber} Generated Successfully!</p>
                <p className="text-green-700 text-xs mt-0.5">
                  Amount: ₹{generatedBill.totalAmount / 100} • Status: {generatedBill.status}
                </p>
              </div>

              <a
                href={`http://localhost:5001/api/v1/bills/${generatedBill._id}/download`}
                target="_blank"
                rel="noreferrer"
                className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillGenerator;
