import { useEffect, useState } from 'react';
import useAppStore from '../../store/appStore.js';
import { incidentsService } from '../../services/index.js';
import { Badge, Card, CardHeader, PageHeader, LoadingSpinner } from '../../components/index.jsx';

const STATUSES  = ['All', 'Open', 'In Progress', 'Monitoring', 'Resolved'];
const SEVERITIES = ['All', 'critical', 'warning', 'info'];

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return new Date(d).toLocaleDateString('en-KE');
}

export default function Incidents() {
  const { user, incidents, incidentsLoading, setIncidents, setIncidentsLoading, updateIncident, selectedIncident, setSelectedIncident } = useAppStore();
  const isAdmin = user?.role === 'admin';

  const [filterStatus,   setFilterStatus]   = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [search,         setSearch]         = useState('');
  const [updating,       setUpdating]       = useState(null);
  const [showCreate,     setShowCreate]     = useState(false);
  const [createForm,     setCreateForm]     = useState({ severity: 'warning', service: '', description: '', assigned_to: '' });
  const [createLoading,  setCreateLoading]  = useState(false);
  const [createError,    setCreateError]    = useState('');

  useEffect(() => {
    fetchIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If navigated here with a selected incident, scroll to it
  useEffect(() => {
    if (selectedIncident) {
      setTimeout(() => {
        document.getElementById(`inc-${selectedIncident.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  }, [selectedIncident]);

  async function fetchIncidents() {
    setIncidentsLoading(true);
    try {
      const data = await incidentsService.getAll();
      setIncidents(data);
    } catch (e) { console.error(e); }
    finally { setIncidentsLoading(false); }
  }

  async function handleStatusChange(inc, newStatus) {
    setUpdating(inc.id);
    try {
      const updated = await incidentsService.update(inc.id, { status: newStatus });
      updateIncident(inc.id, updated);
      if (selectedIncident?.id === inc.id) setSelectedIncident(updated);
    } catch (e) { console.error(e); }
    finally { setUpdating(null); }
  }

  async function handleAssign(inc, assignTo) {
    setUpdating(inc.id);
    try {
      const updated = await incidentsService.update(inc.id, { assigned_to: assignTo });
      updateIncident(inc.id, updated);
      if (selectedIncident?.id === inc.id) setSelectedIncident(updated);
    } catch (e) { console.error(e); }
    finally { setUpdating(null); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!createForm.service || !createForm.description) {
      setCreateError('Service and description are required.'); return;
    }
    setCreateLoading(true); setCreateError('');
    try {
      const inc = await incidentsService.create(createForm);
      setIncidents([inc, ...incidents]);
      setShowCreate(false);
      setCreateForm({ severity: 'warning', service: '', description: '', assigned_to: '' });
    } catch (e) {
      setCreateError(e.response?.data?.error || 'Failed to create incident.');
    } finally { setCreateLoading(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this incident? This cannot be undone.')) return;
    try {
      await incidentsService.remove(id);
      setIncidents(incidents.filter(i => i.id !== id));
      if (selectedIncident?.id === id) setSelectedIncident(null);
    } catch (e) { console.error(e); }
  }

  // Filter + search
  const filtered = incidents.filter(i => {
    if (filterStatus   !== 'All' && i.status   !== filterStatus)   return false;
    if (filterSeverity !== 'All' && i.severity !== filterSeverity) return false;
    if (search && ![i.incident_ref, i.service, i.description, i.assigned_to]
      .join(' ').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const inputStyle = {
    width: '100%', padding: '8px 12px', fontSize: 12,
    border: '1px solid #D8DFE6', borderRadius: 2,
    background: '#F5F7F5', fontFamily: 'inherit', marginTop: 4,
  };

  return (
    <div className="fadeIn">
      <PageHeader title="Incident Management" breadcrumb="Incidents">
        {isAdmin && (
          <button onClick={() => setShowCreate(!showCreate)} style={{
            background: '#006B3C', border: 'none', color: 'white',
            padding: '7px 16px', borderRadius: 2, fontSize: 12,
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>+ New Incident</button>
        )}
      </PageHeader>

      {/* ── Create form (admin only) ── */}
      {showCreate && (
        <Card style={{ marginBottom: 16, borderLeft: '4px solid #006B3C' }}>
          <CardHeader title="Create New Incident" />
          <form onSubmit={handleCreate} style={{ padding: 18 }}>
            {createError && (
              <div style={{ background: '#FFF0F0', border: '1px solid #BB0000', borderRadius: 2, padding: '8px 12px', fontSize: 12, color: '#BB0000', marginBottom: 12 }}>
                {createError}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#3D5247' }}>
                Severity
                <select value={createForm.severity} onChange={e => setCreateForm({ ...createForm, severity: e.target.value })} style={inputStyle}>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </label>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#3D5247' }}>
                Affected Service
                <input value={createForm.service} onChange={e => setCreateForm({ ...createForm, service: e.target.value })} placeholder="e.g. iTax Portal" style={inputStyle} />
              </label>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#3D5247' }}>
                Assign To
                <input value={createForm.assigned_to} onChange={e => setCreateForm({ ...createForm, assigned_to: e.target.value })} placeholder="e.g. J. Kariuki" style={inputStyle} />
              </label>
            </div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#3D5247', display: 'block', marginBottom: 14 }}>
              Description
              <textarea value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Describe the incident..." rows={3}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={createLoading} style={{
                background: createLoading ? '#96A89E' : '#006B3C', border: 'none',
                color: 'white', padding: '8px 20px', borderRadius: 2,
                fontSize: 12, fontWeight: 600, cursor: createLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              }}>{createLoading ? 'Creating...' : 'Create Incident'}</button>
              <button type="button" onClick={() => setShowCreate(false)} style={{
                background: 'none', border: '1px solid #D8DFE6', color: '#6B7C72',
                padding: '8px 16px', borderRadius: 2, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}>Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {/* ── Selected incident detail ── */}
      {selectedIncident && (
        <Card style={{ marginBottom: 16, borderLeft: `4px solid ${selectedIncident.severity === 'critical' ? '#BB0000' : selectedIncident.severity === 'warning' ? '#C8922A' : '#1A5C96'}` }}>
          <div style={{ padding: '14px 18px', background: '#F0FAF4', borderBottom: '1px solid #D8DFE6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 10, color: '#96A89E', fontFamily: "'Source Code Pro', monospace" }}>{selectedIncident.incident_ref}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2B1F', marginTop: 2 }}>Incident Detail</div>
            </div>
            <button onClick={() => setSelectedIncident(null)} style={{ background: 'none', border: '1px solid #D8DFE6', borderRadius: 2, padding: '4px 10px', cursor: 'pointer', color: '#6B7C72', fontSize: 12, fontFamily: 'inherit' }}>✕ Close</button>
          </div>
          <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 4 }}>
            {[
              { label: 'Severity',    value: <Badge status={selectedIncident.severity} /> },
              { label: 'Service',     value: selectedIncident.service },
              { label: 'Status',      value: selectedIncident.status },
              { label: 'Assigned To', value: selectedIncident.assigned_to || '—' },
              { label: 'Detected',    value: timeAgo(selectedIncident.created_at) },
              { label: 'Ref',         value: selectedIncident.incident_ref },
            ].map((f, i) => (
              <div key={i} style={{ background: '#F5F7F5', borderRadius: 2, padding: '10px 14px', border: '1px solid #D8DFE6' }}>
                <div style={{ fontSize: 10, color: '#96A89E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A2B1F' }}>{f.value}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '0 18px 14px' }}>
            <div style={{ fontSize: 10, color: '#96A89E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Description</div>
            <div style={{ fontSize: 13, color: '#3D5247', lineHeight: 1.6, background: '#F5F7F5', padding: '10px 14px', borderRadius: 2, border: '1px solid #D8DFE6' }}>{selectedIncident.description}</div>
          </div>
          {selectedIncident.ai_diagnosis && (
            <div style={{ padding: '0 18px 14px' }}>
              <div style={{ fontSize: 10, color: '#96A89E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>AI Diagnosis</div>
              <div style={{ fontSize: 12, color: '#3D5247', lineHeight: 1.6, background: '#F0FAF4', padding: '10px 14px', borderRadius: 2, border: '1px solid #006B3C30', fontFamily: "'Source Code Pro', monospace" }}>
                {typeof selectedIncident.ai_diagnosis === 'string'
                  ? selectedIncident.ai_diagnosis
                  : JSON.stringify(selectedIncident.ai_diagnosis, null, 2)}
              </div>
            </div>
          )}
          <div style={{ padding: '0 18px 16px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {isAdmin && (
              <>
                {['Open','In Progress','Monitoring','Resolved'].map(s => (
                  <button key={s} onClick={() => handleStatusChange(selectedIncident, s)}
                    disabled={selectedIncident.status === s || updating === selectedIncident.id}
                    style={{
                      background: selectedIncident.status === s ? '#006B3C' : '#E8F5EE',
                      border: '1px solid #006B3C50', color: selectedIncident.status === s ? 'white' : '#006B3C',
                      padding: '6px 14px', borderRadius: 2, fontSize: 11, fontWeight: 600,
                      cursor: selectedIncident.status === s ? 'default' : 'pointer', fontFamily: 'inherit',
                    }}>
                    {updating === selectedIncident.id ? '...' : `→ ${s}`}
                  </button>
                ))}
                <button onClick={() => handleDelete(selectedIncident.id)} style={{
                  background: '#FFF0F0', border: '1px solid #BB000050', color: '#BB0000',
                  padding: '6px 14px', borderRadius: 2, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', marginLeft: 'auto',
                }}>🗑 Delete</button>
              </>
            )}
          </div>
        </Card>
      )}

      {/* ── Filters ── */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ padding: '12px 18px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search incidents..." style={{
              padding: '7px 12px', fontSize: 12, border: '1px solid #D8DFE6',
              borderRadius: 2, background: '#F5F7F5', fontFamily: 'inherit', width: 220,
            }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: '5px 12px', borderRadius: 2, fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', border: '1px solid',
                background: filterStatus === s ? '#006B3C' : '#F5F7F5',
                color: filterStatus === s ? 'white' : '#6B7C72',
                borderColor: filterStatus === s ? '#006B3C' : '#D8DFE6',
              }}>{s}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {SEVERITIES.map(s => (
              <button key={s} onClick={() => setFilterSeverity(s)} style={{
                padding: '5px 12px', borderRadius: 2, fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', border: '1px solid',
                background: filterSeverity === s ? '#003D22' : '#F5F7F5',
                color: filterSeverity === s ? 'white' : '#6B7C72',
                borderColor: filterSeverity === s ? '#003D22' : '#D8DFE6',
              }}>{s === 'All' ? 'All Severity' : s.charAt(0).toUpperCase() + s.slice(1)}</button>
            ))}
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#96A89E' }}>
            {filtered.length} of {incidents.length} incidents
          </span>
          <button onClick={fetchIncidents} style={{
            background: '#E8F5EE', border: '1px solid #006B3C50', color: '#006B3C',
            padding: '5px 12px', borderRadius: 2, fontSize: 11, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>⟳ Refresh</button>
        </div>
      </Card>

      {/* ── Incidents table ── */}
      <Card>
        <CardHeader title="All Incidents" subtitle={`${filtered.length} result${filtered.length !== 1 ? 's' : ''}`} />
        {incidentsLoading ? <LoadingSpinner message="Loading incidents..." /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#003D22' }}>
                  {['Incident ID', 'Severity', 'Service', 'Description', 'Assigned To', 'Status', 'Time', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: '#9ABFAB', letterSpacing: 0.5, textTransform: 'uppercase', borderBottom: '2px solid #C8922A', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#96A89E' }}>No incidents match your filters</td></tr>
                ) : filtered.map((inc, i) => {
                  const isSelected = selectedIncident?.id === inc.id;
                  const ismine = inc.assigned_to && user?.name &&
                    inc.assigned_to.toLowerCase().includes(user.name.split(' ').pop().toLowerCase());
                  return (
                    <tr key={inc.id} id={`inc-${inc.id}`}
                      onClick={() => setSelectedIncident(isSelected ? null : inc)}
                      style={{
                        background: isSelected ? '#E8F5EE' : ismine ? '#F0FAF4' : i % 2 === 0 ? '#FFFFFF' : '#F5F7F5',
                        cursor: 'pointer', transition: 'background 0.15s',
                        borderLeft: isSelected ? '3px solid #006B3C' : ismine ? '3px solid #006B3C60' : '3px solid transparent',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F0FAF4'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = ismine ? '#F0FAF4' : i % 2 === 0 ? '#FFFFFF' : '#F5F7F5'; }}
                    >
                      <td style={{ padding: '10px 14px', fontFamily: "'Source Code Pro', monospace", fontSize: 11, color: '#006B3C', fontWeight: 600, borderBottom: '1px solid #EAEEF0' }}>
                        {inc.incident_ref}
                        {ismine && <span style={{ marginLeft: 5, fontSize: 9, background: '#006B3C', color: 'white', padding: '1px 5px', borderRadius: 2, fontWeight: 700 }}>MINE</span>}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EAEEF0' }}><Badge status={inc.severity} /></td>
                      <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, borderBottom: '1px solid #EAEEF0' }}>{inc.service}</td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: '#3D5247', maxWidth: 240, borderBottom: '1px solid #EAEEF0' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>{inc.description}</div>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 12, borderBottom: '1px solid #EAEEF0' }}>
                        {isAdmin ? (
                          <input defaultValue={inc.assigned_to || ''} onBlur={e => { if (e.target.value !== (inc.assigned_to || '')) handleAssign(inc, e.target.value); }}
                            onClick={e => e.stopPropagation()}
                            style={{ width: 120, padding: '3px 8px', fontSize: 11, border: '1px solid #D8DFE6', borderRadius: 2, background: '#F5F7F5', fontFamily: 'inherit' }}
                            placeholder="Assign..." />
                        ) : (
                          <span style={{ color: inc.assigned_to ? '#1A2B1F' : '#96A89E', fontStyle: inc.assigned_to ? 'normal' : 'italic' }}>
                            {inc.assigned_to || 'Unassigned'}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EAEEF0' }}>
                        {isAdmin ? (
                          <select value={inc.status} onClick={e => e.stopPropagation()}
                            onChange={e => handleStatusChange(inc, e.target.value)}
                            disabled={updating === inc.id}
                            style={{ fontSize: 11, padding: '3px 8px', border: '1px solid #D8DFE6', borderRadius: 2, background: '#F5F7F5', fontFamily: 'inherit', cursor: 'pointer' }}>
                            {['Open','In Progress','Monitoring','Resolved'].map(s => <option key={s}>{s}</option>)}
                          </select>
                        ) : (
                          <span style={{
                            padding: '2px 8px', borderRadius: 2, fontSize: 11, fontWeight: 600,
                            background: inc.status === 'Open' ? '#FFF0F0' : inc.status === 'In Progress' ? '#FEF6E7' : '#E8F5EE',
                            color: inc.status === 'Open' ? '#BB0000' : inc.status === 'In Progress' ? '#C8922A' : '#006B3C',
                          }}>{inc.status}</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', fontFamily: "'Source Code Pro', monospace", fontSize: 10.5, color: '#96A89E', borderBottom: '1px solid #EAEEF0' }}>{timeAgo(inc.created_at)}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EAEEF0' }} onClick={e => e.stopPropagation()}>
                        {isAdmin && (
                          <button onClick={() => handleDelete(inc.id)} style={{ background: 'none', border: 'none', color: '#BB0000', cursor: 'pointer', fontSize: 14, padding: '2px 6px' }} title="Delete">🗑</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
