import { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Share2,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    MapPin,
    User
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { RichTextContent } from './RichTextContent';
import { ReportImage } from './ReportImage';
import { getAbsoluteImageUrl } from '../utils/imageUrl';

// Updated interface supporting media uploads, byline, and metadata
export interface FactCheckArticle {
    id: string | number;
    title: string;
    claim?: string;
    content?: string;
    details?: string;
    summary?: string;
    status: 'TRUE' | 'FALSE' | 'MISLEADING' | 'PENDING' | string;
    category?: string;
    location?: string;
    featured_image_url?: string | null;
    evidence_file?: string | null;
    image?: string | null;
    media_url?: string | null;
    media_type?: 'image' | 'video' | 'audio' | string;
    byline?: string;
    author?: string;
    author_name?: string;
    created_at?: string;
}

export default function FullReportView({ reportId, onBack }: { reportId: string, onBack: () => void }) {
    const [report, setReport] = useState<FactCheckArticle | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFullReport() {
            try {
                const { data, error } = await supabase
                    .from('reports')
                    .select('*')
                    .eq('id', reportId)
                    .single();

                if (error) throw error;
                setReport(data);
            } catch (error) {
                console.error("Error fetching report details:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchFullReport();
    }, [reportId]);

    // Helper for relative time formatting ("1 day ago", "3 hours ago")
    const getTimeAgo = (dateString?: string) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-theme">Loading report details...</div>;
    }

    if (!report) return <div className="p-8 text-center text-rose-400">Report not found.</div>;

    // 1. Dynamic API key mappings
    const authorName = report.byline || report.author || report.author_name || 'TruthGuard Team';
    const featuredImageUrl = report.featured_image_url || report.evidence_file || report.image || report.media_url;
    const bodyContent = report.content || report.details || report.summary || '';

    // Helper for status colors, overlays, and icons
    const getStatusUI = (status?: string) => {
        switch (status?.toUpperCase()) {
            case 'TRUE':
            case 'VERIFIED':
                return {
                    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
                    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500',
                    label: 'VERIFIED TRUE',
                    icon: CheckCircle
                };
            case 'FALSE':
                return {
                    badgeClass: 'bg-red-500/10 text-red-600 dark:text-rose-400 border border-red-500/20',
                    color: 'bg-rose-500/20 text-rose-400 border-rose-500',
                    label: 'FALSE / DEBUNKED',
                    icon: XCircle
                };
            case 'MISLEADING':
                return {
                    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
                    color: 'bg-amber-500/20 text-amber-400 border-amber-500',
                    label: 'MISLEADING CONTENT',
                    icon: AlertTriangle
                };
            default:
                return {
                    badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
                    color: 'bg-gray-500/20 text-muted-theme border-gray-500',
                    label: 'UNDER REVIEW',
                    icon: AlertTriangle
                };
        }
    };

    const statusInfo = getStatusUI(report.status);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
            {/* Navigation Header */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-[#1CB5BE] hover:text-main-theme font-bold mb-6 transition-colors cursor-pointer"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Situation Room
            </button>

            {/* Blog Article Container */}
            <article className="bg-card-theme border border-theme rounded-2xl overflow-hidden shadow-xl space-y-6">

                {/* 1. Prominent Featured Image Hero Banner */}
                <div className="relative w-full max-h-[480px] min-h-[320px] aspect-video md:aspect-[16/9] bg-subcard-theme rounded-t-2xl overflow-hidden border-b border-theme flex items-center justify-center shadow-lg group">
                    {report.media_type === 'video' && (report.media_url || report.evidence_file) ? (
                        <video
                            src={getAbsoluteImageUrl(report.media_url || report.evidence_file)}
                            controls
                            className="w-full h-full max-h-[480px] object-contain mx-auto"
                        />
                    ) : (
                        <ReportImage
                            src={featuredImageUrl}
                            report={report}
                            alt={report.title}
                            className="object-cover w-full h-full rounded-2xl shadow-lg border border-theme hover:scale-[1.01] transition-transform duration-200"
                            wrapperClassName="w-full h-full min-h-[320px] max-h-[480px] flex items-center justify-center"
                            fallbackText="No Media Evidence Attached"
                        />
                    )}

                    {/* Status Overlay Badge on Media */}
                    <div className="absolute top-4 left-4 z-10 pointer-events-none">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-black backdrop-blur-md shadow-md ${statusInfo.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusInfo.label}
                        </span>
                    </div>
                </div>

                {/* 2. Article Body & Metadata */}
                <div className="p-6 sm:p-8 pt-2">

                    {/* Author Byline, Category & Timestamps */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-theme mb-4 pb-4 border-b border-theme/60">
                        {report.category && (
                            <span className="bg-[#1CB5BE]/10 text-[#1CB5BE] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                                {report.category}
                            </span>
                        )}

                        <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                            <User className="w-3.5 h-3.5 text-[#1CB5BE]" />
                            By {authorName}
                        </span>

                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-muted-theme" />
                            <span>{getTimeAgo(report.created_at)}</span>
                        </div>

                        {report.location && (
                            <div className="flex items-center gap-1 text-muted-theme">
                                <MapPin className="w-3.5 h-3.5 text-[#E55322]" />
                                <span>{report.location}</span>
                            </div>
                        )}
                    </div>

                    {/* Headline Title */}
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                        {report.title}
                    </h1>

                    {/* Section 1: Claim */}
                    {report.claim && (
                        <div className="space-y-2">
                            <h2 className="text-slate-900 dark:text-white font-bold text-lg mt-6 mb-2">
                                Claim:
                            </h2>
                            <div className="bg-slate-100/80 dark:bg-subcard-theme p-4 sm:p-5 rounded-r-lg border-l-4 border-[#1CB5BE] border-y border-r border-theme shadow-sm">
                                <RichTextContent
                                    content={report.claim}
                                    className="text-base sm:text-lg italic font-medium text-slate-900 dark:text-slate-100"
                                    fallbackText="No claim statement provided."
                                />
                            </div>
                        </div>
                    )}

                    {/* Section 2: Verdict */}
                    <div className="mt-6 mb-4">
                        <h2 className="text-slate-900 dark:text-white font-bold text-lg mb-2">
                            Verdict:
                        </h2>
                        <div className="inline-block">
                            <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md font-bold text-sm ${statusInfo.badgeClass}`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusInfo.label}
                            </span>
                        </div>
                    </div>

                    {/* Section 3: Verification & Full Text */}
                    <div className="space-y-4 pt-4 border-t border-theme/60 mt-6">
                        <h2 className="text-slate-900 dark:text-white font-bold text-lg mb-2">
                            Verification & Full Text:
                        </h2>
                        <RichTextContent
                            content={bodyContent}
                            className="text-base sm:text-lg text-slate-800 dark:text-slate-200"
                            fallbackText="No analysis details provided for this report."
                        />
                    </div>

                    {/* Share Action Bar */}
                    <div className="mt-10 pt-6 border-t border-theme flex items-center justify-end">
                        <button className="flex items-center gap-2 bg-[#1CB5BE]/10 text-[#1CB5BE] hover:bg-[#1CB5BE] hover:text-[#061528] px-4 py-2 rounded-lg font-bold transition-all text-sm cursor-pointer">
                            <Share2 className="w-4 h-4" />
                            Share Fact-Check
                        </button>
                    </div>

                </div>
            </article>
        </div>
    );
}