import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ResearchProjectProvider } from './contexts/ResearchProjectContext';
import { ModalProvider } from './contexts/ModalContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages lazy loading setups can be used or direct imports for stable compilation
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import Papers from './pages/Papers';
import AILab from './pages/AILab';
import KnowledgeGraph from './pages/KnowledgeGraph';
import Notebook from './pages/Notebook';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <ModalProvider>
        <AuthProvider>
          <ResearchProjectProvider>
          <Routes>
            {/* Public/Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected Workspace Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/workspace" element={<Workspace />} />
                <Route path="/papers" element={<Papers />} />
                <Route path="/ai-lab" element={<AILab />} />
                <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
                <Route path="/notebook" element={<Notebook />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Wildcard Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ResearchProjectProvider>
      </AuthProvider>
      </ModalProvider>
    </BrowserRouter>
  );
}

export default App;
