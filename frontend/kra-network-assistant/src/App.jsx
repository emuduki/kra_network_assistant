import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAppStore from './store/appStore';
import NavBar from './components/NavBar.jsx';
import Login from './pages/Login.jsx';

// Lazy-load pages for faster initial load
import { lazy, Suspense } from 'react';
// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));
const AdminIncidents = lazy(() => import('./pages/admin/Incidents.jsx'));
const AdminVPNHealth = lazy(() => import('./pages/admin/VPNHealth.jsx'));
const AdminTopology = lazy(() => import('./pages/admin/Topology.jsx'));
const AdminDiagnostics = lazy(() => import('./pages/admin/Diagnostics.jsx'));
const AdminAssistant = lazy(() => import('./pages/admin/Assistant.jsx'));

// ICT officer pages
const OfficerDashboard = lazy(() => import('./pages/ict_officer/Dashboard.jsx'));
const OfficerIncidents = lazy(() => import('./pages/ict_officer/ReportIssue.jsx'));
const OfficerTopology = lazy(() => import('./pages/ict_officer/MyTickects.jsx'));
const OfficerDiagnostics = lazy(() => import('./pages/ict_officer/Diagnostics.jsx'));
const OfficerAssistant = lazy(() => import('./pages/ict_officer/Assistant.jsx'));



// Reports page is not present at ./pages/Reports.jsx in this repo.
// If/when added, wire it into the /pages/admin/* and /pages/ict_officer/* routes.


//Wraps routes and checks for authentication
function ProtectedRoute({ children, requiredRole }) {
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const role = user?.role;

  if (!token) return <Navigate to="/login" replace />;

  // If a specific role is required and the user's role doesn't match, redirect them to the correct role dashboard
  if (requiredRole && role !== requiredRole) {
    const home = role === 'admin' ? '/pages/admin/dashboard' : '/pages/ict_officer/dashboard';
    return <Navigate to={home} replace />;
  }

  return children;
}

function NotFoundRedirect() {
  return <Navigate to="/" replace />;
}



function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />
      <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <Suspense fallback={<div style={{ padding: 40, color: '#6B7C72' }}>Loading...</div>}>
          {children}
        </Suspense>
      </main>
      {/* Footer */}
      <div style={{
        background: '#003D22', padding: '10px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '3px solid #C8922A',
      }}>
        <span style={{ fontSize: 11, color: '#4a7c59' }}>
          © Kenya Revenue Authority {new Date().getFullYear()} · ICT Division · NOC
        </span>
        <span style={{ fontSize: 11, color: '#4a7c59' }}>www.kra.go.ke</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/**
         * Role-based guard to prevent a logged-in user from staying on the wrong role routes.
         * Example: ict_officer should not remain on /pages/admin/*.
         */}


        {/* Protected role-based routes */}
        {(
          [
            { path: '/pages/admin/dashboard',   element: <AdminDashboard />, role: 'admin' },
            { path: '/pages/admin/incidents',   element: <AdminIncidents />, role: 'admin' },
            { path: '/pages/admin/vpn-health',  element: <AdminVPNHealth />, role: 'admin' },
            { path: '/pages/admin/topology',    element: <AdminTopology />, role: 'admin' },
            { path: '/pages/admin/diagnostics', element: <AdminDiagnostics />, role: 'admin' },
            { path: '/pages/admin/assistant',   element: <AdminAssistant />, role: 'admin' },

            { path: '/pages/ict_officer/dashboard',   element: <OfficerDashboard />, role: 'ict_officer' },
            { path: '/pages/ict_officer/incidents',   element: <OfficerIncidents />, role: 'ict_officer' },

            { path: '/pages/ict_officer/topology',    element: <OfficerTopology />, role: 'ict_officer' },
            { path: '/pages/ict_officer/diagnostics', element: <OfficerDiagnostics />, role: 'ict_officer' },
            { path: '/pages/ict_officer/assistant',   element: <OfficerAssistant />, role: 'ict_officer' },
          ]
        ).map(({ path, element, role }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute requiredRole={role}>
                <AppLayout>{element}</AppLayout>
              </ProtectedRoute>
            }
          />
        ))}

        {/* Catch-all */}
        <Route path="*" element={<NotFoundRedirect />} />
      </Routes>
    </BrowserRouter>
  );

}