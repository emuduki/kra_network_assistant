import { useState, useRef, useEffect } from "react";


import { useLocation } from 'react-router-dom';
import useAppStore from '../../store/appStore.js';
import { aiService } from '../../services/index.js';
import { Card, CardHeader, PageHeader } from '../../components/index.jsx';

const SUGGESTIONS = [
  'How do I renew the expiring VPN certificate?',
  'Why is DPD failing on the iTax tunnel?',
  'How do I fix DNS SERVFAIL errors on KRA portals?',
  'What MTU should I set for the IPSec tunnel?',
  'How do I unblock IKE (UDP/500) on the firewall?',
  'Step-by-step iTax VPN recovery procedure',
  'How do I restart StrongSwan on the VPN gateway?',
  'What does "giving up after 5 retransmits" mean?',
];

function Message({ msg }) {
  const isUser = msg.role === 'user';

  // Parse markdown code blocks
  const parts = msg.content.split(/(```[\s\S]*?```)/g);

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', gap: 10 }}>
      {!isUser && (
        <div style={{ width: 32, height: 32, borderRadius: 3, background: '#003C71', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2, border: '1px solid #C8922A40' }}>AI</div>
      )}
      <div style={{
        maxWidth: '76%', padding: '12px 16px', borderRadius: 3, fontSize: 13, lineHeight: 1.7,
        background: isUser ? '#003C71' : '#FFFFFF',
        color: isUser ? 'white' : '#1A2B1F',
        border: isUser ? 'none' : '1px solid #D8DFE6',
        boxShadow: isUser ? 'none' : '0 1px 4px rgba(0,40,80,0.06)',
      }}>
        {parts.map((part, i) => {
          if (part.startsWith('```')) {
            const code = part.replace(/```(\w+)?/g, '').trim();
            return (
              <pre key={i} style={{ background: '#0D1B0F', color: '#86EFAC', padding: '12px 14px', borderRadius: 2, fontSize: 11, overflowX: 'auto', margin: '8px 0', fontFamily: "'Source Code Pro', monospace", lineHeight: 1.7 }}>
                {code}
              </pre>
            );
          }
          return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
        })}
      </div>
      {isUser && (
        <div style={{ width: 32, height: 32, borderRadius: 3, background: '#001D38', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A2B9CE', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
          You
        </div>
      )}
    </div>
  );
}

export default function Assistant() {
  const location  = useLocation();
  const { incidents } = useAppStore();
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const chatEndRef = useRef(null);
  const inputRef   = useRef(null);

  // Active incident context sent to Claude
  const activeContext = incidents
    .filter(i => i.status === 'Open' && i.severity === 'critical')
    .slice(0, 3)
    .map(i => `- ${i.incident_ref}: ${i.description} (${i.service})`)
    .join('\n');

  // If navigated here with a pre-filled prompt (from VPN Diagnose button)
  useEffect(() => {
    if (location.state?.prompt) {
      sendMessage(location.state.prompt);
      window.history.replaceState({}, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const reply = await aiService.chat(newMessages, activeContext);
      setMessages([...newMessages, { role: reply.role, content: reply.content }]);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to get response. Check API connectivity.');
      setMessages([...newMessages, { role: 'assistant', content: '⚠ Error connecting to AI service. Please try again.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function clearChat() {
    setMessages([]);
    setError('');
    setInput('');
  }

  return (
    <div className="fadeIn" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
      <PageHeader title="AI Network Assistant" breadcrumb="AI Assistant">
        {messages.length > 0 && (
          <button onClick={clearChat} style={{ background: 'none', border: '1px solid #D8DFE6', color: '#6B7C72', padding: '5px 14px', borderRadius: 2, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
            Clear Chat
          </button>
        )}
      </PageHeader>

      {/* Context banner */}
      {activeContext && (
        <div style={{ background: '#FEF6E7', border: '1px solid #C8922A30', borderLeft: '4px solid #C8922A', borderRadius: 2, padding: '8px 14px', marginBottom: 14, fontSize: 11, color: '#C8922A' }}>
          <strong>Context loaded:</strong> AI is aware of {incidents.filter(i => i.status === 'Open' && i.severity === 'critical').length} active critical incident(s)
        </div>
      )}

      {/* Suggestions (empty state) */}
      {messages.length === 0 && (
        <Card style={{ marginBottom: 14 }}>
          <CardHeader title="Suggested Questions" subtitle="Click any to get started" />
          <div style={{ padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTIONS.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)} style={{
                background: '#F0F4F8', border: '1px solid #003C7140', borderRadius: 2,
                padding: '7px 14px', fontSize: 12, color: '#003C71',
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.target.style.background = '#003C71'; e.target.style.color = 'white'; }}
                onMouseLeave={e => { e.target.style.background = '#F0F4F8'; e.target.style.color = '#003C71'; }}
              >{q}</button>
            ))}
          </div>
        </Card>
      )}

      {/* Chat window */}
      <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 16, background: '#F5F7F5' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#96A89E', paddingTop: 40 }}>
              <div style={{ fontSize: 36, marginBottom: 12, color: '#003C71', opacity: 0.3 }}>✦</div>
              <div style={{ fontWeight: 600, color: '#6B7C72', fontSize: 13 }}>KRA AI Network Assistant</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Ask about incidents, VPN config, certificates, DNS, firewall rules</div>
            </div>
          )}
          {messages.map((m, i) => <Message key={i} msg={m} />)}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 3, background: '#003C71', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700 }}>AI</div>
              <div style={{ padding: '12px 16px', background: 'white', border: '1px solid #D8DFE6', borderRadius: 3, fontSize: 12, color: '#003C71', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ animation: 'pulse 1s infinite' }}>●</span> Thinking...
              </div>
            </div>
          )}
          {error && <div style={{ fontSize: 12, color: '#BB0000', textAlign: 'center' }}>{error}</div>}
          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <div style={{ padding: '12px 16px', borderTop: '2px solid #003C71', background: 'white', display: 'flex', gap: 10 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about the network incident, VPN config, or request a fix procedure..."
            style={{
              flex: 1, padding: '10px 14px', fontSize: 13,
              border: '1px solid #D8DFE6', borderRadius: 2,
              background: '#F5F7F5', fontFamily: 'inherit',
            }}
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
            background: loading || !input.trim() ? '#96A89E' : '#003C71',
            border: 'none', color: 'white', padding: '10px 22px', borderRadius: 2,
            fontSize: 12, fontWeight: 600, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', letterSpacing: 0.3,
          }}>Send</button>
        </div>
      </Card>
    </div>
  );
}
