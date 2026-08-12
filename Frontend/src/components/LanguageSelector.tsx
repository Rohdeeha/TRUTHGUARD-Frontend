import { useLanguage } from '../pages/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[#0E243F] border border-[#1A3352] px-3 py-2 rounded-xl shadow-2xl">
            <Globe className="w-4 h-4 text-[#1CB5BE]" />
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
            >
                <option value="en" className="bg-[#0E243F] text-white">English</option>
                <option value="yo" className="bg-[#0E243F] text-white">Yorùbá</option>
                <option value="pcm" className="bg-[#0E243F] text-white">Pidgin</option>
            </select>
        </div>
    );
}