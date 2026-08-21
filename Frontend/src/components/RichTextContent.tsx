import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

export interface RichTextContentProps {
    /**
     * Rich text / HTML string to render. Can be null, undefined, or string.
     */
    content?: string | null;
    /**
     * Optional custom CSS classes to merge with the typography wrapper.
     */
    className?: string;
    /**
     * Optional DOMPurify configuration options for custom sanitization rules.
     */
    purifyConfig?: DOMPurify.Config;
    /**
     * Optional custom fallback React element when content is empty, null, or undefined.
     */
    fallback?: React.ReactNode;
    /**
     * Optional fallback text string when no content is provided.
     */
    fallbackText?: string;
    /**
     * HTML tag to render as root container (defaults to 'div').
     */
    as?: 'div' | 'article' | 'section';
}

/**
 * RichTextContent safely sanitizes and renders rich HTML string content (e.g., article.content or incident.details)
 * with DOMPurify protection against XSS and Tailwind Typography (`prose dark:prose-invert max-w-none`) styling.
 */
export const RichTextContent: React.FC<RichTextContentProps> = ({
    content,
    className = '',
    purifyConfig,
    fallback,
    fallbackText = 'No content provided.',
    as: Component = 'div',
}) => {
    // 1. Full TypeScript safety & sanitization: guards against null, undefined, or empty strings
    const sanitizedHtml = useMemo(() => {
        if (!content || typeof content !== 'string') {
            return '';
        }
        const trimmed = content.trim();
        if (!trimmed) {
            return '';
        }
        // Sanitize incoming HTML string to prevent XSS vulnerabilities
        return DOMPurify.sanitize(trimmed, purifyConfig);
    }, [content, purifyConfig]);

    // 2. Render graceful fallback when content is missing or sanitized to empty
    if (!sanitizedHtml) {
        if (fallback !== undefined) {
            return <>{fallback}</>;
        }

        return (
            <p className="text-muted-theme italic text-sm py-1">
                {fallbackText}
            </p>
        );
    }

    // 3. Render sanitized HTML wrapped with Tailwind Typography prose classes
    return (
        <Component
            className={`prose dark:prose-invert max-w-none text-main-theme leading-relaxed ${className}`.trim()}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
};

export default RichTextContent;
