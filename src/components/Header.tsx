import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Shield, ChevronDown, Menu, X, Calculator, LineChart, Trophy, Table } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import type { ViewType } from '../App';

export const Header = ({ currentView, navigateTo, activeSection = 'calculator' }: { currentView: ViewType, navigateTo: (v: ViewType) => void, activeSection?: string }) => {
  const { user, profile, openAuthModal, signOut } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    setIsMobileMenuOpen(false);
    await signOut();
    navigateTo('main');
  };

  const navItems = [
    { id: 'calculator', label: 'Calculator', section: 'calculator', view: 'main' as const, icon: Calculator },
    { id: 'analytics', label: 'Analytics', section: 'analytics', view: 'main' as const, icon: LineChart },
    { id: 'leaderboard', label: 'Leaderboard', section: 'leaderboard', view: 'main' as const, icon: Trophy },
    { id: 'results', label: 'Results', section: '', view: 'results' as const, icon: Table },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.view === 'results') return currentView === 'results';
    return currentView === 'main' && activeSection === item.section;
  };

  const handleNav = (item: typeof navItems[0]) => {
    setIsMobileMenuOpen(false);
    navigateTo(item.view);
    if (item.section) {
      setTimeout(() => document.getElementById(item.section)?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex justify-between items-center h-14 sm:h-16">
        {/* Logo & Branding */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
          <button
            onClick={() => { setIsMobileMenuOpen(false); navigateTo('main'); }}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden border-2 border-black shadow-[2px_2px_0px_0px_#000] flex-shrink-0 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              <img
                src="/images/ubit_logo.jpg"
                alt="UBIT Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="font-black text-xs sm:text-sm tracking-tight text-black">
                UBIT <span className="bg-yellow-400 px-1 py-0.2 rounded border border-black text-[10px] sm:text-xs">RESULTS</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-gray-600 tracking-wide uppercase mt-0.5">
                BSCS Batch 2024–28
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2 ml-4">
            {navItems.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all border-2 ${
                    isActive(item)
                      ? 'bg-yellow-400 text-black border-black shadow-[2px_2px_0px_0px_#000]'
                      : 'text-gray-700 hover:text-black border-transparent hover:border-black/30 hover:bg-gray-100'
                  }`}
                >
                  <IconComp size={13} strokeWidth={2.5} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">


          {/* Auth Controls */}
          {user && profile ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black rounded-lg font-bold text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <div className="w-5 h-5 bg-black text-yellow-400 rounded-full flex items-center justify-center text-[10px] font-black">
                  {profile.full_name.charAt(0)}
                </div>
                <span className="max-w-[70px] sm:max-w-[100px] truncate text-[11px] sm:text-xs">
                  {profile.full_name.split(' ')[0]}
                </span>
                {profile.is_admin && <Shield size={11} className="text-black" />}
                <ChevronDown size={12} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_#000] overflow-hidden z-50"
                  >
                    <div className="px-3.5 py-2.5 border-b border-gray-200 bg-yellow-50">
                      <p className="text-xs font-black text-black truncate">{profile.full_name}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5 truncate">{profile.seat_no ? `Seat No: ${profile.seat_no}` : profile.email}</p>
                      {profile.is_admin && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-extrabold bg-black text-yellow-400 px-1.5 py-0.5 rounded">
                          ADMIN
                        </span>
                      )}
                    </div>

                    <div className="p-1.5 space-y-0.5">
                      <button
                        onClick={() => { setIsDropdownOpen(false); navigateTo('profile'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-gray-800 hover:bg-yellow-400 hover:text-black transition-colors text-left"
                      >
                        <User size={13} />
                        My Profile & Marks
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut size={13} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-gray-800 text-yellow-400 rounded-lg font-bold text-xs border-2 border-black shadow-[2px_2px_0px_0px_#E6B400] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <User size={13} />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-lg text-black transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t-2 border-black bg-white px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.1)] overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-bold border-2 transition-all text-left ${
                      active
                        ? 'bg-yellow-400 text-black border-black shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-black'
                    }`}
                  >
                    <Icon size={14} className={active ? 'text-black' : 'text-gray-500'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
