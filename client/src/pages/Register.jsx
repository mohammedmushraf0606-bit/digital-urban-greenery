import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TreePine, Lock, Mail, User, Building, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Forest Officer',
    department: 'Municipal Parks & Horticulture Division'
  });
  const [formError, setFormError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.email || !formData.password) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    const res = await register(formData);
    if (res.success) {
      navigate('/');
    } else {
      setFormError(res.message);
    }
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
            Officer Registration
          </h1>
          <p style={{ color: '#d1fae5', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '460px' }}>
            Create an official staff account to manage tree census records, schedule park maintenance, and track urban air quality indicators.
          </p>
        </div>
      </div>

      <div className="auth-form-container">
        <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>Register Account</h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '4px' }}>
              Enter your official details to register
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
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="e.g. Dr. Rajesh Verma"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Official Email</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="name@greencity.org"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Assigned Role</label>
              <select
                name="role"
                className="form-control"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Forest Officer">Forest Officer</option>
                <option value="Urban Planner">Urban Planner</option>
                <option value="Field Inspector">Field Inspector</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label">Department</label>
              <div style={{ position: 'relative' }}>
                <Building
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <input
                  type="text"
                  name="department"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="Department Name"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Create Account'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.88rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
