const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://truthguard-api-sut7.onrender.com';

// Helper for HTTP requests
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('jwt_token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/${endpoint.replace(/^\//, '')}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

// Public Endpoints
export const publicApi = {
    // 1. Submit a Citizen Report
    submitReport: (formData: Record<string, any>) =>
        apiRequest('report/', {
            method: 'POST',
            body: JSON.stringify(formData),
        }),

    // 2. Fetch Public Feed of Debunked Reports
    getDebunkedFeed: (page = 1, category?: string, search?: string) => {
        const params = new URLSearchParams({ page: String(page) });
        if (category && category !== 'ALL') params.append('category', category);
        if (search) params.append('search', search);

        return apiRequest(`feed/debunked/?${params.toString()}`, { method: 'GET' });
    },
};

// Fact-Checker & Situation Room Endpoints (JWT Protected)
export const dashboardApi = {
    // 3. Main Triage / Kanban Queue
    getTriageQueue: (search?: string, status?: string) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) params.append('status', status);

        return apiRequest(`triage/?${params.toString()}`, { method: 'GET' });
    },

    // 4. Update Report Verdict / State
    updateStatus: (id: string, status: 'VERIFIED' | 'FALSE' | 'MISLEADING' | 'PENDING') =>
        apiRequest(`${id}/status/`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),

    // 5. Legal Expert TFGBV Queue
    getTFGBVQueue: () =>
        apiRequest('tfgbv/queue/', { method: 'GET' }),

    // 6. Social Listening Feed
    getSocialListeningFeed: () =>
        apiRequest('social-listening/', { method: 'GET' }),

    // 7. Situation Room Analytics
    getAnalytics: () =>
        apiRequest('analytics/', { method: 'GET' }),

    // 8. Generate Graphic Card
    generateCard: (claim: string, fact: string) =>
        apiRequest<{ card_url: string }>('generate-card/', {
            method: 'POST',
            body: JSON.stringify({ claim, fact }),
        }),
};