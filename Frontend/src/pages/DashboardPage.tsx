// src/pages/DashboardPage.tsx

import { useEffect, useState } from 'react';
import { getTriageQueue, updateTicketStatus, type DashboardReport } from "../services/api";
import { useLanguage } from './LanguageContext';
import { useTranslation } from 'react-i18next';
import {
    Share2,
    Search,
    Filter,
    Radio,
    Globe
} from 'lucide-react';
import BroadcastModal from '../components/BroadcastModal';

export default function DashboardPage() {
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();

    const [reports, setReports] = useState<DashboardReport[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('ALL');
    const [selectedReportForBroadcast, setSelectedReportForBroadcast] = useState<DashboardReport | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    // Dynamic translation helper to resolve database language fields safely
    const getLocalizedContent = (report: any, field: 'title' | 'summary', currentLang: string) => {
        if (!report) return '';

        // 1. Check nested object format from DRF: report.translations.yo.title
        if (report.translations && report.translations[currentLang] && report.translations[currentLang][field]) {
            return report.translations[currentLang][field];
        }

        // 2. Check flat field format: report.title_yo
        const flatKey = `${field}_${currentLang}`;
        if (report[flatKey]) {
            return report[flatKey];
        }

        // 3. Fallback to default field value
        return report[field] || '';
    };

    // 1. Synchronize live reports with Django DB via polling
    useEffect(() => {
        let isMounted = true;

        const loadReports = async () => {
            setLoading(true);
            try {
                // Calls getTriageQueue from api.ts
                const data = await getTriageQueue(searchQuery, selectedFilter);

                if (isMounted) {
                    const results = Array.isArray(data) ? data : data.results || [];
                    const count = data.count || results.length;

                    setReports(results);
                    setTotalCount(count);
                }
            } catch (error) {
                console.error('Error syncing reports from Django API:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        // Initial Load
        loadReports();

        // 15-second polling loop for live telemetry updates
        const intervalId = setInterval(loadReports, 15000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [searchQuery, selectedFilter, language]);

    // 2. Patch verdict changes in database
    const handleVerdictChange = async (id: string | number, newVerdict: 'VERIFIED' | 'FALSE' | 'MISLEADING' | 'PENDING') => {
        const previousReports = [...reports];

        // Optimistic UI update
        setReports((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status: newVerdict, verdict: newVerdict } : item))
        );

        try {
            await updateTicketStatus(id, newVerdict);
        } catch (error) {
            console.error('Failed to update ticket status in database:', error);
            // Revert state if backend request fails
            setReports(previousReports);
        }
    };

    // Analytics counters
    const pendingCount = reports.filter((r) => (r.status || r.verdict) === 'PENDING').length;
    const debunkedCount = reports.filter((r) => ['FALSE', 'MISLEADING'].includes(r.status || r.verdict)).length;

    return (
        // Scope text color to text-slate-200 to prevent global cyan inheritance
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-slate-200">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A3352] pb-6">
                <div>
                    <div className="flex items-center gap-2 text-[#1CB5BE] font-bold text-xs uppercase tracking-wider mb-1">
                        <Radio className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-ping' : 'animate-pulse'}`} />
                        <h1 className="text-2xl sm:text-3xl font-black text-white">
                            {t('dashboard.pageTitle', 'Situation Room Dashboard')}
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        {/* Language Selector */}
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
                            Live Reports: {totalCount}
                        </span>
                        <span className="bg-yellow-500 text-[#061528] font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                            Pending: {pendingCount}
                        </span>
                        <span className="bg-emerald-500 text-[#061528] font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                            Debunked: {debunkedCount}
                        </span>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-[#0E243F] border border-[#1A3352] p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search reports..."
                        className="w-full bg-[#061528] border border-[#1A3352] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#1CB5BE]"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#1CB5BE]" />
                    {['ALL', 'PENDING', 'VERIFIED', 'FALSE', 'MISLEADING'].map((statusOption) => (
                        <button
                            key={statusOption}
                            onClick={() => setSelectedFilter(statusOption)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${selectedFilter === statusOption
                                ? 'bg-[#1CB5BE] text-[#061528]'
                                : 'bg-[#061528] text-gray-300 border border-[#1A3352]'
                                }`}
                        >
                            {statusOption}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {reports.map((report) => {
                    const currentStatus = report.status || report.verdict || 'PENDING';
                    return (
                        <div
                            key={report.id}
                            className="bg-[#0E243F] border border-[#1A3352] rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                        >
                            <div className="space-y-2 max-w-3xl">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#061528] text-[#1CB5BE] border border-[#1A3352]">
                                        #{String(report.id).slice(0, 8)}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {report.location || 'Unknown Location'}
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-white">
                                    {getLocalizedContent(report, 'title', language)}
                                </h3>

                                <p className="text-xs text-gray-300">
                                    <strong className="text-white">Summary: </strong>
                                    {getLocalizedContent(report, 'summary', language)}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <select
                                    value={currentStatus}
                                    onChange={(e) => handleVerdictChange(report.id, e.target.value as any)}
                                    className="bg-[#061528] border border-[#1A3352] text-xs font-bold text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="VERIFIED">VERIFIED</option>
                                    <option value="FALSE">FALSE</option>
                                    <option value="MISLEADING">MISLEADING</option>
                                </select>

                                <button
                                    onClick={() => setSelectedReportForBroadcast(report)}
                                    className="bg-[#E55322] hover:bg-[#d44819] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Broadcast
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Broadcast Modal */}
            {selectedReportForBroadcast && (
                <BroadcastModal
                    report={{
                        id: String(selectedReportForBroadcast.id),
                        title: getLocalizedContent(selectedReportForBroadcast, 'title', language),
                        claim: selectedReportForBroadcast.claim || getLocalizedContent(selectedReportForBroadcast, 'title', language),
                        verdict: (selectedReportForBroadcast.status || selectedReportForBroadcast.verdict || 'PENDING') as 'FALSE' | 'MISLEADING' | 'VERIFIED' | 'PENDING',
                        summary: getLocalizedContent(selectedReportForBroadcast, 'summary', language),
                    }}
                    onClose={() => setSelectedReportForBroadcast(null)}
                />
            )}
        </div>
    );
}