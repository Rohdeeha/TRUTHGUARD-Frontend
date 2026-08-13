// src/services/api.ts

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'https://truthguard-api-sut7.onrender.com/api';

// Helper to get stored auth token
const getAuthHeader = (tokenKey = 'token') => {
    const token = localStorage.getItem(tokenKey);
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

/** 1. Submit Citizen Report (Supports both FormData with media files and JSON) */
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

/** 2. Fetch Public Debunked Feed */
export const getDebunkedFeed = async (page = 1) => {
    const res = await fetch(`${API_BASE_URL}/incidents/feed/debunked/?page=${page}`);
    return handleResponse(res, 'Failed to fetch debunked feed');
};

// --- Fact-Checker Authenticated Endpoints ---

/** 3. Fetch Triage Kanban Board Queue */
export const getTriageQueue = async (search = '', status = '') => {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (status && status !== 'ALL') query.append('status', status);

    const queryString = query.toString() ? `?${query.toString()}` : '';

    const res = await fetch(`${API_BASE_URL}/incidents/triage/${queryString}`, {
        headers: {
            ...getAuthHeader('fact_checker_token'),
        },
    });

    return handleResponse(res, 'Failed to fetch triage queue');
};

/** Alias function for components referencing KanbanTriageView */
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
        body: JSON.stringify({ status }),
    });

    return handleResponse(res, 'Failed to update ticket status');
};

/** 5. Fetch Social Listening Feed */
export const getSocialListeningFeed = async () => {
    const res = await fetch(`${API_BASE_URL}/incidents/social-listening/`, {
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

/** 7. Generate Cloudinary Debunk Card (Backend Generator) */
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

// --- Legal Expert Authenticated Endpoint ---

/** 8. Fetch TFGBV Queue */
export const getTFGBVQueue = async () => {
    const res = await fetch(`${API_BASE_URL}/incidents/tfgbv/queue/`, {
        headers: {
            ...getAuthHeader('legal_expert_token'),
        },
    });

    return handleResponse(res, 'Failed to fetch TFGBV queue');
};