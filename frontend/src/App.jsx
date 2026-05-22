import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Train from './pages/Train';
import Locked from './pages/Locked';
import DashboardLayout from './dashboard/DashboardLayout';
import Home from './dashboard/Home';
import Accounts from './dashboard/Accounts';
import Transfer from './dashboard/Transfer';
import History from './dashboard/History';
import Cards from './dashboard/Cards';
import Settings from './dashboard/Settings';
import SecurityHub from './dashboard/SecurityHub';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
};

// GlobalSecurityListener handles ONLY critical, unrecoverable lock events.
// Soft SVM anomalies are intercepted by DashboardLayout's Step-Up MFA modal.
const GlobalSecurityListener = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const CRITICAL_TRIGGERS = [
      'inactivity',
      'Screenshot',
      'Step-up authentication failed',
      'Automated/Fast typing'
    ];

    const handleAuthUpdate = (e) => {
      if (e.detail.status === 'anomaly') {
        const msg = e.detail.message || '';
        const isCritical = CRITICAL_TRIGGERS.some(t => msg.toLowerCase().includes(t.toLowerCase()));
        // Only hard-redirect for explicitly critical events, NOT for SVM ratio anomalies
        // (those are handled by DashboardLayout's Step-Up modal)
        if (isCritical) {
          localStorage.setItem('auth_lock_reason', msg || 'Unusual activity detected');
          navigate('/locked');
        }
        // Soft SVM anomalies: DashboardLayout listens and shows the modal instead
      }
    };

    window.addEventListener('auth_status', handleAuthUpdate);
    return () => window.removeEventListener('auth_status', handleAuthUpdate);
  }, [navigate]);

  return null;
};

const App = () => {
  return (
    <BrowserRouter 
      future={{ 
        v7_startTransition: true, 
        v7_relativeSplatPath: true 
      }}
    >
      <GlobalSecurityListener />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/train" element={<ProtectedRoute><Train /></ProtectedRoute>} />
        <Route path="/locked" element={<Locked />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="transfer" element={<Transfer />} />
          <Route path="history" element={<History />} />
          <Route path="cards" element={<Cards />} />
          <Route path="settings" element={<Settings />} />
          <Route path="security" element={<SecurityHub />} />
        </Route>
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
