// src/services/api.ts

import i18n from 'i18next'; // Import i18n directly into your API service

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'https://truthguard-api-sut7.onrender.com/api';

// Helper to get active language code ('en', 'yo', 'pcm')
const getCurrentLang = () => {
    const lang = i18n.language || localStorage.getItem('i18nextLng') || localStorage.getItem('preferred_language') || 'en';
    // Clean up codes like 'en-US' -> 'en'
    return lang.split('-')[0];
};

// Helper to get stored auth token
const getAuthHeader = (tokenKey = 'token'): Record<string, string> => {
    const token = localStorage.getItem(tokenKey) || localStorage.getItem('fact_checker_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper to parse DRF response errors gracefully
const handleResponse = async (res: Response, fallbackMessage: string) => {
    if (!res.ok) {
        let errorMessage = fallbackMessage;
        try {
            const errorData = await res.json();
            if (errorData.detail) {
                errorMessage = errorData.detail;
            } else if (typeof errorData === 'object') {
                const firstKey = Object.keys(errorData)[0];
                if (firstKey && Array.isArray(errorData[firstKey])) {
                    errorMessage = `${firstKey}: ${errorData[firstKey][0]}`;
                }
            }
        } catch (_) {
            // Non-JSON error response
        }
        throw new Error(errorMessage);
    }
    return res.json();
};

// --- Public Endpoints ---

/** 1. Submit Citizen Report */
export const submitReport = async (data: FormData | Record<string, any>) => {
    const isFormData = data instanceof FormData;

    const res = await fetch(`${API_BASE_URL}/incidents/report/`, {
        method: 'POST',
        headers: isFormData
            ? {}
            : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data),
    });

    return handleResponse(res, 'Failed to submit report');
};

/** 2. Fetch Public Debunked Feed (With Language Parameter) */
export const getDebunkedFeed = async (page = 1) => {
    const lang = getCurrentLang();
    const res = await fetch(`${API_BASE_URL}/incidents/feed/debunked/?page=${page}&lang=${lang}`);
    return handleResponse(res, 'Failed to fetch debunked feed');
};

// --- Fact-Checker Authenticated Endpoints ---

/** 3. Fetch Triage Kanban Board Queue (With Language Parameter) */
export const getTriageQueue = async (search = '', status = '') => {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (status && status !== 'ALL') query.append('status', status);

    // Automatically attach current active language
    query.append('lang', getCurrentLang());

    const queryString = query.toString() ? `?${query.toString()}` : '';

    const res = await fetch(`${API_BASE_URL}/incidents/triage/${queryString}`, {
        headers: {
            ...getAuthHeader('fact_checker_token'),
        },
    });

    return handleResponse(res, 'Failed to fetch triage queue');
};

/** Alias for compatibility */
export const getKanbanTriageQueue = async (_limit = 10, search = '', status = '') => {
    return getTriageQueue(search, status);
};

/** 4. Update Report Ticket Status */
export const updateTicketStatus = async (
    id: string,
    status: 'VERIFIED' | 'FALSE' | 'MISLEADING' | 'PENDING'
) => {
    const res = await fetch(`${API_BASE_URL}/incidents/triage/${id}/status/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader('fact_checker_token'),
        },
        body: JSON.stringify({ status, verdict: status }),
    });

    return handleResponse(res, 'Failed to update ticket status');
};

/** 5. Fetch Social Listening Feed */
export const getSocialListeningFeed = async () => {
    const lang = getCurrentLang();
    const res = await fetch(`${API_BASE_URL}/incidents/social-listening/?lang=${lang}`, {
        headers: {
            ...getAuthHeader('fact_checker_token'),
        },
    });

    return handleResponse(res, 'Failed to fetch social listening feed');
};

/** 6. Fetch Analytics / Situation Room Data */
export const getAnalyticsData = async () => {
    const res = await fetch(`${API_BASE_URL}/incidents/analytics/`, {
        headers: {
            ...getAuthHeader('fact_checker_token'),
        },
    });

    return handleResponse(res, 'Failed to fetch analytics');
};

/** 7. Generate Cloudinary Debunk Card */
export const generateCloudinaryCard = async (claim: string, fact: string) => {
    const res = await fetch(`${API_BASE_URL}/incidents/generate-card/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader('fact_checker_token'),
        },
        body: JSON.stringify({ claim, fact }),
    });

    return handleResponse(res, 'Failed to generate Cloudinary card');
};

/** 8. Fetch TFGBV Queue */
export const getTFGBVQueue = async () => {
    const lang = getCurrentLang();
    const res = await fetch(`${API_BASE_URL}/incidents/tfgbv/queue/?lang=${lang}`, {
        headers: {
            ...getAuthHeader('legal_expert_token'),
        },
    });

    return handleResponse(res, 'Failed to fetch TFGBV queue');
};