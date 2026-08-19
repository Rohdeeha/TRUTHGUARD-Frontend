// src/pages/DashboardPage.tsx

import { useEffect, useState, useCallback } from 'react';
import { getTriageQueue, updateTicketStatus, type DashboardReport } from "../services/api";
import {
    Share2,
    Search,
    Filter,
    Radio,
    Plus,
    Edit3
} from 'lucide-react';
import BroadcastModal from '../components/BroadcastModal';
import { SituationRoomAdminForm, type AdminFormState } from './SituationRoomAdminPage';

export default function DashboardPage() {
    const [reports, setReports] = useState<DashboardReport[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('ALL');
    const [selectedReportForBroadcast, setSelectedReportForBroadcast] = useState<DashboardReport | null>(null);
    const [adminFormModal, setAdminFormModal] = useState<{ isOpen: boolean; data: AdminFormState | null }>({
        isOpen: false,
        data: null,
    });
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    // 1. Synchronize live reports with Django DB
    const loadReports = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getTriageQueue(searchQuery, selectedFilter);
            const results = Array.isArray(data) ? data : data.results || [];
            const count = data.count || results.length;

            setReports(results);
            setTotalCount(count);
        } catch (error) {
            console.error('Error syncing reports from Django API:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedFilter]);

    useEffect(() => {
        loadReports();

        // 15-second polling loop for live telemetry updates
        const intervalId = setInterval(loadReports, 15000);

        return () => {
            clearInterval(intervalId);
        };
    }, [loadReports]);

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
    const debunkedCount = reports.filter((r) => ['FALSE', 'MISLEADING'].includes(r.status || r.verdict || '')).length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-slate-200">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A3352] pb-6">
                <div>
                    <div className="flex items-center gap-2 text-[#1CB5BE] font-bold text-xs uppercase tracking-wider mb-1">
                        <Radio className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-ping' : 'animate-pulse'}`} />
                        <h1 className="text-2xl sm:text-3xl font-black text-white">
                            Situation Room Dashboard
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
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

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setAdminFormModal({ isOpen: true, data: null })}
                        className="bg-[#1CB5BE] hover:bg-[#189ea6] text-[#061528] font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Create Incident
                    </button>
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
                    const reportTitle = report.title || 'Untitled Incident';
                    const reportSummary = report.summary || report.details || report.description || 'No summary provided.';

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
                                    {report.category && (
                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#061528] text-amber-400 border border-[#1A3352]">
                                            {report.category}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-base font-bold text-white">
                                    {reportTitle}
                                </h3>

                                <p className="text-xs text-gray-300">
                                    <strong className="text-white">Summary: </strong>
                                    {reportSummary}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
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
                                    onClick={() => setAdminFormModal({
                                        isOpen: true,
                                        data: {
                                            id: report.id,
                                            title: report.title || '',
                                            claim: report.claim || report.title || '',
                                            description: report.details || report.description || report.summary || '',
                                            category: report.category || 'Disinformation',
                                            status: report.status || report.verdict || 'Pending',
                                            location: report.location || '',
                                            is_eligible: report.is_eligible ?? true,
                                            is_anonymous: report.is_anonymous ?? false,
                                            evidence_file: report.evidence_file || report.media_url || null,
                                            reporter: report.author_name || (typeof report.reporter === 'string' ? report.reporter : (typeof report.reporter === 'number' ? String(report.reporter) : '')),
                                        }
                                    })}
                                    className="bg-[#1A3352] hover:bg-[#22436c] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    Edit
                                </button>

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

            {/* Admin Incident Form Modal */}
            {adminFormModal.isOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <SituationRoomAdminForm
                            initialData={adminFormModal.data}
                            onClose={() => setAdminFormModal({ isOpen: false, data: null })}
                            onSuccess={() => {
                                loadReports();
                                setAdminFormModal({ isOpen: false, data: null });
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Broadcast Modal */}
            {selectedReportForBroadcast && (
                <BroadcastModal
                    report={{
                        id: String(selectedReportForBroadcast.id),
                        title: selectedReportForBroadcast.title || 'Incident Report',
                        claim: selectedReportForBroadcast.claim || selectedReportForBroadcast.title || '',
                        verdict: (selectedReportForBroadcast.status || selectedReportForBroadcast.verdict || 'PENDING') as 'FALSE' | 'MISLEADING' | 'VERIFIED' | 'PENDING',
                        summary: selectedReportForBroadcast.summary || selectedReportForBroadcast.details || '',
                    }}
                    onClose={() => setSelectedReportForBroadcast(null)}
                />
            )}
        </div>
    );
}