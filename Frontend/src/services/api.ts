// src/services/api.ts

export interface DashboardReport {
    id: string | number;
    title?: string;
    summary?: string;
    status?: 'VERIFIED' | 'FALSE' | 'MISLEADING' | 'PENDING';
    verdict?: string;
    location?: string;
    category?: string;
    reporter?: string | number;
    author_name?: string;
    is_anonymous?: boolean;
    created_at?: string;
    translations?: Record<string, any>;
    [key: string]: any;
}

// Updated to match the new Django Payload fields
export interface IncidentReport {
    id?: string | number;
    claim?: string;
    who_said_it?: string;
    where_and_when?: string;
    location?: string;
    category?: string;
    is_anonymous?: boolean;
    is_tfgbv?: boolean;
    evidence_file?: File | null;
    media_url?: string | null;
    created_at?: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// Ensure your VITE_API_BASE_URL in your .env file ends with /api (e.g. http://localhost:8000/api)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://truthguard-api-sut7.onrender.com/api';

// Cache key identifier for localStorage
const DEBUNKED_FEED_CACHE_KEY = 'truthguard_cached_debunked_feed';

// Helper to get stored auth token (Updated to check for standard 'access_token' first)
const getAuthHeader = (tokenKey = 'access_token'): Record<string, string> => {
    // If you explicitly pass fact_checker_token, it looks for that, otherwise defaults to access_token
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
    // Return null on 204 No Content to avoid JSON parse errors
    if (res.status === 204) return null;
    return res.json();
};

// --- Initial Mock Data (Fallback) ---
const MOCK_DEBUNKED_FALLBACK: PaginatedResponse<DashboardReport> = {
    count: 2,
    next: null,
    previous: null,
    results: [
        {
            id: 101,
            title: "Alleged Voter Suppression at Polling Unit 004",
            summary: "Reports indicate voting materials arrived late and polling officials closed lines prematurely.",
            status: "PENDING",
            verdict: "UNDER REVIEW",
            location: "Osogbo, Osun State",
            category: "Voter Suppression",
            author_name: "Adeyemi John",
            reporter: "Observer_01",
            is_anonymous: false,
            created_at: new Date().toISOString()
        }
    ]
};


// ==========================================
// 1. CITIZEN-FACING ENDPOINTS (PUBLIC)
// ==========================================

export const submitReport = async (data: FormData | Record<string, any>) => {
    const isFormData = data instanceof FormData;
    // Updated endpoint: /api/report/
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

export const getDebunkedFeed = async (page = 1, limit = 10): Promise<PaginatedResponse<DashboardReport>> => {
    try {
        // Updated endpoint: /api/feed/fact-checks/
        const res = await fetch(`${API_BASE_URL}/feed/fact-checks/?page=${page}&limit=${limit}`);

        if (!res.ok) throw new Error(`Server returned status code ${res.status}`);

        const data = await res.json();
        const formattedData: PaginatedResponse<DashboardReport> = Array.isArray(data)
            ? { count: data.length, next: null, previous: null, results: data }
            : data;

        localStorage.setItem(DEBUNKED_FEED_CACHE_KEY, JSON.stringify(formattedData));
        return formattedData;
    } catch (error) {
        console.warn("Backend 500 error or offline detected. Attempting cache fallback:", error);
        const cachedFeed = localStorage.getItem(DEBUNKED_FEED_CACHE_KEY);
        if (cachedFeed) {
            try { return JSON.parse(cachedFeed); }
            catch (parseError) { console.error("Parse error:", parseError); }
        }
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
    // Updated endpoint: /api/triage/
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
    // Updated endpoint: /api/triage/<id>/update/
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
    // Updated endpoint: /api/tfgbv/queue/
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

    // Updated endpoint: /api/social-listening/
    const res = await fetch(`${API_BASE_URL}/social-listening/${queryString}`, {
        headers: getAuthHeader(),
    });

    return handleResponse(res, 'Failed to fetch social listening feed');
};


// ==========================================
// 4. TOOLS & ANALYTICS (AUTH REQUIRED)
// ==========================================

export const getAnalyticsData = async () => {
    // Updated endpoint: /api/analytics/
    const res = await fetch(`${API_BASE_URL}/analytics/`, {
        headers: getAuthHeader(),
    });

    return handleResponse(res, 'Failed to fetch analytics');
};

export const generateCloudinaryCard = async (claim: string, fact: string) => {
    // Updated endpoint: /api/generate-card/
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
    // New endpoint: /api/token/
    const res = await fetch(`${API_BASE_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });

    const data = await handleResponse(res, 'Invalid credentials');

    // Automatically save standard DRF SimpleJWT tokens
    if (data?.access) {
        localStorage.setItem('access_token', data.access);
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
    }

    return data;
};

export const refreshAuthToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error("No refresh token available");

    // New endpoint: /api/token/refresh/
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

// Logout helper
export const logoutUser = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('fact_checker_token');
    localStorage.removeItem('legal_expert_token');
};