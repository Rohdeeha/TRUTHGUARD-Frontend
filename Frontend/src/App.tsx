import { useState, useEffect } from 'react';
import { Shield, FileText, LayoutDashboard, Globe, LogOut } from 'lucide-react';
import { useLanguage } from './pages/LanguageContext';
import { useTranslation } from 'react-i18next';
import HomePage from './pages/Homepage';
import ReportPage from './pages/ReportPage';
import DashboardPage from './pages/DashboardPage';
import AdminLoginModal from './components/AdminLoginModal';

export default function App() {
    const [activeTab, setActiveTab] = useState<'home' | 'report' | 'dashboard'>('home');
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [isAdminMode, setIsAdminMode] = useState(false);

    // Connects to LanguageContext (which syncs with i18next & localStorage)
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();

    // Check URL and Session Storage on load
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const hasAdminParam = params.get('admin') === 'true';
        const isAuthenticated = !!sessionStorage.getItem('truthguard_admin_token');

        if (hasAdminParam || isAuthenticated) {
            setIsAdminMode(true);
        }
    }, []);

    const handleTabClick = (tab: 'home' | 'report' | 'dashboard') => {
        if (tab === 'dashboard') {
            const isAuthenticated = !!sessionStorage.getItem('truthguard_admin_token');
            if (!isAuthenticated) {
                setShowAdminLogin(true);
                return;
            }
        }
        setActiveTab(tab);
    };

    // Logout function to clear session and hide admin mode
    const handleLogout = () => {
        sessionStorage.removeItem('truthguard_admin_token');
        setIsAdminMode(false);
        setActiveTab('home');

        // Removes ?admin=true from address bar cleanly
        window.history.replaceState({}, document.title, window.location.pathname);
    };

    const isAuthenticated = !!sessionStorage.getItem('truthguard_admin_token');

    return (
        <div className="min-h-screen bg-[#061528] text-white flex flex-col font-sans">
            {/* Header / Navbar */}
            <header className="border-b border-[#1A3352] bg-[#0E243F] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">

                    {/* Logo / Brand */}
                    <div
                        className="flex items-center gap-3 cursor-pointer shrink-0 py-1"
                        onClick={() => handleTabClick('home')}
                    >
                        <img
                            src="/truthguard.jpeg"
                            alt="TruthGuard Shield"
                            className="h-10 sm:h-12 w-auto object-contain"
                        />
                        <div className="flex flex-col justify-center">
                            <span className="text-lg sm:text-2xl font-black tracking-wider flex items-center">
                                <span className="text-[#1CB5BE]">TRUTH</span>
                                <span className="text-[#E55322]">GUARD</span>
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest -mt-0.5">
                                {t('nav.tagline', 'Osun 2026 Fact Check')}
                            </span>
                        </div>
                    </div>

                    {/* Navigation Controls & Language Switcher */}
                    <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-1">
                        <nav className="flex items-center gap-1.5 bg-[#061528] p-1.5 rounded-xl border border-[#1A3352] shrink-0">

                            {/* Live Fact-Checks / Debunks */}
                            <button
                                onClick={() => handleTabClick('home')}
                                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${activeTab === 'home'
                                    ? 'bg-[#1CB5BE] text-[#061528] shadow-md font-extrabold'
                                    : 'text-gray-300 hover:text-white'
                                    }`}
                            >
                                <FileText className="w-4 h-4" />
                                {t('nav.debunks', 'Live Fact-Checks')}
                            </button>

                            {/* Report Incident */}
                            <button
                                onClick={() => handleTabClick('report')}
                                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${activeTab === 'report'
                                    ? 'bg-[#E55322] text-white shadow-md font-extrabold'
                                    : 'text-gray-300 hover:text-white'
                                    }`}
                            >
                                <Shield className="w-4 h-4" />
                                {t('nav.report', 'Report Incident')}
                            </button>

                            {/* Situation Room (Admin Mode) */}
                            {isAdminMode && (
                                <button
                                    onClick={() => handleTabClick('dashboard')}
                                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${activeTab === 'dashboard'
                                        ? 'bg-[#1CB5BE] text-[#061528] shadow-md font-extrabold'
                                        : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    {t('nav.situationRoom', 'Situation Room')}
                                </button>
                            )}

                            {/* Logout Button */}
                            {isAuthenticated && (
                                <button
                                    onClick={handleLogout}
                                    className="px-2.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 ml-1"
                                    title={t('nav.lockRoom', 'Lock Situation Room')}
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            )}
                        </nav>

                        {/* Language Selector */}
                        <div className="flex items-center gap-1 bg-[#061528] px-2.5 py-1.5 rounded-xl border border-[#1A3352] text-xs shrink-0">
                            <Globe className="w-4 h-4 text-[#1CB5BE]" />
                            {[
                                { code: 'en', label: 'EN' },
                                { code: 'yo', label: 'YO' },
                                { code: 'pcm', label: 'PCM' }
                            ].map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => setLanguage(lang.code)}
                                    className={`px-2 py-1 rounded-md font-bold cursor-pointer transition-colors ${language === lang.code
                                        ? 'bg-[#1CB5BE] text-[#061528]'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {activeTab === 'home' && <HomePage />}
                {activeTab === 'report' && <ReportPage />}
                {activeTab === 'dashboard' && isAdminMode && <DashboardPage />}
            </main>

            {/* Admin Login Modal Overlay */}
            {showAdminLogin && (
                <AdminLoginModal
                    onSuccess={() => {
                        setShowAdminLogin(false);
                        setIsAdminMode(true);
                        setActiveTab('dashboard');
                    }}
                    onCancel={() => setShowAdminLogin(false)}
                />
            )}

            {/* Footer */}
            <footer className="border-t border-[#1A3352] bg-[#0E243F] py-6 text-center text-xs text-gray-400">
                <p>{t('nav.footer', '© 2026 TruthGuard Initiative · FactCheck Africa / BallotEyes Working Group')}</p>
            </footer>
        </div>
    );
}