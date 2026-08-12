import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    X
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export interface PublicReport {
    id: string;
    title: string;
    claim: string;
    verdict: 'FALSE' | 'MISLEADING' | 'VERIFIED' | 'PENDING';
    category: 'VOTER_SUPPRESSION' | 'DISINFORMATION' | 'TFGBV' | 'LOGISTICS_FAILURE' | 'VIOLENCE' | 'INEC'; location: string;
    timestamp: string;
    summary: string;
}

const ITEMS_PER_PAGE = 10;

export default function HomePage() {
    const { t, i18n } = useTranslation();
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [reports, setReports] = useState<PublicReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<string>('ALL');
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    // Card Generation States
    const [generatingCardId, setGeneratingCardId] = useState<string | null>(null);
    const [previewCardUrl, setPreviewCardUrl] = useState<string | null>(null);

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return t('time.justNow', 'Just now');
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} ${t('time.minsAgo', 'mins ago')}`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} ${t('time.hoursAgo', 'hours ago')}`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} ${t('time.daysAgo', 'days ago')}`;
    };

    useEffect(() => {
        const fetchLiveReports = async () => {
            setIsLoading(true);

            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .neq('verdict', 'PENDING')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching reports:', error);
            } else if (data) {
                const lang = i18n.language; // 'en', 'pcm', or 'yo'

                const formattedData: PublicReport[] = data.map((item) => {
                    const dbTitle = item[`title_${lang}`];
                    const dbClaim = item[`claim_${lang}`];
                    const dbSummary = item[`summary_${lang}`];

                    return {
                        id: item.id,
                        title: dbTitle || item.title,
                        claim: dbClaim || item.claim,
                        verdict: item.verdict,
                        category: item.category,
                        location: item.location,
                        timestamp: item.created_at ? getRelativeTime(item.created_at) : t('time.recently', 'Recently'),
                        summary: dbSummary || item.summary
                    };
                });

                setReports(formattedData);
            }

            setIsLoading(false);
        };

        fetchLiveReports();
    }, [t, i18n.language]);

    const handleShareCard = async (report: PublicReport) => {
        try {
            setGeneratingCardId(report.id);

            const response = await fetch('/api/incidents/generate-card/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    claim: report.claim,
                    fact: report.summary
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate card');
            }

            const data = await response.json();
            if (data.card_url) {
                setPreviewCardUrl(data.card_url);
            }
        } catch (error) {
            console.error('Error generating card:', error);
        } finally {
            setGeneratingCardId(null);
        }
    };

    const selectedReport = useMemo(() => {
        return reports.find((r) => r.id === selectedReportId);
    }, [reports, selectedReportId]);

    const filteredReports = useMemo(() => {
        return reports.filter((report) => {
            const matchesSearch =
                report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.claim.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesFilter =
                activeFilter === 'ALL' || report.category === activeFilter;

            return matchesSearch && matchesFilter;
        });
    }, [reports, searchQuery, activeFilter]);

    const renderVerdictBadge = (verdict: string) => {
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

    return (
        <div className="min-h-screen bg-[#061528] text-white py-12 px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-4xl mx-auto space-y-10">

                {selectedReportId && selectedReport ? (
                    <div className="space-y-6">
                        <button
                            onClick={() => setSelectedReportId(null)}
                            className="inline-flex items-center gap-2 text-[#1CB5BE] hover:text-white font-bold text-sm cursor-pointer mb-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t('home.backToFeed', 'Back to Feed')}
                        </button>

                        <div className="bg-[#0E243F] border border-[#1A3352] p-6 sm:p-8 rounded-2xl space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                {renderVerdictBadge(selectedReport.verdict)}
                                <span className="text-xs text-gray-400 font-medium">
                                    {selectedReport.timestamp} • {selectedReport.location}
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                                {selectedReport.title}
                            </h1>

                            <div className="bg-[#061528] rounded-xl p-4 border border-[#1A3352]">
                                <p className="text-sm text-gray-300">
                                    <strong className="text-[#E55322] uppercase text-xs tracking-wider block mb-1">
                                        {t('home.claimLabel', 'WETIN DEM TALK: ')}
                                    </strong>
                                    "{selectedReport.claim}"
                                </p>
                            </div>

                            <div className="border-t border-[#1A3352] pt-6">
                                <p className="text-gray-200 leading-relaxed text-base whitespace-pre-wrap">
                                    {selectedReport.summary}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-[#1A3352] flex justify-end">
                                <button
                                    onClick={() => handleShareCard(selectedReport)}
                                    disabled={generatingCardId === selectedReport.id}
                                    className="text-gray-400 hover:text-white text-xs font-bold flex items-center gap-2 bg-[#061528] px-4 py-2 rounded-xl border border-[#1A3352] cursor-pointer disabled:opacity-50 transition-colors"
                                >
                                    {generatingCardId === selectedReport.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-[#1CB5BE]" />
                                    ) : (
                                        <Share2 className="w-4 h-4" />
                                    )}
                                    {t('home.shareReport', 'Share This Check')}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                {t('home.heroTitle', 'Live Election Fact-Checks')}
                            </h1>
                            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                                {t('home.heroSubtitle', 'Real-time news check, fake story debunk, and official info for Osun 2026.')}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setVisibleCount(ITEMS_PER_PAGE);
                                    }}
                                    placeholder={t('home.searchPlaceholder', 'Search news, candidate name, or fake story...')}
                                    className="w-full bg-[#0E243F] border border-[#1A3352] rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-[#1CB5BE] placeholder-gray-500 shadow-lg"
                                />
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                <Filter className="w-4 h-4 text-[#1CB5BE] shrink-0 mr-2" />
                                {[
                                    { id: 'ALL', label: t('home.filterAll', 'All Fact-Checks') },
                                    { id: 'VOTER_SUPPRESSION', label: t('home.filterVoterSuppression', 'Voter Suppression') },
                                    { id: 'DISINFORMATION', label: t('home.filterDisinformation', 'Disinformation / Fake News') },
                                    { id: 'TFGBV', label: t('home.filterTFGBV', 'TFGBV') },
                                    { id: 'LOGISTICS_FAILURE', label: t('home.filterLogistics', 'Logistics Failure') },
                                    { id: 'VIOLENCE', label: t('home.filterViolence', 'Violence / Intimidation') },
                                    { id: 'INEC', label: t('home.filterINEC', 'INEC / Voting Info') }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveFilter(tab.id);
                                            setVisibleCount(ITEMS_PER_PAGE);
                                        }}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeFilter === tab.id
                                            ? 'bg-[#1CB5BE] text-[#061528]'
                                            : 'bg-[#0E243F] text-gray-300 border border-[#1A3352] hover:text-white'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-[#1CB5BE]">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                </div>
                            ) : (
                                <>
                                    {filteredReports.slice(0, visibleCount).map((report) => (
                                        <article
                                            key={report.id}
                                            className="bg-[#0E243F] border border-[#1A3352] p-6 rounded-2xl shadow-xl hover:border-[#1CB5BE]/50 transition-colors"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                                <div className="space-y-3">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        {renderVerdictBadge(report.verdict)}
                                                        <span className="text-xs text-gray-400 font-medium">
                                                            {report.timestamp} • {report.location}
                                                        </span>
                                                    </div>
                                                    <h2 className="text-xl font-bold text-white leading-snug">
                                                        {report.title}
                                                    </h2>
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
                                                    onClick={() => setSelectedReportId(report.id)}
                                                    className="text-[#1CB5BE] hover:text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                                >
                                                    {t('home.readFull', 'Read Full Story')}
                                                </button>
                                                <button
                                                    onClick={() => handleShareCard(report)}
                                                    disabled={generatingCardId === report.id}
                                                    className="text-gray-400 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    {generatingCardId === report.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin text-[#1CB5BE]" />
                                                    ) : (
                                                        <Share2 className="w-4 h-4" />
                                                    )}
                                                    {t('home.shareReport', 'Share This Check')}
                                                </button>
                                            </div>
                                        </article>
                                    ))}

                                    {!isLoading && filteredReports.length === 0 && (
                                        <div className="text-center py-12 text-gray-400 border border-dashed border-[#1A3352] rounded-2xl">
                                            {t('home.noReports', 'No story match wetin you dey find.')}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {!isLoading && visibleCount < filteredReports.length && (
                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#0E243F] border border-[#1CB5BE]/30 text-[#1CB5BE] hover:bg-[#1CB5BE]/10 rounded-xl font-bold text-sm transition-all cursor-pointer"
                                >
                                    {t('home.loadMore', 'Load More Story')} <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}

            </div>

            {/* Generated Fact Card Preview Modal */}
            {previewCardUrl && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#0E243F] border border-[#1A3352] p-6 rounded-2xl max-w-md w-full space-y-4 text-center shadow-2xl relative">
                        <button
                            onClick={() => setPreviewCardUrl(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-lg font-bold text-white pt-2">
                            {t('home.generatedCardTitle', 'Fact-Check Card')}
                        </h3>

                        <div className="overflow-hidden rounded-xl border border-[#1A3352] bg-[#061528] p-2">
                            <img
                                src={previewCardUrl}
                                alt="Fact Check Graphic Card"
                                className="w-full h-auto rounded-lg object-contain"
                            />
                        </div>

                        <div className="flex items-center gap-3 justify-end pt-2">
                            <button
                                onClick={() => setPreviewCardUrl(null)}
                                className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
                            >
                                {t('home.close', 'Close')}
                            </button>
                            <a
                                href={previewCardUrl}
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
            )}
        </div>
    );
}
