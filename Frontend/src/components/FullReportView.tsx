import { useState, useEffect } from 'react';
import { ArrowLeft, Share2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

// Define the shape of your report data
interface Report {
    id: string;
    title: string;
    claim: string;
    summary: string; // The full text we want to read
    status: 'TRUE' | 'FALSE' | 'MISLEADING';
    created_at: string;
}

export default function FullReportView({ reportId, onBack }: { reportId: string, onBack: () => void }) {
    const { t } = useTranslation();
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFullReport() {
            try {
                // Fetch the specific report using its ID
                const { data, error } = await supabase
                    .from('reports') // Ensure this matches your table name
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

    if (loading) {
        return <div className="p-8 text-center text-gray-400">{t('home.syncing', 'Loading report details...')}</div>;
    }

    if (!report) return <div className="p-8 text-center text-rose-400">Report not found.</div>;

    // Helper for status colors and icons
    const getStatusUI = (status: string) => {
        switch (status) {
            case 'TRUE': return { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500', icon: CheckCircle };
            case 'FALSE': return { color: 'bg-rose-500/20 text-rose-400 border-rose-500', icon: XCircle };
            case 'MISLEADING': return { color: 'bg-amber-500/20 text-amber-400 border-amber-500', icon: AlertTriangle };
            default: return { color: 'bg-gray-500/20 text-gray-400 border-gray-500', icon: AlertTriangle };
        }
    };

    const StatusIcon = getStatusUI(report.status).icon;

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-20">
            {/* Top Navigation */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-[#1CB5BE] hover:text-white font-bold mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Feed
            </button>

            {/* Report Header */}
            <div className="bg-[#0E243F] border border-[#1A3352] rounded-2xl p-6 mb-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-black mb-4 ${getStatusUI(report.status).color}`}>
                    <StatusIcon className="w-4 h-4" />
                    {report.status}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white mb-4 leading-tight">
                    {report.title}
                </h1>
                <div className="bg-[#061528] p-4 rounded-xl border border-[#1A3352]">
                    <span className="text-[#E55322] font-bold text-sm uppercase tracking-wider">{t('home.claimLabel', 'Claim:')}</span>
                    <p className="text-gray-300 mt-1 italic font-medium">"{report.claim}"</p>
                </div>
            </div>

            {/* Full Summary / Fact Check Analysis */}
            <div className="bg-[#0E243F] border border-[#1A3352] rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4 border-b border-[#1A3352] pb-2">Full Fact-Check Analysis</h2>
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {report.summary}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-[#1A3352] flex justify-end">
                    <button className="flex items-center gap-2 bg-[#1CB5BE]/10 text-[#1CB5BE] hover:bg-[#1CB5BE] hover:text-[#061528] px-4 py-2 rounded-lg font-bold transition-all">
                        <Share2 className="w-4 h-4" />
                        {t('home.shareReport', 'Share Fact-Check')}
                    </button>
                </div>
            </div>
        </div>
    );
}