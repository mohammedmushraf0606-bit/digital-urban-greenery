import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TreePine,
  Trees,
  Sprout,
  Compass,
  Activity,
  Wrench,
  FileBarChart2,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/parks', label: 'Park Management', icon: Compass },
  { path: '/trees', label: 'Tree Inventory', icon: TreePine },
  { path: '/urban-forests', label: 'Urban Forests', icon: Trees },
  { path: '/green-belts', label: 'Green Belts', icon: Sprout },
  { path: '/environmental', label: 'Environmental Stats', icon: Activity },
  { path: '/maintenance', label: 'Maintenance Log', icon: Wrench },
  { path: '/reports', label: 'Reports & Analytics', icon: FileBarChart2 }
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'UG';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 35
          }}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <TreePine size={24} />
          </div>
          <div className="sidebar-brand">
            <h2>GreenCity CMS</h2>
            <span>Urban Greenery System</span>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: isOpen ? 'block' : 'none'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Navigation Modules</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {user && (
          <div className="sidebar-footer">
            <div className="user-badge">
              <div className="user-avatar">{getInitials(user.name)}</div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
              <button
                onClick={logout}
                className="btn-icon"
                title="Logout"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: 'none'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
