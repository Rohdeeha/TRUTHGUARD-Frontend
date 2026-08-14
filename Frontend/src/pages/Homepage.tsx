import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
    Play
} from 'lucide-react';
import { FactCheckCardGraphic } from '../components/FactCheckCardGraphics';
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

const FILTER_CATEGORIES: { id: Category; labelKey: string; fallback: string }[] = [
    { id: 'ALL', labelKey: 'home.filterAll', fallback: 'All Fact-Checks' },
    { id: 'VOTER_SUPPRESSION', labelKey: 'home.filterVoterSuppression', fallback: 'Voter Suppression' },
    { id: 'DISINFORMATION', labelKey: 'home.filterDisinformation', fallback: 'Disinformation / Fake News' },
    { id: 'TFGBV', labelKey: 'home.filterTFGBV', fallback: 'TFGBV' },
    { id: 'LOGISTICS_FAILURE', labelKey: 'home.filterLogistics', fallback: 'Logistics Failure' },
    { id: 'VIOLENCE', labelKey: 'home.filterViolence', fallback: 'Violence / Intimidation' },
    { id: 'INEC', labelKey: 'home.filterINEC', fallback: 'INEC / Voting Info' },
];

// --- Sub-Components ---

const VerdictBadge = ({ verdict }: { verdict: Verdict }) => {
    const { t } = useTranslation();
    const normalizedVerdict = String(verdict || '').toUpperCase();

    switch (normalizedVerdict) {
        case 'FALSE':
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <XCircle className="w-4 h-4" /> {t('home.statusFalse', 'NO BE TRUE')}
                </span>
            );
        case 'MISLEADING':
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full bg-[#E55322]/20 text-[#E55322] border border-[#E55322]/30">
                    <AlertTriangle className="w-4 h-4" /> {t('home.statusMisleading', 'E NO CLEAR')}
                </span>
            );
        case 'VERIFIED':
        case 'TRUE':
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4" /> {t('home.statusVerified', 'CONFIRM TRUE')}
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
                    {verdict || 'UNVERIFIED'}
                </span>
            );
    }
};

