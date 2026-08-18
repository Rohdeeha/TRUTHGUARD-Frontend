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
    { id: 'ALL', labelKey: 'home.filterAll', fallback: 'All Debunks' },
    { id: 'VOTER_SUPPRESSION', labelKey: 'home.filterVoterSuppression', fallback: 'Voter Suppression' },
    { id: 'DISINFORMATION', labelKey: 'home.filterDisinformation', fallback: 'Disinformation' },
    { id: 'TFGBV', labelKey: 'home.filterTFGBV', fallback: 'TFGBV' },
    { id: 'LOGISTICS_FAILURE', labelKey: 'home.filterLogistics', fallback: 'Logistics' },
    { id: 'VIOLENCE', labelKey: 'home.filterViolence', fallback: 'Violence' },
    { id: 'INEC', labelKey: 'home.filterINEC', fallback: 'INEC' },
];

// --- Sub-Components ---

const VerdictBadge = ({ verdict }: { verdict: Verdict }) => {
    const { t } = useTranslation();
    const normalizedVerdict = String(verdict || '').toUpperCase();

    switch (normalizedVerdict) {
        case 'FALSE':
            return (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black px-2 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wide">
                    <XCircle className="w-3.5 h-3.5" /> {t('home.statusFalse', 'FALSE')}
                </span>
            );
        case 'MISLEADING':
            return (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black px-2 py-1 rounded bg-[#E55322]/20 text-[#E55322] border border-[#E55322]/30 uppercase tracking-wide">
                    <AlertTriangle className="w-3.5 h-3.5" /> {t('home.statusMisleading', 'MISLEADING')}
                </span>
            );
        case 'VERIFIED':
        case 'TRUE':
            return (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t('home.statusVerified', 'VERIFIED')}
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
    const { t } = useTranslation();
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

/* --- UPDATED REPORT CARD LAYOUT --- */

// 1. We define the ReportCard component and specify the data (props) it needs to work.
const ReportCard = ({ report, onSelect, onShare, isGeneratingCard }: { report: PublicReport; onSelect: (id: string) => void; onShare: (report: PublicReport) => void; isGeneratingCard: boolean; }) => {

    // 2. We bring in the translation function 't' to handle dynamic language switching.
    const { t } = useTranslation();

    // 3. The 'return' statement dictates what HTML/UI is actually drawn on the screen.
    return (
        // 4. The main card wrapper (`article`). It sets a dark background, a border, padding, rounded corners, and uses 'flex-col' to stack items vertically with a gap of 4 units.
        <article className="bg-[#0E243F] border border-[#1A3352] p-5 sm:p-6 rounded-2xl shadow-xl hover:border-[#1CB5BE]/50 transition-colors flex flex-col gap-4">

            {/* --- TOP HEADER ROW --- */}
            // 5. A flex container for the top row, spreading items to the far left and right (justify-between).
            <div className="flex items-center justify-between text-xs text-gray-400">

                // 6. The wrapper for the timestamp on the left side.
                <span className="inline-flex items-center gap-1.5 font-medium">
                    // 7. Renders the Clock icon from Lucide.
                    <Clock className="w-3.5 h-3.5" />
                    // 8. Displays the relative time string (e.g., "20 hours ago").
                    {report.timestamp}
                </span>

                // 9. A wrapper for the right side of the header, holding the Location and Verdict badge.
                <div className="flex items-center gap-2">
                    // 10. Conditional check: Only render the location if the report has one.
                    {report.location && (
                        // 11. The visual styling for the orange location pill.
                        <span className="inline-flex items-center gap-1 text-[#E55322] border border-[#E55322]/20 bg-[#E55322]/10 px-2 py-1 rounded-md">
                            // 12. Renders the MapPin icon.
                            <MapPin className="w-3.5 h-3.5" />
                            // 13. Displays the actual location text.
                            {report.location}
                        </span>
                    )}
                    // 14. Conditional check: Only render the VerdictBadge if a verdict exists. (Moved here to match your image).
                    {report.verdict && (
                        // 15. Calls your existing VerdictBadge component to render the colored status pill.
                        <VerdictBadge verdict={report.verdict} />
                    )}
                </div>
            </div>

            {/* --- TITLE --- */}
            // 16. The heading element for the fact-check title.
            <h2
                // 17. When clicked, it triggers the 'onSelect' function to open the full detail view.
                onClick={() => onSelect(report.id)}
                // 18. Styling for the text: large, bold, white, and turns teal on hover.
                className="text-lg sm:text-xl font-bold text-white leading-snug hover:text-[#1CB5BE] cursor-pointer transition-colors"
            >
                // 19. Displays the actual title text from the database.
                {report.title}
            </h2>

            {/* --- CONTENT AREA (IMAGE + CLAIM) --- */}
            // 20. A flex container to place the image and the claim box side-by-side (flex-row).
            <div className="flex flex-row gap-3 sm:gap-4 items-stretch mt-2">

                // 21. Conditional check: Only render the media block if an image/video URL exists.
                {report.media_url && (
                    // 22. A fixed-size square container for the thumbnail. Hides anything that overflows outside its rounded borders.
                    <div
                        // 23. Clicking the image also opens the full report.
                        onClick={() => onSelect(report.id)}
                        // 24. Styling to keep it a fixed size (24x24 or 32x32 on larger screens) and act as a group for hover effects.
                        className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-[#061528] rounded-xl overflow-hidden border border-[#1A3352] relative cursor-pointer group"
                    >
                        // 25. Checks if the media is a video.
                        {report.media_type === 'video' ? (
                            // 26. Container for video styling.
                            <div className="w-full h-full relative flex items-center justify-center bg-black">
                                // 27. Renders the video element.
                                <video src={report.media_url} className="w-full h-full object-cover opacity-80" />
                                // 28. Overlays a Play icon on top of the video thumbnail.
                                <Play className="w-6 h-6 absolute text-white opacity-70" />
                            </div>
                        ) : (
                            // 29. If it's an image, render the standard <img> tag.
                            <img
                                // 30. Sets the source URL.
                                src={report.media_url}
                                // 31. Uses the title as alt text for accessibility.
                                alt={report.title}
                                // 32. Ensures the image covers the box and zooms slightly when hovered.
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                // 33. If the image link is broken (404), it hides the entire image container automatically.
                                onError={(e) => { (e.target as HTMLElement).parentElement!.style.display = 'none'; }}
                            />
                        )}
                    </div>
                )}

                // 34. The Claim Box container. `flex-1` tells it to fill all the remaining space next to the image.
                <div className="flex-1 bg-[#061528] rounded-xl p-3 sm:p-4 border border-[#1A3352] flex flex-col justify-center">
                    // 35. The label above the claim text.
                    <span className="text-gray-400 font-bold text-xs mb-1 block">
                        // 36. Uses the translation hook. I updated the fallback to "Wetin dem talk:" to match your image.
                        {t('home.claimLabel', 'Wetin dem talk:')}
                    </span>
                    // 37. The actual claim text styling. `line-clamp-3` cuts off the text with an ellipsis (...) if it's too long.
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-3">
                        // 38. Fallback logic: Try to show the claim first, if empty show summary, if empty show content.
                        {report.claim || report.summary || report.content}
                    </p>
                </div>
            </div>

            {/* --- FOOTER ACTIONS --- */}
            // 39. The bottom row container, separated by a thin top border.
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#1A3352]">
                // 40. The "Read Full Story" button on the left.
                <button
                    // 41. Clicking it opens the full report view.
                    onClick={() => onSelect(report.id)}
                    // 42. Teal text styling.
                    className="text-[#1CB5BE] hover:text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                    // 43. Uses the translation hook, updated to match your design.
                    {t('home.readFull', 'Read Full Story →')}
                </button>

                // 44. The Share button on the right.
                <button
                    // 45. Triggers the screenshot/native share function when clicked.
                    onClick={() => onShare(report)}
                    // 46. Disables the button while a screenshot is actively being generated.
                    disabled={isGeneratingCard}
                    // 47. Button styling, with lower opacity if it's disabled.
                    className="text-gray-400 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                    // 48. Conditional rendering based on loading state.
                    {isGeneratingCard ? (
                        // 49. If generating, show a spinning loader icon.
                        <Loader2 className="w-4 h-4 animate-spin text-[#1CB5BE]" />
                    ) : (
                        // 50. If not generating, show the standard Share icon.
                        <Share2 className="w-4 h-4" />
                    )}
                    // 51. The button text.
                    {t('home.shareReport', 'Share This Check')}
                </button>
            </div>
        </article>
    );
};

// ... [Detail View and remaining components identical to previous implementation logic]
const ReportDetailView = ({ report, onBack, onShare, isGeneratingCard }: { report: PublicReport; onBack: () => void; onShare: (report: PublicReport) => void; isGeneratingCard: boolean; }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <button onClick={onBack} className="inline-flex items-center gap-2 text-[#1CB5BE] hover:text-white font-bold text-sm cursor-pointer mb-2">
                <ArrowLeft className="w-4 h-4" /> {t('home.backToFeed', 'Back to Feed')}
            </button>
            <div className="bg-[#0E243F] border border-[#1A3352] p-6 sm:p-8 rounded-2xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {report.verdict && <VerdictBadge verdict={report.verdict} />}
                        <span className="text-xs text-gray-400 font-medium">{report.timestamp}</span>
                    </div>
                    {report.location && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E55322] bg-[#E55322]/10 border border-[#E55322]/20 px-3 py-1 rounded-lg">
                            <MapPin className="w-3.5 h-3.5" /> {report.location}
                        </span>
                    )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{report.title}</h1>
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
                            <strong className="text-gray-400 font-bold text-xs block mb-1">{t('home.claimLabel', 'CLAIM:')}</strong>
                            "{report.claim}"
                        </p>
                    </div>
                )}
                <div className="border-t border-[#1A3352] pt-6">
                    <p className="text-gray-200 leading-relaxed text-base whitespace-pre-wrap">{report.summary || report.content}</p>
                </div>
                <div className="pt-4 border-t border-[#1A3352] flex justify-end">
                    <button onClick={() => onShare(report)} disabled={isGeneratingCard} className="text-gray-400 hover:text-white text-xs font-bold flex items-center gap-2 bg-[#061528] px-4 py-2 rounded-xl border border-[#1A3352] cursor-pointer disabled:opacity-50 transition-colors">
                        {isGeneratingCard ? <Loader2 className="w-4 h-4 animate-spin text-[#1CB5BE]" /> : <Share2 className="w-4 h-4" />}
                        {t('home.shareReport', 'Share Fact-Check')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ShareCardModal = ({ cardUrl, onClose }: { cardUrl: string; onClose: () => void; }) => {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#0E243F] border border-[#1A3352] p-6 rounded-2xl max-w-md w-full space-y-4 text-center shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-bold text-white pt-2">{t('home.generatedCardTitle', 'Fact-Check Card')}</h3>
                <div className="overflow-hidden rounded-xl border border-[#1A3352] bg-[#061528] p-2">
                    <img src={cardUrl} alt="Fact Check Graphic Card" className="w-full h-auto rounded-lg object-contain" />
                </div>
                <div className="flex items-center gap-3 justify-end pt-2">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer">{t('home.close', 'Close')}</button>
                    <a href={cardUrl} target="_blank" rel="noopener noreferrer" download="fact-check-card.png" className="px-4 py-2 bg-[#1CB5BE] text-[#061528] rounded-xl text-xs font-bold hover:bg-[#1CB5BE]/90 transition-colors inline-flex items-center gap-2 cursor-pointer">
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
    const cardRef = useRef<HTMLDivElement>(null);
    const [selectedShareReport, setSelectedShareReport] = useState<PublicReport | null>(null);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(() => {
        if (typeof window !== 'undefined') return new URLSearchParams(window.location.search).get('report');
        return null;
    });

    const [reports, setReports] = useState<PublicReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<Category>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(false);
    const [generatingCardId, setGeneratingCardId] = useState<string | null>(null);
    const [previewCardUrl, setPreviewCardUrl] = useState<string | null>(null);

    const getRelativeTime = useCallback((dateString: string) => {
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
    }, [t]);

    const lang = i18n.language || 'en';

    const formatApiRecord = useCallback((item: any): PublicReport => {
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
            timestamp: item.created_at ? getRelativeTime(item.created_at) : t('time.recently', 'Recently'),
            summary: dbSummary,
            content: item.content || item[`content_${lang}`] || dbSummary,
            rawCreatedAt: item.created_at,
            media_url: item.media_url || item.evidence_file || item.image_url || item.media || item.image || null,
            media_type: item.media_type || (item.video_url ? 'video' : 'image')
        };
    }, [lang, getRelativeTime, t]);

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
        const currentLang = i18n.language || 'en';
        try {
            let data: any;
            if (typeof getDebunkedFeed === 'function') {
                data = await getDebunkedFeed(pageNum);
            } else {
                const res = await fetch(`https://truthguard-api-sut7.onrender.com/api/incidents/feed/debunked/?lang=${currentLang}&page=${pageNum}`);
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
    }, [formatApiRecord, i18n.language, t]);

    useEffect(() => {
        setCurrentPage(1);
        fetchDebunkedFeed(1, false);
    }, [i18n.language, fetchDebunkedFeed]);

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
        <div className="min-h-screen bg-[#061528] text-white py-12 px-4 sm:px-6 lg:px-8 relative">
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
                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{t('home.heroTitle', 'Live Election Fact-Checks')}</h1>
                        </div>
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('home.searchPlaceholder', 'Search verified claims, candidates, or rumors...')} className="w-full bg-[#0E243F] border border-[#1A3352] rounded-xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#1CB5BE] shadow-lg" />
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
                                    <button onClick={() => fetchDebunkedFeed(1, false)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#0E243F] text-[#1CB5BE] rounded-xl text-xs font-bold border border-[#1CB5BE]/30 hover:bg-[#1CB5BE]/10 transition-colors cursor-pointer">
                                        <RefreshCw className="w-4 h-4" /> {t('home.retry', 'Retry')}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {filteredReports.map((report) => (
                                        <ReportCard key={report.id} report={report} onSelect={(id) => handleSelectReport(id)} onShare={handleShareCard} isGeneratingCard={generatingCardId === report.id} />
                                    ))}
                                    {filteredReports.length === 0 && (
                                        <div className="text-center py-12 text-gray-400 border border-dashed border-[#1A3352] rounded-2xl">{t('home.noReports', 'No fact-checks found matching your search.')}</div>
                                    )}
                                </>
                            )}
                        </div>
                        {hasMorePages && (
                            <div className="flex justify-center pt-4">
                                <button onClick={handleLoadMore} disabled={isLoading} className="px-6 py-3 bg-[#0E243F] hover:bg-[#1A3352] text-[#1CB5BE] border border-[#1CB5BE]/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50">
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('home.loadMore', 'Load More Fact-Checks')}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}