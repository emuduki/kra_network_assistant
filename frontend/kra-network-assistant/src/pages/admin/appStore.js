import { create } from 'zustand';

const useAppStore = create((set) => ({
  // ── Auth ────────────────────────────────────────────────────────────────────
  user:  JSON.parse(localStorage.getItem('kra_user')  || 'null'),
  token: localStorage.getItem('kra_token') || null,

  login(user, token) {
    localStorage.setItem('kra_user',  JSON.stringify(user));
    localStorage.setItem('kra_token', token);
    set({ user, token });
  },
  logout() {
    localStorage.removeItem('kra_user');
    localStorage.removeItem('kra_token');
    set({ user: null, token: null, incidents: [], tunnels: [], chatHistory: [] });
  },

  // ── Incidents ───────────────────────────────────────────────────────────────
  incidents:        [],
  incidentsLoading: false,
  setIncidents:        (incidents)        => set({ incidents }),
  setIncidentsLoading: (incidentsLoading) => set({ incidentsLoading }),

  updateIncident(id, changes) {
    set(state => ({
      incidents: state.incidents.map(inc => inc.id === id ? { ...inc, ...changes } : inc),
    }));
  },

  // ── Tunnels ─────────────────────────────────────────────────────────────────
  tunnels:        [],
  tunnelsLoading: false,
  setTunnels:        (tunnels)        => set({ tunnels }),
  setTunnelsLoading: (tunnelsLoading) => set({ tunnelsLoading }),

  // ── UI / Selection ──────────────────────────────────────────────────────────
  selectedIncident: null,
  setSelectedIncident: (selectedIncident) => set({ selectedIncident }),

  // ── Chat history (persists across tab switches) ──────────────────────────
  chatHistory: [],
  setChatHistory: (chatHistory) => set({ chatHistory }),
}));

export default useAppStore;
