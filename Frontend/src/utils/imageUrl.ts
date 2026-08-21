/**
 * Helper utility to construct and normalize absolute image URLs for reports and incidents.
 */

export interface ReportImageSource {
    evidence_file?: string | File | null;
    image?: string | null;
    media_url?: string | null;
    cover_image?: string | null;
    evidence_links?: string | null;
    media_file?: string | null;
    [key: string]: any;
}

/**
 * Resolves a relative or absolute image path to a fully-qualified absolute URL.
 * - Leaves absolute URLs (http://, https://, blob:, data:) as-is.
 * - Prepends the backend server origin (VITE_API_BASE_URL without /api suffix) to relative paths (e.g. /media/...).
 */
export function getAbsoluteImageUrl(path?: string | File | null): string {
    if (!path) return '';

    if (typeof path !== 'string') {
        if (path instanceof File) {
            return URL.createObjectURL(path);
        }
        return '';
    }

    const trimmed = path.trim();
    if (!trimmed) return '';

    // If already absolute or blob/data URI, return directly
    if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('blob:')
    ) {
        return trimmed;
    }

    // Determine the backend API origin without the trailing /api route
    const rawApiUrl =
        import.meta.env.VITE_API_BASE_URL || 'https://truthguard-api-sut7.onrender.com/api';
    const backendOrigin = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

    // Normalize relative path with leading slash
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${backendOrigin}${cleanPath}`;
}

/**
 * Extracts and resolves the primary image URL from an API report/incident payload,
 * checking multiple common payload fields (evidence_file, image, media_url, cover_image, evidence_links).
 */
export function extractReportImageUrl(report?: ReportImageSource | string | null): string {
    if (!report) return '';

    if (typeof report === 'string') {
        return getAbsoluteImageUrl(report);
    }

    // 1. Direct image / media fields
    const directCandidates = [
        report.evidence_file,
        report.image,
        report.media_url,
        report.cover_image,
        report.media_file,
    ];

    for (const candidate of directCandidates) {
        if (typeof candidate === 'string' && candidate.trim()) {
            return getAbsoluteImageUrl(candidate);
        }
        if (candidate instanceof File) {
            return URL.createObjectURL(candidate);
        }
    }

    // 2. Fallback: inspect evidence_links if present
    if (typeof report.evidence_links === 'string' && report.evidence_links.trim()) {
        const raw = report.evidence_links.trim();
        // Remove common prefixes like "Evidence: "
        const cleaned = raw.replace(/^Evidence:\s*/i, '');
        const firstLink = cleaned.split(/[\s,]+/)[0];
        if (
            firstLink &&
            (firstLink.startsWith('http://') ||
                firstLink.startsWith('https://') ||
                firstLink.startsWith('/'))
        ) {
            return getAbsoluteImageUrl(firstLink);
        }
    }

    return '';
}
