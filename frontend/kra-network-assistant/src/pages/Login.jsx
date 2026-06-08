import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/index.js';
import useAppStore from '../store/appStore.js';
import { KRALogo } from '../components/index.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAppStore();
  const [email,    setEmail]    = useState('kariuki@kra.go.ke');
  const [password, setPassword] = useState('kra2026!');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await authService.login(email, password);
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', fontSize: 13,
    border: '1px solid #D8DFE6', borderRadius: 2,
    background: '#F5F7F5', fontFamily: 'inherit', marginTop: 6,
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#003D22',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Background pattern */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)',
      }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 420, padding: 24 }}>
        {/* Card */}
        <div style={{
          background: '#FFFFFF', borderRadius: 4,
          border: '1px solid #D8DFE6', overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}>
          {/* Green header */}
          <div style={{
            background: '#006B3C', padding: '28px 32px',
            borderBottom: '3px solid #C8922A', textAlign: 'center',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <KRALogo size={60} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: 0.3 }}>
              Kenya Revenue Authority
            </div>
            <div style={{ fontSize: 11, color: '#9ABFAB', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              ICT Division · Network Operations Centre
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '28px 32px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2B1F', marginBottom: 20 }}>
              Sign in to your account
            </div>

            {error && (
              <div style={{
                background: '#FFF0F0', border: '1px solid #BB0000',
                borderLeft: '4px solid #BB0000', borderRadius: 2,
                padding: '10px 14px', fontSize: 12, color: '#BB0000', marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <label style={{ fontSize: 12, fontWeight: 600, color: '#3D5247', display: 'block', marginBottom: 14 }}>
              Email Address
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                style={inputStyle} required placeholder="you@kra.go.ke"
              />
            </label>

            <label style={{ fontSize: 12, fontWeight: 600, color: '#3D5247', display: 'block', marginBottom: 22 }}>
              Password
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                style={inputStyle} required placeholder="Enter password"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '11px', background: loading ? '#96A89E' : '#006B3C',
                border: 'none', borderRadius: 2, color: '#fff',
                fontSize: 13, fontWeight: 600, letterSpacing: 0.4,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div style={{ marginTop: 16, fontSize: 11, color: '#96A89E', textAlign: 'center' }}>
              This system is for authorised KRA ICT staff only.<br />
              Unauthorised access is a violation of KRA ICT Policy.
            </div>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#4a7c59' }}>
          © Kenya Revenue Authority {new Date().getFullYear()} · AI Network Incident Diagnostics
        </div>
      </div>
    </div>
  );
}
