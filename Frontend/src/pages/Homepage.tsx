import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import {
    Search,
    Filter,
    Share2,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Loader2,
    ArrowLeft,
    X,
    RefreshCw,
    MapPin,
    Clock,
    Play,
    User
} from 'lucide-react';
import { FactCheckCardGraphic } from '../components/FactCheckCardGraphics';
import { RichTextContent, stripHtml } from '../components/RichTextContent';
import { ReportImage } from '../components/ReportImage';
import { getAbsoluteImageUrl } from '../utils/imageUrl';
import { getDebunkedFeed } from '../services/api';

// --- Types & Constants ---
export type Verdict = 'FALSE' | 'MISLEADING' | 'VERIFIED' | 'PENDING' | string;

export type Category =
    | 'ALL'
    | 'VOTER_SUPPRESSION'
    | 'DISINFORMATION'
    | 'TFGBV'
    | 'LOGISTICS_FAILURE'
    | 'VIOLENCE'
    | 'INEC';

export interface PublicReport {
    id: string;
    title: string;
    claim: string;
    verdict: Verdict;
    category: Exclude<Category, 'ALL'>;
    location: string;
    timestamp: string;
    summary: string;
    rawCreatedAt?: string;
    content?: string;
    media_url?: string;
    media_type?: 'image' | 'video' | string;
    [key: string]: any;
}

const FILTER_CATEGORIES: { id: Category; label: string }[] = [
    { id: 'ALL', label: 'All Debunks' },
    { id: 'VOTER_SUPPRESSION', label: 'Voter Suppression' },
    { id: 'DISINFORMATION', label: 'Disinformation' },
    { id: 'TFGBV', label: 'TFGBV' },
    { id: 'LOGISTICS_FAILURE', label: 'Logistics' },
    { id: 'VIOLENCE', label: 'Violence' },
    { id: 'INEC', label: 'INEC' },
];

// --- Sub-Components ---

