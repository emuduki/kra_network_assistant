// ── Quick API Test Script ─────────────────────────────────────────────────────
// Run: node test-api.js
// Tests every endpoint and prints pass/fail
// Requires the backend to be running on localhost:4000

const BASE = 'http://localhost:4000';
let TOKEN  = '';
let INCIDENT_ID = '';

async function req(method, path, body, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function pass(label) { console.log(`  ✅ ${label}`); }
function fail(label, detail) { console.log(`  ❌ ${label} — ${detail}`); }
function section(title) { console.log(`\n── ${title} ${'─'.repeat(40 - title.length)}`); }

async function run() {
  console.log('🧪 KRA Network Assistant — API Test Suite\n');

  // ── Health ──────────────────────────────────────────────────────────────────
  section('Health');
  const health = await req('GET', '/health', null, false);
  health.status === 200 && health.data.status === 'ok'
    ? pass('GET /health')
    : fail('GET /health', JSON.stringify(health.data));

  // ── Auth ────────────────────────────────────────────────────────────────────
  section('Auth');

  const badLogin = await req('POST', '/api/auth/login', { email: 'wrong@kra.go.ke', password: 'wrong' }, false);
  badLogin.status === 401
    ? pass('POST /api/auth/login  (wrong credentials → 401)')
    : fail('POST /api/auth/login  (wrong credentials)', `expected 401 got ${badLogin.status}`);

  const login = await req('POST', '/api/auth/login', { email: 'kariuki@kra.go.ke', password: 'kra2026!' }, false);
  if (login.status === 200 && login.data.token) {
    TOKEN = login.data.token;
    pass(`POST /api/auth/login  (admin login → token received)`);
  } else {
    fail('POST /api/auth/login', JSON.stringify(login.data));
  }

  // ── Users ───────────────────────────────────────────────────────────────────
  section('Users');

  const me = await req('GET', '/api/users/me');
  me.status === 200 && me.data.email
    ? pass(`GET /api/users/me  (${me.data.name}, ${me.data.role})`)
    : fail('GET /api/users/me', JSON.stringify(me.data));

  const users = await req('GET', '/api/users');
  users.status === 200 && Array.isArray(users.data)
    ? pass(`GET /api/users  (${users.data.length} users returned)`)
    : fail('GET /api/users', JSON.stringify(users.data));

  // ── Tunnels ─────────────────────────────────────────────────────────────────
  section('Tunnels');

  const tunnels = await req('GET', '/api/tunnels');
  tunnels.status === 200 && Array.isArray(tunnels.data)
    ? pass(`GET /api/tunnels  (${tunnels.data.length} tunnels returned)`)
    : fail('GET /api/tunnels', JSON.stringify(tunnels.data));

  // ── Incidents ───────────────────────────────────────────────────────────────
  section('Incidents');

  const incidents = await req('GET', '/api/incidents');
  incidents.status === 200 && Array.isArray(incidents.data)
    ? pass(`GET /api/incidents  (${incidents.data.length} incidents returned)`)
    : fail('GET /api/incidents', JSON.stringify(incidents.data));

  const filtered = await req('GET', '/api/incidents?status=Open&severity=critical');
  filtered.status === 200
    ? pass(`GET /api/incidents?status=Open&severity=critical  (${filtered.data.length} results)`)
    : fail('GET /api/incidents  (filter)', JSON.stringify(filtered.data));

  const created = await req('POST', '/api/incidents', {
    severity:    'warning',
    service:     'Test Service',
    description: 'Test incident created by test-api.js',
  });
  if (created.status === 201 && created.data.id) {
    INCIDENT_ID = created.data.id;
    pass(`POST /api/incidents  (created ${created.data.incident_ref})`);
  } else {
    fail('POST /api/incidents', JSON.stringify(created.data));
  }

  if (INCIDENT_ID) {
    const updated = await req('PATCH', `/api/incidents/${INCIDENT_ID}`, { status: 'In Progress' });
    updated.status === 200 && updated.data.status === 'In Progress'
      ? pass(`PATCH /api/incidents/:id  (status → In Progress)`)
      : fail('PATCH /api/incidents/:id', JSON.stringify(updated.data));

    const deleted = await req('DELETE', `/api/incidents/${INCIDENT_ID}`);
    deleted.status === 200
      ? pass(`DELETE /api/incidents/:id  (cleaned up test incident)`)
      : fail('DELETE /api/incidents/:id', JSON.stringify(deleted.data));
  }

  // ── Logs ────────────────────────────────────────────────────────────────────
  section('Logs');

  const logs = await req('GET', '/api/logs');
  logs.status === 200 && Array.isArray(logs.data)
    ? pass(`GET /api/logs  (${logs.data.length} past submissions)`)
    : fail('GET /api/logs', JSON.stringify(logs.data));

  // ── AI ──────────────────────────────────────────────────────────────────────
  section('AI (requires ANTHROPIC_API_KEY)');

  const analysis = await req('POST', '/api/ai/analyze', {
    logText: 'May 23 08:14:40 vpn-gw01 charon: IKE_SA iTax_staff[23] state change: ESTABLISHED => DELETING\nMay 23 08:15:10 vpn-gw01 named: DNS SERVFAIL itax.kra.go.ke from 10.0.1.22',
  });
  if (analysis.status === 200 && analysis.data.severity) {
    pass(`POST /api/ai/analyze  (severity: ${analysis.data.severity}, issues: ${analysis.data.issues?.length})`);
  } else if (analysis.status === 429) {
    pass('POST /api/ai/analyze  (rate limited — API key working)');
  } else {
    fail('POST /api/ai/analyze', JSON.stringify(analysis.data).slice(0, 100));
  }

  const chat = await req('POST', '/api/ai/chat', {
    messages: [{ role: 'user', content: 'What does DPD stand for and why does it fail?' }],
  });
  chat.status === 200 && chat.data.content
    ? pass('POST /api/ai/chat  (response received)')
    : fail('POST /api/ai/chat', JSON.stringify(chat.data).slice(0, 100));

  console.log('\n─────────────────────────────────────────────────\n');
  console.log('Test run complete. Fix any ❌ above before Phase 3.\n');
}

run().catch(console.error);