import { useState, useEffect } from 'react';
import { Home, Plus, Users, IndianRupee, CheckCircle, AlertTriangle } from 'lucide-react';
import axios from '../api/axios';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    capacity: 1,
    monthlyRent: 0,
    description: ''
  });

  const [assignmentData, setAssignmentData] = useState({
    roomId: '',
    studentId: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/rooms');
      setRooms(response.data.data);
    } catch (err) {
      console.error('Error fetching rooms', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/rooms', newRoom);
      alert('Room added successfully!');
      setShowAddRoomModal(false);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add room');
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/rooms/assign', assignmentData);
      alert('Student assigned successfully!');
      setShowAssignModal(false);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign student');
    }
  };

  const handleGenerateRentBills = async () => {
    const month = prompt("Enter month name (e.g., September 2023):");
    if (!month) return;

    try {
      const response = await axios.post('/rooms/generate-bills', {
        academicSession: '2023-2024',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
        month
      });
      alert(`Generated ${response.data.count} rent bills successfully!`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate bills');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Room Management</h2>
          <p className="text-gray-500">Manage hostel rooms, occupancy, and monthly rent.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerateRentBills}
            className="btn bg-white border hover:bg-gray-50 flex items-center"
          >
            <IndianRupee className="h-4 w-4 mr-2" /> Generate Rent Bills
          </button>
          <button
            onClick={() => setShowAddRoomModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Room
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-sm text-gray-500 font-medium">Total Rooms</p>
          <h3 className="text-2xl font-bold mt-1">{rooms.length}</h3>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 font-medium">Total Capacity</p>
          <h3 className="text-2xl font-bold mt-1">{rooms.reduce((sum, r) => sum + r.capacity, 0)}</h3>
        </div>
        <div className="card text-green-600">
          <p className="text-sm text-gray-500 font-medium">Occupied</p>
          <h3 className="text-2xl font-bold mt-1">{rooms.reduce((sum, r) => sum + r.occupancy, 0)}</h3>
        </div>
        <div className="card text-primary">
          <p className="text-sm text-gray-500 font-medium">Vacant Seats</p>
          <h3 className="text-2xl font-bold mt-1">
            {rooms.reduce((sum, r) => sum + (r.capacity - r.occupancy), 0)}
          </h3>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-sm font-medium text-gray-500">
                <th className="pb-4 px-4">Room Number</th>
                <th className="pb-4 px-4">Capacity</th>
                <th className="pb-4 px-4">Occupancy</th>
                <th className="pb-4 px-4">Monthly Rent</th>
                <th className="pb-4 px-4">Status</th>
                <th className="pb-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="6" className="py-10 text-center text-gray-500">Loading rooms...</td></tr>
              ) : rooms.length === 0 ? (
                <tr><td colSpan="6" className="py-10 text-center text-gray-500">No rooms found.</td></tr>
              ) : rooms.map((room) => (
                <tr key={room._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-medium">{room.roomNumber}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{room.capacity}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{room.occupancy}</td>
                  <td className="py-4 px-4 text-sm">₹{(room.monthlyRent / 100).toLocaleString()}</td>
                  <td className="py-4 px-4">
                    {room.occupancy >= room.capacity ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Full</span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Available</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => {
                        setAssignmentData({...assignmentData, roomId: room._id});
                        setShowAssignModal(true);
                      }}
                      disabled={room.occupancy >= room.capacity}
                      className="text-primary text-xs font-bold hover:underline disabled:text-gray-400 disabled:no-underline"
                    >
                      Assign Student
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Add New Room</h3>
            <form onSubmit={handleAddRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Number *</label>
                <input
                  type="text" required className="input mt-1"
                  value={newRoom.roomNumber}
                  onChange={(e) => setNewRoom({...newRoom, roomNumber: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity *</label>
                  <input
                    type="number" min="1" required className="input mt-1"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monthly Rent (₹) *</label>
                  <input
                    type="number" required className="input mt-1"
                    onChange={(e) => setNewRoom({...newRoom, monthlyRent: parseFloat(e.target.value) * 100})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="input mt-1" rows="2"
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowAddRoomModal(false)} className="btn bg-gray-200">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Assign Student to Room</h3>
            <form onSubmit={handleAssignStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Admission ID / MongoID *</label>
                <input
                  type="text" required className="input mt-1"
                  onChange={(e) => setAssignmentData({...assignmentData, studentId: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowAssignModal(false)} className="btn bg-gray-200">Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
