import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, User, LogOut, Shield, ChevronDown, ShieldCheck } from 'lucide-react';
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

  const navItems = [
    { id: 'calculator', label: 'Calculator', section: 'calculator', view: 'main' as const },
    { id: 'analytics', label: 'Analytics', section: 'analytics', view: 'main' as const },
    { id: 'leaderboard', label: 'Leaderboard', section: 'leaderboard', view: 'main' as const },
    { id: 'results', label: 'Results', section: '', view: 'results' as const },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.view === 'results') return currentView === 'results';
    return currentView === 'main' && activeSection === item.section;
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 w-full glass border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-14 sm:h-16">
        {/* Logo & Branding */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <button
            onClick={() => navigateTo('main')}
            className="flex items-center gap-2.5 group"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-border/60 shadow-md flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
              <img
                src="/images/ubit_logo.jpg"
                alt="UBIT Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="font-black text-sm tracking-tight text-textMain">
                UBIT <span className="text-brand-400">GPA</span>
              </span>
              <span className="text-[9px] font-medium text-textMuted tracking-wide uppercase mt-0.5">
                Batch '28 · CS
              </span>
            </div>
          </button>

          {/* Separator */}
          <div className="hidden md:block h-6 w-px bg-border" />

          {/* Slim nav — desktop */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  navigateTo(item.view);
                  if (item.section) {
                    setTimeout(() => document.getElementById(item.section)?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap text-[13px] ${
                  isActive(item)
                    ? 'bg-brand-500/15 text-brand-400 font-semibold'
                    : 'text-textMuted hover:text-textMain hover:bg-surfaceHighlight/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile nav pill */}
          <nav className="flex md:hidden items-center gap-0.5 text-[11px] font-medium bg-surfaceHighlight/50 p-1 rounded-xl border border-border overflow-x-auto max-w-[calc(100vw-160px)] scrollbar-none">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  navigateTo(item.view);
                  if (item.section) {
                    setTimeout(() => document.getElementById(item.section)?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }
                }}
                className={`shrink-0 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  isActive(item)
                    ? 'text-brand-400 font-bold bg-brand-500/10'
                    : 'text-textMuted hover:text-textMain hover:bg-surfaceHighlight/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Auth Controls */}
          {user && profile ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 bg-surfaceHighlight/70 hover:bg-surfaceHighlight text-textMain rounded-full font-bold text-xs border border-border hover:border-brand-500/30 transition-all shadow-sm group"
              >
                <div className="w-7 h-7 bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center text-[11px] font-black border border-brand-500/30">
                  {profile.full_name.charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[80px] truncate text-[12px]">{profile.full_name.split(' ')[0]}</span>
                {profile.is_admin && <Shield size={11} className="text-yellow-400" />}
                <ChevronDown size={13} className={`transition-transform text-textMuted ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-52 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-border/50 bg-surfaceHighlight/20">
                      <p className="text-sm font-bold text-textMain truncate">{profile.full_name}</p>
                      <p className="text-[11px] text-textMuted mt-0.5 truncate">{profile.email}</p>
                      <div className="mt-2">
                        {profile.is_admin ? (
                          <span className="inline-flex items-center gap-1 text-[9px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            <Shield size={9} /> Admin
                          </span>
                        ) : profile.is_verified ? (
                          <span className="inline-flex items-center gap-1 text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            <ShieldCheck size={9} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] bg-surfaceHighlight text-textMuted border border-border px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <button
                        onClick={() => { setIsDropdownOpen(false); navigateTo('profile'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-textMain hover:bg-brand-500/10 hover:text-brand-400 rounded-xl transition-colors text-left"
                      >
                        <User size={15} /> My Profile
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-400 text-white rounded-full font-semibold text-xs transition-all hover:scale-105 shadow-md shadow-brand-500/20"
            >
              <LogIn size={13} />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
};
