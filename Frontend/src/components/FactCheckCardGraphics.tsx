import { forwardRef } from 'react';
import type { PublicReport } from '../pages/Homepage';

interface Props {
    report: PublicReport;
}

export const FactCheckCardGraphic = forwardRef<HTMLDivElement, Props>(
    ({ report }, ref) => {
        return (
            <div className="fixed -left-[9999px] top-0">
                <div
                    ref={ref}
                    className="w-[1200px] h-[630px] bg-[#061528] p-12 flex flex-col justify-between border-4 border-[#1CB5BE] text-main-white font-sans"
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

                    {/* Claim Section */}
                    <div className="space-y-3">
                        <span className="text-xs font-bold text-[#E55322] uppercase tracking-widest">
                            CLAIM UNDER REVIEW
                        </span>
                        <p className="text-2xl font-semibold text-gray-200 leading-snug">
                            "{report.claim}"
                        </p>
                    </div>

                    {/* Verdict & Summary Box */}
                    <div className="bg-card-theme border border-theme p-6 rounded-2xl space-y-2">
                        <span className="text-xs font-bold text-[#1CB5BE] uppercase tracking-widest">
                            VERIFIED FINDING
                        </span>
                        <p className="text-lg text-gray-300 line-clamp-4 leading-relaxed">
                            {report.summary}
                        </p>
                    </div>

                    {/* Footer Branding */}
                    <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-theme">
                        <span>TruthGuard Election Monitoring Platform</span>
                        <span>truthguard.org</span>
                    </div>
                </div>
            </div>
        );
    }
);

FactCheckCardGraphic.displayName = 'FactCheckCardGraphic';