import { useState } from 'react';
import { Lock, X, ArrowRight } from 'lucide-react';

interface AdminLoginModalProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function AdminLoginModal({ onSuccess, onCancel }: AdminLoginModalProps) {
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check passcode against environment variable or local default
        const validPasscode = import.meta.env.VITE_ADMIN_PASSCODE || 'truthguard2026';

        if (passcode.trim() === validPasscode) {
            sessionStorage.setItem('truthguard_admin_token', 'true');
            onSuccess();
        } else {
            setError(true);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="relative w-full max-w-md bg-card-theme border border-theme text-main-theme rounded-2xl shadow-2xl p-6 sm:p-8 transition-colors duration-200">

                {/* Close Button */}
                <button
                    onClick={onCancel}
                    type="button"
                    className="absolute top-4 right-4 p-2 text-muted-theme hover:text-main-theme rounded-lg hover:bg-input-theme transition-colors cursor-pointer"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Icon & Titles */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-[#E55322] flex items-center justify-center mb-3 border border-rose-500/20">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-main-theme tracking-tight">
                        Restricted Access
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-theme font-medium mt-1">
                        Authorized TruthGuard personnel only.
                    </p>
                </div>

                {/* Authentication Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-theme mb-2">
                            Operation Passcode
                        </label>
                        <input
                            type="password"
                            value={passcode}
                            onChange={(e) => {
                                setPasscode(e.target.value);
                                setError(false);
                            }}
                            placeholder="Enter secure passcode..."
                            className={`w-full bg-input-theme text-main-theme border ${error ? 'border-rose-500' : 'border-theme focus:border-[#1CB5BE]'
                                } placeholder:text-slate-400 rounded-xl px-4 py-3.5 text-sm outline-none transition-colors duration-200`}
                            autoFocus
                        />
                        {error && (
                            <p className="text-xs text-rose-500 font-semibold mt-2">
                                Incorrect passcode. Please try again.
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#E55322] hover:bg-[#c9451b] text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
                    >
                        Authenticate
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}