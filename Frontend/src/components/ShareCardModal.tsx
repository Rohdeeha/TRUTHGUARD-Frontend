import { X } from 'lucide-react';

interface ShareCardModalProps {
    cardUrl: string;
    onClose: () => void;
}

export const ShareCardModal = ({ cardUrl, onClose }: ShareCardModalProps) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#0E243F] border border-[#1A3352] p-6 rounded-2xl max-w-md w-full space-y-4 text-center shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-lg font-bold text-white pt-2">
                    Fact-Check Card
                </h3>

                <div className="overflow-hidden rounded-xl border border-[#1A3352] bg-[#061528] p-2">
                    <img
                        src={cardUrl}
                        alt="Fact Check Graphic Card"
                        className="w-full h-auto rounded-lg object-contain"
                    />
                </div>

                <div className="flex items-center gap-3 justify-end pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                    <a
                        href={cardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download="truthguard-fact-check.png"
                        className="px-4 py-2 bg-[#1CB5BE] text-[#061528] rounded-xl text-xs font-bold hover:bg-[#1CB5BE]/90 transition-colors inline-flex items-center gap-2 cursor-pointer"
                    >
                        Download Card
                    </a>
                </div>
            </div>
        </div>
    );
};