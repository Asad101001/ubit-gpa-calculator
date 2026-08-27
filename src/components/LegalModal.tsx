import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Scale, FileText, Check, AlertCircle, Info, ExternalLink } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: 'terms' | 'privacy' | 'grading';
  onClose: () => void;
}

export const LegalModal = ({ isOpen, initialTab = 'terms', onClose }: LegalModalProps) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'grading'>(initialTab);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-4xl bg-surface/95 backdrop-blur-2xl border border-border/80 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden z-10 my-8 flex flex-col max-h-[85vh]"
        >
          {/* Header Banner */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-r from-brand-950/60 via-surfaceHighlight to-surface border-b border-border overflow-hidden shrink-0">
            <div 
              className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none mix-blend-overlay"
              style={{ backgroundImage: 'url(/images/campus_bg.jpg)' }}
            />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-md">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-textMain tracking-tight">
                    Terms & Legal Documentation
                  </h2>
                  <p className="text-xs sm:text-sm text-textMuted font-medium mt-0.5">
                    Department of Computer Science (UBIT) • University of Karachi
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-surfaceHighlight/80 hover:bg-red-500/20 text-textMuted hover:text-red-400 border border-border flex items-center justify-center transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mt-6 overflow-x-auto scrollbar-none pt-2 border-t border-border/40">
              {[
                { id: 'terms', label: 'Terms of Service (TOC)', icon: FileText },
                { id: 'privacy', label: 'Privacy & Legal Disclaimer', icon: ShieldCheck },
                { id: 'grading', label: 'UBIT Grading Policy', icon: Info },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'terms' | 'privacy' | 'grading')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 border border-brand-400/30'
                        : 'bg-surface/60 text-textMuted hover:text-textMain hover:bg-surfaceHighlight border border-border/50'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-textMain/90 font-sans leading-relaxed">
            {activeTab === 'terms' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-start gap-3">
                  <Info className="text-brand-400 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-brand-300 font-medium">
                    By accessing or using the UBIT GPA Calculator & Results Portal, you agree to comply with and be bound by these Terms of Service.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-bold text-textMain flex items-center gap-2">
                    <Check className="text-emerald-400" size={16} /> 1. Educational Estimation Purpose
                  </h3>
                  <p className="text-textMuted text-xs sm:text-sm pl-6">
                    This software tool is provided solely for educational, planning, and self-assessment purposes for students of the Department of Computer Science (UBIT), University of Karachi. While every effort is made to maintain complete accuracy with the official UOK semester grading regulations, calculated values serve as estimates and do not replace official transcript documents issued by the Semester Examination Section.
                  </p>

                  <h3 className="text-base font-bold text-textMain flex items-center gap-2">
                    <Check className="text-emerald-400" size={16} /> 2. Community & Leaderboard Integrity
                  </h3>
                  <p className="text-textMuted text-xs sm:text-sm pl-6">
                    When submitting entries to the public Leaderboard or interacting with student profiles:
                  </p>
                  <ul className="list-disc pl-10 space-y-1 text-xs sm:text-sm text-textMuted">
                    <li>You must provide accurate, non-misleading information.</li>
                    <li>Submissions containing offensive language, hate speech, or malicious text will be automatically removed.</li>
                    <li>Impersonation of faculty members or fellow students is strictly prohibited.</li>
                  </ul>

                  <h3 className="text-base font-bold text-textMain flex items-center gap-2">
                    <Check className="text-emerald-400" size={16} /> 3. Data & Local Storage Usage
                  </h3>
                  <p className="text-textMuted text-xs sm:text-sm pl-6">
                    The app utilizes your browser's Local Storage to save course grade inputs offline for convenience. Authentication and profile synchronization (when opted-in) are handled securely via Supabase infrastructure.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-amber-300 font-medium">
                    Disclaimer: This is an open-source, student-led project. It is not officially operated, owned, or endorsed by the administrative body of the University of Karachi.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-bold text-textMain">Non-Affiliation & Copyright Notice</h3>
                  <p className="text-textMuted text-xs sm:text-sm">
                    All trademarks, department names, logo representations, and course titles ("Department of Computer Science", "UBIT", "University of Karachi") belong to their respective institution owners. The source code of this tool is published under open-source software terms.
                  </p>

                  <h3 className="text-base font-bold text-textMain">Information Collection & Seat Number Lookups</h3>
                  <p className="text-textMuted text-xs sm:text-sm">
                    The Results Portal allows students to verify publicly announced department exam scores using seat numbers (e.g. B23101001). We do not sell, rent, or trade student details to third parties. Authentication state and session keys are secured using industry-standard TLS encryption.
                  </p>

                  <div className="pt-2">
                    <a
                      href="https://github.com/Asad101001/ubit-gpa-calculator"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 hover:text-brand-300 bg-brand-500/10 border border-brand-500/20 px-3.5 py-2 rounded-xl transition-colors"
                    >
                      <ExternalLink size={14} /> View Open Source Repository on GitHub
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'grading' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <h3 className="text-base font-bold text-textMain">Official UBIT Semester Grading Formula</h3>
                <p className="text-textMuted text-xs sm:text-sm">
                  GPA (Grade Point Average) is calculated by multiplying the credit hours of each course by the Grade Point earned, summing them up, and dividing by total credit hours attempted.
                </p>

                {/* Table */}
                <div className="overflow-x-auto rounded-2xl border border-border/60 bg-surface/40">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-surfaceHighlight text-textMain font-bold border-b border-border/60">
                      <tr>
                        <th className="py-3 px-4">Marks Range</th>
                        <th className="py-3 px-4">Grade Point (GP)</th>
                        <th className="py-3 px-4">Letter Grade</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-textMuted font-mono">
                      <tr className="hover:bg-surfaceHighlight/30"><td className="py-2.5 px-4 font-bold text-emerald-400">85 - 100</td><td className="py-2.5 px-4 font-bold text-textMain">4.0</td><td className="py-2.5 px-4">A+ / A</td><td className="py-2.5 px-4 text-emerald-400">Outstanding</td></tr>
                      <tr className="hover:bg-surfaceHighlight/30"><td className="py-2.5 px-4 text-emerald-400">80 - 84</td><td className="py-2.5 px-4 font-bold text-textMain">3.8</td><td className="py-2.5 px-4">A-</td><td className="py-2.5 px-4 text-emerald-400">Excellent</td></tr>
                      <tr className="hover:bg-surfaceHighlight/30"><td className="py-2.5 px-4 text-brand-400">75 - 79</td><td className="py-2.5 px-4 font-bold text-textMain">3.4</td><td className="py-2.5 px-4">B+</td><td className="py-2.5 px-4 text-brand-400">Very Good</td></tr>
                      <tr className="hover:bg-surfaceHighlight/30"><td className="py-2.5 px-4 text-brand-400">71 - 74</td><td className="py-2.5 px-4 font-bold text-textMain">3.0</td><td className="py-2.5 px-4">B</td><td className="py-2.5 px-4 text-brand-400">Good</td></tr>
                      <tr className="hover:bg-surfaceHighlight/30"><td className="py-2.5 px-4">68 - 70</td><td className="py-2.5 px-4 font-bold text-textMain">2.8</td><td className="py-2.5 px-4">B-</td><td className="py-2.5 px-4">Above Average</td></tr>
                      <tr className="hover:bg-surfaceHighlight/30"><td className="py-2.5 px-4">64 - 67</td><td className="py-2.5 px-4 font-bold text-textMain">2.4</td><td className="py-2.5 px-4">C+</td><td className="py-2.5 px-4">Average</td></tr>
                      <tr className="hover:bg-surfaceHighlight/30"><td className="py-2.5 px-4">61 - 63</td><td className="py-2.5 px-4 font-bold text-textMain">2.0</td><td className="py-2.5 px-4">C</td><td className="py-2.5 px-4">Satisfactory</td></tr>
                      <tr className="hover:bg-surfaceHighlight/30"><td className="py-2.5 px-4">57 - 60</td><td className="py-2.5 px-4 font-bold text-textMain">1.8</td><td className="py-2.5 px-4">C-</td><td className="py-2.5 px-4 text-yellow-500">Below Average</td></tr>
                      <tr className="hover:bg-surfaceHighlight/30"><td className="py-2.5 px-4">50 - 56</td><td className="py-2.5 px-4 font-bold text-textMain">1.0 - 1.4</td><td className="py-2.5 px-4">D+, D</td><td className="py-2.5 px-4 text-yellow-500">Pass (Minimum)</td></tr>
                      <tr className="hover:bg-surfaceHighlight/30"><td className="py-2.5 px-4 text-red-400">&lt; 50</td><td className="py-2.5 px-4 font-bold text-red-400">0.0</td><td className="py-2.5 px-4 text-red-400">F</td><td className="py-2.5 px-4 text-red-400">Fail</td></tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 sm:p-6 bg-surfaceHighlight/50 border-t border-border flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95"
            >
              I Understand & Agree
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
