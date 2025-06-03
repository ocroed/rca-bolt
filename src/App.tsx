import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ActiveIncidents from './pages/ActiveIncidents';

function App() {
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