import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAppStore from './store/appStore';
import NavBar from './components/NavBar.jsx';
import Login from './pages/Login.jsx';

// Lazy-load pages for faster initial load
import { lazy, Suspense } from 'react';
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Incidents = lazy(() => import('./pages/Incidents.jsx'));
const VPNHealth = lazy(() => import('./pages/VPNHealth.jsx'));
const Topology = lazy(() => import('./pages/Topology.jsx'));
const Diagnostics = lazy(() => import('./pages/Diagnostics.jsx'));
const Assistant = lazy(() => import('./pages/Assistant.jsx'));
const Reports = lazy(() => import('./pages/Reports.jsx'));

//Wraps routes and checks for authentication
function ProtectedRoute({ children }) {
  const token = useAppStore((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {[
          { path: '/dashboard',   element: <Dashboard /> },
          { path: '/incidents',   element: <Incidents /> },
          { path: '/vpn-health',  element: <VPNHealth /> },
          { path: '/topology',    element: <Topology /> },
          { path: '/diagnostics', element: <Diagnostics /> },
          { path: '/assistant',   element: <Assistant /> },
          { path: '/reports',     element: <Reports /> },
        ].map(({ path, element }) => (
          <Route key={path} path={path} element={
            <ProtectedRoute>
              <AppLayout>{element}</AppLayout>
            </ProtectedRoute>
          } />
        ))}
      </Routes>
    </BrowserRouter>
  );
}