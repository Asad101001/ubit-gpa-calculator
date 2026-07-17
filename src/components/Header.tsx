import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, LogIn, User, LogOut, Shield, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const Header = ({ currentView, navigateTo, activeSection = 'calculator' }: { currentView: 'main' | 'results' | 'profile', navigateTo: (v: 'main' | 'results' | 'profile') => void, activeSection?: string }) => {
  const { user, profile, openAuthModal, signOut } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    await signOut();
    navigateTo('main');
  };

  return (
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

          {/* Auth Controls */}
          {user && profile ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-black text-white rounded-sm font-bold text-[11px] sm:text-xs border-2 border-black transition-all hover:bg-zinc-800 uppercase tracking-wider"
                style={{ boxShadow: '2px 2px 0px 0px rgb(230, 180, 0)' }}
              >
                <div className="w-5 h-5 bg-white text-black rounded-sm flex items-center justify-center text-[10px] font-black">
                  {profile.full_name.charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[80px] truncate">{profile.full_name.split(' ')[0]}</span>
                {profile.is_admin && <Shield size={10} className="text-yellow-400" />}
                <ChevronDown size={12} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-surface border-2 border-black rounded-sm overflow-hidden z-50"
                    style={{ boxShadow: '4px 4px 0px 0px #000000' }}
                  >
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs font-bold text-textMain truncate">{profile.full_name}</p>
                      <p className="text-[10px] text-textMuted font-mono truncate">{profile.email}</p>
                    </div>
                    <button
                      onClick={() => { setIsDropdownOpen(false); navigateTo('profile'); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-textMain hover:bg-surfaceHighlight transition-colors text-left uppercase tracking-wider"
                    >
                      <User size={14} /> My Profile
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-500/10 transition-colors text-left uppercase tracking-wider border-t border-border"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-sm font-bold text-[11px] sm:text-xs border-2 border-black transition-all hover:bg-zinc-800 uppercase tracking-wider"
              style={{ boxShadow: '2px 2px 0px 0px rgb(230, 180, 0)' }}
            >
              <LogIn size={14} />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
};
