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
    [key: string]: any; // Flexible indexing for dynamic language keys
}

export interface IncidentReport {
    id?: string | number;
    title: string;
    category: string;
    location: string;
    details: string;
    is_anonymous: boolean;
    media?: File | null;           // Raw file appended to FormData
    media_url?: string | null;     // Media URL from Django backend
    media_type?: 'image' | 'video' | 'audio' | '';
    reporter?: string | number;
    author_name?: string;
    created_at?: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'https://truthguard-api-sut7.onrender.com/api';

// Cache key identifier for localStorage
const DEBUNKED_FEED_CACHE_KEY = 'truthguard_cached_debunked_feed';

// Helper to get stored auth token
const getAuthHeader = (tokenKey = 'token'): Record<string, string> => {
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

// --- Initial Mock Data (Used only on fresh browser installs before cache exists) ---
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
        },
        {
            id: 102,
            title: "Viral Video Claiming Result Sheet Manipulation",
            summary: "Video shared across social media shows altered result sheet figures in local ward.",
            status: "FALSE",
            verdict: "DEBUNKED",
            location: "Ife East, Osun State",
            category: "Disinformation",
            author_name: "TruthGuard Team",
            reporter: "FactCheck Desk",
            is_anonymous: false,
            created_at: new Date().toISOString()
        }
    ]
};

// --- Public Endpoints ---

/** 1. Submit Citizen Report (Supports both FormData with media files and JSON) */
export const submitReport = async (data: FormData | Record<string, any>) => {
    const isFormData = data instanceof FormData;

    const res = await fetch(`${API_BASE_URL}/incidents/report/`, {
        method: 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data),
    });

    return handleResponse(res, 'Failed to submit report');
};

/** 2. Fetch Public Debunked Feed (With Live Caching + Fallback Safeguard) */
export const getDebunkedFeed = async (page = 1, limit = 10): Promise<PaginatedResponse<DashboardReport>> => {
    try {
        const res = await fetch(`${API_BASE_URL}/incidents/feed/debunked/?page=${page}&limit=${limit}`);

        if (!res.ok) {
            throw new Error(`Server returned status code ${res.status}`);
        }

        const data = await res.json();
        const formattedData: PaginatedResponse<DashboardReport> = Array.isArray(data)
            ? { count: data.length, next: null, previous: null, results: data }
            : data;

        // SAVE: Persist the real successful API response to localStorage for offline/outage resiliency
        localStorage.setItem(DEBUNKED_FEED_CACHE_KEY, JSON.stringify(formattedData));

        return formattedData;
    } catch (error) {
        console.warn("Backend 500 error or offline detected. Attempting cache fallback:", error);

        // READ: Look for real previously saved reports in browser storage
        const cachedFeed = localStorage.getItem(DEBUNKED_FEED_CACHE_KEY);
        if (cachedFeed) {
            try {
                return JSON.parse(cachedFeed);
            } catch (parseError) {
                console.error("Failed to parse cached feed data:", parseError);
            }
        }

        // FALLBACK: Serve test placeholders if no local cache exists yet
        return MOCK_DEBUNKED_FALLBACK;
    }
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
    id: string | number,
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