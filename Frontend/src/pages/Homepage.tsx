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
    ChevronDown,
    Loader2,
    ArrowLeft,
    X,
    RefreshCw
} from 'lucide-react';
import { FactCheckCardGraphic } from '../components/FactCheckCardGraphics';
import { getDebunkedFeed } from '../services/api';

// --- Types & Constants ---
export type Verdict = 'FALSE' | 'MISLEADING' | 'VERIFIED' | 'PENDING';

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

    switch (verdict) {
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
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4" /> {t('home.statusVerified', 'CONFIRM TRUE')}
                </span>
            );
        default:
            return null;
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
        <article className="bg-[#0E243F] border border-[#1A3352] p-6 rounded-2xl shadow-xl hover:border-[#1CB5BE]/50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <VerdictBadge verdict={report.verdict} />
                        <span className="text-xs text-gray-400 font-medium">
                            {report.timestamp} • {report.location}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-white leading-snug">{report.title}</h2>
                </div>
            </div>

            <div className="bg-[#061528] rounded-xl p-4 border border-[#1A3352] mb-4">
                <p className="text-sm text-gray-300">
                    <strong className="text-gray-400 uppercase text-xs tracking-wider">
                        {t('home.claimLabel', 'WETIN DEM TALK: ')}
                    </strong>
                    {report.claim}
                </p>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed mb-6 line-clamp-3">
                {report.summary}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-[#1A3352]">
                <button
                    onClick={() => onSelect(report.id)}
                    className="text-[#1CB5BE] hover:text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                    {t('home.readFull', 'Read Full Story')}
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
                <div className="flex flex-wrap items-center gap-3">
                    <VerdictBadge verdict={report.verdict} />
                    <span className="text-xs text-gray-400 font-medium">
                        {report.timestamp} • {report.location}
                    </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {report.title}
                </h1>

                <div className="bg-[#061528] rounded-xl p-4 border border-[#1A3352]">
                    <p className="text-sm text-gray-300">
                        <strong className="text-[#E55322] uppercase text-xs tracking-wider block mb-1">
                            {t('home.claimLabel', 'WETIN DEM TALK: ')}
                        </strong>
                        "{report.claim}"
                    </p>
                </div>

                <div className="border-t border-[#1A3352] pt-6">
                    <p className="text-gray-200 leading-relaxed text-base whitespace-pre-wrap">
                        {report.summary}
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

    // Ref & State for Client-Side Card Capture
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

    // Helper: Record Formatter for API Response
    const formatApiRecord = useCallback(
        (item: any): PublicReport => {
            const lang = i18n.language || 'en';
            const dbTitle = item[`title_${lang}`];
            const dbClaim = item[`claim_${lang}`];
            const dbSummary = item[`summary_${lang}`];

            return {
                id: String(item.id),
                title: dbTitle || item.title || '',
                claim: dbClaim || item.claim || '',
                verdict: item.verdict,
                category: item.category,
                location: item.location || '',
                timestamp: item.created_at
                    ? getRelativeTime(item.created_at)
                    : t('time.recently', 'Recently'),
                summary: dbSummary || item.summary || item.fact || '',
                rawCreatedAt: item.created_at
            };
        },
        [i18n.language, getRelativeTime, t]
    );

    // Sync URL state with selected report
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

    // Step 2 Integration: Fetch Public Debunked Feed (`GET feed/debunked/`)
    const fetchDebunkedFeed = useCallback(async (pageNum: number, append = false) => {
        setIsLoading(true);
        setErrorMsg(null);

        try {
            const data = await getDebunkedFeed(pageNum);

            // Handles both paginated objects ({ results: [], next: "..." }) and standard arrays
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
    }, [formatApiRecord, t]);

    // Initial Fetch on Component Mount
    useEffect(() => {
        fetchDebunkedFeed(1);
    }, [fetchDebunkedFeed]);

    // Load More Handler (Pagination)
    const handleLoadMore = () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchDebunkedFeed(nextPage, true);
    };

    // Handle Sharing (Client-Side html-to-image Fallback)
    const handleShareCard = async (report: PublicReport) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: report.title,
                    text: `[Fact-Check: ${report.verdict}] ${report.claim}`,
                    url: `${window.location.origin}/?report=${report.id}`
                });
                return;
            } catch (e) {
                // Fallback to graphic modal if native share is cancelled or unsupported
            }
        }

        // Render report into offscreen component and convert to PNG
        setSelectedShareReport(report);
        setGeneratingCardId(report.id);

        setTimeout(async () => {
            if (cardRef.current) {
                try {
                    const dataUrl = await htmlToImage.toPng(cardRef.current, { cacheBust: true });
                    setPreviewCardUrl(dataUrl);
                } catch (err) {
                    console.error('Failed to capture card image:', err);
                } finally {
                    setGeneratingCardId(null);
                }
            }
        }, 100);
    };

    // Selected Report Memo
    const selectedReport = useMemo(() => {
        return reports.find((r) => r.id === selectedReportId);
    }, [reports, selectedReportId]);

    // Filtered Reports Memo
    const filteredReports = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return reports.filter((report) => {
            const matchesSearch =
                !q ||
                report.title.toLowerCase().includes(q) ||
                report.claim.toLowerCase().includes(q);

            const matchesFilter =
                activeFilter === 'ALL' || report.category === activeFilter;

            return matchesSearch && matchesFilter;
        });
    }, [reports, searchQuery, activeFilter]);

    return (
        <div className="min-h-screen bg-[#061528] text-white py-12 px-4 sm:px-6 lg:px-8 relative">
            {/* Hidden graphic component target for html-to-image canvas capture */}
            {selectedShareReport && (
                <FactCheckCardGraphic ref={cardRef} report={selectedShareReport} />
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
                        <div className="text-center space-y-4">
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

                        {/* Reports List / Feed */}
                        <div className="space-y-6">
                            {isLoading && reports.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-[#1CB5BE]">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                </div>
                            ) : errorMsg && reports.length === 0 ? (
                                <div className="text-center py-12 text-rose-400 border border-dashed border-rose-500/30 rounded-2xl space-y-4">
                                    <p>{errorMsg}</p>
                                    <button
                                        onClick={() => fetchDebunkedFeed(1)}
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

                        {/* Pagination Button connected to feed/debunked/ page parameters */}
                        {hasMorePages && (
                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#0E243F] border border-[#1CB5BE]/30 text-[#1CB5BE] hover:bg-[#1CB5BE]/10 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            {t('home.loadMore', 'Load More Story')}{' '}
                                            <ChevronDown className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Share Preview Modal */}
            {previewCardUrl && (
                <ShareCardModal
                    cardUrl={previewCardUrl}
                    onClose={() => setPreviewCardUrl(null)}
                />
            )}
        </div>
    );
}