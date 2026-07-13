import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { GlobalProvider, useGlobalState, ADMIN_USERNAME } from './hooks/useGlobalState.tsx';
import { Layout } from './components/Layout';
import { SignInPage } from './pages/SignInPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { AdminPage } from './pages/AdminPage';
import { SupportPage } from './pages/SupportPage';
import { Notification } from './components/Notification';
import Announcement from './pages/announcement';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useGlobalState();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentUser } = useGlobalState();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);

  const isAdmin = currentUser?.username === ADMIN_USERNAME;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }
    if (!isAdmin) {
      setShowAlert(true);
      const t = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (!isAuthenticated) return null;

  if (!isAdmin) {
    return (
      <Notification
        message="Unauthorized Access Denied: Administrator Credentials Required"
        isVisible={showAlert}
        onClose={() => setShowAlert(false)}
        variant="error"
      />
    );
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/workspace" element={
          <ProtectedRoute>
            <WorkspacePage />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminGuard>
            <AdminPage />
          </AdminGuard>
        } />
        <Route path="/support" element={
          <ProtectedRoute>
            <SupportPage />
          </ProtectedRoute>
        } />
        <Route path="/announcement" element={
            <ProtectedRoute>
              <Announcement />
            </ProtectedRoute>
          } />
      </Route>

      <Route path="/" element={<SignInPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <GlobalProvider>
        <Router>
          <AppRoutes />
        </Router>
      </GlobalProvider>
    </ThemeProvider>
  );
}

export default App;
