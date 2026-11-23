import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, CreditCard } from 'lucide-react';
import axios from '../api/axios';

const Admission = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    email: '',
    admissionNumber: '',
    rollNumber: '',
    class: '',
    section: '',
    academicSession: '2023-2024',
    parentData: {
      fullName: '',
      mobileNumber: '',
      email: '',
      address: '',
      occupation: ''
    }
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get('/classes');
        setClasses(response.data.data);
      } catch (err) {
        console.error('Error fetching classes', err);
      }
    };
    fetchClasses();
  }, []);

  const handleClassChange = async (classId) => {
    setFormData({ ...formData, class: classId, section: '' });
    try {
      const response = await axios.get(`/classes/${classId}/sections`);
      setSections(response.data.data);
    } catch (err) {
      console.error('Error fetching sections', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/students', formData);
      alert('Student admitted successfully!');
      navigate('/students');
    } catch (err) {
      alert(err.response?.data?.error || 'Admission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">New Student Admission</h2>
        <p className="text-gray-500">Fill in the student and parent details to register a new enrollment.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Student Details */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6 text-primary">
            <User className="h-5 w-5" />
            <h3 className="text-lg font-bold">Student Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name *</label>
              <input
                type="text" required className="input mt-1"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name *</label>
              <input
                type="text" required className="input mt-1"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
              <input
                type="date" required className="input mt-1"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender *</label>
              <select
                className="input mt-1"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Admission Number *</label>
              <input
                type="text" required className="input mt-1"
                value={formData.admissionNumber}
                onChange={(e) => setFormData({...formData, admissionNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Student Email (Login)</label>
              <input
                type="email" className="input mt-1"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6 text-primary">
            <BookOpen className="h-5 w-5" />
            <h3 className="text-lg font-bold">Academic Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Class *</label>
              <select
                required className="input mt-1"
                value={formData.class}
                onChange={(e) => handleClassChange(e.target.value)}
              >
                <option value="">Select Class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Section *</label>
              <select
                required className="input mt-1"
                value={formData.section}
                onChange={(e) => setFormData({...formData, section: e.target.value})}
              >
                <option value="">Select Section</option>
                {sections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Roll Number</label>
              <input
                type="text" className="input mt-1"
                value={formData.rollNumber}
                onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Academic Session *</label>
              <input
                type="text" required className="input mt-1"
                value={formData.academicSession}
                onChange={(e) => setFormData({...formData, academicSession: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Parent Details */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6 text-primary">
            <Users className="h-5 w-5" />
            <h3 className="text-lg font-bold">Parent / Guardian Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input
                type="text" required className="input mt-1"
                value={formData.parentData.fullName}
                onChange={(e) => setFormData({
                  ...formData,
                  parentData: {...formData.parentData, fullName: e.target.value}
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
              <input
                type="tel" required className="input mt-1"
                value={formData.parentData.mobileNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  parentData: {...formData.parentData, mobileNumber: e.target.value}
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email" required className="input mt-1"
                value={formData.parentData.email}
                onChange={(e) => setFormData({
                  ...formData,
                  parentData: {...formData.parentData, email: e.target.value}
                })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address *</label>
              <textarea
                required className="input mt-1" rows="3"
                value={formData.parentData.address}
                onChange={(e) => setFormData({
                  ...formData,
                  parentData: {...formData.parentData, address: e.target.value}
                })}
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Occupation</label>
              <input
                type="text" className="input mt-1"
                value={formData.parentData.occupation}
                onChange={(e) => setFormData({
                  ...formData,
                  parentData: {...formData.parentData, occupation: e.target.value}
                })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/students')}
            className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Processing Admission...' : 'Confirm Admission'}
          </button>
        </div>
      </form>
    </div>
  );
};

const Users = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

export default Admission;
