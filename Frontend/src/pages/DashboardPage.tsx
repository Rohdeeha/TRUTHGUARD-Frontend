import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Adjust path as needed
import { useLanguage } from './LanguageContext';
import { useTranslation } from 'react-i18next'; // Import language hook
import {
    Shield,
    Share2,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    Clock,
    FileText,
    Radio,
    Globe
} from 'lucide-react';
import BroadcastModal from '../components/BroadcastModal';

export interface DashboardReport {
    id: string;
    title: string;
    claim: string;
    verdict: 'FALSE' | 'MISLEADING' | 'VERIFIED' | 'PENDING';
    category: 'INEC' | 'Election Day' | 'Candidates' | 'Security';
    location: string;
    timestamp?: string;
    created_at?: string;
    summary: string;
    broadcasted?: boolean;
}

export default function DashboardPage() {
    // 1. LANGUAGE HOOK
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();

    // 2. STATE MANAGEMENT
    const [reports, setReports] = useState<DashboardReport[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
    const [selectedReportForBroadcast, setSelectedReportForBroadcast] = useState<DashboardReport | null>(null);

    // Pagination State
    const [totalCount, setTotalCount] = useState<number>(0);
    const [visibleCount, setVisibleCount] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(false);

    // 3. SUPABASE FETCH LOGIC
    const fetchReports = async (limit: number) => {
        setLoading(true);

        const { count, error: countError } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true });

        if (!countError && count !== null) {
            setTotalCount(count);
        }

        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false })
            .range(0, limit - 1);

        if (!error && data) {
            setReports(data as DashboardReport[]);
        } else if (error) {
            console.error('Error fetching reports:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReports(visibleCount);
    }, [visibleCount]);

    const handleLoadMore = () => {
        setVisibleCount((prevCount) => prevCount + 10);
    };

    // 4. DATABASE UPDATE LOGIC
    const handleVerdictChange = async (id: string, newVerdict: DashboardReport['verdict']) => {
        setReports((prev) =>
            prev.map((item) => (item.id === id ? { ...item, verdict: newVerdict } : item))
        );

        const { error } = await supabase
            .from('reports')
            .update({ verdict: newVerdict })
            .eq('id', id);

        if (error) {
            console.error('Failed to update verdict in database:', error);
        }
    };

    // 5. FILTERING & SEARCH LOGIC
    const filteredReports = reports.filter((item) => {
        const matchesSearch =
            (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.claim && item.claim.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesFilter =
            selectedFilter === 'ALL' ||
            (selectedFilter === 'PENDING' && item.verdict === 'PENDING') ||
            (selectedFilter === 'VERIFIED' && item.verdict !== 'PENDING');

        return matchesSearch && matchesFilter;
    });

    // 6. ANALYTICS COUNTERS
    const pendingCount = reports.filter((r) => r.verdict === 'PENDING').length;
    const debunkedCount = reports.filter((r) => r.verdict === 'FALSE' || r.verdict === 'MISLEADING').length;
    const broadcastedCount = reports.filter((r) => r.broadcasted).length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

            {/* Control Room Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A3352] pb-6">
                <div>
                    <div className="flex items-center gap-2 text-[#1CB5BE] font-bold text-xs uppercase tracking-wider mb-1">
                        <Radio className="w-4 h-4 animate-pulse text-emerald-400" />
                        <span>{t('dashboard.controlPanel', 'Control Panel')}</span>                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white">
                        {t('dashboard.pageTitle', 'Situation Room Dashboard')}
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Language Switcher Selector (English, Yorùbá, Pidgin) */}
                    <div className="flex items-center bg-[#061528] border border-[#1A3352] rounded-xl px-3 py-1.5 gap-2">
                        <Globe className="w-4 h-4 text-[#1CB5BE]" />
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                        >
                            <option value="en" className="bg-[#061528] text-white">English</option>
                            <option value="yo" className="bg-[#061528] text-white">Yorùbá</option>
                            <option value="pcm" className="bg-[#061528] text-white">Pidgin</option>
                        </select>
                    </div>

                    <span className="bg-[#1CB5BE] text-[#061528] font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        {t('dashboard.activeDbReports', 'Active DB Reports')}: {totalCount}
                    </span>

                    <span className="bg-[#061528] border border-[#1A3352] text-gray-300 text-xs px-3 py-2 rounded-xl flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#1CB5BE]" />
                        {t('dashboard.liveSyncing', 'Live Syncing...')}
                    </span>
                </div>
            </div>

            {/* Analytics KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0E243F] border border-[#1A3352] p-4 rounded-2xl flex items-center justify-between shadow-lg">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">{t('dashboard.totalReports', 'Total Reports')}</p>
                        <h3 className="text-2xl font-black text-white mt-1">{totalCount}</h3>
                    </div>
                    <div className="p-3 bg-[#061528] rounded-xl text-[#1CB5BE]">
                        <FileText className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-[#0E243F] border border-[#1A3352] p-4 rounded-2xl flex items-center justify-between shadow-lg">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">{t('dashboard.pendingVerification', 'Pending Verification')}</p>
                        <h3 className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</h3>
                    </div>
                    <div className="p-3 bg-[#061528] rounded-xl text-amber-400">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-[#0E243F] border border-[#1A3352] p-4 rounded-2xl flex items-center justify-between shadow-lg">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">{t('dashboard.debunkedClaims', 'Debunked Claims')}</p>
                        <h3 className="text-2xl font-black text-rose-400 mt-1">{debunkedCount}</h3>
                    </div>
                    <div className="p-3 bg-[#061528] rounded-xl text-rose-400">
                        <Shield className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-[#0E243F] border border-[#1A3352] p-4 rounded-2xl flex items-center justify-between shadow-lg">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">{t('dashboard.multiBroadcasted', 'Multi-Broadcasted')}</p>
                        <h3 className="text-2xl font-black text-emerald-400 mt-1">{broadcastedCount}</h3>
                    </div>
                    <div className="p-3 bg-[#061528] rounded-xl text-emerald-400">
                        <Share2 className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Search & Status Filters */}
            <div className="bg-[#0E243F] border border-[#1A3352] p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('dashboard.searchPlaceholder', 'Search reports...')}
                        className="w-full bg-[#061528] border border-[#1A3352] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#1CB5BE] placeholder-gray-500"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
                    <Filter className="w-4 h-4 text-[#1CB5BE] shrink-0" />
                    {[
                        { id: 'ALL', label: t('dashboard.filterAll', 'ALL') },
                        { id: 'PENDING', label: t('dashboard.filterPending', 'PENDING') },
                        { id: 'VERIFIED', label: t('dashboard.filterVerified', 'VERIFIED') },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedFilter(tab.id)}
                            className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${selectedFilter === tab.id
                                ? 'bg-[#1CB5BE] text-[#061528]'
                                : 'bg-[#061528] text-gray-300 border border-[#1A3352] hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {filteredReports.map((report) => (
                    <div
                        key={report.id}
                        className="bg-[#0E243F] border border-[#1A3352] rounded-2xl p-5 hover:border-[#1CB5BE]/40 transition-all shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                        {/* Details */}
                        <div className="space-y-2 max-w-3xl">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#061528] text-[#1CB5BE] border border-[#1A3352]">
                                    #{report.id.slice(0, 8)} • {report.category}
                                </span>

                                <span className="text-xs text-gray-400 font-medium">
                                    {report.location} • {report.timestamp || new Date(report.created_at || '').toLocaleTimeString()}
                                </span>

                                {/* Status Indicators (Localized) */}
                                {report.verdict === 'FALSE' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                        <XCircle className="w-3 h-3" /> {t('dashboard.verdictFalse', 'FALSE')}
                                    </span>
                                )}
                                {report.verdict === 'MISLEADING' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-[#E55322]/20 text-[#E55322] border border-[#E55322]/30">
                                        <AlertTriangle className="w-3 h-3" /> {t('dashboard.verdictMisleading', 'MISLEADING')}
                                    </span>
                                )}
                                {report.verdict === 'VERIFIED' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        <CheckCircle2 className="w-3 h-3" /> {t('dashboard.verdictVerified', 'VERIFIED')}
                                    </span>
                                )}
                                {report.verdict === 'PENDING' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                        <Clock className="w-3 h-3" /> {t('dashboard.verdictPending', 'PENDING')}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-base font-bold text-white leading-snug">
                                {report[`title_${language}` as keyof DashboardReport] || (t(`dynamic.${report.id}.title`) !== `dynamic.${report.id}.title` ? t(`dynamic.${report.id}.title`) : report.title)}
                            </h3>

                            <p className="text-xs text-gray-300">
                                <strong className="text-gray-400">{t('dashboard.summaryPrefix', 'Summary:')}</strong> {report[`summary_${language}` as keyof DashboardReport] || (t(`dynamic.${report.id}.summary`) !== `dynamic.${report.id}.summary` ? t(`dynamic.${report.id}.summary`) : report.summary)}
                            </p>
                        </div>

                        {/* Verdict & Actions */}
                        <div className="flex flex-wrap lg:flex-col items-end justify-between gap-3 border-t lg:border-t-0 border-[#1A3352] pt-4 lg:pt-0 shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-gray-400 uppercase">{t('dashboard.verdictLabel', 'Verdict')}</span>
                                <select
                                    value={report.verdict}
                                    onChange={(e) => handleVerdictChange(report.id, e.target.value as DashboardReport['verdict'])}
                                    className="bg-[#061528] border border-[#1A3352] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#1CB5BE] font-bold cursor-pointer"
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="FALSE">FALSE</option>
                                    <option value="MISLEADING">MISLEADING</option>
                                    <option value="VERIFIED">VERIFIED</option>
                                </select>
                            </div>

                            <button
                                onClick={() => setSelectedReportForBroadcast(report)}
                                disabled={report.verdict === 'PENDING'}
                                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md ${report.verdict === 'PENDING'
                                    ? 'bg-[#061528] text-gray-500 border border-[#1A3352] cursor-not-allowed'
                                    : 'bg-[#E55322] hover:bg-[#d44819] text-white'
                                    }`}
                            >
                                <Share2 className="w-4 h-4" />
                                <span>{t('dashboard.broadcastBtn', 'Broadcast')}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More Button Section */}
            {visibleCount < totalCount && (
                <div className="mt-8 flex justify-center pb-8">
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="bg-[#0E243F] border border-[#1CB5BE]/50 hover:bg-[#1A3352] text-[#1CB5BE] px-8 py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Clock className="w-4 h-4 animate-spin" />
                                {t('dashboard.loadingText', 'Loading...')}
                            </>
                        ) : (
                            t('dashboard.loadMore', 'Load More')
                        )}
                    </button>
                </div>
            )}

            {visibleCount >= totalCount && totalCount > 0 && (
                <div className="mt-8 text-center text-gray-500 text-xs font-bold uppercase tracking-wider pb-8">
                    {t('dashboard.allLoadedText', 'All reports loaded')}
                </div>
            )}

            {/* Broadcast Modal */}
            {selectedReportForBroadcast && (
                <BroadcastModal
                    report={selectedReportForBroadcast}
                    onClose={() => {
                        setReports((prev) =>
                            prev.map((item) =>
                                item.id === selectedReportForBroadcast.id ? { ...item, broadcasted: true } : item
                            )
                        );
                        setSelectedReportForBroadcast(null);
                    }}
                />
            )}
        </div>
    );
}