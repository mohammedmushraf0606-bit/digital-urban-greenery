import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TreePine, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setFormError(res.message);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFormError('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-sidebar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399'
              }}
            >
              <TreePine size={28} />
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>GreenCity CMS</h2>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '18px' }}>
            Digital Urban Greenery Management System
          </h1>
          <p style={{ color: '#d1fae5', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '460px' }}>
            Empowering municipal authorities, urban forestry officers, and environmental scientists with real-time greenery census, canopy monitoring, and carbon absorption intelligence.
          </p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', backdropFilter: 'blur(8px)' }}>
          <div style={{ fontSize: '0.85rem', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '6px' }}>
            College Project Edition (MERN Stack)
          </div>
          <div style={{ fontSize: '0.9rem', color: '#f0fdf4' }}>
            Features comprehensive MongoDB integration, live REST APIs, interactive Chart.js analytics, and full CRUD operations across all municipal green assets.
          </div>
        </div>
      </div>

      <div className="auth-form-container">
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>Sign In</h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '4px' }}>
              Access the Urban Greenery Administration Portal
            </p>
          </div>

          {formError && (
            <div
              style={{
                padding: '12px 16px',
                background: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                borderRadius: '8px',
                fontSize: '0.88rem',
                marginBottom: '20px'
              }}
            >
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="name@greencity.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick Demo Login Credentials */}
          <div style={{ marginTop: '28px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '10px' }}>
              Click to Auto-Fill Demo Credentials:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                className="demo-account-pill"
                onClick={() => handleQuickLogin('admin@greencity.org', 'admin123')}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#065f46' }}>Admin Officer</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>admin@greencity.org</div>
                </div>
                <span className="badge badge-success">Full Access</span>
              </div>

              <div
                className="demo-account-pill"
                onClick={() => handleQuickLogin('officer@greencity.org', 'officer123')}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#065f46' }}>Forestry Officer</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>officer@greencity.org</div>
                </div>
                <span className="badge badge-info">Horticulture</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem', color: '#64748b' }}>
            Need a new municipal account?{' '}
            <Link to="/register" style={{ color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
