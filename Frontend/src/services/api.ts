import axios from 'axios';

// We use an environment variable for the API base URL. 
// In development, this might be http://localhost:8000/api/v1
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.truthguard.org/v1';

// Create a configured Axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Automatically attach the Admin Auth Token to every request
apiClient.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('truthguard_admin_token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// API Methods organized by feature
export const api = {
    // --- PUBLIC ENDPOINTS ---
    reports: {
        submit: (formData: FormData) =>
            apiClient.post('/reports', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
    },

    debunks: {
        getLive: (page = 1, limit = 10) =>
            apiClient.get(`/debunks?page=${page}&limit=${limit}`),
    },

    // --- ADMIN / SITUATION ROOM ENDPOINTS ---
    auth: {
        login: (passcode: string) =>
            apiClient.post('/auth/login', { passcode }),
    },

    tickets: {
        getAll: () => apiClient.get('/admin/tickets'),
        updateStatus: (id: string, status: string) =>
            apiClient.patch(`/admin/tickets/${id}`, { status }),
    }
};