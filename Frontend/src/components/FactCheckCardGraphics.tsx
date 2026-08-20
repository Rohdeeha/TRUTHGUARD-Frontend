import { forwardRef } from 'react';
import type { PublicReport } from '../pages/Homepage';

// Ensure your PublicReport type in Homepage.tsx includes:
// image_url?: string;
// status?: 'NEW' | 'INVESTIGATING' | 'VERIFIED' | 'FALSE' | 'DISMISSED';

interface Props {
    report: PublicReport;
}

export const FactCheckCardGraphic = forwardRef<HTMLDivElement, Props>(
    ({ report }, ref) => {
        return (
            <div className="fixed -left-[9999px] top-0">
                <div
                    ref={ref}
                    // 1. Replaced hardcoded dark backgrounds with your dynamic semantic classes
                    className="w-[1200px] h-[630px] bg-app p-12 flex flex-col justify-between border-4 border-[#1CB5BE] text-main-theme font-sans"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-theme pb-6">
                        <h1 className="text-3xl font-black text-[#1CB5BE] tracking-wider">
                            TRUTHGUARD FACT-CHECK
                        </h1>
                        <span className="text-lg font-bold text-muted-theme">
                            {report.location} • {report.timestamp}
                        </span>
                    </div>

                    {/* Main Content Area (Split Layout) */}
                    <div className="flex gap-10 h-full py-8 min-h-0">

                        {/* Left Column: Text Data */}
                        <div className="flex-1 flex flex-col justify-center space-y-8">
                            <div className="space-y-3">
                                {/* Used your brand coral color variable for the claim tag */}
                                <span className="text-sm font-black text-[#E05A2B] uppercase tracking-widest">
                                    CLAIM UNDER REVIEW
                                </span>
                                <p className="text-3xl font-bold leading-snug line-clamp-3">
                                    "{report.claim}"
                                </p>
                            </div>

                            <div className="bg-subcard-theme border border-theme p-6 rounded-2xl space-y-2 shadow-sm">
                                <span className="text-sm font-black text-[#1CB5BE] uppercase tracking-widest">
                                    VERIFIED FINDING
                                </span>
                                <p className="text-xl text-muted-theme line-clamp-4 leading-relaxed font-medium">
                                    {report.summary}
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Evidence Image & Dynamic CSS Stamp */}
                        {report.image_url && (
                            <div className="w-[450px] relative rounded-2xl overflow-hidden border-2 border-theme bg-subcard-theme shrink-0 shadow-lg">
                                <img
                                    src={report.image_url}
                                    alt="Evidence"
                                    className="w-full h-full object-cover"
                                />

                                {/* The FALSE Stamp Overlay */}
                                {report.status === 'FALSE' && (
                                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px] flex items-center justify-center z-10">
                                        <div className="border-8 border-rose-600 text-rose-500 bg-[#0B131D]/90 font-black text-6xl uppercase tracking-[0.2em] px-8 py-4 rounded-2xl -rotate-12 shadow-2xl">
                                            FALSE
                                        </div>
                                    </div>
                                )}

                                {/* The VERIFIED Stamp Overlay */}
                                {report.status === 'VERIFIED' && (
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                                        <div className="border-8 border-emerald-500 text-emerald-400 bg-[#0B131D]/90 font-black text-6xl uppercase tracking-[0.2em] px-8 py-4 rounded-2xl -rotate-12 shadow-2xl">
                                            VERIFIED
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Branding */}
                    <div className="flex justify-between items-center text-lg font-semibold text-muted-theme pt-6 border-t border-theme">
                        <span>TruthGuard Election Monitoring Platform</span>
                        <span>truthguard.org</span>
                    </div>
                </div>
            </div>
        );
    }
);

FactCheckCardGraphic.displayName = 'FactCheckCardGraphic';