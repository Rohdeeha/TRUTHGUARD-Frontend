import React, { useState } from 'react';
import { Lock, ArrowRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminLoginModalProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function AdminLoginModal({ onSuccess, onCancel }: AdminLoginModalProps) {
    const [passcode, setPasscode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // In a real scenario, this calls api.auth.login(passcode)
            // For this prototype, we simulate a network delay and a static passcode validation
            await new Promise((resolve) => setTimeout(resolve, 1000));

            if (passcode === 'OSUN2026') {
                sessionStorage.setItem('truthguard_admin_token', 'simulated_jwt_token_12345');
                toast.success('Access Granted to Situation Room');
                onSuccess();
            } else {
                toast.error('Invalid Admin Passcode');
                setPasscode('');
            }
        } catch (error) {
            toast.error('Authentication server error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0E243F] border border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center space-y-3 mb-6">
                    <div className="w-12 h-12 bg-rose-500/10 border-2 border-rose-500/30 rounded-full flex items-center justify-center text-rose-500">
                        <Lock className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Restricted Access</h2>
                        <p className="text-xs text-gray-400 mt-1">
                            Authorized TruthGuard personnel only.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-300 uppercase tracking-wide">
                            Operation Passcode
                        </label>
                        <input
                            type="password"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            placeholder="Enter secure passcode..."
                            className="w-full bg-[#071D38] border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !passcode}
                        className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Verifying...' : 'Authenticate'} <ArrowRight className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}