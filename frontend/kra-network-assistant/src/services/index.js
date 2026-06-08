import api from './api';

// Incidents
export const incidentsService = {
    getAll: (params) => api.get('/api/incidents', { params }).then(r => r.data),
    getOne: (id) => api.get(`/api/incidents/${id}`).then(r => r.data),
    create: (data) => api.post('/api/incidents', data).then(r => r.data),
    update: (id, data) => api.patch(`/api/incidents/${id}`, data).then(r => r.data),
    remove: (id) => api.delete(`/api/incidents/${id}`).then(r => r.data),
};

// Tunnels
export const tunnelsService = {
    getAll: ()      => api.get('/api/tunnels').then(r => r.data),
    update: (id, data) => api.patch(`/api/tunnels/${id}`, data).then(r => r.data),
};

//AI Services
export const aiService = {
    analyzeLog: (logText, traceroute) => 
        api.post('/api/ai/analyze', { logText, traceroute }).then(r => r.data),

    chat: (messages, context) =>
        api.post('/api/ai/chat', { messages, context }).then(r => r.data),
};

//Auth
export const authService = {
    login: (email, password) =>
        api.post('/api/auth/login', { email, password }).then(r => r.data),
    logout: () => api.post('/api/auth/logout'),
};