import axios from 'axios';

// Base API configuration connecting to Django backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Ticket / Incident Types
export interface TicketPayload {
    incident_type: 'fake_news' | 'doctored_media' | 'tfgbv' | 'hate_speech';
    description: string;
    is_anonymous: boolean;
    language: string;
    media_file?: File | null;
}

// API Methods
export const submitIncidentReport = async (payload: TicketPayload) => {
    const formData = new FormData();
    formData.append('incident_type', payload.incident_type);
    formData.append('description', payload.description);
    formData.append('is_anonymous', String(payload.is_anonymous));
    formData.append('language', payload.language);

    if (payload.media_file) {
        formData.append('media_file', payload.media_file);
    }

    const response = await apiClient.post('/tickets/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const fetchPublicDebunks = async () => {
    const response = await apiClient.get('/debunks/public/');
    return response.data;
};