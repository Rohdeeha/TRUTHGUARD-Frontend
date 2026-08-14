import { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Share2,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    MapPin,
    Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

// Updated interface supporting media uploads & metadata
interface Report {
    id: string;
    title: string;
    claim: string;
    summary: string;
    status: 'TRUE' | 'FALSE' | 'MISLEADING' | 'PENDING';
    category?: string;
    location?: string;
    media_url?: string;
    media_type?: 'image' | 'video' | 'audio' | string;
    created_at: string;
}

export default function FullReportView({ reportId, onBack }: { reportId: string, onBack: () => void }) {
    const { t } = useTranslation();
    const [report, setReport] = useState<Report | null>(null);
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
    const getTimeAgo = (dateString: string) => {
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
        return <div className="p-8 text-center text-gray-400">{t('home.syncing', 'Loading report details...')}</div>;
    }

    if (!report) return <div className="p-8 text-center text-rose-400">Report not found.</div>;

    // Helper for status colors, overlays, and icons
    const getStatusUI = (status: string) => {
        switch (status) {
            case 'TRUE':
                return { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500', label: 'VERIFIED TRUE', icon: CheckCircle };
            case 'FALSE':
                return { color: 'bg-rose-500/20 text-rose-400 border-rose-500', label: 'FALSE / MISLEADING', icon: XCircle };
            case 'MISLEADING':
                return { color: 'bg-amber-500/20 text-amber-400 border-amber-500', label: 'MISLEADING CONTENT', icon: AlertTriangle };
            default:
                return { color: 'bg-gray-500/20 text-gray-400 border-gray-500', label: 'UNDER REVIEW', icon: AlertTriangle };
        }
    };

    const statusInfo = getStatusUI(report.status);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
            {/* Navigation Header */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-[#1CB5BE] hover:text-white font-bold mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Situation Room
            </button>

            {/* Blog Article Container */}
            <article className="bg-[#0E243F] border border-[#1A3352] rounded-2xl overflow-hidden shadow-xl">

                {/* 1. Featured Media Hero Banner (Image/Video) */}
                {report.media_url ? (
                    <div className="relative w-full max-h-[420px] bg-[#061528] overflow-hidden border-b border-[#1A3352]">
                        {report.media_type === 'video' ? (
                            <video
                                src={report.media_url}
                                controls
                                className="w-full max-h-[420px] object-contain mx-auto"
                            />
                        ) : (
                            <img
                                src={report.media_url}
                                alt={report.title}
                                className="w-full h-full object-cover max-h-[420px]"
                            />
                        )}

                        {/* Status Overlay Badge on Media */}
                        <div className="absolute top-4 left-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-black backdrop-blur-md ${statusInfo.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusInfo.label}
                            </span>
                        </div>
                    </div>
                ) : (
                    /* Fallback when no media exists */
                    <div className="w-full h-32 bg-[#061528] flex items-center justify-center text-slate-500 border-b border-[#1A3352]">
                        <div className="flex items-center gap-2 text-sm font-semibold opacity-60">
                            <ImageIcon className="w-5 h-5" />
                            <span>No Media Evidence Attached</span>
                        </div>
                    </div>
                )}

                {/* 2. Article Body & Metadata */}
                <div className="p-6 sm:p-8">

                    {/* Category & Timestamps */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-400 mb-4">
                        {report.category && (
                            <span className="bg-[#1CB5BE]/10 text-[#1CB5BE] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                                {report.category}
                            </span>
                        )}

                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>{getTimeAgo(report.created_at)}</span>
                        </div>

                        {report.location && (
                            <div className="flex items-center gap-1 text-slate-300">
                                <MapPin className="w-3.5 h-3.5 text-[#E55322]" />
                                <span>{report.location}</span>
                            </div>
                        )}
                    </div>

                    {/* Headline Title */}
                    <h1 className="text-2xl sm:text-3xl font-black text-white mb-6 leading-tight">
                        {report.title}
                    </h1>

                    {/* Highlighted Claim Box */}
                    <div className="bg-[#061528] p-4 sm:p-5 rounded-xl border border-[#1A3352] mb-8">
                        <span className="text-[#E55322] font-bold text-xs uppercase tracking-wider block mb-1">
                            {t('home.claimLabel', 'Claim Under Review:')}
                        </span>
                        <p className="text-gray-200 text-base italic font-medium leading-relaxed">
                            "{report.claim}"
                        </p>
                    </div>

                    {/* Main Fact-Check Analysis Content */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-white border-b border-[#1A3352] pb-2">
                            Fact-Check Findings & Analysis
                        </h2>
                        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap text-base sm:text-lg">
                            {report.summary}
                        </div>
                    </div>

                    {/* Share Action Bar */}
                    <div className="mt-10 pt-6 border-t border-[#1A3352] flex items-center justify-between">
                        <div className="text-xs text-gray-400 font-medium">
                            Source verified by <span className="text-white font-bold">TruthGuard Fact Check Room</span>
                        </div>
                        <button className="flex items-center gap-2 bg-[#1CB5BE]/10 text-[#1CB5BE] hover:bg-[#1CB5BE] hover:text-[#061528] px-4 py-2 rounded-lg font-bold transition-all text-sm">
                            <Share2 className="w-4 h-4" />
                            {t('home.shareReport', 'Share Fact-Check')}
                        </button>
                    </div>

                </div>
            </article>
        </div>
    );
}