const FilterTabs = ({
    activeFilter,
    onSelectFilter
}: {
    activeFilter: Category;
    onSelectFilter: (cat: Category) => void;
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Filter className="w-4 h-4 text-[#1CB5BE] shrink-0 mr-2" />
            {FILTER_CATEGORIES.map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onSelectFilter(tab.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${isActive
                                ? 'bg-[#1CB5BE] text-[#061528]'
                                : 'bg-[#0E243F] text-gray-300 border border-[#1A3352] hover:text-white'
                            }`}
                    >
                        {t(tab.labelKey, tab.fallback)}
                    </button>
                );
            })}
        </div>
    );
};

const ReportCard = ({
    report,
    onSelect,
    onShare,
    isGeneratingCard
}: {
    report: PublicReport;
    onSelect: (id: string) => void;
    onShare: (report: PublicReport) => void;
    isGeneratingCard: boolean;
}) => {
    const { t } = useTranslation();

    return (
        <article className="bg-[#0E243F] border border-[#1A3352] p-5 sm:p-6 rounded-2xl shadow-xl hover:border-[#1CB5BE]/50 transition-colors flex flex-col gap-4">
            {/* Top Row: Badges and Location */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    {report.verdict && <VerdictBadge verdict={report.verdict} />}
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        {report.timestamp}
                    </span>
                </div>

                {report.location && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E55322] bg-[#E55322]/10 border border-[#E55322]/20 px-2.5 py-1 rounded-lg">
                        <MapPin className="w-3.5 h-3.5" />
                        {report.location}
                    </span>
                )}
            </div>

            {/* Main Content Layout: Text + Optional Media Preview */}
            <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
                <div className="flex-1 space-y-3">
                    <h2
                        onClick={() => onSelect(report.id)}
                        className="text-xl font-bold text-white leading-snug hover:text-[#1CB5BE] cursor-pointer transition-colors"
                    >
                        {report.title}
                    </h2>

                    {report.claim && (
                        <div className="bg-[#061528] rounded-xl p-3.5 border border-[#1A3352]">
                            <p className="text-xs sm:text-sm text-gray-300">
                                <strong className="text-gray-400 uppercase text-xs tracking-wider">
                                    {t('home.claimLabel', 'WETIN DEM TALK: ')}
                                </strong>
                                {report.claim}
                            </p>
                        </div>
                    )}

                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
                        {report.summary || report.content}
                    </p>
                </div>

                {/* Media Thumbnail (If situation room media exists) */}
                {report.media_url && (
                    <div
                        onClick={() => onSelect(report.id)}
                        className="w-full md:w-44 h-32 flex-shrink-0 bg-[#061528] rounded-xl overflow-hidden border border-[#1A3352] relative cursor-pointer group"
                    >
                        {report.media_type === 'video' ? (
                            <div className="w-full h-full relative flex items-center justify-center bg-black">
                                <video src={report.media_url} className="w-full h-full object-cover opacity-80" />
                                <div className="absolute p-2 rounded-full bg-[#1CB5BE] text-[#061528] shadow-lg group-hover:scale-110 transition-transform">
                                    <Play className="w-4 h-4 fill-current" />
                                </div>
                            </div>
                        ) : (
                            <img
                                src={report.media_url}
                                alt={report.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1A3352]">
                <button
                    onClick={() => onSelect(report.id)}
                    className="text-[#1CB5BE] hover:text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                    {t('home.readFull', 'Read Full Story')} →
                </button>
                <button
                    onClick={() => onShare(report)}
                    disabled={isGeneratingCard}
                    className="text-gray-400 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                >
                    {isGeneratingCard ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#1CB5BE]" />
                    ) : (
                        <Share2 className="w-4 h-4" />
                    )}
                    {t('home.shareReport', 'Share This Check')}
                </button>
            </div>
        </article>
    );
};

const ReportDetailView = ({
    report,
    onBack,
    onShare,
    isGeneratingCard
}: {
    report: PublicReport;
    onBack: () => void;
    onShare: (report: PublicReport) => void;
    isGeneratingCard: boolean;
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-[#1CB5BE] hover:text-white font-bold text-sm cursor-pointer mb-2"
            >
                <ArrowLeft className="w-4 h-4" />
                {t('home.backToFeed', 'Back to Feed')}
            </button>

            <div className="bg-[#0E243F] border border-[#1A3352] p-6 sm:p-8 rounded-2xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {report.verdict && <VerdictBadge verdict={report.verdict} />}
                        <span className="text-xs text-gray-400 font-medium">
                            {report.timestamp}
                        </span>
                    </div>
                    {report.location && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E55322] bg-[#E55322]/10 border border-[#E55322]/20 px-3 py-1 rounded-lg">
                            <MapPin className="w-3.5 h-3.5" />
                            {report.location}
                        </span>
                    )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {report.title}
                </h1>

                {/* Media Preview in Detail View */}
                {report.media_url && (
                    <div className="rounded-xl overflow-hidden border border-[#1A3352] max-h-96 bg-[#061528] flex items-center justify-center">
                        {report.media_type === 'video' ? (
                            <video src={report.media_url} controls className="w-full max-h-96 object-contain" />
                        ) : (
                            <img src={report.media_url} alt={report.title} className="w-full max-h-96 object-contain" />
                        )}
                    </div>
                )}

                {report.claim && (
                    <div className="bg-[#061528] rounded-xl p-4 border border-[#1A3352]">
                        <p className="text-sm text-gray-300">
                            <strong className="text-[#E55322] uppercase text-xs tracking-wider block mb-1">
                                {t('home.claimLabel', 'WETIN DEM TALK: ')}
                            </strong>
                            "{report.claim}"
                        </p>
                    </div>
                )}

                <div className="border-t border-[#1A3352] pt-6">
                    <p className="text-gray-200 leading-relaxed text-base whitespace-pre-wrap">
                        {report.summary || report.content}
                    </p>
                </div>

                <div className="pt-4 border-t border-[#1A3352] flex justify-end">
                    <button
                        onClick={() => onShare(report)}
                        disabled={isGeneratingCard}
                        className="text-gray-400 hover:text-white text-xs font-bold flex items-center gap-2 bg-[#061528] px-4 py-2 rounded-xl border border-[#1A3352] cursor-pointer disabled:opacity-50 transition-colors"
                    >
                        {isGeneratingCard ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#1CB5BE]" />
                        ) : (
                            <Share2 className="w-4 h-4" />
                        )}
                        {t('home.shareReport', 'Share This Check')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ShareCardModal = ({
    cardUrl,
    onClose
}: {
    cardUrl: string;
    onClose: () => void;
}) => {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#0E243F] border border-[#1A3352] p-6 rounded-2xl max-w-md w-full space-y-4 text-center shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-lg font-bold text-white pt-2">
                    {t('home.generatedCardTitle', 'Fact-Check Card')}
                </h3>

                <div className="overflow-hidden rounded-xl border border-[#1A3352] bg-[#061528] p-2">
                    <img
                        src={cardUrl}
                        alt="Fact Check Graphic Card"
                        className="w-full h-auto rounded-lg object-contain"
                    />
                </div>

                <div className="flex items-center gap-3 justify-end pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                        {t('home.close', 'Close')}
                    </button>
                    <a
                        href={cardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download="fact-check-card.png"
                        className="px-4 py-2 bg-[#1CB5BE] text-[#061528] rounded-xl text-xs font-bold hover:bg-[#1CB5BE]/90 transition-colors inline-flex items-center gap-2 cursor-pointer"
                    >
                        {t('home.downloadCard', 'Download Card')}
                    </a>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---

export default function HomePage() {
    const { t, i18n } = useTranslation();

    // Ref & State for Canvas Capture
    const cardRef = useRef<HTMLDivElement>(null);
    const [selectedShareReport, setSelectedShareReport] = useState<PublicReport | null>(null);

    // State Management
    const [selectedReportId, setSelectedReportId] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('report');
        }
        return null;
    });

    const [reports, setReports] = useState<PublicReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<Category>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(false);

    // Card Generation State
    const [generatingCardId, setGeneratingCardId] = useState<string | null>(null);
    const [previewCardUrl, setPreviewCardUrl] = useState<string | null>(null);

    // Helper: Relative Time Calculator
    const getRelativeTime = useCallback(
        (dateString: string) => {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

            if (isNaN(date.getTime()) || diffInSeconds < 0) return t('time.recently', 'Recently');
            if (diffInSeconds < 60) return t('time.justNow', 'Just now');
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            if (diffInMinutes < 60) return `${diffInMinutes} ${t('time.minsAgo', 'mins ago')}`;
            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) return `${diffInHours} ${t('time.hoursAgo', 'hours ago')}`;
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays} ${t('time.daysAgo', 'days ago')}`;
        },
        [t]
    );

    // Helper: Resilient Record Formatter for direct API responses
    const formatApiRecord = useCallback(
        (item: any): PublicReport => {
            const lang = i18n.language || 'en';

            const dbTitle = item[`title_${lang}`] || item.title || '';
            const dbClaim = item[`claim_${lang}`] || item.claim || item.summary || '';
            const dbSummary = item[`summary_${lang}`] || item.summary || item.content || item.fact || '';

            return {
                id: String(item.id),
                title: dbTitle,
                claim: dbClaim,
                verdict: item.verdict || '',
                category: item.category || 'ALL',
                location: item.location || '',
                timestamp: item.created_at
                    ? getRelativeTime(item.created_at)
                    : t('time.recently', 'Recently'),
                summary: dbSummary,
                content: item.content || dbSummary,
                rawCreatedAt: item.created_at,
                media_url: item.media_url || item.image_url || item.media || item.image || null,
                media_type: item.media_type || (item.video_url ? 'video' : 'image')
            };
        },
        [i18n.language, getRelativeTime, t]
    );

    // Sync URL state with selected report ID
    const handleSelectReport = (id: string | null) => {
        setSelectedReportId(id);
        const url = new URL(window.location.href);
        if (id) {
            url.searchParams.set('report', id);
        } else {
            url.searchParams.delete('report');
        }
        window.history.pushState({}, '', url.toString());
    };

    // Fetch Feed with Language Query & Pagination
    const fetchDebunkedFeed = useCallback(
        async (pageNum: number, append = false) => {
            setIsLoading(true);
            setErrorMsg(null);

            const currentLang = i18n.language || 'en';

            try {
                let data: any;

                if (typeof getDebunkedFeed === 'function') {
                    data = await getDebunkedFeed(pageNum);
                } else {
                    const res = await fetch(
                        `https://truthguard-api-sut7.onrender.com/api/incidents/feed/debunked/?lang=${currentLang}&page=${pageNum}`
                    );
                    if (!res.ok) throw new Error('Failed to fetch debunked feed.');
                    data = await res.json();
                }

                const apiResults = Array.isArray(data) ? data : data.results || [];
                const formatted = apiResults.map(formatApiRecord);

                setReports((prev) => (append ? [...prev, ...formatted] : formatted));
                setHasMorePages(data.next !== null && data.next !== undefined);
            } catch (err: any) {
                console.error('Error fetching debunked feed from API:', err);
                setErrorMsg(t('home.fetchError', 'Failed to load fact-checks. Please try again.'));
            } finally {
                setIsLoading(false);
            }
        },
        [formatApiRecord, i18n.language, t]
    );

    // Trigger Fetch on Initial Mount & whenever Language changes
    useEffect(() => {
        setCurrentPage(1);
        fetchDebunkedFeed(1, false);
    }, [i18n.language, fetchDebunkedFeed]);

    // Load More Handler (Pagination)
    const handleLoadMore = () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchDebunkedFeed(nextPage, true);
    };

    // Handle Share (Native Share with HTML-to-Image Fallback)
    const handleShareCard = async (report: PublicReport) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: report.title,
                    text: `[Fact-Check: ${report.verdict}] ${report.claim || report.title}`,
                    url: `${window.location.origin}/?report=${report.id}`
                });
                return;
            } catch (e) {
                // Fallback to graphic modal if cancelled or unsupported
            }
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

    // Derived Selected Report Memo
    const selectedReport = useMemo(() => {
        if (!selectedReportId) return null;
        return reports.find((r) => String(r.id) === String(selectedReportId)) || null;
    }, [reports, selectedReportId]);

    // Derived Filtered Reports Memo
    const filteredReports = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return reports.filter((report) => {
            const matchesSearch =
                !q ||
                report.title.toLowerCase().includes(q) ||
                report.claim.toLowerCase().includes(q) ||
                report.summary.toLowerCase().includes(q);

            const matchesFilter =
                activeFilter === 'ALL' || report.category === activeFilter;

            return matchesSearch && matchesFilter;
        });
    }, [reports, searchQuery, activeFilter]);

    return (
        <div className="min-h-screen bg-[#061528] text-white py-12 px-4 sm:px-6 lg:px-8 relative">
            {/* Hidden graphic component target for html-to-image canvas capture */}
            <div aria-hidden="true" className="absolute -left-[9999px] -top-[9999px] pointer-events-none opacity-0">
                {selectedShareReport && (
                    <FactCheckCardGraphic ref={cardRef} report={selectedShareReport} />
                )}
            </div>

            {/* Share Modal Preview */}
            {previewCardUrl && (
                <ShareCardModal cardUrl={previewCardUrl} onClose={() => setPreviewCardUrl(null)} />
            )}

            <div className="max-w-4xl mx-auto space-y-10">
                {selectedReportId && selectedReport ? (
                    <ReportDetailView
                        report={selectedReport}
                        onBack={() => handleSelectReport(null)}
                        onShare={handleShareCard}
                        isGeneratingCard={generatingCardId === selectedReport.id}
                    />
                ) : (
                    <>
                        {/* Hero Section */}
                        <div className="text-center space-y-[#061528] space-y-4">
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                {t('home.heroTitle', 'Live Election Fact-Checks')}
                            </h1>
                            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                                {t(
                                    'home.heroSubtitle',
                                    'Real-time news check, fake story debunk, and official info for Osun 2026.'
                                )}
                            </p>
                        </div>

                        {/* Controls Section */}
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t(
                                        'home.searchPlaceholder',
                                        'Search news, candidate name, or fake story...'
                                    )}
                                    className="w-full bg-[#0E243F] border border-[#1A3352] rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-[#1CB5BE] placeholder-gray-500 shadow-lg"
                                />
                            </div>

                            <FilterTabs
                                activeFilter={activeFilter}
                                onSelectFilter={(cat) => setActiveFilter(cat)}
                            />
                        </div>

                        {/* Situation Room Reports Feed */}
                        <div className="space-y-6">
                            {isLoading && reports.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-[#1CB5BE]">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                    <p className="text-sm text-gray-400">{t('home.loading', 'Fetching verified reports...')}</p>
                                </div>
                            ) : errorMsg && reports.length === 0 ? (
                                <div className="text-center py-12 text-rose-400 border border-dashed border-rose-500/30 rounded-2xl space-y-4">
                                    <p>{errorMsg}</p>
                                    <button
                                        onClick={() => fetchDebunkedFeed(1, false)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0E243F] text-[#1CB5BE] rounded-xl text-xs font-bold border border-[#1CB5BE]/30 hover:bg-[#1CB5BE]/10 transition-colors cursor-pointer"
                                    >
                                        <RefreshCw className="w-4 h-4" /> {t('home.retry', 'Retry')}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {filteredReports.map((report) => (
                                        <ReportCard
                                            key={report.id}
                                            report={report}
                                            onSelect={(id) => handleSelectReport(id)}
                                            onShare={handleShareCard}
                                            isGeneratingCard={generatingCardId === report.id}
                                        />
                                    ))}

                                    {filteredReports.length === 0 && (
                                        <div className="text-center py-12 text-gray-400 border border-dashed border-[#1A3352] rounded-2xl">
                                            {t('home.noReports', 'No story match wetin you dey find.')}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {hasMorePages && (
                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                    className="px-6 py-3 bg-[#0E243F] hover:bg-[#1A3352] text-[#1CB5BE] border border-[#1CB5BE]/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        t('home.loadMore', 'Load More Fact-Checks')
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}