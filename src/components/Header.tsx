import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export const Header = ({ currentView, navigateTo, activeSection = 'calculator' }: { currentView: 'main' | 'results', navigateTo: (v: 'main' | 'results') => void, activeSection?: string }) => (
  <motion.header 
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="sticky top-0 z-50 w-full glass border-b border-border py-2 sm:py-3"
  >
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => navigateTo('main')}>
        <div className="bg-gradient-to-br from-brand-500/20 to-accent-500/20 p-1 sm:p-2 rounded-lg sm:rounded-xl border border-brand-500/30 shadow-[0_0_15px_rgba(var(--color-brand-500),0.1)] transition-all hover:scale-105">
          <GraduationCap className="text-brand-500 w-5 h-5 sm:w-[18px] sm:h-[18px]" />
        </div>
        <div className="font-bold text-sm sm:text-lg tracking-tight text-textMain hidden sm:block">
          DCS <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-accent-500">UBIT</span>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <nav className="flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm font-medium text-textMuted bg-surface/50 p-1 rounded-xl border border-border">
          <a href="#calculator" onClick={(e) => { e.preventDefault(); navigateTo('main'); setTimeout(() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className={`${currentView === 'main' && activeSection === 'calculator' ? 'text-textMain font-bold bg-surfaceHighlight shadow-sm' : 'text-textMuted hover:text-textMain hover:bg-surfaceHighlight/50'} px-3 py-1.5 rounded-lg transition-all`}>Calculator</a>
          <a href="#analytics" onClick={(e) => { e.preventDefault(); navigateTo('main'); setTimeout(() => document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className={`${currentView === 'main' ? 'hidden sm:block' : 'hidden'} ${activeSection === 'analytics' && currentView === 'main' ? 'text-textMain font-bold bg-surfaceHighlight shadow-sm' : 'text-textMuted hover:text-textMain hover:bg-surfaceHighlight/50'} px-3 py-1.5 rounded-lg transition-all`}>Analytics</a>
          <a href="#leaderboard" onClick={(e) => { e.preventDefault(); navigateTo('main'); setTimeout(() => document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className={`${currentView === 'main' ? 'hidden sm:block' : 'hidden'} ${activeSection === 'leaderboard' && currentView === 'main' ? 'text-textMain font-bold bg-surfaceHighlight shadow-sm' : 'text-textMuted hover:text-textMain hover:bg-surfaceHighlight/50'} px-3 py-1.5 rounded-lg transition-all`}>Leaderboard</a>
          <button onClick={() => navigateTo('results')} className={`${currentView === 'results' ? 'text-brand-500 font-bold bg-brand-500/10 shadow-sm' : 'text-textMuted hover:text-brand-500 hover:bg-brand-500/10'} px-3 py-1.5 rounded-lg transition-all`}>Results</button>
        </nav>
        <div className="px-2 sm:px-3 py-1 rounded-full bg-surface/90 text-textMain border border-border text-[9px] sm:text-xs font-bold tracking-wider hidden sm:block">
          BATCH '28
        </div>
      </div>
    </div>
  </motion.header>
);