const VerdictBadge = ({ verdict }: { verdict: Verdict }) => {
    const normalizedVerdict = String(verdict || '').toUpperCase();

    switch (normalizedVerdict) {
        case 'FALSE':
            return (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black px-2 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wide">
                    <XCircle className="w-3.5 h-3.5" /> FALSE
                </span>
            );
        case 'MISLEADING':
            return (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black px-2 py-1 rounded bg-[#E55322]/20 text-[#E55322] border border-[#E55322]/30 uppercase tracking-wide">
                    <AlertTriangle className="w-3.5 h-3.5" /> MISLEADING
                </span>
            );
        case 'VERIFIED':
        case 'TRUE':
            return (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
                    <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black px-2 py-1 rounded bg-slate-500/20 text-slate-300 border border-slate-500/30 uppercase tracking-wide">
                    {verdict || 'UNVERIFIED'}
                </span>
            );
    }
};

const FilterTabs = ({ activeFilter, onSelectFilter }: { activeFilter: Category; onSelectFilter: (cat: Category) => void; }) => {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Filter className="w-4 h-4 text-[#1CB5BE] shrink-0 mr-1" />
            {FILTER_CATEGORIES.map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onSelectFilter(tab.id)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${isActive
                            ? 'bg-[#1CB5BE] text-[#061528]'
                            : 'bg-card-theme text-muted-theme border border-theme hover:text-main-theme'
                            }`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

const ReportCard = ({ report, onSelect, onShare, isGeneratingCard }: { report: PublicReport; onSelect: (id: string) => void; onShare: (report: PublicReport) => void; isGeneratingCard: boolean; }) => {
    const claimText = report.claim || report.summary || report.content || report.title;

    return (
        <article className="bg-card-theme border border-theme p-5 sm:p-6 rounded-2xl shadow-xl hover:border-[#1CB5BE]/50 transition-colors flex flex-col gap-4">
            {/* Top Row: Timestamp, Location & Always-Visible Verdict Badge */}
            <div className="flex items-center justify-between text-xs text-muted-theme gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {report.timestamp}
                    </span>
                    {report.location && (
                        <span className="inline-flex items-center gap-1 text-[#E55322] border border-[#E55322]/20 bg-[#E55322]/10 px-2 py-1 rounded-md">
                            <MapPin className="w-3.5 h-3.5" />
                            {report.location}
                        </span>
                    )}
                </div>

                <div>
                    <VerdictBadge verdict={report.verdict} />
                </div>
            </div>

            {/* Title */}
            <h2
                onClick={() => onSelect(report.id)}
                className="text-lg sm:text-xl font-bold text-main-theme leading-snug hover:text-[#1CB5BE] cursor-pointer transition-colors"
            >
                {report.title}
            </h2>

            {/* Image + Claim Box */}
            <div className="flex flex-row gap-3 sm:gap-4 items-stretch mt-1">
                <div
                    onClick={() => onSelect(report.id)}
                    className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-subcard-theme rounded-xl overflow-hidden border border-theme relative cursor-pointer group"
                >
                    {report.media_type === 'video' && report.media_url ? (
                        <div className="w-full h-full relative flex items-center justify-center bg-black">
                            <video src={getAbsoluteImageUrl(report.media_url)} className="w-full h-full object-cover opacity-80" />
                            <Play className="w-6 h-6 absolute text-white opacity-70" />
                        </div>
                    ) : (
                        <ReportImage
                            src={report.media_url}
                            alt={report.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            wrapperClassName="w-full h-full"
                        />
                    )}
                </div>

                <div className="flex-1 bg-subcard-theme rounded-xl p-3 sm:p-4 border border-theme flex flex-col justify-center">
                    <span className="text-muted-theme font-bold text-xs mb-1 block">
                        Claim Under Review:
                    </span>
                    <p className="text-xs sm:text-sm text-main-theme leading-relaxed line-clamp-3">
                        {stripHtml(claimText)}
                    </p>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-theme">
                <button
                    onClick={() => onSelect(report.id)}
                    className="text-[#1CB5BE] hover:opacity-80 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                    Read Full Story →
                </button>

                <button
                    onClick={() => onShare(report)}
                    disabled={isGeneratingCard}
                    className="text-muted-theme hover:text-main-theme text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                    {isGeneratingCard ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#1CB5BE]" />
                    ) : (
                        <Share2 className="w-4 h-4" />
                    )}
                    Share This Check
                </button>
            </div>
        </article>
    );
};

const ReportDetailView = ({ report, onBack, onShare, isGeneratingCard }: { report: PublicReport; onBack: () => void; onShare: (report: PublicReport) => void; isGeneratingCard: boolean; }) => {
    const authorName = report.byline || report.author || report.author_name || 'TruthGuard Team';
    const featuredImageUrl = report.featured_image_url || report.evidence_file || report.image || report.media_url;
    const bodyContent = report.content || report.details || report.summary || '';

    const getVerdictClaimHeader = (status?: string) => {
        switch (status?.toUpperCase()) {
            case 'FALSE':
                return 'DEBUNKED FALSE CLAIM:';
            case 'MISLEADING':
                return 'MISLEADING CLAIM UNDER REVIEW:';
            case 'TRUE':
            case 'VERIFIED':
                return 'VERIFIED FACTUAL CLAIM:';
            case 'PENDING':
            case 'UNDER_REVIEW':
                return 'CLAIM UNDER INVESTIGATION:';
            default:
                return 'CLAIM UNDER REVIEW:';
        }
    };

    const verdictHeader = getVerdictClaimHeader(report.status || report.verdict);

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="inline-flex items-center gap-2 text-[#1CB5BE] hover:opacity-80 font-bold text-sm cursor-pointer mb-2">
                <ArrowLeft className="w-4 h-4" /> Back to Feed
            </button>
            <div className="bg-card-theme border border-theme p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-theme/60 pb-4">
                    <div className="flex flex-wrap items-center gap-3">
                        {report.verdict && <VerdictBadge verdict={report.verdict} />}
                        <span className="flex items-center gap-1.5 text-xs font-bold text-main-theme">
                            <User className="w-3.5 h-3.5 text-[#1CB5BE]" />
                            By {authorName}
                        </span>
                        <span className="text-xs text-muted-theme font-medium">{report.timestamp}</span>
                    </div>
                    {report.location && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E55322] bg-[#E55322]/10 border border-[#E55322]/20 px-3 py-1 rounded-lg">
                            <MapPin className="w-3.5 h-3.5" /> {report.location}
                        </span>
                    )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-main-theme leading-tight">{report.title}</h1>
                <div className="relative w-full max-h-[480px] min-h-[320px] aspect-video md:aspect-[16/9] bg-subcard-theme rounded-2xl overflow-hidden border border-theme flex items-center justify-center shadow-lg group">
                    {report.media_type === 'video' && report.media_url ? (
                        <video src={getAbsoluteImageUrl(report.media_url)} controls className="w-full h-full max-h-[480px] object-contain mx-auto" />
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
                </div>
                {report.claim && (
                    <div className="bg-slate-100/70 dark:bg-subcard-theme p-4 sm:p-5 rounded-r-lg border-l-4 border-[#1CB5BE] border-y border-r border-theme my-4 shadow-sm">
                        <strong className="text-[#E05A2B] font-bold text-xs uppercase tracking-wider block mb-2">
                            {verdictHeader}
                        </strong>
                        <RichTextContent
                            content={report.claim}
                            className="text-sm sm:text-base italic font-medium text-slate-900 dark:text-main-theme"
                            fallbackText="No claim statement provided."
                        />
                    </div>
                )}
                <div className="border-t border-theme pt-6">
                    <RichTextContent
                        content={bodyContent}
                        className="text-base sm:text-lg"
                        fallbackText="No analysis content available for this report."
                    />
                </div>
                <div className="pt-4 border-t border-theme flex justify-end">
                    <button onClick={() => onShare(report)} disabled={isGeneratingCard} className="text-muted-theme hover:text-main-theme text-xs font-bold flex items-center gap-2 bg-subcard-theme px-4 py-2 rounded-xl border border-theme cursor-pointer disabled:opacity-50 transition-colors">
                        {isGeneratingCard ? <Loader2 className="w-4 h-4 animate-spin text-[#1CB5BE]" /> : <Share2 className="w-4 h-4" />}
                        Share Fact-Check
                    </button>
                </div>
            </div>
        </div>
    );
};

const ShareCardModal = ({ cardUrl, onClose }: { cardUrl: string; onClose: () => void; }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card-theme border border-theme p-6 rounded-2xl max-w-md w-full space-y-4 text-center shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-muted-theme hover:text-main-theme transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-bold text-main-theme pt-2">Fact-Check Card</h3>
                <div className="rounded-xl overflow-hidden border border-theme bg-subcard-theme p-2">
                    <img src={cardUrl} alt="Fact Check Graphic Card" className="w-full h-auto rounded-lg object-contain" />
                </div>
                <div className="pt-2 flex gap-3 justify-center">
                    <button onClick={() => {
                        const link = document.createElement('a');
                        link.download = 'TruthGuard-FactCheck.png';
                        link.href = cardUrl;
                        link.click();
                    }} className="px-4 py-2 bg-[#1CB5BE] text-[#061528] font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md">
                        Download Image
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
export default function Homepage() {
    const cardRef = useRef<HTMLDivElement>(null);
    const [reports, setReports] = useState<PublicReport[]>([]);
    const [activeFilter, setActiveFilter] = useState<Category>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReportId, setSelectedReportId] = useState<string | null>(() => {
        if (typeof window !== 'undefined') return new URLSearchParams(window.location.search).get('report');
        return null;
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Share Graphic Modal state
    const [selectedShareReport, setSelectedShareReport] = useState<PublicReport | null>(null);
    const [previewCardUrl, setPreviewCardUrl] = useState<string | null>(null);
    const [generatingCardId, setGeneratingCardId] = useState<string | null>(null);

    const getRelativeTime = useCallback((dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
    }, []);

    const formatApiRecord = useCallback((item: any): PublicReport => {
        const dbTitle = item.title || '';
        const dbClaim = item.claim || item.summary || item.details || '';
        const dbSummary = item.summary || item.content || item.details || item.fact || '';
        const author = item.byline || item.author || item.author_name || (item.fact_checker ? `${item.fact_checker.first_name || ''} ${item.fact_checker.last_name || ''}`.trim() : '') || 'TruthGuard Team';
        const featuredImage = item.featured_image_url || item.evidence_file || item.image || item.cover_image || item.media_url || item.image_url || null;

        return {
            id: String(item.id),
            title: dbTitle,
            claim: dbClaim,
            verdict: item.verdict || item.status || '',
            category: item.category || 'ALL',
            location: item.location || '',
            timestamp: item.created_at ? getRelativeTime(item.created_at) : 'Recently',
            summary: dbSummary,
            content: item.content || item.details || dbSummary,
            author,
            byline: author,
            featured_image_url: featuredImage,
            media_url: featuredImage,
            media_type: item.media_type || (item.video_url ? 'video' : 'image'),
            rawCreatedAt: item.created_at,
        };
    }, [getRelativeTime]);

    const handleSelectReport = (id: string | null) => {
        setSelectedReportId(id);
        const url = new URL(window.location.href);
        if (id) url.searchParams.set('report', id);
        else url.searchParams.delete('report');
        window.history.pushState({}, '', url.toString());
    };

    const fetchDebunkedFeed = useCallback(async (pageNum: number, append = false) => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            let data: any;
            if (typeof getDebunkedFeed === 'function') {
                data = await getDebunkedFeed(pageNum);
            } else {
                const res = await fetch(`https://truthguard-api-sut7.onrender.com/api/incidents/feed/debunked/?page=${pageNum}`);
                if (!res.ok) throw new Error('Failed to fetch debunked feed.');
                data = await res.json();
            }
            const apiResults = Array.isArray(data) ? data : data.results || [];
            const formatted = apiResults.map(formatApiRecord);
            setReports((prev) => (append ? [...prev, ...formatted] : formatted));
            setHasMorePages(data.next !== null && data.next !== undefined);
        } catch (err: any) {
            console.error('Error fetching debunked feed from API:', err);
            setErrorMsg('Failed to load fact-checks. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [formatApiRecord]);

    useEffect(() => {
        setCurrentPage(1);
        fetchDebunkedFeed(1, false);
    }, [fetchDebunkedFeed]);

    const handleLoadMore = () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchDebunkedFeed(nextPage, true);
    };

    const handleShareCard = async (report: PublicReport) => {
        if (navigator.share) {
            try {
                await navigator.share({ title: report.title, text: `[Fact-Check: ${report.verdict}] ${report.claim || report.title}`, url: `${window.location.origin}/?report=${report.id}` });
                return;
            } catch (e) { }
        }
        setSelectedShareReport(report);
        setGeneratingCardId(report.id);
        setTimeout(async () => {
            if (cardRef.current) {
                try {
                    const dataUrl = await htmlToImage.toPng(cardRef.current, { cacheBust: true, quality: 0.95 });
                    setPreviewCardUrl(dataUrl);
                } catch (err) {
                    console.error('Failed to capture card image:', err);
                } finally {
                    setGeneratingCardId(null);
                }
            }
        }, 100);
    };

    const selectedReport = useMemo(() => {
        if (!selectedReportId) return null;
        return reports.find((r) => String(r.id) === String(selectedReportId)) || null;
    }, [reports, selectedReportId]);

    const filteredReports = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return reports.filter((report) => {
            const matchesSearch = !q || report.title.toLowerCase().includes(q) || report.claim.toLowerCase().includes(q) || report.summary.toLowerCase().includes(q);
            const matchesFilter = activeFilter === 'ALL' || report.category === activeFilter;
            return matchesSearch && matchesFilter;
        });
    }, [reports, searchQuery, activeFilter]);

    return (
        <div className="min-h-screen bg-app text-main-theme py-12 px-4 sm:px-6 lg:px-8 relative">
            <div aria-hidden="true" className="absolute -left-[9999px] -top-[9999px] pointer-events-none opacity-0">
                {selectedShareReport && <FactCheckCardGraphic ref={cardRef} report={selectedShareReport} />}
            </div>
            {previewCardUrl && <ShareCardModal cardUrl={previewCardUrl} onClose={() => setPreviewCardUrl(null)} />}
            <div className="max-w-4xl mx-auto space-y-10">
                {selectedReportId && selectedReport ? (
                    <ReportDetailView report={selectedReport} onBack={() => handleSelectReport(null)} onShare={handleShareCard} isGeneratingCard={generatingCardId === selectedReport.id} />
                ) : (
                    <>
                        <div className="text-center space-y-4">
                            <h1 className="text-3xl md:text-5xl font-black text-main-theme tracking-tight">Live Election Fact-Checks</h1>
                        </div>
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-theme" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search verified claims, candidates, or rumors..."
                                    className="w-full bg-card-theme border border-theme rounded-xl pl-12 pr-4 py-3.5 text-sm text-main-theme focus:outline-none focus:border-[#1CB5BE] shadow-lg placeholder:text-muted-theme"
                                />
                            </div>
                            <FilterTabs activeFilter={activeFilter} onSelectFilter={(cat) => setActiveFilter(cat)} />
                        </div>
                        <div className="space-y-6">
                            {isLoading && reports.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-[#1CB5BE]">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                </div>
                            ) : errorMsg && reports.length === 0 ? (
                                <div className="text-center py-12 text-rose-400 border border-dashed border-rose-500/30 rounded-2xl space-y-4">
                                    <p>{errorMsg}</p>
                                    <button onClick={() => fetchDebunkedFeed(1, false)} className="inline-flex items-center gap-2 px-4 py-2 bg-card-theme text-[#1CB5BE] rounded-xl text-xs font-bold border border-[#1CB5BE]/30 hover:bg-[#1CB5BE]/10 transition-colors cursor-pointer">
                                        <RefreshCw className="w-4 h-4" /> Retry
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {filteredReports.map((report) => (
                                        <ReportCard key={report.id} report={report} onSelect={(id) => handleSelectReport(id)} onShare={handleShareCard} isGeneratingCard={generatingCardId === report.id} />
                                    ))}
                                    {filteredReports.length === 0 && (
                                        <div className="text-center py-12 text-muted-theme border border-dashed border-theme rounded-2xl">No fact-checks found matching your search.</div>
                                    )}
                                </>
                            )}
                        </div>
                        {hasMorePages && (
                            <div className="flex justify-center pt-4">
                                <button onClick={handleLoadMore} disabled={isLoading} className="px-6 py-3 bg-card-theme hover:bg-subcard-theme text-[#1CB5BE] border border-[#1CB5BE]/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50">
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load More Fact-Checks'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}