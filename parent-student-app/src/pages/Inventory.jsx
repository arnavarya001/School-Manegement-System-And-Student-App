import { useState, useEffect } from 'react';
import { Package, Calendar, IndianRupee, CheckCircle2, Clock } from 'lucide-react';
import axios from '../api/axios';

const Inventory = ({ activeStudent }) => {
  const [issuedItems, setIssuedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeStudent) {
      fetchIssuedItems();
    }
  }, [activeStudent]);

  const fetchIssuedItems = async () => {
    try {
      // We need an endpoint for this. For now, let's assume we can filter StudentIssuedItem by student
      // I'll mock it for the UI
      const mockItems = [
        { _id: '1', product: { name: 'Mathematics Book Class VII' }, quantity: 1, unitPrice: 45000, issueDate: '2023-07-15', status: 'Issued' },
        { _id: '2', product: { name: 'School Bag (Large)' }, quantity: 1, unitPrice: 85000, issueDate: '2023-07-15', status: 'Issued' },
        { _id: '3', product: { name: 'School Tie' }, quantity: 1, unitPrice: 15000, issueDate: '2023-07-15', status: 'Issued' },
      ];
      setIssuedItems(mockItems);
    } catch (err) {
      console.error('Error fetching issued items', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-10 text-center font-bold text-gray-500">Loading your materials...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">School Materials</h2>

      <div className="space-y-4">
        {issuedItems.length === 0 ? (
          <div className="card text-center py-10">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">No materials issued yet.</p>
          </div>
        ) : (
          issuedItems.map((item) => (
            <div key={item._id} className="card space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{item.product.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">₹{(item.unitPrice / 100).toLocaleString()}</p>
                  <span className="inline-block px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-black rounded-md uppercase mt-1">
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center text-gray-400">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span className="text-[10px] font-bold uppercase">Issued: {new Date(item.issueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-primary">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  <span className="text-[10px] font-bold uppercase">Verified</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-2xl">
        <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase tracking-wide">
          Note: If any issued item is missing from this list, please contact the school office.
        </p>
      </div>
    </div>
  );
};

export default Inventory;
