import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export const Header = ({ currentView, setCurrentView }: { currentView: 'main' | 'results', setCurrentView: (v: 'main' | 'results') => void }) => (
  <motion.header 
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="sticky top-0 z-50 w-full glass border-b border-border py-1.5 sm:py-3"
  >
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => setCurrentView('main')}>
        <div className="bg-gradient-to-br from-brand-500/20 to-accent-500/20 p-1 sm:p-2 rounded-lg sm:rounded-xl border border-brand-500/30 shadow-[0_0_15px_rgba(var(--color-brand-500),0.1)] transition-all hover:scale-105">
          <GraduationCap className="text-brand-500 w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </div>
        <div className="font-bold text-base sm:text-lg tracking-tight text-textMain">
          DCS <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-accent-500">UBIT</span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <nav className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-sm font-medium text-textMuted">
          <a href="#calculator" onClick={() => setCurrentView('main')} className={`${currentView === 'main' ? 'text-textMain font-bold' : ''} hover:text-textMain transition-colors`}>Calculator</a>
          <a href="#analytics" onClick={() => setCurrentView('main')} className={`${currentView === 'main' ? '' : 'hidden'} hover:text-textMain transition-colors`}>Analytics</a>
          <a href="#leaderboard" onClick={() => setCurrentView('main')} className={`${currentView === 'main' ? '' : 'hidden'} hover:text-textMain transition-colors`}>Leaderboard</a>
          <button onClick={() => setCurrentView('results')} className={`${currentView === 'results' ? 'text-brand-600 font-bold' : 'text-brand-600/80'} hover:text-brand-600 transition-colors`}>Results Portal</button>
        </nav>
        <div className="px-2 sm:px-3 py-1 rounded-full bg-surface/90 text-textMain border border-border text-[10px] sm:text-xs font-bold tracking-wider">
          BATCH '28
        </div>
      </div>
    </div>
  </motion.header>
);
