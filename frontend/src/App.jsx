import { useEffect } from 'react'
import styles from "./App.module.css"
import Login from './components/login /Login'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Signup from './components/signup/Signup'
import Loading from './UI/Loading'
import SalesEntry from './pages/SalesEntry'
import ProtectedRoute from './routes/ProtectedRoute'
import MainLayout from './components/layout/MainLayout'
import ManageProducts from './pages/ManageProducts'
import ViewStore from './pages/ViewStore'
import Account from './pages/Account'
import Maintenance from './pages/Maintenance'
import { Toaster } from 'react-hot-toast';

function App() {
  // Check maintenance mode environment variable
  const isMaintenanceEnv = 
    process.env.MAINTENANCE_MODE === true || 
    process.env.MAINTENANCE_MODE === 'true' ||
    process.env.VITE_MAINTENANCE_MODE === true ||
    process.env.VITE_MAINTENANCE_MODE === 'true' ||
    (typeof import.meta !== 'undefined' && import.meta.env && (
      import.meta.env.VITE_MAINTENANCE_MODE === 'true' || 
      import.meta.env.MAINTENANCE_MODE === 'true'
    ));

  // Check URL query parameters for bypass trigger
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const bypassParam = params.get('bypass_maintenance') || params.get('bypass');
      if (bypassParam === 'true') {
        localStorage.setItem('mamootil_maintenance_bypass', 'true');
      } else if (bypassParam === 'false') {
        localStorage.removeItem('mamootil_maintenance_bypass');
      }
    } catch (e) {
      console.error("Error reading URL parameters:", e);
    }
  }, []);

  const isBypassed = typeof localStorage !== 'undefined' && localStorage.getItem('mamootil_maintenance_bypass') === 'true';
  const showMaintenance = isMaintenanceEnv && !isBypassed;

  const handleExitBypass = () => {
    localStorage.removeItem('mamootil_maintenance_bypass');
    window.location.reload();
  };

  if (showMaintenance) {
    return <Maintenance />;
  }

  return (
    <Router>
      {/* Floating Exit Bypass Pill for Admins */}
      {isMaintenanceEnv && isBypassed && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 999999,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          border: '1px solid #f59e0b',
          padding: '8px 14px',
          borderRadius: '30px',
          fontSize: '12px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#f59e0b' }}>
            <span>⚠️</span> Maintenance Mode Active (Bypass)
          </span>
          <button 
            onClick={handleExitBypass}
            style={{
              backgroundColor: '#d32f2f',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#b71c1c'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#d32f2f'}
          >
            Exit Bypass
          </button>
        </div>
      )}

      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<Signup/>} />
        <Route path="/" element={<Login />} />
        <Route path="/load" element={<Loading />} />
        
        {/* Protected Routes with MainLayout */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/sales-entry" element={<SalesEntry />} />
          <Route path="/manage-products" element={<ManageProducts />} />
          <Route path="/view-store" element={<ViewStore />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
