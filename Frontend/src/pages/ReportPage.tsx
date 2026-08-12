import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Upload, Send, CheckCircle2 } from 'lucide-react';

export default function ReportPage() {
    const { t } = useTranslation();
    const [incidentType, setIncidentType] = useState('Fake News / Unverified Claim');
    const [description, setDescription] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto my-12 p-8 bg-[#0E243F] border border-[#1A3352] rounded-2xl text-center">
                <CheckCircle2 className="w-16 h-16 text-[#1CB5BE] mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Report Received!</h2>
                <p className="text-gray-300 text-sm mb-6">
                    Thank you for helping keep the Osun 2026 elections transparent. Our verification team is reviewing your submission.
                </p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="bg-[#1CB5BE] text-[#061528] font-bold px-6 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all cursor-pointer"
                >
                    Submit Another Report
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="bg-[#0E243F] border border-[#1A3352] rounded-2xl p-6 sm:p-8 shadow-xl">

                {/* Header Title */}
                <div className="mb-6">
                    <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mb-2">
                        <Shield className="w-6 h-6 text-[#1CB5BE]" />
                        {t('report.title', 'Report Fake News or Incident Wey Happen')}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        {t('report.subtitle', 'Help keep Osun 2026 clean from fake news. Send suspicious news, fake results, or voting trouble straight to our Situation Room.')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Incident Type Selector */}
                    <div>
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                            {t('report.incidentType', 'Incident Type')}
                        </label>
                        <select
                            value={incidentType}
                            onChange={(e) => setIncidentType(e.target.value)}
                            className="w-full bg-[#061528] border border-[#1A3352] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#1CB5BE]"
                        >
                            <option value="Fake News / Unverified Claim">Fake News / Unverified Claim</option>
                            <option value="Voter Suppression / Intimidation">Voter Suppression / Intimidation</option>
                            <option value="False Election Results">False Election Results</option>
                            <option value="Technical / BVAS Issue">Technical / BVAS Issue</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Description Textarea */}
                    <div>
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                            {t('report.description', 'Description')}
                        </label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('report.placeholder', 'Describe the suspicious claim, location, or video link in detail...')}
                            className="w-full bg-[#061528] border border-[#1A3352] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#1CB5BE] placeholder-gray-500"
                            required
                        />
                    </div>

                    {/* Upload Evidence Box */}
                    <div>
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                            Upload Media Evidence (Optional)
                        </label>
                        <div className="border-2 border-dashed border-[#1A3352] hover:border-[#1CB5BE] rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#061528]">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-400">Click to attach screenshot, audio, or video evidence</p>
                        </div>
                    </div>

                    {/* Anonymous Checkbox */}
                    <div className="flex items-center gap-3 bg-[#061528] p-3 rounded-xl border border-[#1A3352]">
                        <input
                            type="checkbox"
                            id="anonymous"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="w-4 h-4 accent-[#1CB5BE] rounded cursor-pointer"
                        />
                        <label htmlFor="anonymous" className="text-xs font-semibold text-gray-300 cursor-pointer">
                            {t('report.anonymous', 'Keep my report anonymous')}
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-[#1CB5BE] hover:bg-[#18a2aa] text-[#061528] font-black py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                        <Send className="w-4 h-4" />
                        {t('report.submit', 'Submit Incident Report')}
                    </button>
                </form>

            </div>
        </div>
    );
}