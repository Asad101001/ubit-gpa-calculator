import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Check, Info, ShieldCheck } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage = ({ onBack }: TermsPageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-4xl mx-auto space-y-8 pb-28 sm:pb-16 pt-4"

    >
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-surfaceHighlight hover:bg-surfaceHighlight/80 text-textMain rounded-xl border-2 border-black font-extrabold text-xs shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          <ArrowLeft size={16} />
          Back to Calculator
        </button>
        <div className="text-right">
          <span className="text-[10px] font-extrabold tracking-widest text-textMuted uppercase">Legal Document</span>
          <p className="text-xs font-bold text-textMain">Last Updated: August 2026</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="glass-card p-6 sm:p-10 space-y-8 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex items-center gap-4 pb-6 border-b-2 border-black">
          <div className="p-3 bg-yellow-400 text-black border-2 border-black rounded-xl font-black shadow-[3px_3px_0px_0px_#000000]">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-textMain tracking-tight">Terms of Service (TOC)</h1>
            <p className="text-xs sm:text-sm text-textMuted font-semibold mt-1">
              Umaer Basha Institute of Information Technology • University of Karachi
            </p>
          </div>
        </div>

        <div className="p-4 bg-yellow-400/10 border-2 border-black rounded-xl flex items-start gap-3">
          <Info className="text-black shrink-0 mt-0.5" size={20} />
          <p className="text-xs text-textMain font-bold">
            By accessing or using the UBIT GPA Calculator & Results Portal, you agree to comply with and be bound by these Terms of Service.
          </p>
        </div>

        <div className="space-y-6 text-sm text-textMain leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-textMain flex items-center gap-2">
              <Check className="text-emerald-600" size={18} /> 1. Educational Estimation Purpose
            </h2>
            <p className="text-textMuted text-xs sm:text-sm pl-6 leading-relaxed">
              This software tool is provided solely for educational, planning, and self-assessment purposes for students of the Department of Computer Science (UBIT), University of Karachi. While every effort is made to maintain complete accuracy with official UOK semester grading regulations, calculated values serve as estimates and do not replace official transcript documents issued by the Semester Examination Section.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-textMain flex items-center gap-2">
              <Check className="text-emerald-600" size={18} /> 2. Community & Leaderboard Integrity
            </h2>
            <p className="text-textMuted text-xs sm:text-sm pl-6 leading-relaxed">
              When submitting entries to the public Leaderboard or interacting with student profiles:
            </p>
            <ul className="list-disc pl-12 space-y-1.5 text-xs sm:text-sm text-textMuted font-medium">
              <li>You must provide accurate, non-misleading information and true seat numbers.</li>
              <li>Submissions containing offensive language, hate speech, or malicious text will be automatically removed.</li>
              <li>Impersonation of faculty members or fellow students is strictly prohibited.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-textMain flex items-center gap-2">
              <Check className="text-emerald-600" size={18} /> 3. Data & Local Storage Usage
            </h2>
            <p className="text-textMuted text-xs sm:text-sm pl-6 leading-relaxed">
              The app utilizes your browser's Local Storage to save course grade inputs offline for convenience. Authentication and profile synchronization (when opted-in) are handled securely via Supabase infrastructure.
            </p>
          </section>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-textMuted">
            <ShieldCheck size={16} className="text-emerald-600" />
            Verified UBIT Community Standard
          </div>
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </motion.div>
  );
};
