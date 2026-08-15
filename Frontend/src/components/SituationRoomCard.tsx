import React from 'react';
import { Clock, MapPin } from 'lucide-react';

interface Report {
    id: string | number;
    title: string;
    details?: string;
    summary?: string;
    status?: string;
    location?: string;
    media_url?: string;
    media_type?: string;
    created_at?: string;
}

export const SituationRoomCard: React.FC<{ report: Report; onClick?: () => void }> = ({ report, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-[#0E243F] border border-[#1A3352] rounded-xl mb-3 hover:border-[#1CB5BE] transition cursor-pointer"
        >
            {/* LEFT: Media Thumbnail */}
            <div className="w-full sm:w-40 h-28 flex-shrink-0 bg-[#061528] rounded-lg overflow-hidden border border-[#1A3352] relative">
                {report.media_url ? (
                    report.media_type === 'video' ? (
                        <video src={report.media_url} className="w-full h-full object-cover" />
                    ) : (
                        <img src={report.media_url} alt={report.title} className="w-full h-full object-cover" />
                    )
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-semibold">
                        No Media
                    </div>
                )}
            </div>

            {/* RIGHT: Content & Metadata */}
            <div className="flex-1 flex flex-col justify-between h-full">
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-white hover:text-[#1CB5BE] transition line-clamp-2">
                        {report.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2">
                        {report.summary || report.details}
                    </p>
                </div>

                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                    {report.location && (
                        <span className="flex items-center gap-1 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-[#E55322]" />
                            {report.location}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};