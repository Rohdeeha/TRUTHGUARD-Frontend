import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Upload, Send, CheckCircle2, Loader2, AlertCircle, X } from 'lucide-react';
import { submitReport } from '../services/api';

export default function ReportPage() {
    const { t } = useTranslation();

    // Form Field States
    const [title, setTitle] = useState('');
    const [claim, setClaim] = useState('');
    const [category, setCategory] = useState('DISINFORMATION');
    const [location, setLocation] = useState('');
    const [details, setDetails] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Request & Feedback States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleReset = () => {
        setTitle('');
        setClaim('');
        setCategory('DISINFORMATION');
        setLocation('');
        setDetails('');
        setIsAnonymous(false);
        setSelectedFile(null);
        setSubmitted(false);
        setErrorMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        // Build FormData payload to handle multipart binary file upload
        const formData = new FormData();
        formData.append('title', title);
        formData.append('claim', claim);
        formData.append('category', category);
        formData.append('location', location);
        formData.append('details', details);
        formData.append('is_anonymous', String(isAnonymous));

        if (selectedFile) {
            // UPDATED: Using 'evidence_file' exactly as the backend requested
            formData.append('evidence_file', selectedFile);
        }

        try {
            // Calls POST /api/incidents/report/ via src/services/api.ts
            await submitReport(formData);
            setSubmitted(true);
        } catch (err: any) {
            console.error('Report submission error:', err);
            setErrorMessage(
                err.message ||
                t(
                    'report.submitError',
                    'Could not submit report. Please check your network and try again.'
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto my-12 p-8 bg-[#0E243F] border border-[#1A3352] rounded-2xl text-center shadow-2xl">
                <CheckCircle2 className="w-16 h-16 text-[#1CB5BE] mx-auto mb-4 animate-bounce" />
                <h2 className="text-2xl font-bold mb-2 text-white">
                    {t('report.receivedTitle', 'Report Received!')}
                </h2>
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                    {t(
                        'report.receivedMsg',
                        'Thank you for helping keep the Osun elections transparent. Our verification team in the Situation Room is reviewing your submission.'
                    )}
                </p>
                <button
                    onClick={handleReset}
                    className="bg-[#1CB5BE] text-[#061528] font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#1CB5BE]/90 transition-all cursor-pointer"
                >
                    {t('report.submitAnother', 'Submit Another Report')}
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
                        {t(
                            'report.subtitle',
                            'Help keep Osun clean from fake news. Send suspicious news, fake results, or voting trouble straight to our Situation Room.'
                        )}
                    </p>
                </div>

                {/* Error Alert Box */}
                {errorMessage && (
                    <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Report Title */}
                    <div>
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                            {t('report.titleLabel', 'Report Headline / Title')}
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('report.titlePlaceholder', 'e.g., Fake election result sheet circulating online')}
                            className="w-full bg-[#061528] border border-[#1A3352] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#1CB5BE] placeholder-gray-500"
                        />
                    </div>

                    {/* Incident Category Selector */}
                    <div>
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                            {t('report.categoryLabel', 'Incident Category')}
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-[#061528] border border-[#1A3352] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#1CB5BE]"
                        >
                            <option value="DISINFORMATION">Disinformation / Fake News</option>
                            <option value="VOTER_SUPPRESSION">Voter Suppression / Intimidation</option>
                            <option value="LOGISTICS_FAILURE">Logistics / BVAS Issue</option>
                            <option value="VIOLENCE">Violence / Security Incident</option>
                            <option value="TFGBV">Targeted Online Harassment (TFGBV)</option>
                            <option value="INEC">INEC Official Info Discrepancy</option>
                        </select>
                    </div>

                    {/* Claim / Rumor Text (RESTORED) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                            {t('report.claimLabel', 'What is the Rumor or Claim?')}
                        </label>
                        <textarea
                            rows={2}
                            required
                            value={claim}
                            onChange={(e) => setClaim(e.target.value)}
                            placeholder={t('report.claimPlaceholder', 'e.g., They are saying ballot boxes were snatched at Ward 4...')}
                            className="w-full bg-[#061528] border border-[#1A3352] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#1CB5BE] placeholder-gray-500"
                        />
                    </div>

                    {/* Location Field */}
                    <div>
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                            {t('report.locationLabel', 'Location / LGA / Polling Unit')}
                        </label>
                        <input
                            type="text"
                            required
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder={t('report.locationPlaceholder', 'e.g., Osogbo LGA, Ward 4, PU 008')}
                            className="w-full bg-[#061528] border border-[#1A3352] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#1CB5BE] placeholder-gray-500"
                        />
                    </div>

                    {/* Detailed Context */}
                    <div>
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                            {t('report.detailsLabel', 'Additional Context / Details')}
                        </label>
                        <textarea
                            rows={3}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder={t('report.detailsPlaceholder', 'Describe what happened in detail or include links to social media posts...')}
                            className="w-full bg-[#061528] border border-[#1A3352] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#1CB5BE] placeholder-gray-500"
                        />
                    </div>

                    {/* Upload Evidence Box */}
                    <div>
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                            {t('report.uploadLabel', 'Upload Media Evidence (Optional)')}
                        </label>
                        <div className="relative border-2 border-dashed border-[#1A3352] hover:border-[#1CB5BE] rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#061528]">
                            <input
                                type="file"
                                accept="image/*,video/*,audio/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            {selectedFile ? (
                                <div className="flex items-center justify-center gap-2 text-xs text-[#1CB5BE] font-bold">
                                    <span>{selectedFile.name}</span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                        }}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400">
                                    {t('report.uploadClick', 'Click or drag to attach screenshot, audio, or video evidence')}
                                </p>
                            )}
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
                        <label htmlFor="anonymous" className="text-xs font-semibold text-gray-300 cursor-pointer select-none">
                            {t('report.anonymous', 'Keep my report anonymous')}
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#1CB5BE] hover:bg-[#18a2aa] text-[#061528] font-black py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                {t('report.submit', 'Submit Incident Report')}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}