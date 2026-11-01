import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, Table, User, Target, 
  BookOpen, ArrowRight, FileText, FileSpreadsheet 
} from 'lucide-react';

import type { ViewType } from '../App';
import { useAuthStore } from '../store/useAuthStore';
import { OfficialMarksheetsModal } from './OfficialMarksheetsModal';

interface HomePageProps {
  navigateTo: (view: ViewType) => void;
  gpa1?: string;
  gpa2?: string;
  cgpa?: string;
  hasGrades?: boolean;
}

export const HomePage = ({ navigateTo }: HomePageProps) => {
  const { user, profile, openAuthModal } = useAuthStore();
  const [isMarksheetsModalOpen, setIsMarksheetsModalOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
  };

  return (
    <>
      <OfficialMarksheetsModal
        isOpen={isMarksheetsModalOpen}
        onClose={() => setIsMarksheetsModalOpen(false)}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 sm:space-y-12 pb-8"
      >
        {/* ── 1. HERO SECTION (Unblocked initial paint for instant LCP) ── */}
        <section className="relative">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-black shadow-[6px_6px_0px_0px_#000000] bg-surface group">
            <img
              src="/images/ubit_building_day.webp"
              alt="UBIT Building - Department of Computer Science"
              width="1200"
              height="320"
              fetchPriority="high"
              decoding="async"
              className="w-full h-56 sm:h-72 md:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
              loading="eager"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent flex items-end p-4 sm:p-8">
              <div className="text-left max-w-3xl w-full">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#801618] text-white border-2 border-black font-black text-[10px] sm:text-xs tracking-wider uppercase mb-2 shadow-[1.5px_1.5px_0px_0px_#000]">
                  <BookOpen size={11} strokeWidth={2.5} />
                  Department of Computer Science · University of Karachi
                </span>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-2">
                  UBIT Academic Portal
                </h1>
                <p className="text-gray-300 text-xs sm:text-sm font-medium max-w-2xl mb-4 leading-relaxed line-clamp-2 sm:line-clamp-none">
                  The centralized academic result platform and GPA calculator for BSCS Batch 2024–28. Instant GPA calculations, official single-page transcripts, target simulators, and batch ranking.
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
                  <button
                    onClick={() => navigateTo('calculator')}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#801618] hover:bg-[#9b1b1e] text-white rounded-xl border-2 border-black font-black text-xs sm:text-sm shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all w-full sm:w-auto"
                  >
                    <Calculator size={16} strokeWidth={2.5} />
                    <span>Launch GPA Calculator</span>
                  </button>

                  <button
                    onClick={() => navigateTo('results')}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white hover:bg-gray-100 text-black rounded-xl border-2 border-black font-black text-xs sm:text-sm shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all w-full sm:w-auto"
                  >
                    <Table size={16} strokeWidth={2.5} />
                    <span>Explore Class Results</span>
                  </button>

                  <button
                    onClick={() => setIsMarksheetsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-amber-400 hover:bg-amber-300 text-black rounded-xl border-2 border-black font-black text-xs sm:text-sm shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all w-full sm:w-auto"
                  >
                    <FileText size={16} strokeWidth={2.5} />
                    <span>Official Marksheets Archive</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. FOUR MAIN MODULE CARDS ── */}
        <motion.section variants={itemVariants} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#801618] animate-pulse" />
            <h3 className="text-xs font-black font-mono uppercase tracking-wider text-textMuted">
              Explore Platform Features
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 'calc',
                title: 'GPA Calculator',
                desc: 'Enter subject scores with step controls, real-time GP calculation, and 90 credit hour tracking across 5 semesters.',
                action: () => navigateTo('calculator'),
                btnText: 'Open Calculator',
                icon: Calculator,
                badge: 'Interactive'
              },
              {
                id: 'results',
                title: 'Results Portal',
                desc: 'Search batch results by name or seat number, filter courses, and export single-page PDF transcripts.',
                action: () => navigateTo('results'),
                btnText: 'Browse Results',
                icon: Table,
                badge: 'Batch Data'
              },
              {
                id: 'target',
                title: 'Target CGPA Advisor',
                desc: 'Simulate target GPAs, determine required improvement scores, and plan future semester targets.',
                action: () => navigateTo('calculator'),
                btnText: 'Simulate Target',
                icon: Target,
                badge: 'Smart Roadmap'
              },
              {
                id: 'profile',
                title: 'Student Profile',
                desc: 'Claim your seat number, verify student credentials, and securely manage your semester marks.',
                action: () => {
                  if (user && profile) {
                    navigateTo('profile');
                  } else {
                    openAuthModal('signin');
                  }
                },
                btnText: user ? 'View Profile' : 'Sign In',
                icon: User,
                badge: user ? 'Verified' : 'Auth Required'
              },
            ].map((card) => {
              const IconComp = card.icon;
              return (
                <div
                  key={card.id}
                  onClick={card.action}
                  className="group p-4 sm:p-5 rounded-2xl bg-surface border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-[#801618] border-2 border-black text-white group-hover:scale-110 transition-transform shadow-[1.5px_1.5px_0px_0px_#000]">
                        <IconComp size={18} strokeWidth={2.5} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 border border-black text-black">
                        {card.badge}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-textMain group-hover:text-[#801618] transition-colors">
                      {card.title}
                    </h4>
                    <p className="text-xs text-textMuted font-medium mt-1.5 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-black text-black">
                    <span>{card.btnText}</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* ── 3. OFFICIAL UNIVERSITY MARKSHEET ARCHIVE FEATURE ── */}
        <motion.section variants={itemVariants} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="text-xs font-black font-mono uppercase tracking-wider text-textMuted">
                Official Department Records & Gazettes
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase hidden sm:inline">
              Physical Marksheet Scans (PDF)
            </span>
          </div>

          <div className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-50 via-white to-rose-50 border-2 border-black shadow-[5px_5px_0px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000] shrink-0">
                <FileSpreadsheet size={24} strokeWidth={2.5} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base sm:text-xl font-black text-black">
                    Physical University Marksheets (PDF Archive)
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#801618] text-white border border-black uppercase">
                    Sem 1 – 3 Scans
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1 max-w-2xl leading-relaxed">
                  Access and inspect high-resolution scanned copies of official departmental marksheets, signed teacher gazettes, and verified tabulation records across all semesters.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsMarksheetsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#801618] hover:bg-[#9b1b1e] text-white font-black text-xs sm:text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all w-full md:w-auto shrink-0"
            >
              <FileText size={16} strokeWidth={2.5} />
              <span>Open Marksheet Archive</span>
              <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        </motion.section>
      </motion.div>
    </>
  );
};
