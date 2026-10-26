import React from 'react';
import { Menu, Bell, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onToggleSidebar, title }) => {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle-btn" onClick={onToggleSidebar} aria-label="Toggle Navigation">
          <Menu size={22} />
        </button>
        <h1 className="page-title">{title || 'Urban Greenery Dashboard'}</h1>
      </div>

      <div className="navbar-right">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ecfdf5',
            padding: '6px 14px',
            borderRadius: '9999px',
            border: '1px solid #a7f3d0',
            fontSize: '0.8rem',
            color: '#065f46',
            fontWeight: 600
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'inline-block'
            }}
          />
          Live System Connected
        </div>

        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.88rem',
              color: '#334155'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569'
              }}
            >
              <User size={18} />
            </div>
            <div style={{ display: 'none', md: 'block' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{user.role}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
