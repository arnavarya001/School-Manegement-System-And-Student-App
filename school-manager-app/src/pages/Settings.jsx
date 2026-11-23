import { useState, useEffect } from 'react';
import { Save, Upload, School, MapPin, Phone, Mail, Calendar, Clock } from 'lucide-react';
import axios from '../api/axios';

const Settings = () => {
  const [settings, setSettings] = useState({
    name: 'St. Michel School',
    address: '',
    contactNumber: '',
    email: '',
    academicSessions: [{ year: '2023-2024', isCurrent: true }],
    schoolTimings: { start: '08:00', end: '14:00' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/school/settings');
      if (response.data.data) {
        setSettings(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/school/settings', settings);
      alert('Settings updated successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-10 text-center">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">School Settings</h2>
        <p className="text-gray-500">Configure school identity, branding, and academic sessions.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card">
          <div className="flex items-center space-x-2 mb-6 text-primary">
            <School className="h-5 w-5" />
            <h3 className="text-lg font-bold">General Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex items-center space-x-6 mb-4">
              <div className="h-24 w-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden group">
                {settings.logo ? (
                  <img src={settings.logo} alt="School Logo" className="object-contain" />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
                <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center cursor-pointer">
                  <span className="text-white text-xs font-bold">Change Logo</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">School Logo</h4>
                <p className="text-xs text-gray-500 mt-1">Recommended size: 512x512px. JPG or PNG.</p>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Official School Name</label>
              <input
                type="text"
                required
                className="input mt-1"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">School Address</label>
              <textarea
                required
                className="input mt-1"
                rows="3"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  className="input pl-10"
                  value={settings.contactNumber}
                  onChange={(e) => setSettings({ ...settings, contactNumber: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  className="input pl-10"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-2 mb-6 text-primary">
            <Calendar className="h-5 w-5" />
            <h3 className="text-lg font-bold">Academic & Timing</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">School Start Time</label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="time"
                  className="input pl-10"
                  value={settings.schoolTimings?.start}
                  onChange={(e) => setSettings({
                    ...settings,
                    schoolTimings: { ...settings.schoolTimings, start: e.target.value }
                  })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">School End Time</label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="time"
                  className="input pl-10"
                  value={settings.schoolTimings?.end}
                  onChange={(e) => setSettings({
                    ...settings,
                    schoolTimings: { ...settings.schoolTimings, end: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
