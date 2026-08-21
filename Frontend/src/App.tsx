import { useState, useEffect } from 'react';
import { Shield, FileText, LayoutDashboard, LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import HomePage from './pages/Homepage';
import ReportPage from './pages/ReportPage';
import DashboardPage from './pages/DashboardPage';
import AdminLoginModal from './components/AdminLoginModal';

export default function App() {
    const [activeTab, setActiveTab] = useState<'home' | 'report' | 'dashboard'>('home');
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- NEW: Theme State ---
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') !== 'light';
    });

    // Check URL path and Session Storage on load
    useEffect(() => {
        const path = window.location.pathname.replace(/\/+$/, '');
        const params = new URLSearchParams(window.location.search);
        const isAdminPath = path === '/admin' || params.has('admin');
        const isAuthenticated = !!sessionStorage.getItem('truthguard_admin_token');

        if (isAdminPath || isAuthenticated) {
            setIsAdminMode(true);
            if (isAdminPath) {
                if (isAuthenticated) {
                    setActiveTab('dashboard');
                } else {
                    setShowAdminLogin(true);
                }
            }
        }
    }, []);

    // --- NEW: Theme Effect ---
    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const handleTabClick = (tab: 'home' | 'report' | 'dashboard') => {
        if (tab === 'dashboard') {
            const isAuthenticated = !!sessionStorage.getItem('truthguard_admin_token');
            if (!isAuthenticated) {
                setShowAdminLogin(true);
                return;
            }
            window.history.replaceState({}, document.title, '/admin');
        } else {
            window.history.replaceState({}, document.title, '/');
        }
        setActiveTab(tab);
    };

    // Logout function to clear session and hide admin mode
    const handleLogout = () => {
        sessionStorage.removeItem('truthguard_admin_token');
        setIsAdminMode(false);
        setActiveTab('home');

        // Cleanly resets address bar to root path
        window.history.replaceState({}, document.title, '/');
    };

    const isAuthenticated = !!sessionStorage.getItem('truthguard_admin_token');

    return (
        <div className="min-h-screen bg-app text-main-theme flex flex-col font-sans transition-colors duration-200">
            {/* Header / Navbar */}
            <header className="border-b border-theme bg-card-theme sticky top-0 z-50 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">

                    {/* Logo / Brand */}
                    <div
                        className="flex items-center gap-3 cursor-pointer shrink-0 py-1"
                        onClick={() => {
                            handleTabClick('home');
                            setIsMobileMenuOpen(false);
                        }}
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
                            <span className="text-[9px] sm:text-[10px] text-muted-theme font-bold uppercase tracking-widest -mt-0.5">
                                Osun 2026 Fact Check
                            </span>
                        </div>
                    </div>

                    {/* 1. Desktop Navigation (Tablet/Desktop 768px+) */}
                    <div className="hidden md:flex items-center gap-3">
                        <nav className="flex items-center gap-1.5 bg-subcard-theme p-1.5 rounded-xl border border-theme shrink-0 transition-colors duration-200">

                            {/* Live Fact-Checks / Debunks */}
                            <button
                                onClick={() => handleTabClick('home')}
                                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${activeTab === 'home'
                                    ? 'bg-[#1CB5BE] text-[#061528] shadow-md font-extrabold'
                                    : 'text-muted-theme hover:text-main-theme'
                                    }`}
                            >
                                <FileText className="w-4 h-4" />
                                Live Fact-Checks
                            </button>

                            {/* Report Incident */}
                            <button
                                onClick={() => handleTabClick('report')}
                                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${activeTab === 'report'
                                    ? 'bg-[#E55322] text-white shadow-md font-extrabold'
                                    : 'text-muted-theme hover:text-main-theme'
                                    }`}
                            >
                                <Shield className="w-4 h-4" />
                                Report Incident
                            </button>

                            {/* Situation Room (Admin Mode) */}
                            {isAdminMode && (
                                <button
                                    onClick={() => handleTabClick('dashboard')}
                                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${activeTab === 'dashboard'
                                        ? 'bg-[#1CB5BE] text-[#061528] shadow-md font-extrabold'
                                        : 'text-muted-theme hover:text-main-theme'
                                        }`}
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Situation Room
                                </button>
                            )}

                            {/* Logout Button */}
                            {isAuthenticated && (
                                <button
                                    onClick={handleLogout}
                                    className="px-2.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 ml-1"
                                    title="Lock Situation Room"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            )}

                            {/* --- Theme Toggle Button --- */}
                            <button
                                onClick={() => setIsDark(!isDark)}
                                className="p-2 ml-1 rounded-lg text-muted-theme hover:bg-card-theme hover:text-main-theme transition-all cursor-pointer flex items-center justify-center shrink-0 border border-transparent hover:border-theme"
                                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDark ? (
                                    <Sun className="w-4 h-4 text-amber-400" />
                                ) : (
                                    <Moon className="w-4 h-4 text-slate-700" />
                                )}
                            </button>
                        </nav>
                    </div>

                    {/* 2. Mobile Hamburger Toggle Button (Mobile only) */}
                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2 rounded-lg text-muted-theme hover:bg-subcard-theme hover:text-main-theme transition-all cursor-pointer flex items-center justify-center border border-theme"
                            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDark ? (
                                <Sun className="w-4 h-4 text-amber-400" />
                            ) : (
                                <Moon className="w-4 h-4 text-slate-700" />
                            )}
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg text-muted-theme hover:bg-subcard-theme hover:text-main-theme transition-all cursor-pointer border border-theme"
                            aria-label="Toggle Navigation Menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6 text-main-theme" />
                            ) : (
                                <Menu className="w-6 h-6 text-main-theme" />
                            )}
                        </button>
                    </div>
                </div>

                {/* 3. Mobile Dropdown / Drawer Menu */}
                {isMobileMenuOpen && (
                    <div className="flex flex-col gap-3 p-4 bg-card-theme border-b border-theme md:hidden shadow-lg animate-in slide-in-from-top-2 duration-200">
                        {/* Live Fact-Checks */}
                        <button
                            onClick={() => {
                                handleTabClick('home');
                                setIsMobileMenuOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-between ${activeTab === 'home'
                                ? 'bg-[#1CB5BE] text-[#061528] shadow-md font-extrabold'
                                : 'bg-subcard-theme text-main-theme hover:bg-subcard-theme/80 border border-theme'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Live Fact-Checks
                            </span>
                            {activeTab === 'home' && <span className="text-xs font-black">ACTIVE</span>}
                        </button>

                        {/* Report Incident */}
                        <button
                            onClick={() => {
                                handleTabClick('report');
                                setIsMobileMenuOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-between ${activeTab === 'report'
                                ? 'bg-[#E55322] text-white shadow-md font-extrabold'
                                : 'bg-subcard-theme text-main-theme hover:bg-subcard-theme/80 border border-theme'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Report Incident
                            </span>
                            {activeTab === 'report' && <span className="text-xs font-black">ACTIVE</span>}
                        </button>

                        {/* Situation Room (Admin Mode) */}
                        {isAdminMode && (
                            <button
                                onClick={() => {
                                    handleTabClick('dashboard');
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`w-full px-4 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-between ${activeTab === 'dashboard'
                                    ? 'bg-[#1CB5BE] text-[#061528] shadow-md font-extrabold'
                                    : 'bg-subcard-theme text-main-theme hover:bg-subcard-theme/80 border border-theme'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Situation Room
                                </span>
                                {activeTab === 'dashboard' && <span className="text-xs font-black">ACTIVE</span>}
                            </button>
                        )}

                        {/* Logout & Theme Row on Mobile */}
                        <div className="flex items-center justify-between pt-2 border-t border-theme/60 mt-1">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-theme">
                                <span>Theme:</span>
                                <button
                                    onClick={() => setIsDark(!isDark)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-subcard-theme border border-theme text-main-theme font-bold text-xs cursor-pointer"
                                >
                                    {isDark ? (
                                        <>
                                            <Sun className="w-3.5 h-3.5 text-amber-400" />
                                            Light Mode
                                        </>
                                    ) : (
                                        <>
                                            <Moon className="w-3.5 h-3.5 text-slate-700" />
                                            Dark Mode
                                        </>
                                    )}
                                </button>
                            </div>

                            {isAuthenticated && (
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg text-rose-500 hover:bg-rose-500/10 border border-rose-500/30 flex items-center gap-1.5 cursor-pointer"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>
                )}
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
                        window.history.replaceState({}, document.title, '/admin');
                    }}
                    onCancel={() => {
                        setShowAdminLogin(false);
                        if (window.location.pathname === '/admin') {
                            window.history.replaceState({}, document.title, '/');
                        }
                    }}
                />
            )}

            {/* Footer */}
            <footer className="border-t border-theme bg-card-theme py-6 text-center text-xs text-muted-theme transition-colors duration-200">
                <p>© 2026 TruthGuard Initiative · FactCheck Africa / BallotEyes Working Group</p>
            </footer>
        </div>
    );
}