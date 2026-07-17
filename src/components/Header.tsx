import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, LogIn, User, LogOut, Shield, ChevronDown, ShieldCheck } from 'lucide-react';
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => navigateTo('main')}>
            <div className="bg-gradient-to-br from-brand-500/20 to-accent-500/20 p-1 sm:p-2 rounded-lg sm:rounded-xl border border-brand-500/30 shadow-[0_0_15px_rgba(var(--color-brand-500),0.1)] transition-all hover:scale-105">
              <GraduationCap className="text-brand-500 w-5 h-5 sm:w-[18px] sm:h-[18px]" />
            </div>
            <div className="font-bold text-sm sm:text-lg tracking-tight text-textMain hidden sm:block">
              DCS <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-accent-500">UBIT</span>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-surface/90 text-textMain border border-border text-[10px] sm:text-xs font-bold tracking-wider hidden md:block shadow-sm">
            BATCH '28
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <nav className="flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm font-medium text-textMuted bg-surface/50 p-1 rounded-xl border border-border">
            <a href="#calculator" onClick={(e) => { e.preventDefault(); navigateTo('main'); setTimeout(() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className={`${currentView === 'main' && activeSection === 'calculator' ? 'text-textMain font-bold bg-surfaceHighlight shadow-sm' : 'text-textMuted hover:text-textMain hover:bg-surfaceHighlight/50'} px-3 py-1.5 rounded-lg transition-all`}>Calculator</a>
            <a href="#analytics" onClick={(e) => { e.preventDefault(); navigateTo('main'); setTimeout(() => document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className={`${currentView === 'main' ? 'hidden sm:block' : 'hidden'} ${activeSection === 'analytics' && currentView === 'main' ? 'text-textMain font-bold bg-surfaceHighlight shadow-sm' : 'text-textMuted hover:text-textMain hover:bg-surfaceHighlight/50'} px-3 py-1.5 rounded-lg transition-all`}>Analytics</a>
            <a href="#leaderboard" onClick={(e) => { e.preventDefault(); navigateTo('main'); setTimeout(() => document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className={`${currentView === 'main' ? 'hidden sm:block' : 'hidden'} ${activeSection === 'leaderboard' && currentView === 'main' ? 'text-textMain font-bold bg-surfaceHighlight shadow-sm' : 'text-textMuted hover:text-textMain hover:bg-surfaceHighlight/50'} px-3 py-1.5 rounded-lg transition-all`}>Leaderboard</a>
            <button onClick={() => navigateTo('results')} className={`${currentView === 'results' ? 'text-brand-500 font-bold bg-brand-500/10 shadow-sm' : 'text-textMuted hover:text-brand-500 hover:bg-brand-500/10'} px-3 py-1.5 rounded-lg transition-all`}>Results</button>
          </nav>

          {/* Auth Controls */}
          {user && profile ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 bg-gradient-to-r from-surfaceHighlight/80 to-surface/80 hover:from-surfaceHighlight hover:to-surfaceHighlight text-textMain rounded-full font-bold text-xs border-[1.5px] border-border/80 hover:border-brand-500/30 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.1)] group"
              >
                <div className="w-7 h-7 bg-black text-brand-500 rounded-full flex items-center justify-center text-[11px] font-black group-hover:scale-105 transition-transform border border-brand-500/20">
                  {profile.full_name.charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{profile.full_name.split(' ')[0]}</span>
                {profile.is_admin && <Shield size={12} className="text-yellow-500" />}
                <ChevronDown size={14} className={`transition-transform text-textMuted ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-56 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-border/50 bg-surfaceHighlight/30 flex flex-col items-start">
                      <p className="text-sm font-bold text-textMain truncate w-full">{profile.full_name}</p>
                      <p className="text-[11px] text-textMuted font-medium truncate mt-0.5 mb-2 w-full">{profile.email}</p>
                      {profile.is_admin ? (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider shadow-sm">
                          <Shield size={10} /> Admin
                        </span>
                      ) : profile.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-green-500/10 text-green-500 border border-green-500/30 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider shadow-sm">
                          <ShieldCheck size={10} /> Verified User
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-surfaceHighlight text-textMuted border border-border px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider shadow-sm">
                          Unverified
                        </span>
                      )}
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={() => { setIsDropdownOpen(false); navigateTo('profile'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-textMain hover:bg-brand-500/10 hover:text-brand-500 rounded-xl transition-colors text-left"
                      >
                        <User size={16} /> My Profile
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-left mt-1"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="flex items-center gap-2 px-4 py-2 bg-textMain text-background rounded-full font-bold text-xs transition-all hover:bg-textMain/90 hover:scale-105 shadow-md shadow-brand-500/10"
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
