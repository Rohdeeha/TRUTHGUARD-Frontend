import React from 'react';
import { Clock, MapPin, User } from 'lucide-react';

// 1. Updated Report Interface (Contract aligning with Django backend)
export interface Report {
    id: string | number;
    title: string;
    claim?: string;
    details?: string;
    summary?: string;
    description?: string;
    category?: string;
    status?: string;
    location?: string;
    media_url?: string;
    media_type?: string;
    evidence_file?: string | null;
    created_at?: string;
    // Milestone 1: Author & Metadata fields
    reporter?: string | number;
    author_name?: string;
    is_anonymous?: boolean;
    is_eligible?: boolean;
}

export const SituationRoomCard: React.FC<{ report: Report; onClick?: () => void }> = ({ report, onClick }) => {
    // Determine reporter display name based on backend contract
    const getReporterName = () => {
        if (report.is_anonymous) return 'Anonymous Reporter';
        if (report.author_name) return report.author_name;
        if (typeof report.reporter === 'string') return report.reporter;
        if (typeof report.reporter === 'number') return `Reporter #${report.reporter}`;
        return 'Verified Contributor';
    };

    return (
        <div
            onClick={onClick}
            className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-card-theme border border-theme rounded-xl mb-3 hover:border-[#1CB5BE] transition cursor-pointer"
        >
            {/* LEFT: Media Thumbnail */}
            <div className="w-full sm:w-40 h-28 flex-shrink-0 bg-subcard-theme rounded-lg overflow-hidden border border-theme relative">
                {report.media_url || report.evidence_file ? (
                    report.media_type === 'video' ? (
                        <video src={report.media_url || report.evidence_file || ''} className="w-full h-full object-cover" />
                    ) : (
                        <img src={report.media_url || report.evidence_file || ''} alt={report.title} className="w-full h-full object-cover" />
                    )
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-theme font-semibold">
                        No Media
                    </div>
                )}
            </div>

            {/* RIGHT: Content & Metadata */}
            <div className="flex-1 flex flex-col justify-between h-full w-full">
                <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-base sm:text-lg font-bold text-main-theme hover:text-[#1CB5BE] transition line-clamp-2">
                            {report.title}
                        </h3>
                        {report.category && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-subcard-theme text-[#1CB5BE] border border-theme shrink-0">
                                {report.category}
                            </span>
                        )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-theme mt-1 line-clamp-2">
                        {report.summary || report.claim || report.description || report.details}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-theme border-t border-theme/50 pt-2">
                    {/* Reporter / Author Badge */}
                    <span className="flex items-center gap-1.5 font-medium text-[#1CB5BE]">
                        <User className="w-3.5 h-3.5 text-[#1CB5BE]" />
                        {getReporterName()}
                    </span>

                    {/* Timestamp */}
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-muted-theme" />
                        {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'Recent'}
                    </span>

                    {/* Location */}
                    {report.location && (
                        <span className="flex items-center gap-1 text-muted-theme">
                            <MapPin className="w-3.5 h-3.5 text-[#E05A2B]" />
                            {report.location}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};