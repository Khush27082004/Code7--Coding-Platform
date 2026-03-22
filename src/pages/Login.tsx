import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-indigo-900 to-purple-700 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl">
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
          <p className="text-slate-500 mt-1 text-sm"><b>Code7 - Assessments &amp; Practice Platform</b></p>
        </div>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              required
            />
          </div>
          <div className="mb-5">
            <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </form>
        <div className="mt-4 text-center text-slate-500 text-sm">
          Don't have an account? <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-800">Create one</Link>
        </div>
      </div>
    </div>
  );
};
