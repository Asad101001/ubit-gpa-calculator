import { Home, Calculator, Table, User } from 'lucide-react';
import type { ViewType } from '../App';
import { useAuthStore } from '../store/useAuthStore';

interface MobileBottomNavProps {
  currentView: ViewType;
  navigateTo: (v: ViewType) => void;
}

export const MobileBottomNav = ({
  currentView,
  navigateTo
}: MobileBottomNavProps) => {
  const { user, profile } = useAuthStore();

  const isHomeActive = currentView === 'home';
  const isCalcActive = currentView === 'calculator';
  const isResultsActive = currentView === 'results';
  const isProfileActive = currentView === 'profile';

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#801618] border-t-2 border-black shadow-[0_-4px_10px_rgba(0,0,0,0.25)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around px-3 py-1.5 h-16 max-w-md mx-auto gap-2">
        
        {/* 1. HOME */}
        <button
          onClick={() => navigateTo('home')}
          className={`flex flex-col items-center justify-center flex-1 h-full px-2 transition-all ${
            isHomeActive 
              ? 'text-white font-black scale-105' 
              : 'text-white/75 hover:text-white font-bold'
          }`}
        >
          <div className={`p-1 rounded-md transition-colors ${isHomeActive ? 'bg-white text-[#801618] shadow-[1.5px_1.5px_0px_0px_#000]' : ''}`}>
            <Home size={20} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] uppercase tracking-tight mt-0.5 leading-none">Home</span>
        </button>

        {/* 2. CALCULATOR */}
        <button
          onClick={() => navigateTo('calculator')}
          className={`flex flex-col items-center justify-center flex-1 h-full px-2 transition-all relative ${
            isCalcActive
              ? 'bg-white text-[#801618] rounded-t-lg -translate-y-2 py-2 border-2 border-b-0 border-black shadow-[2px_-2px_0px_0px_#000]'
              : 'text-white/75 hover:text-white font-bold'
          }`}
        >
          {isCalcActive && (
            <div className="absolute -top-1 left-3 right-3 h-1 bg-[#801618] rounded-full" />
          )}
          <div className={`p-1 rounded-md ${isCalcActive ? 'text-[#801618]' : ''}`}>
            <Calculator size={20} strokeWidth={2.5} />
          </div>
          <span className={`text-[10px] uppercase tracking-tight mt-0.5 leading-none ${isCalcActive ? 'font-black text-[#801618]' : 'font-bold'}`}>
            Calculator
          </span>
        </button>

        {/* 3. RESULTS */}
        <button
          onClick={() => navigateTo('results')}
          className={`flex flex-col items-center justify-center flex-1 h-full px-2 transition-all relative ${
            isResultsActive
              ? 'bg-white text-[#801618] rounded-t-lg -translate-y-2 py-2 border-2 border-b-0 border-black shadow-[2px_-2px_0px_0px_#000]'
              : 'text-white/75 hover:text-white font-bold'
          }`}
        >
          {isResultsActive && (
            <div className="absolute -top-1 left-3 right-3 h-1 bg-[#801618] rounded-full" />
          )}
          <div className={`p-1 rounded-md ${isResultsActive ? 'text-[#801618]' : ''}`}>
            <Table size={20} strokeWidth={2.5} />
          </div>
          <span className={`text-[10px] uppercase tracking-tight mt-0.5 leading-none ${isResultsActive ? 'font-black text-[#801618]' : 'font-bold'}`}>
            Results
          </span>
        </button>

        {/* 4. PROFILE (Only when signed in) */}
        {user && profile && (
          <button
            onClick={() => navigateTo('profile')}
            className={`flex flex-col items-center justify-center flex-1 h-full px-2 transition-all ${
              isProfileActive 
                ? 'text-white font-black scale-105' 
                : 'text-white/75 hover:text-white font-bold'
            }`}
          >
            <div className={`p-1 rounded-md transition-colors ${isProfileActive ? 'bg-white text-[#801618] shadow-[1.5px_1.5px_0px_0px_#000]' : ''}`}>
              <User size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] uppercase tracking-tight mt-0.5 leading-none">
              Profile
            </span>
          </button>
        )}

      </div>
    </nav>
  );
};

