import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ActiveIncidents from './pages/ActiveIncidents';
import LoginPage from './components/auth/LoginPage';
import { useAuth } from './hooks/useAuth';
import { authService } from './services/auth/cogniteAuth';
import { Loader2 } from 'lucide-react';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Handle redirect response when the app loads
    const handleRedirect = async () => {
      try {
        await authService.handleRedirectResponse();
      } catch (error) {
        console.error('Error handling redirect response:', error);
      }
    };

    handleRedirect();
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show main application if authenticated
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/active-incidents" element={<ActiveIncidents />} />
          <Route path="/" element={<Navigate to="/dashboard\" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;