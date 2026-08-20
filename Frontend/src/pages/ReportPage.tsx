import React, { useState } from 'react';
import { Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { submitReport } from '../services/api';

// 1. Strictly type the data object we will send to the backend/parent
export interface FactCheckSubmissionData {
    statement: string;
    whoSaidIt: string;
    whenAndWhere: string;
    evidenceLinks: string;
    contactName?: string;
    contactEmail?: string;
}

// 2. Strictly type the props this component expects to receive
export interface SubmitClaimFormProps {
    onSubmitReport?: (data: FactCheckSubmissionData) => Promise<void>;
}

export const ReportPage: React.FC<SubmitClaimFormProps> = ({ onSubmitReport }) => {
    const [formData, setFormData] = useState<FactCheckSubmissionData>({
        statement: '',
        whoSaidIt: '',
        whenAndWhere: '',
        evidenceLinks: '',
        contactName: '',
        contactEmail: '',
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Trigger the parent function if it was passed in
            if (onSubmitReport) {
                await onSubmitReport(formData);
            } else {
                // Submit to backend
                await submitReport({
                    title: formData.statement,
                    details: `Who said it: ${formData.whoSaidIt || 'Unknown'}\nWhere/When: ${formData.whenAndWhere || 'Unknown'}\nEvidence: ${formData.evidenceLinks || 'None'}\nContact Name: ${formData.contactName || 'Anonymous'}\nContact Email: ${formData.contactEmail || 'N/A'}`,
                    category: 'DISINFORMATION',
                    location: formData.whenAndWhere || 'Osun State',
                    is_anonymous: !formData.contactName && !formData.contactEmail,
                });
            }

            setIsSuccess(true);
            setFormData({
                statement: '', whoSaidIt: '', whenAndWhere: '', evidenceLinks: '', contactName: '', contactEmail: ''
            });
        } catch (error) {
            console.error("Failed to submit fact-check:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-card-theme border border-theme rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-colors duration-200">

            {/* Top Left Decorative Accent */}
            <div className="absolute top-0 left-0 w-2 h-full bg-[#1CB5BE]"></div>

            {/* Header Section */}
            <div className="mb-8 pl-4">
                <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-5 h-5 text-[#1CB5BE]" />
                    <span className="bg-[#1CB5BE]/10 text-[#1CB5BE] border border-[#1CB5BE]/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                        Public Submission
                    </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-main-theme tracking-tight mb-3">
                    Suggest a Fact-Check
                </h1>
                <p className="text-muted-theme text-sm sm:text-base leading-relaxed max-w-xl">
                    Help us combat misinformation. Seen or heard something dubious? Fill out the form below, and our team will investigate.
                </p>
            </div>

            {isSuccess && (
                <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-500 dark:text-emerald-400 ml-4">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">
                        Submission received! Our desk team will investigate this claim.
                    </p>
                </div>
            )}

            {/* Form Section with Responsive Grid */}
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 pl-4">

                {/* 1. The Statement (Full Width) */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-main-theme">
                        <span className="text-[#1CB5BE] font-black">1.</span>
                        <span>THE STATEMENT / CLAIM</span>
                        <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                        required
                        rows={3}
                        value={formData.statement}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, statement: e.target.value })}
                        placeholder="Please enter the exact statement or claim you want us to investigate..."
                        className="w-full bg-input-theme text-main-theme border border-theme focus:border-[#1CB5BE] placeholder:text-muted-theme rounded-xl p-4 text-sm outline-none transition-colors resize-y leading-relaxed"
                    />
                </div>

                {/* 2 & 3. Who and Where/When (Side-by-Side on larger screens) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-main-theme">
                            <span className="text-[#1CB5BE] font-black">2.</span>
                            <span>WHO SAID IT?</span>
                        </label>
                        <input
                            type="text"
                            value={formData.whoSaidIt}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, whoSaidIt: e.target.value })}
                            placeholder="Name of public figure, organization..."
                            className="w-full bg-input-theme text-main-theme border border-theme focus:border-[#1CB5BE] placeholder:text-muted-theme rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-main-theme">
                            <span className="text-[#1CB5BE] font-black">3.</span>
                            <span>WHERE & WHEN?</span>
                        </label>
                        <input
                            type="text"
                            value={formData.whenAndWhere}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, whenAndWhere: e.target.value })}
                            placeholder="e.g., Yesterday on X/Twitter, TV Broadcast"
                            className="w-full bg-input-theme text-main-theme border border-theme focus:border-[#1CB5BE] placeholder:text-muted-theme rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* 4. Evidence (Full Width) */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-main-theme">
                        <span className="text-[#1CB5BE] font-black">4.</span>
                        <span>EVIDENCE & CONTEXT LINKS</span>
                    </label>
                    <textarea
                        rows={2}
                        value={formData.evidenceLinks}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, evidenceLinks: e.target.value })}
                        placeholder="Provide links to sources, social media posts, or any extra context..."
                        className="w-full bg-input-theme text-main-theme border border-theme focus:border-[#1CB5BE] placeholder:text-muted-theme rounded-xl p-4 text-sm outline-none transition-colors resize-y leading-relaxed"
                    />
                </div>

                {/* Submit Action */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto bg-[#1CB5BE] hover:bg-[#189EA6] text-white font-bold py-3.5 px-8 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <span className="text-sm">Submitting...</span>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                <span className="text-sm">Submit Fact-Check</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export const SubmitClaimForm = ReportPage;
export default ReportPage;