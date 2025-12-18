import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MeterProvider } from './context/MeterContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/Layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MeterDistribution } from './pages/MeterDistribution';
import { DailyInstallation } from './pages/DailyInstallation';
import { BalanceCount } from './pages/BalanceCount';
import { MeterTracking } from './pages/MeterTracking';
import { InstallerView } from './pages/InstallerView';
import { ManageInstallers } from './pages/ManageInstallers';
import { UserRole } from './types';
import './index.css';

// Component to handle root redirect based on auth status
const RootRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === UserRole.INSTALLER) {
    return <Navigate to="/installer" replace />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <MeterProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Installer Routes */}
            <Route
              path="/installer"
              element={
                <ProtectedRoute allowedRoles={[UserRole.INSTALLER]}>
                  <InstallerView />
                </ProtectedRoute>
              }
            />

            {/* Shared Route - Both roles can access */}
            <Route
              path="/daily-installation"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.INSTALLER]}>
                  <AppLayout>
                    <DailyInstallation />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <AppLayout>
                    <RootRedirect />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meter-distribution"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <AppLayout>
                    <MeterDistribution />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/balance-count"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <AppLayout>
                    <BalanceCount />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meter-tracking"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <AppLayout>
                    <MeterTracking />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-installers"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <AppLayout>
                    <ManageInstallers />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </MeterProvider>
    </AuthProvider>
  );
}

export default App;
