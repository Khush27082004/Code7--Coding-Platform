import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CheckCircle2, Eye, EyeOff, ShieldCheck, Terminal } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wake up Render web service early (cold start optimization)
    const backendUrl = import.meta.env.VITE_API_URL || '/api/v1';
    const healthUrl = backendUrl.replace('/api/v1', '/health');
    fetch(healthUrl).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid email or password');
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
            Practice coding.<br />
            Ace your <span className="mono-text-glow">evaluations</span>.
          </h1>
          <p className="mono-subheadline">
            An advanced coding assessment and skill development platform engineered for students and instructors.
          </p>

          <div className="mono-features">
            <div className="mono-feature">
              <span className="mono-feature-bullet" />
              <p>Solve assignment sets and practice problems</p>
            </div>
            <div className="mono-feature">
              <span className="mono-feature-bullet" />
              <p>Track history logs and grading performance</p>
            </div>
            <div className="mono-feature">
              <span className="mono-feature-bullet" />
              <p>Real-time compilation and automated tests</p>
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
            <h2 className="mono-card-title">Sign In</h2>
            <p className="mono-card-subtitle">Enter your credentials to access the console</p>
          </div>

          {error && (
            <div className="mono-error">
              <span className="mono-error-icon">!</span>
              <p className="mono-error-text">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mono-form" autoComplete="off" noValidate>
            {/* Email */}
            <div className="mono-field">
              <label className="mono-label" htmlFor="login-email">Email Address</label>
              <div className="mono-input-wrap">
                <Mail size={14} className="mono-input-icon" />
                <input
                  id="login-email"
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
              <div className="mono-label-row">
                <label className="mono-label" htmlFor="login-password">Password</label>
                <a href="#" className="mono-link-forgot">Forgot?</a>
              </div>
              <div className="mono-input-wrap">
                <Lock size={14} className="mono-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mono-input"
                  placeholder="••••••••"
                  autoComplete="off"
                  required
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
                  Sign In
                  <ArrowRight size={14} className="mono-arrow" />
                </>
              )}
            </button>
          </form>

          <div className="mono-or-divider">
            <span className="mono-or-line" />
            <span className="mono-or-text">or try a demo account</span>
            <span className="mono-or-line" />
          </div>

          {/* Clean Monochrome Demo Grid */}
          <div className="mono-demo-grid">
            {[
              {
                role: 'Admin',
                email: 'admin@example.com',
                password: 'Admin123!',
                desc: 'Assessments console',
              },
              {
                role: 'Candidate',
                email: 'candidate@example.com',
                password: 'Candidate123!',
                desc: 'Practice console',
              },
            ].map((d) => (
              <button
                key={d.role}
                type="button"
                onClick={() => {
                  setEmail(d.email);
                  setPassword(d.password);
                }}
                className="mono-demo-btn"
              >
                <div className="mono-demo-header">
                  <span className="mono-demo-role">{d.role}</span>
                  <span className="mono-demo-arrow">→</span>
                </div>
                <p className="mono-demo-desc">{d.desc}</p>
              </button>
            ))}
          </div>

          <p className="mono-register-link">
            Don't have an account? <Link to="/register">Create console account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
