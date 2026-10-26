import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout & Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Parks from './pages/Parks';
import Trees from './pages/Trees';
import UrbanForests from './pages/UrbanForests';
import GreenBelts from './pages/GreenBelts';
import Environmental from './pages/Environmental';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';

const pageTitles = {
  '/': 'Urban Greenery Overview & Telemetry',
  '/parks': 'Park Management & Public Spaces',
  '/trees': 'Tree Inventory & Biometric Census',
  '/urban-forests': 'Urban Forest Reserves & Biodiversity',
  '/green-belts': 'Green Belts & Environmental Buffers',
  '/environmental': 'Environmental Performance & Air Quality',
  '/maintenance': 'Municipal Horticulture & Maintenance Hub',
  '/reports': 'Executive Reports & Green Audit Analytics'
};

const ProtectedLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const currentTitle = pageTitles[location.pathname] || 'Urban Greenery Management';

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={currentTitle}
        />
        <main className="content-body">{children}</main>
      </div>
    </div>
  );
};

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
      />

      <Route
        path="/"
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      />
      <Route
        path="/parks"
        element={
          <ProtectedLayout>
            <Parks />
          </ProtectedLayout>
        }
      />
      <Route
        path="/trees"
        element={
          <ProtectedLayout>
            <Trees />
          </ProtectedLayout>
        }
      />
      <Route
        path="/urban-forests"
        element={
          <ProtectedLayout>
            <UrbanForests />
          </ProtectedLayout>
        }
      />
      <Route
        path="/green-belts"
        element={
          <ProtectedLayout>
            <GreenBelts />
          </ProtectedLayout>
        }
      />
      <Route
        path="/environmental"
        element={
          <ProtectedLayout>
            <Environmental />
          </ProtectedLayout>
        }
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedLayout>
            <Maintenance />
          </ProtectedLayout>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedLayout>
            <Reports />
          </ProtectedLayout>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
