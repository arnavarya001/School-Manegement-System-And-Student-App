import { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  User,
  Clock,
  Layers
} from 'lucide-react';
import axios from '../api/axios';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/reports/logs');
      setLogs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load activity logs', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    const matchSearch = log.action?.toLowerCase().includes(q) || log.user?.name?.toLowerCase().includes(q) || log.module?.toLowerCase().includes(q);
    const matchModule = moduleFilter ? log.module === moduleFilter : true;
    return matchSearch && matchModule;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Activity & Audit Logs</h1>
        <p className="text-sm text-gray-500">Security event trail tracking operational modifications across all modules</p>
      </div>

      {/* Filter / Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search audit trail by user, action or keyword..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
          >
            <option value="">All Functional Modules</option>
            <option value="Authentication">Authentication</option>
            <option value="Students">Students & Admissions</option>
            <option value="Fees">Fee Collection</option>
            <option value="Inventory">Inventory & Stock</option>
            <option value="Expenses">Expenses</option>
            <option value="Staff">Faculty & Staff</option>
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading audit trail...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ShieldCheck className="h-12 w-12 mx-auto text-emerald-400 mb-3" />
            <p className="font-medium text-gray-700">Audit trail active & secure</p>
            <p className="text-sm text-gray-400 mt-1">Operational activities are recorded automatically as actions are taken.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((log) => (
              <div key={log._id} className="p-4 flex items-center justify-between hover:bg-gray-50/80 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {log.user?.name ? log.user.name[0] : 'S'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{log.user?.name || 'Authorized User'}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                        {log.module}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{log.action}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
