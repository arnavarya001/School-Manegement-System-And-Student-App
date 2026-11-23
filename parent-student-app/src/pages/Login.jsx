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
      const { user } = response.data;

      if (user.role === 'parent' || user.role === 'student') {
        onLogin(response.data);
      } else {
        setError('Unauthorized: Please use the staff portal for manager login.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-white px-6">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-10">
          <div className="h-20 w-20 bg-primary mx-auto rounded-3xl flex items-center justify-center text-white text-3xl font-bold mb-4">
            SM
          </div>
          <h1 className="text-2xl font-bold text-gray-900">St. Michel School</h1>
          <p className="text-gray-500 mt-1">Parent & Student Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium">{error}</div>}

          <div>
            <label className="block text-sm font-bold text-gray-700 ml-1">Email / Student ID</label>
            <input
              type="text"
              required
              className="input mt-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 ml-1">Password</label>
            <input
              type="password"
              required
              className="input mt-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="text-right">
            <button type="button" className="text-sm font-bold text-primary">Forgot Password?</button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-4 text-lg"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-10">
          By signing in, you agree to our <span className="text-primary font-bold">Terms</span> and <span className="text-primary font-bold">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default Login;
