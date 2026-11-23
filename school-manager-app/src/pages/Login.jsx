import { useState } from 'react';
import axios from '../api/axios';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/login', { email, password });
      if (['super-admin', 'manager', 'accountant', 'admission-staff', 'inventory-manager', 'teacher'].includes(response.data.user.role)) {
        onLogin(response.data);
      } else {
        setError('Unauthorized: Only school staff can log in here.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">St. Michel School</h1>
          <p className="text-gray-500 mt-2">Management System - Manager Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              required
              className="input mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@stmichel.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              className="input mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary flex justify-center items-center"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
