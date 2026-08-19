import React, { useState } from 'react';
import { Send, ShieldCheck, CheckCircle2, UserCircle2 } from 'lucide-react';

interface FactCheckSubmission {
    statement: string;
    whoSaidIt: string;
    whenAndWhere: string;
    evidenceLinks: string;
    contactName: string;
    contactEmail: string;
}

export const SubmitClaimForm: React.FC = () => {
    const [formData, setFormData] = useState<FactCheckSubmission>({
        statement: '',
        whoSaidIt: '',
        whenAndWhere: '',
        evidenceLinks: '',
        contactName: '',
        contactEmail: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setFormData({
                statement: '', whoSaidIt: '', whenAndWhere: '', evidenceLinks: '', contactName: '', contactEmail: ''
            });
        }, 1500);
    };

    return (
        <div className="max-w-3xl mx-auto bg-[#0E243F] border border-[#1A3352] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">

            {/* Top Left Decorative Accent */}
            <div className="absolute top-0 left-0 w-2 h-full bg-[#1CB5BE]"></div>

            {/* Header Section matching the reference image */}
            <div className="mb-8 pl-4">
                <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                        Public Submission
                    </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
                    Suggest a Fact-Check
                </h1>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl">
                    Help us combat misinformation. Seen or heard something dubious? Fill out the form below, and our team will investigate.
                </p>
            </div>

            {isSuccess && (
                <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400 ml-4">
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
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider flex gap-1">
                        <span className="text-[#1CB5BE]">1.</span> The Statement / Claim <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                        required
                        rows={3}
                        value={formData.statement}
                        onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                        placeholder="Please enter the exact statement or claim you want us to investigate..."
                        className="w-full bg-[#061528] border border-[#1A3352] focus:border-[#1CB5BE] text-white placeholder-gray-500 rounded-xl p-4 text-sm outline-none transition-colors resize-y leading-relaxed"
                    />
                </div>

                {/* 2 & 3. Who and Where/When (Side-by-Side on larger screens) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider flex gap-1">
                            <span className="text-[#1CB5BE]">2.</span> Who said it?
                        </label>
                        <input
                            type="text"
                            value={formData.whoSaidIt}
                            onChange={(e) => setFormData({ ...formData, whoSaidIt: e.target.value })}
                            placeholder="Name of public figure, organization..."
                            className="w-full bg-[#061528] border border-[#1A3352] focus:border-[#1CB5BE] text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider flex gap-1">
                            <span className="text-[#1CB5BE]">3.</span> Where & When?
                        </label>
                        <input
                            type="text"
                            value={formData.whenAndWhere}
                            onChange={(e) => setFormData({ ...formData, whenAndWhere: e.target.value })}
                            placeholder="e.g., Yesterday on X/Twitter, TV Broadcast"
                            className="w-full bg-[#061528] border border-[#1A3352] focus:border-[#1CB5BE] text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* 4. Evidence (Full Width) */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider flex gap-1">
                        <span className="text-[#1CB5BE]">4.</span> Evidence & Context Links
                    </label>
                    <textarea
                        rows={2}
                        value={formData.evidenceLinks}
                        onChange={(e) => setFormData({ ...formData, evidenceLinks: e.target.value })}
                        placeholder="Provide links to sources, social media posts, or any extra context..."
                        className="w-full bg-[#061528] border border-[#1A3352] focus:border-[#1CB5BE] text-white placeholder-gray-500 rounded-xl p-4 text-sm outline-none transition-colors resize-y leading-relaxed"
                    />
                </div>

                {/* Contact Divider */}
                <div className="pt-6 border-t border-[#1A3352]">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-6">
                        <UserCircle2 className="w-4 h-4 text-[#1CB5BE]" />
                        Your Contact Details (Optional)
                    </h3>

                    {/* 5 & 6. Name and Email (Side-by-Side on larger screens) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Your Name
                            </label>
                            <input
                                type="text"
                                value={formData.contactName}
                                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                placeholder="John Doe"
                                className="w-full bg-[#061528] border border-[#1A3352] focus:border-[#1CB5BE] text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.contactEmail}
                                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                placeholder="john@example.com"
                                className="w-full bg-[#061528] border border-[#1A3352] focus:border-[#1CB5BE] text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-8 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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