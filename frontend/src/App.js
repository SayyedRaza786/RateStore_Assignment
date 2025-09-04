import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlobalStyle, theme, darkTheme } from './styles/GlobalStyles';
import { ThemeToggleProvider } from './context/ThemeToggleContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Stores from './pages/Stores';
import UserDashboard from './pages/user/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageStores from './pages/admin/ManageStores';
import StoreOwnerDashboard from './pages/storeOwner/StoreOwnerDashboard';
import { useEffect } from 'react';

const Dashboard = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'store_owner':
      return <StoreOwnerDashboard />;
    case 'user':
    default:
      return <UserDashboard />;
  }
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  // Helper component to perform logout via route navigation
  const Logout = () => {
    const { logout } = useAuth();
    useEffect(() => {
      logout();
    }, [logout]);
    return <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      <Route 
        path="/login" 
  // Always render Login (even if already authenticated) so initial load shows /login
  element={<Login />} 
      />
      <Route 
        path="/register" 
  // Always render Register form (optional: you could block if authenticated)
  element={<Register />} 
      />
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/admin" 
        element={isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />} 
      />
      <Route
        path="/profile"
        element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/stores"
        element={isAuthenticated ? <Stores /> : <Navigate to="/login" replace />}
      />
      {/* Admin guard wrapper */}
      <Route
        path="/admin/users"
        element={isAuthenticated && user?.role === 'admin' ? <ManageUsers /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/stores"
        element={isAuthenticated && user?.role === 'admin' ? <ManageStores /> : <Navigate to="/login" replace />}
      />
  <Route path="/logout" element={<Logout />} />
      <Route 
        path="/" 
  // Always land on login when hitting root; remove conditional redirect to /dashboard
  element={<Navigate to="/login" />} 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  const [mode, setMode] = useState(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('themeMode') : null;
    return stored === 'dark' ? 'dark' : 'light';
  });

  const toggleMode = useCallback(() => {
    setMode(m => {
      const next = m === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('themeMode', next);
      }
      return next;
    });
  }, []);

  const activeTheme = mode === 'dark' ? darkTheme : theme;

  return (
    <ThemeProvider theme={activeTheme}>
      <GlobalStyle />
      <AuthProvider>
        <Router>
          <ThemeToggleProvider mode={mode} toggleMode={toggleMode}>
            <div className="App" style={{ position: 'relative', minHeight: '100vh' }}>
              <AppRoutes />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={mode === 'dark' ? 'dark' : 'light'}
              />
            </div>
          </ThemeToggleProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
