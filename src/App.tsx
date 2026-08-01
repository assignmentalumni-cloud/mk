import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { GlobalProvider, useGlobalState, ADMIN_USERNAME } from './hooks/useGlobalState.tsx';
import { Layout } from './components/Layout';
import { OnboardingPaywall } from './components/OnboardingPaywall';
import { SignInPage } from './pages/SignInPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { WorkspacePage } from './pages/WorkspacePage';
import { ReferralPage } from './pages/ReferralPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { Notification } from './components/Notification';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentUser, isAdmin } = useGlobalState();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  // Admin can always access
  if (isAdmin) return <>{children}</>;
  // Unactivated users are locked to the paywall
  if (currentUser && currentUser.depositTier === 0) {
    return <OnboardingPaywall />;
  }
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
        navigate('/home', { replace: true });
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
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/workspace" element={
          <ProtectedRoute>
            <WorkspacePage />
          </ProtectedRoute>
        } />
        <Route path="/referral" element={
          <ProtectedRoute>
            <ReferralPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminGuard>
            <AdminPage />
          </AdminGuard>
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
