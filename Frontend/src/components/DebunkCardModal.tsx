import { useRef, useState } from 'react';
import { ShieldCheck, Download, Share2, X, CheckCircle2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';

export interface DebunkItem {
    id: string;
    claim: string;
    verdict: 'FALSE' | 'MISLEADING' | 'TRUE' | 'UNVERIFIED';
    explanation: string;
    category: string;
    date: string;
    sourceUrl?: string;
}

interface DebunkCardModalProps {
    debunk: DebunkItem | null;
    onClose: () => void;
}

export default function DebunkCardModal({ debunk, onClose }: DebunkCardModalProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!debunk) return null;

    const downloadImage = async () => {
        if (!cardRef.current) return;
        setIsDownloading(true);

        try {
            const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `TruthGuard-Debunk-${debunk.id}.png`;
            link.href = dataUrl;
            link.click();
            toast.success('Debunk Card image downloaded successfully!');
        } catch (err) {
            console.error('Failed to generate image:', err);
            toast.error('Could not generate debunk card image.');
        } finally {
            setIsDownloading(false);
        }
    };

    const getVerdictBadge = (verdict: DebunkItem['verdict']) => {
        switch (verdict) {
            case 'FALSE':
                return { bg: 'bg-rose-600', text: 'text-white', label: 'FAKE NEWS / DEBUNKED' };
            case 'MISLEADING':
                return { bg: 'bg-amber-500', text: 'text-slate-950', label: 'MISLEADING CONTENT' };
            case 'TRUE':
                return { bg: 'bg-emerald-600', text: 'text-white', label: 'VERIFIED TRUE' };
            default:
                return { bg: 'bg-gray-600', text: 'text-white', label: 'UNVERIFIED CLAIM' };
        }
    };

    const verdictStyle = getVerdictBadge(debunk.verdict);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-card-theme border border-theme rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-muted-theme hover:text-main-theme bg-subcard-theme rounded-full transition-colors cursor-pointer border border-theme"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-[#00B8C4]" />
                    <h2 className="text-lg font-bold text-main-theme">Shareable Fact-Check Card</h2>
                </div>

                {/* Printable Canvas Card Area */}
                <div
                    ref={cardRef}
                    className="bg-[#071D38] border-2 border-[#00B8C4] rounded-2xl p-6 text-white space-y-5 shadow-2xl relative overflow-hidden"
                >
                    {/* Header Branding */}
                    <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-[#0B131D] border-2 border-[#00B8C4] rounded-lg flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-[#00B8C4]" />
                            </div>
                            <div>
                                <span className="text-sm font-black tracking-wider text-[#00B8C4]">
                                    TRUTH<span className="text-white">GUARD</span>
                                </span>
                                <span className="text-[8px] block text-slate-400 font-bold uppercase tracking-widest -mt-0.5">
                                    #OsunDecides2026 Fact Check
                                </span>
                            </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-300 font-bold bg-[#0E243F] px-2 py-1 rounded border border-gray-800">
                            {debunk.date}
                        </span>
                    </div>

                    {/* Verdict Banner */}
                    <div className={`py-2 px-4 rounded-xl text-center font-black text-sm tracking-wider uppercase shadow-md ${verdictStyle.bg} ${verdictStyle.text}`}>
                        VERDICT: {verdictStyle.label}
                    </div>

                    {/* Claim Box */}
                    <div className="bg-card-theme p-4 rounded-xl border border-gray-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-[#E05A2B] tracking-wide block">
                            Claim Circulating Online:
                        </span>
                        <p className="text-xs sm:text-sm font-medium italic text-gray-200 leading-relaxed">
                            "{debunk.claim}"
                        </p>
                    </div>

                    {/* Explanation Box */}
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase text-[#00B8C4] tracking-wide block flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Investigation Findings:
                        </span>
                        <p className="text-xs text-gray-300 leading-relaxed bg-card-theme/50 p-3 rounded-lg border border-gray-800/80">
                            {debunk.explanation}
                        </p>
                    </div>

                    {/* Watermark Footer */}
                    <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-[9px] text-muted-theme font-semibold">
                        <span>Verified by FactCheck Africa / BallotEyes</span>
                        <span>truthguard.org · Osun 2026</span>
                    </div>
                </div>

                {/* Action Controls */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={downloadImage}
                        disabled={isDownloading}
                        className="flex-1 py-3 bg-[#00B8C4] hover:bg-teal-400 disabled:opacity-50 text-[#071D38] font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                        <Download className="w-4 h-4" />
                        {isDownloading ? 'Generating High-Res PNG...' : 'Download Shareable Card (PNG)'}
                    </button>
                </div>
            </div>
        </div>
    );
}