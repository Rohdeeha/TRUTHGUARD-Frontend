import React, { useMemo } from 'react';
import DOMPurify, { type Config as DOMPurifyConfig } from 'dompurify';

/**
 * Utility helper to strip HTML markup using Regex, returning clean plain text.
 * Useful for card excerpts, metadata, or unformatted text previews.
 */
export function stripHtml(html?: string | null): string {
    if (!html || typeof html !== 'string') return '';
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

/**
 * Checks if a given string contains HTML markup tags.
 */
export function containsHtml(str?: string | null): boolean {
    if (!str || typeof str !== 'string') return false;
    return /<\/?[a-z][\s\S]*>/i.test(str);
}

export interface RichTextContentProps {
    /**
     * Rich text / HTML string to render (e.g. report.claim, article.content, or incident.details).
     */
    content?: string | null;
    /**
     * Optional custom CSS classes to merge with the typography wrapper.
     */
    className?: string;
    /**
     * Optional DOMPurify configuration options for custom sanitization rules.
     */
    purifyConfig?: DOMPurifyConfig;
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
    as?: 'div' | 'article' | 'section' | 'span';
}

/**
 * RichTextContent safely sanitizes and renders rich HTML string content
 * with DOMPurify protection against XSS and Tailwind Typography (`prose dark:prose-invert max-w-none text-main-theme`) styling.
 * Handles null/undefined, plain text strings, and HTML markup gracefully.
 */
// Register hook once to strip inline color and background styles from rich text
if (typeof window !== 'undefined' && DOMPurify && typeof DOMPurify.addHook === 'function') {
    try {
        DOMPurify.addHook('afterSanitizeAttributes', (node) => {
            if (node instanceof HTMLElement && node.hasAttribute('style')) {
                node.style.removeProperty('color');
                node.style.removeProperty('background-color');
                node.style.removeProperty('background');
            }
        });
    } catch {
        // hook already registered or unsupported in environment
    }
}

export const RichTextContent: React.FC<RichTextContentProps> = ({
    content,
    className = '',
    purifyConfig,
    fallback,
    fallbackText = 'No content provided.',
    as: Component = 'div',
}) => {
    // 1. Guard against null, undefined, or empty/whitespace strings
    const trimmed = typeof content === 'string' ? content.trim() : '';

    const hasHtmlMarkup = useMemo(() => containsHtml(trimmed), [trimmed]);

    const sanitizedHtml = useMemo(() => {
        if (!trimmed) return '';
        // If content has HTML tags, sanitize with DOMPurify
        if (hasHtmlMarkup) {
            const config: DOMPurifyConfig = {
                ADD_ATTR: ['target', 'rel'],
                FORBID_TAGS: ['style'],
                ...purifyConfig,
            };
            return DOMPurify.sanitize(trimmed, config);
        }
        return '';
    }, [trimmed, hasHtmlMarkup, purifyConfig]);

    // 2. Render graceful fallback when content is empty, null, or undefined
    if (!trimmed) {
        if (fallback !== undefined) {
            return <>{fallback}</>;
        }

        return (
            <p className="text-muted-theme italic text-sm py-1">
                {fallbackText}
            </p>
        );
    }

    // 3. Render rich HTML string using dangerouslySetInnerHTML
    if (hasHtmlMarkup && sanitizedHtml) {
        return (
            <Component
                className={`prose prose-slate text-black dark:prose-invert dark:text-slate-100 max-w-none leading-relaxed 
                prose-headings:text-black dark:prose-headings:text-white prose-headings:font-bold
                prose-p:text-black dark:prose-p:text-slate-100
                prose-strong:text-black dark:prose-strong:text-white
                prose-li:text-black dark:prose-li:text-slate-100
                prose-a:text-cyan-700 dark:prose-a:text-cyan-400 prose-a:font-semibold prose-a:underline hover:prose-a:text-cyan-800 dark:hover:prose-a:text-cyan-300
                prose-blockquote:border-l-4 prose-blockquote:border-[#1CB5BE] prose-blockquote:pl-4 prose-blockquote:my-4 prose-blockquote:py-3 prose-blockquote:pr-4 
                prose-blockquote:bg-slate-100 dark:prose-blockquote:bg-subcard-theme 
                prose-blockquote:rounded-r-lg prose-blockquote:text-black dark:prose-blockquote:text-slate-100 prose-blockquote:not-italic ${className}`.trim()}
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
        );
    }

    // 4. Fallback for plain unformatted text (no HTML tags)
    return (
        <Component
            className={`prose prose-slate text-black dark:prose-invert dark:text-slate-100 max-w-none leading-relaxed whitespace-pre-wrap 
            prose-headings:text-black dark:prose-headings:text-white prose-headings:font-bold
            prose-p:text-black dark:prose-p:text-slate-100
            prose-strong:text-black dark:prose-strong:text-white
            prose-a:text-cyan-700 dark:prose-a:text-cyan-400 prose-a:font-semibold prose-a:underline hover:prose-a:text-cyan-800 dark:hover:prose-a:text-cyan-300 ${className}`.trim()}
        >
            {trimmed}
        </Component>
    );
};

export default RichTextContent;
