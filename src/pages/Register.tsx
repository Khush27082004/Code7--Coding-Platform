import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck, UserPlus, Eye, EyeOff, Terminal } from 'lucide-react';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'candidate' | 'admin'>('candidate');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, fullName, role);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mono-login-root">
      {/* Subtle premium linear grid */}
      <div className="mono-login-grid" />
      <div className="mono-login-radial" />

      {/* ── Left panel (Hero) ── */}
      <div className="mono-login-left">
        {/* Brand Header */}
        <div className="mono-brand">
          <div className="mono-brand-logo">
            <Terminal size={16} strokeWidth={2.5} />
          </div>
          <div>
            <span className="mono-brand-name">Code7</span>
            <span className="mono-brand-tag">Technical Assessments</span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="mono-hero">
          <div className="mono-pill">
            <span className="mono-pill-dot" />
            Code7 Assessment Platform
          </div>
          <h1 className="mono-headline">
            Start your session.<br />
            Enhance your skills.
          </h1>
          <p className="mono-subheadline">
            Create an account on Code7 to complete assigned evaluations, practice coding sets, and review grade reports.
          </p>

          <div className="mono-features">
            <div className="mono-feature">
              <span className="mono-feature-bullet" />
              <p>Practice modules and independent coding sets</p>
            </div>
            <div className="mono-feature">
              <span className="mono-feature-bullet" />
              <p>Admin tools to manage questions, tests, and classes</p>
            </div>
          </div>
        </div>

        <p className="mono-footer-text">© 2026 Code7 Platform. All rights reserved.</p>
      </div>

      {/* ── Right panel (Card) ── */}
      <div className="mono-login-right">
        {/* Mobile brand header */}
        <div className="mono-mobile-brand">
          <div className="mono-brand-logo">
            <Terminal size={14} strokeWidth={2.5} />
          </div>
          <span className="mono-brand-name">Code7</span>
        </div>

        <div className="mono-card">
          <div className="mono-card-header">
            <h2 className="mono-card-title">Create Account</h2>
            <p className="mono-card-subtitle">Set up your credentials below</p>
          </div>

          {error && (
            <div className="mono-error">
              <span className="mono-error-icon">!</span>
              <p className="mono-error-text">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mono-form" autoComplete="off" noValidate>
            {/* Full Name */}
            <div className="mono-field">
              <label className="mono-label" htmlFor="reg-name">Full Name</label>
              <div className="mono-input-wrap">
                <User size={14} className="mono-input-icon" />
                <input
                  id="reg-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mono-input"
                  placeholder="John Doe"
                  autoComplete="off"
                  required
                  minLength={2}
                />
              </div>
            </div>

            {/* Email */}
            <div className="mono-field">
              <label className="mono-label" htmlFor="reg-email">Email Address</label>
              <div className="mono-input-wrap">
                <Mail size={14} className="mono-input-icon" />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mono-input"
                  placeholder="name@example.com"
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mono-field">
              <label className="mono-label" htmlFor="reg-password">Password</label>
              <div className="mono-input-wrap">
                <Lock size={14} className="mono-input-icon" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mono-input"
                  placeholder="Min. 6 characters"
                  autoComplete="off"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="mono-eye-btn"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div className="mono-field">
              <label className="mono-label">Account Role</label>
              <div className="mono-role-grid">
                {(['candidate', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`mono-role-btn ${role === r ? 'mono-role-btn--active' : ''}`}
                  >
                    <ShieldCheck size={13} />
                    <span className="capitalize">{r}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button (Monochrome Premium) */}
            <button
              type="submit"
              disabled={loading}
              className="mono-submit-btn"
            >
              {loading ? (
                <span className="mono-spinner" />
              ) : (
                <>
                  Get Started
                  <UserPlus size={14} className="mono-arrow" />
                </>
              )}
            </button>
          </form>

          <p className="mono-register-link" style={{ marginTop: '1.25rem' }}>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
