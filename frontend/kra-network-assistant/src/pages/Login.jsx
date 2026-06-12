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
  const [hoverBtn, setHoverBtn] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Clear any previous session first (prevents role flash if localStorage has stale data)
      localStorage.removeItem('kra_user');
      localStorage.removeItem('kra_token');

      const { token, user } = await authService.login(email, password);
      login(user, token);

      console.log('Logged in as:', user?.role, '| Full user object:', user);
      console.log('Store state:', useAppStore.getState());

      const role = user?.role;
      if (role === 'admin') {
        navigate('/pages/admin/dashboard');
      } else if (role === 'ict_officer') {
        navigate('/pages/ict_officer/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      const responseData = err.response?.data;
      const isNetworkError = err.isNetworkError || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError');
      const fallbackMessage = isNetworkError
        ? `Cannot reach the backend. Ensure backend is running at ${err.response?.url || 'http://localhost:4000'} and that CORS is allowed.`
        : responseData?.error || responseData?.message || err.message || 'Login failed. Please try again.';
      const statusInfo = err.response?.status ? ` (${err.response.status} ${err.response.statusText || ''})` : '';
      setError(`${fallbackMessage}${statusInfo}`.trim());
      console.error('Login error details:', {
        message: err.message,
        response: err.response,
        responseData,
      });
    } finally {
      setLoading(false);
    }
  }

  /* ── styles ─────────────────────────────── */
  const KRA_RED   = '#C8102E';
  const KRA_BLACK = '#1A1A1A';

  const inputStyle = {
    width: '100%', padding: '13px 16px', fontSize: 14,
    border: '1.5px solid #D4D4D4', borderRadius: 8,
    background: '#FAFAFA', fontFamily: 'inherit', marginTop: 8,
    color: KRA_BLACK, outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const inputFocusHandler = (e) => {
    e.target.style.borderColor = KRA_RED;
    e.target.style.boxShadow = `0 0 0 3px ${KRA_RED}18`;
    e.target.style.background = '#FFFFFF';
  };
  const inputBlurHandler = (e) => {
    e.target.style.borderColor = '#D4D4D4';
    e.target.style.boxShadow = 'none';
    e.target.style.background = '#FAFAFA';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F0F0F0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Subtle diagonal pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `repeating-linear-gradient(
          135deg,
          transparent,
          transparent 35px,
          rgba(200,16,46,0.02) 35px,
          rgba(200,16,46,0.02) 36px
        )`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 440 }}>

        {/* ── Card ─────────────────────── */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
        }}>

          {/* Red accent bar at top */}
          <div style={{ height: 4, background: `linear-gradient(90deg, ${KRA_RED}, #E0243E)` }} />

          {/* ── Logo header ─────────── */}
          <div style={{
            padding: '16px 28px 8px',
            textAlign: 'center',
          }}>
            {/* Logo — large */}
            <div style={{
              display: 'flex', justifyContent: 'center', marginBottom: 8,
            }}>
              <div style={{ transform: 'scale(1.55)', transformOrigin: 'center center' }}>
                <KRALogo size={160} />
              </div>
            </div>

            {/* Title */}
            <div style={{
              fontSize: 10.5, fontWeight: 700, color: '#888',
              textTransform: 'uppercase', letterSpacing: 2.5,
              marginTop: -30,
            }}>
              ICT Network Operations Centre
            </div>
          </div>

          {/* Divider */}
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, #E0E0E0, transparent)',
            margin: '0 28px',
          }} />

          {/* ── Form ─────────────────── */}
          <form onSubmit={handleSubmit} style={{ padding: '18px 28px 24px' }}>
            <div style={{
              fontSize: 16, fontWeight: 800, color: KRA_BLACK,
              marginBottom: 4,
            }}>
              Sign In
            </div>
            <div style={{
              fontSize: 12.5, color: '#707070', marginBottom: 16,
              lineHeight: 1.4,
            }}>
              Enter your KRA staff credentials to continue.
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#FFF0F0',
                border: `1px solid ${KRA_RED}40`,
                borderLeft: `4px solid ${KRA_RED}`,
                borderRadius: 8,
                padding: '12px 16px',
                fontSize: 12.5, color: KRA_RED,
                marginBottom: 20,
                lineHeight: 1.5,
              }}>
                {error}
              </div>
            )}

            {/* Staff Number */}
            <div style={{ marginBottom: 12 }}>
              <label style={{
                fontSize: 12, fontWeight: 700, color: KRA_BLACK,
                display: 'block', letterSpacing: 0.3,
              }}>
                Staff Number
              </label>
              <input
                type="text" value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
                style={inputStyle}
                required placeholder="e.g. kariuki@kra.go.ke"
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 6 }}>
              <label style={{
                fontSize: 12, fontWeight: 700, color: KRA_BLACK,
                display: 'block', letterSpacing: 0.3,
              }}>
                Password
              </label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
                style={inputStyle}
                required placeholder="Enter your password"
              />
            </div>

            {/* Forgot */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <button type="button" style={{
                border: 'none', background: 'transparent', color: KRA_RED,
                fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '4px 0',
                textDecoration: 'none',
              }}>
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setHoverBtn(true)}
              onMouseLeave={() => setHoverBtn(false)}
              style={{
                width: '100%', padding: '13px 18px',
                background: loading ? '#999' : KRA_RED,
                border: 'none', borderRadius: 12, color: '#FFFFFF',
                fontSize: 14, fontWeight: 800, letterSpacing: 0.5,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: hoverBtn && !loading
                  ? `0 12px 32px ${KRA_RED}44`
                  : `0 8px 24px ${KRA_RED}28`,
                transform: hoverBtn && !loading ? 'translateY(-1px)' : 'translateY(0)',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>

            {/* Policy notice */}
            <div style={{
              marginTop: 14,
              padding: '8px 14px',
              background: '#F7F7F7',
              borderRadius: 10,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 11.5, color: '#888', lineHeight: 1.6 }}>
                This system is for <strong style={{ color: KRA_BLACK }}>authorised KRA ICT staff</strong> only.
                <br />Unauthorised access is a violation of KRA ICT Policy.
              </div>
            </div>
          </form>
        </div>

        {/* ── Footer ─────────────────── */}
        <div style={{
          textAlign: 'center', marginTop: 24,
          fontSize: 11, color: '#1A1A1A', letterSpacing: 0.2,
        }}>
          © Kenya Revenue Authority {new Date().getFullYear()} · AI Network Incident Diagnostics
        </div>
      </div>
    </div>
  );
}
