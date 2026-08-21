import React, { useState, useEffect, useMemo } from 'react';
import { Image as ImageIcon, AlertCircle } from 'lucide-react';
import { getAbsoluteImageUrl, extractReportImageUrl, type ReportImageSource } from '../utils/imageUrl';

export interface ReportImageProps {
    /**
     * Direct image URL or relative path (e.g. /media/... or https://...).
     */
    src?: string | File | null;
    /**
     * Alternatively, pass the report / incident payload object to auto-extract the image field.
     */
    report?: ReportImageSource | null;
    /**
     * Alternative text for the image.
     */
    alt?: string;
    /**
     * Tailwind CSS classes applied directly to the <img> element.
     */
    className?: string;
    /**
     * Tailwind CSS classes applied to the container wrapper.
     */
    wrapperClassName?: string;
    /**
     * Optional custom fallback element to render when the image is missing or fails to load.
     */
    fallback?: React.ReactNode;
    /**
     * Label displayed in the default placeholder when no image is available.
     */
    fallbackText?: string;
    /**
     * Label displayed when image fails to load (404/broken link).
     */
    errorText?: string;
    /**
     * Callback triggered when image successfully loads.
     */
    onLoad?: () => void;
    /**
     * Callback triggered when image fails to load.
     */
    onError?: () => void;
}

/**
 * ReportImage component for displaying fact-check and incident images safely.
 * - Auto-detects image fields from payload (evidence_file, image, media_url, evidence_links).
 * - Converts relative backend media paths (/media/...) to full absolute URLs.
 * - Catches 404/broken image URLs gracefully via onError with a polished fallback placeholder.
 * - Renders with responsive Tailwind styling (`object-cover w-full h-auto rounded-lg`).
 */
export const ReportImage: React.FC<ReportImageProps> = ({
    src,
    report,
    alt = 'Incident Media',
    className = 'object-cover w-full h-auto rounded-lg',
    wrapperClassName = '',
    fallback,
    fallbackText = 'No Media Attached',
    errorText = 'Image Unavailable',
    onLoad,
    onError,
}) => {
    // 1. Resolve absolute image URL from src prop or report payload
    const resolvedUrl = useMemo(() => {
        if (src !== undefined) {
            return getAbsoluteImageUrl(src);
        }
        if (report) {
            return extractReportImageUrl(report);
        }
        return '';
    }, [src, report]);

    const [hasError, setHasError] = useState(false);

    // Reset error state when the URL changes
    useEffect(() => {
        setHasError(false);
    }, [resolvedUrl]);

    const handleError = () => {
        setHasError(true);
        if (onError) onError();
    };

    // 2. Render fallback placeholder if URL is empty or failed to load
    if (!resolvedUrl || hasError) {
        if (fallback !== undefined) {
            return <>{fallback}</>;
        }

        return (
            <div
                className={`w-full min-h-32 bg-subcard-theme border border-theme rounded-lg flex flex-col items-center justify-center p-4 text-muted-theme ${wrapperClassName}`.trim()}
            >
                {hasError ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errorText}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-theme opacity-70">
                        <ImageIcon className="w-4 h-4" />
                        <span>{fallbackText}</span>
                    </div>
                )}
            </div>
        );
    }

    // 3. Render image inside responsive wrapper
    return (
        <div className={`relative overflow-hidden w-full ${wrapperClassName}`.trim()}>
            <img
                src={resolvedUrl}
                alt={alt}
                className={className}
                onError={handleError}
                onLoad={onLoad}
                loading="lazy"
            />
        </div>
    );
};

export default ReportImage;
