import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [role, setRole] = useState('candidate');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, fullName, role, enrollmentNo);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-indigo-900 to-purple-700 px-4 py-8">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl">
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
          <p className="text-slate-500 mt-1 text-sm">Join <b>Code7</b> to master your coding skills</p>
        </div>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              required
              minLength={2}
            />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 text-sm font-medium mb-1">Enrollment No.</label>
            <input
              type="text"
              value={enrollmentNo}
              onChange={(e) => setEnrollmentNo(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              placeholder="(Optional for Admins)"
            />
          </div>
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
          <div className="mb-3">
            <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              required
              minLength={6}
            />
          </div>
          <div className="mb-5">
            <label className="block text-gray-700 text-sm font-medium mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            >
              <option value="candidate">Candidate</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center text-slate-500 text-sm">
          Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800">Sign in</Link>
        </div>
      </div>
    </div>
 
  );
};
