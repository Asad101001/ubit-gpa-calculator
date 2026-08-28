import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, AlertCircle, ExternalLink, Lock } from 'lucide-react';

interface PrivacyPageProps {
  onBack: () => void;
}

export const PrivacyPage = ({ onBack }: PrivacyPageProps) => {
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
          <span className="text-[10px] font-extrabold tracking-widest text-textMuted uppercase">Privacy Policy</span>
          <p className="text-xs font-bold text-textMain">Department of Computer Science</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="glass-card p-6 sm:p-10 space-y-8 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex items-center gap-4 pb-6 border-b-2 border-black">
          <div className="p-3 bg-yellow-400 text-black border-2 border-black rounded-xl font-black shadow-[3px_3px_0px_0px_#000000]">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-textMain tracking-tight">Privacy & Legal Disclaimer</h1>
            <p className="text-xs sm:text-sm text-textMuted font-semibold mt-1">
              Umaer Basha Institute of Information Technology • University of Karachi
            </p>
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border-2 border-black rounded-xl flex items-start gap-3">
          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <p className="text-xs text-textMain font-bold">
            Disclaimer: This is an open-source, student-led portal. It is not officially operated, owned, or endorsed by the administrative body of the University of Karachi.
          </p>
        </div>

        <div className="space-y-6 text-sm text-textMain leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-textMain flex items-center gap-2">
              <Lock className="text-yellow-600" size={18} /> 1. Non-Affiliation & Copyright Notice
            </h2>
            <p className="text-textMuted text-xs sm:text-sm leading-relaxed">
              All trademarks, department names, logo representations, and course titles ("Department of Computer Science", "UBIT", "University of Karachi") belong to their respective institution owners. The source code of this tool is published under open-source software terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-textMain flex items-center gap-2">
              <Lock className="text-yellow-600" size={18} /> 2. Information Collection & Seat Number Lookups
            </h2>
            <p className="text-textMuted text-xs sm:text-sm leading-relaxed">
              The Results Portal allows students to verify publicly announced department exam scores using seat numbers (e.g. B23101001). We do not sell, rent, or trade student details to third parties. Authentication state and session keys are secured using industry-standard TLS encryption.
            </p>
          </section>

          <div className="pt-2">
            <a
              href="https://github.com/Asad101001/ubit-gpa-calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-black bg-yellow-400 border-2 border-black px-4 py-2.5 rounded-xl shadow-[3px_3px_0px_0px_#000000] hover:bg-yellow-300 transition-all"
            >
              <ExternalLink size={16} /> View Open Source Repository on GitHub
            </a>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t-2 border-black flex justify-between items-center">
          <span className="text-xs font-bold text-textMuted">UBIT Data Protection Policy</span>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-black text-white font-extrabold text-xs rounded-xl hover:bg-gray-800 transition-all"
          >
            Close & Return
          </button>
        </div>
      </div>
    </motion.div>
  );
};
