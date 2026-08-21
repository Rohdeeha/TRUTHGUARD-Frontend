// src/services/api.ts

// 1. Updated to match the new Incident model Payload fields
export interface IncidentReport {
    id?: string | number;
    claim?: string;
    who_said_it?: string;
    where_and_when?: string;
    location?: string;
    category?: string;
    status?: 'VERIFIED' | 'FALSE' | 'MISLEADING' | 'PENDING';
    is_anonymous?: boolean;
    is_tfgbv?: boolean;
    evidence_file?: File | string | null; // Can be a File object for upload, or a string URL from backend
    created_at?: string;
}

// 2. NEW: Interface mapping to the new FactCheckArticle model for the public feed
export interface FactCheckArticle {
    id: string | number;
    title?: string;
    content?: string;
    verdict?: string;
    cover_image?: string | null;
    created_at?: string;
    fact_checker?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    incident_details?: IncidentReport; // The original citizen report is now nested here!
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// Ensure your VITE_API_BASE_URL in your .env file ends with /api (e.g. http://localhost:8000/api)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://truthguard-api-sut7.onrender.com/api';

// Helper to get stored auth token
const getAuthHeader = (tokenKey = 'access_token'): Record<string, string> => {
    const token = localStorage.getItem(tokenKey) || localStorage.getItem('access_token');
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
    if (res.status === 204) return null;
    return res.json();
};

// --- Updated Mock Data (Fallback) ---
const MOCK_DEBUNKED_FALLBACK: PaginatedResponse<FactCheckArticle> = {
    count: 1,
    next: null,
    previous: null,
    results: [
        {
            id: 101,
            title: "No, Voting Materials Did Not Arrive Late at Unit 004",
            content: "<p>Our investigation shows polling started exactly on time.</p>",
            verdict: "FALSE",
            created_at: new Date().toISOString(),
            incident_details: {
                claim: "Voting materials arrived late and polling officials closed lines prematurely.",
                who_said_it: "Anonymous User on X",
                where_and_when: "Yesterday, Osogbo",
                category: "Voter Suppression"
            }
        }
    ]
};

// ==========================================
// 1. CITIZEN-FACING ENDPOINTS (PUBLIC)
// ==========================================

export const submitReport = async (data: FormData | Record<string, any>) => {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/report/`, {
        method: 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data),
    });

    return handleResponse(res, 'Failed to submit report');
};

// ==========================================
// 2. PUBLIC VISITOR FEED
// ==========================================

// Switched to FactCheckArticle type and fixed pagination param (page_size)
export const getDebunkedFeed = async (page = 1, limit = 10): Promise<PaginatedResponse<FactCheckArticle>> => {
    try {
        // FIX: Changed limit= to page_size= so Django actually paginates it
        const res = await fetch(`${API_BASE_URL}/feed/fact-checks/?page=${page}&page_size=${limit}`);

        if (!res.ok) throw new Error(`Server returned status code ${res.status}`);

        const data = await res.json();

        // Return structured data immediately instead of caching to localStorage 
        // (prevents stale bug when the backend updates)
        return Array.isArray(data)
            ? { count: data.length, next: null, previous: null, results: data }
            : data;

    } catch (error) {
        console.warn("Backend 500 error or offline detected. Attempting fallback:", error);
        return MOCK_DEBUNKED_FALLBACK;
    }
};

// ==========================================
// 3. INTERNAL SITUATION ROOM & TRIAGE (AUTH REQUIRED)
// ==========================================

export const getTriageQueue = async (params: { search?: string; status?: string; is_tfgbv?: boolean } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.is_tfgbv) query.append('is_tfgbv', 'true');

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/triage/${queryString}`, {
        headers: getAuthHeader(),
    });

    return handleResponse(res, 'Failed to fetch triage queue');
};

export const getKanbanTriageQueue = async (_limit = 10, search = '', status = '') => {
    return getTriageQueue({ search, status });
};

export const updateTicketStatus = async (
    id: string | number,
    data: { status?: 'VERIFIED' | 'FALSE' | 'MISLEADING' | 'PENDING'; is_tfgbv?: boolean }
) => {
    const res = await fetch(`${API_BASE_URL}/triage/${id}/update/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(data),
    });

    return handleResponse(res, 'Failed to update ticket status');
};

export const getTFGBVQueue = async () => {
    const res = await fetch(`${API_BASE_URL}/tfgbv/queue/`, {
        headers: getAuthHeader(),
    });

    return handleResponse(res, 'Failed to fetch TFGBV queue');
};

export const getSocialListeningFeed = async (params: { platform?: string; sentiment?: string; search?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.platform) query.append('platform', params.platform);
    if (params.sentiment) query.append('sentiment', params.sentiment);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';

    const res = await fetch(`${API_BASE_URL}/social-listening/${queryString}`, {
        headers: getAuthHeader(),
    });

    return handleResponse(res, 'Failed to fetch social listening feed');
};

// ==========================================
// 4. TOOLS & ANALYTICS (AUTH REQUIRED)
// ==========================================

export const getAnalyticsData = async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/`, {
        headers: getAuthHeader(),
    });

    return handleResponse(res, 'Failed to fetch analytics');
};

export const generateCloudinaryCard = async (claim: string, fact: string) => {
    const res = await fetch(`${API_BASE_URL}/generate-card/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify({ claim, fact }),
    });

    return handleResponse(res, 'Failed to generate Cloudinary card');
};

// ==========================================
// 5. AUTHENTICATION (NEW)
// ==========================================

export const loginUser = async (credentials: Record<string, any>) => {
    const res = await fetch(`${API_BASE_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });

    const data = await handleResponse(res, 'Invalid credentials');

    if (data?.access) {
        localStorage.setItem('access_token', data.access);
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
    }

    return data;
};

export const refreshAuthToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error("No refresh token available");

    const res = await fetch(`${API_BASE_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await handleResponse(res, 'Session expired. Please log in again.');

    if (data?.access) {
        localStorage.setItem('access_token', data.access);
    }
    return data;
};

export const logoutUser = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('fact_checker_token');
    localStorage.removeItem('legal_expert_token');
};