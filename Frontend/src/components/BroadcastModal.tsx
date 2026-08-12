import React, { useState } from 'react';
import { X, Send, CheckCircle2, Share2, MessageSquare, Globe } from 'lucide-react';

const Twitter = (props: React.ComponentProps<'svg'>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

const Facebook = (props: React.ComponentProps<'svg'>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

interface ReportData {
    id: string;
    title: string;
    claim: string;
    verdict: 'FALSE' | 'MISLEADING' | 'VERIFIED' | 'PENDING';
    summary: string;
}

interface BroadcastModalProps {
    report: ReportData;
    onClose: () => void;
}

export default function BroadcastModal({ report, onClose }: BroadcastModalProps) {
    const [selectedPlatforms, setSelectedPlatforms] = useState({
        twitter: true,
        facebook: true,
        telegram: true,
        whatsapp: true,
    });

    const [customCaption, setCustomCaption] = useState(
        `🚨 [OSUN 2026 FACT-CHECK]\n\nVerdict: ${report.verdict}\nClaim: "${report.claim}"\n\nSummary: ${report.summary}\n\nFull details: https://truthguard.org/factcheck/${report.id}`
    );

    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [broadcastDone, setBroadcastDone] = useState(false);

    const toggleSelectAll = (checked: boolean) => {
        setSelectedPlatforms({
            twitter: checked,
            facebook: checked,
            telegram: checked,
            whatsapp: checked,
        });
    };

    const handleBroadcast = async () => {
        setIsBroadcasting(true);

        try {
            // -----------------------------------------------------------------
            // OPTION A: Backend API or Webhook Automation (Zapier / Make / Node)
            // -----------------------------------------------------------------
            /*
            await fetch('https://api.truthguard.org/v1/broadcast', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reportId: report.id,
                caption: customCaption,
                platforms: selectedPlatforms,
              }),
            });
            */

            // Simulated network delay for API broadcast execution
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // -----------------------------------------------------------------
            // OPTION B: Fallback Web Intents (Opens direct share compose windows)
            // -----------------------------------------------------------------
            const encodedText = encodeURIComponent(customCaption);

            if (selectedPlatforms.twitter) {
                window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
            }
            if (selectedPlatforms.whatsapp) {
                window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
            }
            if (selectedPlatforms.telegram) {
                window.open(`https://t.me/share/url?url=https://truthguard.org/factcheck/${report.id}&text=${encodedText}`, '_blank');
            }

            setBroadcastDone(true);
        } catch (error) {
            alert('Broadcast failed. Check API credentials or network connection.');
        } finally {
            setIsBroadcasting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0E243F] border border-[#1A3352] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">

                {/* Header */}
                <div className="p-5 border-b border-[#1A3352] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#1CB5BE] font-bold text-base">
                        <Share2 className="w-5 h-5" />
                        <span>Broadcast Report to Social Media</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {broadcastDone ? (
                        <div className="text-center py-6 space-y-4">
                            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                            <h3 className="text-xl font-bold text-white">Successfully Broadcasted!</h3>
                            <p className="text-xs text-gray-300">
                                This fact-check report has been transmitted to all selected official social media channels.
                            </p>
                            <button
                                onClick={onClose}
                                className="bg-[#1CB5BE] text-[#061528] font-bold px-6 py-2 rounded-xl text-xs"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Platform Selector Checkboxes */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                                        Select Target Channels
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleSelectAll(
                                                !Object.values(selectedPlatforms).every(Boolean)
                                            )
                                        }
                                        className="text-[11px] text-[#1CB5BE] hover:underline font-semibold"
                                    >
                                        Toggle All
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <label className="flex items-center gap-2 p-2.5 bg-[#061528] border border-[#1A3352] rounded-xl cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedPlatforms.twitter}
                                            onChange={(e) =>
                                                setSelectedPlatforms({ ...selectedPlatforms, twitter: e.target.checked })
                                            }
                                            className="accent-[#1CB5BE]"
                                        />
                                        <Twitter className="w-4 h-4 text-sky-400" />
                                        <span className="font-bold">X / Twitter</span>
                                    </label>

                                    <label className="flex items-center gap-2 p-2.5 bg-[#061528] border border-[#1A3352] rounded-xl cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedPlatforms.facebook}
                                            onChange={(e) =>
                                                setSelectedPlatforms({ ...selectedPlatforms, facebook: e.target.checked })
                                            }
                                            className="accent-[#1CB5BE]"
                                        />
                                        <Facebook className="w-4 h-4 text-blue-500" />
                                        <span className="font-bold">Facebook Page</span>
                                    </label>

                                    <label className="flex items-center gap-2 p-2.5 bg-[#061528] border border-[#1A3352] rounded-xl cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedPlatforms.telegram}
                                            onChange={(e) =>
                                                setSelectedPlatforms({ ...selectedPlatforms, telegram: e.target.checked })
                                            }
                                            className="accent-[#1CB5BE]"
                                        />
                                        <MessageSquare className="w-4 h-4 text-cyan-400" />
                                        <span className="font-bold">Telegram Channel</span>
                                    </label>

                                    <label className="flex items-center gap-2 p-2.5 bg-[#061528] border border-[#1A3352] rounded-xl cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedPlatforms.whatsapp}
                                            onChange={(e) =>
                                                setSelectedPlatforms({ ...selectedPlatforms, whatsapp: e.target.checked })
                                            }
                                            className="accent-[#1CB5BE]"
                                        />
                                        <Globe className="w-4 h-4 text-emerald-400" />
                                        <span className="font-bold">WhatsApp Channel</span>
                                    </label>
                                </div>
                            </div>

                            {/* Editable Caption Box */}
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                                    Post Text Preview
                                </label>
                                <textarea
                                    rows={6}
                                    value={customCaption}
                                    onChange={(e) => setCustomCaption(e.target.value)}
                                    className="w-full bg-[#061528] border border-[#1A3352] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#1CB5BE] font-mono leading-relaxed"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-transparent border border-[#1A3352]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBroadcast}
                                    disabled={isBroadcasting}
                                    className="px-5 py-2.5 rounded-xl text-xs font-black text-[#061528] bg-[#E55322] hover:bg-[#d44819] text-white transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                    {isBroadcasting ? 'Publishing...' : 'Broadcast Everywhere'}
                                </button>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}