import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminRoute } from './components/layout/AdminRoute';
import { MainLayout } from './components/layout/MainLayout';
import { Assets } from './pages/Assets';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { Unauthorized } from './pages/Unauthorized';
import { Employees } from './pages/Employees';
import { Reports } from './pages/Reports';
import { Software } from './pages/Software';
import { Licenses } from './pages/Licenses';
import { Procurement } from './pages/Procurement';
import { AuditLogs } from './pages/AuditLogs';
import { MyAssets } from './pages/MyAssets';
import { WarrantyStatus } from './pages/WarrantyStatus';
import { WarrantyDashboard } from './pages/WarrantyDashboard';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Secure App Shell Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    {/* Common / Employee Allowed Routes */}
                    <Route path="/my-assets" element={<MyAssets />} />
                    <Route path="/warranty" element={<WarrantyStatus />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />

                    {/* Admin ONLY Routes */}
                    <Route path="/" element={<AdminRoute><Dashboard /></AdminRoute>} />
                    <Route path="/assets" element={<AdminRoute><Assets /></AdminRoute>} />
                    <Route path="/employees" element={<AdminRoute><Employees /></AdminRoute>} />
                    <Route path="/software" element={<AdminRoute><Software /></AdminRoute>} />
                    <Route path="/licenses" element={<AdminRoute><Licenses /></AdminRoute>} />
                    <Route path="/procurement" element={<AdminRoute><Procurement /></AdminRoute>} />
                    <Route path="/reports" element={<AdminRoute><Reports /></AdminRoute>} />
                    <Route path="/audit-logs" element={<AdminRoute><AuditLogs /></AdminRoute>} />
                    <Route path="/warranty-automations" element={<AdminRoute><WarrantyDashboard /></AdminRoute>} />
                    
                    {/* Redirect unknown routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
