import { Home, User, Table, LineChart, Trophy, FileText } from 'lucide-react';

import type { ViewType } from '../App';
import { useAuthStore } from '../store/useAuthStore';
import { triggerConfetti } from '../lib/confetti';

interface MobileBottomNavProps {
  currentView: ViewType;
  navigateTo: (v: ViewType) => void;
  activeSection?: string;
  onGeneratePdf?: () => void;
}

export const MobileBottomNav = ({
  currentView,
  navigateTo,
  activeSection = 'calculator',
  onGeneratePdf
}: MobileBottomNavProps) => {
  const { user, profile, openAuthModal } = useAuthStore();

  const handleNav = (view: ViewType, sectionId?: string) => {
    navigateTo(view);
    if (sectionId && view === 'main') {
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const isCalcActive = currentView === 'main' && activeSection === 'calculator';
  const isAnalyticsActive = currentView === 'main' && activeSection === 'analytics';
  const isLeaderboardActive = currentView === 'main' && activeSection === 'leaderboard';
  const isResultsActive = currentView === 'results';
  const isProfileActive = currentView === 'profile';

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-yellow-400 border-t-2 border-black shadow-[0_-4px_10px_rgba(0,0,0,0.15)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around px-1 py-1.5 h-16 max-w-md mx-auto">
        
        {/* 1. HOME / CALC */}
        <button
          onClick={() => handleNav('main', 'calculator')}
          className={`flex flex-col items-center justify-center flex-1 h-full px-1 transition-all ${
            isCalcActive 
              ? 'text-black font-black scale-105' 
              : 'text-black/75 hover:text-black font-bold'
          }`}
        >
          <div className={`p-1 rounded-md transition-colors ${isCalcActive ? 'bg-black text-yellow-400 shadow-[1px_1px_0px_0px_#000]' : ''}`}>
            <Home size={18} strokeWidth={2.5} />
          </div>
          <span className="text-[9px] uppercase tracking-tighter mt-0.5 leading-none">Home</span>
        </button>

        {/* 2. PROFILE / AUTH */}
        <button
          onClick={() => {
            if (user && profile) {
              handleNav('profile');
            } else {
              openAuthModal();
            }
          }}
          className={`flex flex-col items-center justify-center flex-1 h-full px-1 transition-all ${
            isProfileActive 
              ? 'text-black font-black scale-105' 
              : 'text-black/75 hover:text-black font-bold'
          }`}
        >
          <div className={`p-1 rounded-md transition-colors ${isProfileActive ? 'bg-black text-yellow-400 shadow-[1px_1px_0px_0px_#000]' : ''}`}>
            <User size={18} strokeWidth={2.5} />
          </div>
          <span className="text-[9px] uppercase tracking-tighter mt-0.5 leading-none">
            {user ? 'Profile' : 'Sign In'}
          </span>
        </button>

        {/* 3. RESULTS (Center raised active pill if selected) */}
        <button
          onClick={() => handleNav('results')}
          className={`flex flex-col items-center justify-center flex-1 h-full px-1 transition-all relative ${
            isResultsActive
              ? 'bg-black text-yellow-400 rounded-t-lg -translate-y-2 py-2 border-2 border-b-0 border-black shadow-[2px_-2px_0px_0px_#000]'
              : 'text-black/75 hover:text-black font-bold'
          }`}
        >
          {isResultsActive && (
            <div className="absolute -top-1 left-2 right-2 h-1 bg-red-500 rounded-full" />
          )}
          <div className={`p-1 rounded-md ${isResultsActive ? 'text-yellow-400' : ''}`}>
            <Table size={18} strokeWidth={2.5} />
          </div>
          <span className={`text-[9px] uppercase tracking-tighter mt-0.5 leading-none ${isResultsActive ? 'font-black text-yellow-400' : 'font-bold'}`}>
            Results
          </span>
        </button>

        {/* 4. ANALYTICS */}
        <button
          onClick={() => handleNav('main', 'analytics')}
          className={`flex flex-col items-center justify-center flex-1 h-full px-1 transition-all ${
            isAnalyticsActive 
              ? 'text-black font-black scale-105' 
              : 'text-black/75 hover:text-black font-bold'
          }`}
        >
          <div className={`p-1 rounded-md transition-colors ${isAnalyticsActive ? 'bg-black text-yellow-400 shadow-[1px_1px_0px_0px_#000]' : ''}`}>
            <LineChart size={18} strokeWidth={2.5} />
          </div>
          <span className="text-[9px] uppercase tracking-tighter mt-0.5 leading-none">Stats</span>
        </button>

        {/* 5. LEADERBOARD */}
        <button
          onClick={() => handleNav('main', 'leaderboard')}
          className={`flex flex-col items-center justify-center flex-1 h-full px-1 transition-all ${
            isLeaderboardActive 
              ? 'text-black font-black scale-105' 
              : 'text-black/75 hover:text-black font-bold'
          }`}
        >
          <div className={`p-1 rounded-md transition-colors ${isLeaderboardActive ? 'bg-black text-yellow-400 shadow-[1px_1px_0px_0px_#000]' : ''}`}>
            <Trophy size={18} strokeWidth={2.5} />
          </div>
          <span className="text-[9px] uppercase tracking-tighter mt-0.5 leading-none">Ranks</span>
        </button>

        {/* 6. RESUME / TRANSCRIPT (Red brutalist button on right) */}
        <button
          onClick={() => {
            if (onGeneratePdf) {
              triggerConfetti();
              onGeneratePdf();
            } else {
              handleNav('main', 'calculator');
            }
          }}
          className="flex flex-col items-center justify-center h-12 px-2 ml-0.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all shrink-0"
          title="Download 1-Page Official Transcript PDF"
        >
          <FileText size={16} strokeWidth={2.5} />
          <span className="text-[8.5px] font-black uppercase tracking-tight mt-0.5 leading-none">PDF</span>
        </button>

      </div>
    </nav>
  );
};
