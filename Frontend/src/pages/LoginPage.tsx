import React, { useState } from 'react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('https://truthguard-api-sut7.onrender.com/api/auth/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store token using the key expected by api.ts
                localStorage.setItem('fact_checker_token', data.access || data.token);
                sessionStorage.setItem('truthguard_admin_token', data.access || data.token);
                window.location.href = '/?admin=true';
            } else {
                setError(data.detail || 'Login failed');
            }
        } catch (err) {
            console.error('Network error during login:', err);
            setError('Network error during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#071D38] flex items-center justify-center p-4">
            <div className="bg-card-theme border border-theme p-8 rounded-2xl max-w-md w-full">
                <h1 className="text-2xl font-bold text-main-white mb-6">Staff Login</h1>
                {error && (
                    <div className="p-3 mb-4 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[#061528] border border-theme text-main-white rounded-xl p-3 text-sm outline-none focus:border-[#1CB5BE]"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#061528] border border-theme text-main-white rounded-xl p-3 text-sm outline-none focus:border-[#1CB5BE]"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#1CB5BE] hover:bg-[#1CB5BE]/90 text-[#061528] font-bold py-3 rounded-xl transition-opacity disabled:opacity-50 cursor-pointer"
                    >
                        {isLoading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
            </div>
        </div>
    );
}