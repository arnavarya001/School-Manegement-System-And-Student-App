import { useState, useEffect } from 'react';
import { Bell, Plus, Search, Trash2, Edit, Calendar, Users, Eye } from 'lucide-react';
import axios from '../api/axios';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'All',
    expiryDate: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/announcements');
      setAnnouncements(response.data.data);
    } catch (err) {
      console.error('Error fetching announcements', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/announcements', formData);
      alert('Announcement posted successfully!');
      setShowAddModal(false);
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await axios.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to delete announcement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">School Announcements</h2>
          <p className="text-gray-500">Post notices and updates for parents, students, and staff.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" /> New Announcement
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-sm font-medium text-gray-500">
                <th className="pb-4 px-4">Title</th>
                <th className="pb-4 px-4">Audience</th>
                <th className="pb-4 px-4">Date Posted</th>
                <th className="pb-4 px-4">Expiry</th>
                <th className="pb-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="5" className="py-10 text-center text-gray-500">Loading notices...</td></tr>
              ) : announcements.length === 0 ? (
                <tr><td colSpan="5" className="py-10 text-center text-gray-500">No announcements found.</td></tr>
              ) : announcements.map((notice) => (
                <tr key={notice._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-medium text-sm">{notice.title}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">{notice.content}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      notice.targetAudience === 'All' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {notice.targetAudience}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {notice.expiryDate ? new Date(notice.expiryDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button className="p-1 hover:text-primary"><Eye className="h-4 w-4" /></button>
                    <button
                      onClick={() => handleDelete(notice._id)}
                      className="p-1 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold mb-4">Create New Announcement</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text" required className="input mt-1"
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content *</label>
                <textarea
                  required className="input mt-1" rows="4"
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Audience *</label>
                  <select
                    className="input mt-1"
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                  >
                    <option value="All">Everyone</option>
                    <option value="Parents">Parents Only</option>
                    <option value="Students">Students Only</option>
                    <option value="Teachers">Teachers Only</option>
                    <option value="Staff">Staff Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input
                    type="date" className="input mt-1"
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn bg-gray-200">Cancel</button>
                <button type="submit" className="btn btn-primary">Post Announcement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
