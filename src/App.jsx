import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import SupportButton from './components/support/SupportButton';
import { useAuth } from './hooks/useAuth';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const Login = lazy(() => import('./pages/public/Login'));
const Register = lazy(() => import('./pages/public/Register'));
const TermsOfService = lazy(() => import('./pages/public/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/public/PrivacyPolicy'));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/public/ResetPassword'));

const UserDashboard = lazy(() => import('./pages/user/Dashboard'));
const MyCases = lazy(() => import('./pages/user/MyCases'));
const ReportFraud = lazy(() => import('./pages/user/ReportFraud'));
const CaseDetails = lazy(() => import('./pages/user/CaseDetails'));
const EvidenceCenter = lazy(() => import('./pages/user/EvidenceCenter'));
const Notifications = lazy(() => import('./pages/user/Notifications'));
const Profile = lazy(() => import('./pages/user/Profile'));
const Settings = lazy(() => import('./pages/user/Settings'));
const Support = lazy(() => import('./pages/user/Support'));

const InvestigatorDashboard = lazy(() => import('./pages/investigator/Dashboard'));
const CaseList = lazy(() => import('./pages/investigator/CaseList'));
const InvestigationWorkspace = lazy(() => import('./pages/investigator/InvestigationWorkspace'));
const EvidenceAnalysis = lazy(() => import('./pages/investigator/EvidenceAnalysis'));
const ThreatIntelligence = lazy(() => import('./pages/investigator/ThreatIntelligence'));
const Reports = lazy(() => import('./pages/investigator/Reports'));
const Teams = lazy(() => import('./pages/investigator/Teams'));
const InvestigatorNotifications = lazy(() => import('./pages/investigator/Notifications'));


const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const CaseManagement = lazy(() => import('./pages/admin/CaseManagement'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));
const Monitor = lazy(() => import('./pages/admin/Monitor'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));

// pwa install prompt
import PWAInstallPrompt from './components/common/PWAInstallPrompt';


const PageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <LoadingSpinner size="lg" text="Loading..." />
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'investigator') return <Navigate to="/investigator" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (isAuthenticated) {
    if (user?.role === 'investigator') return <Navigate to="/investigator" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-6">An unexpected error occurred. Please try refreshing the page.</p>
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition-colors">
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ScrollToTop = () => {
  const { pathname } = window.location;
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const NotFound = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
    <div className="text-center max-w-md">
      <div className="text-8xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">404</div>
      <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
      <p className="text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <a href="/" className="inline-flex items-center px-6 py-3 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition-colors">Go Home</a>
    </div>
  </div>
);

// Main App Component
const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <ScrollToTop />
              
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '14px',
                  },
                }}
              />

              {/* pwa install prompt */}
              <PWAInstallPrompt />

              <Suspense fallback={<PageLoader />}>
                <AnimatePresence mode="wait">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                    <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

                    {/* User Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
                    <Route path="/cases" element={<ProtectedRoute allowedRoles={['user']}><MyCases /></ProtectedRoute>} />
                    <Route path="/cases/:id" element={<ProtectedRoute allowedRoles={['user']}><CaseDetails /></ProtectedRoute>} />
                    <Route path="/report-fraud" element={<ProtectedRoute allowedRoles={['user']}><ReportFraud /></ProtectedRoute>} />
                    <Route path="/evidence" element={<ProtectedRoute allowedRoles={['user']}><EvidenceCenter /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute allowedRoles={['user']}><Notifications /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute allowedRoles={['user']}><Profile /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute allowedRoles={['user']}><Settings /></ProtectedRoute>} />
                    <Route path="/support" element={<ProtectedRoute allowedRoles={['user']}><Support /></ProtectedRoute>} />

                    {/* Investigator Routes */}
                    <Route path="/investigator" element={<ProtectedRoute allowedRoles={['investigator', 'admin']}><InvestigatorDashboard /></ProtectedRoute>} />
                    <Route path="/investigator/cases" element={<ProtectedRoute allowedRoles={['investigator', 'admin']}><CaseList /></ProtectedRoute>} />
                    <Route path="/investigator/cases/:id" element={<ProtectedRoute allowedRoles={['investigator', 'admin']}><InvestigationWorkspace /></ProtectedRoute>} />
                    <Route path="/investigator/evidence" element={<ProtectedRoute allowedRoles={['investigator', 'admin']}><EvidenceAnalysis /></ProtectedRoute>} />
                    <Route path="/investigator/threats" element={<ProtectedRoute allowedRoles={['investigator', 'admin']}><ThreatIntelligence /></ProtectedRoute>} />
                    <Route path="/investigator/reports" element={<ProtectedRoute allowedRoles={['investigator', 'admin']}><Reports /></ProtectedRoute>} />
                    <Route path="/investigator/team" element={<ProtectedRoute allowedRoles={['investigator', 'admin']}><Teams /></ProtectedRoute>} />
                    <Route path="/investigator/notifications" element={<ProtectedRoute allowedRoles={['investigator', 'admin']}><InvestigatorNotifications /></ProtectedRoute>} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
                    <Route path="/admin/cases" element={<ProtectedRoute allowedRoles={['admin']}><CaseManagement /></ProtectedRoute>} />
                    <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><SystemSettings /></ProtectedRoute>} />
                    <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
                    <Route path="/admin/monitor" element={<ProtectedRoute allowedRoles={['admin']}><Monitor /></ProtectedRoute>} />
                    <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['admin']}><AdminNotifications /></ProtectedRoute>} />
                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AnimatePresence>
              </Suspense>

              <SupportButton />
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;