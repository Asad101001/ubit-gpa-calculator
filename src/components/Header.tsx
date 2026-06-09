import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export const Header = () => (
  <motion.header 
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="sticky top-0 z-50 w-full glass border-b border-slate-300 py-1.5 sm:py-3"
  >
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="bg-brand-500/20 p-1 sm:p-2 rounded-lg sm:rounded-xl border border-brand-500/30">
          <GraduationCap className="text-brand-400 w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </div>
        <div className="font-bold text-base sm:text-lg tracking-tight text-slate-800">
          DCS <span className="text-brand-400">UBIT</span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <nav className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-sm font-medium text-slate-600">
          <a href="#calculator" className="hover:text-slate-900 transition-colors">Calculator</a>
          <a href="#analytics" className="hover:text-slate-900 transition-colors">Analytics</a>
          <a href="#leaderboard" className="hover:text-slate-900 transition-colors">Leaderboard</a>
        </nav>
        <div className="px-2 sm:px-3 py-1 rounded-full bg-white/90 text-slate-900 border border-slate-300 text-[10px] sm:text-xs font-bold tracking-wider">
          BATCH '28
        </div>
      </div>
    </div>
  </motion.header>
);
