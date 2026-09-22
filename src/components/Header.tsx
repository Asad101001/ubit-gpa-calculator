import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, LogOut, Shield, ChevronDown, Calculator, Table, Share2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import type { ViewType } from '../App';
import { shareNative, copyToClipboard, shareWhatsApp } from '../lib/shareUtils';
import { toast } from 'react-hot-toast';

export const Header = ({ currentView, navigateTo }: { currentView: ViewType, navigateTo: (v: ViewType) => void, activeSection?: string }) => {
  const { user, profile, openAuthModal, signOut } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    await signOut();
    navigateTo('home');
  };

  const navItems = [
    { id: 'home', label: 'Home', view: 'home' as const, icon: Home },
    { id: 'calculator', label: 'Calculator', view: 'calculator' as const, icon: Calculator },
    { id: 'results', label: 'Results', view: 'results' as const, icon: Table },
    ...(user && profile ? [{ id: 'profile', label: 'Profile', view: 'profile' as const, icon: User }] : []),
  ];

  const isActive = (item: typeof navItems[0]) => {
    return currentView === item.view;
  };

  const handleNav = (item: typeof navItems[0]) => {
    navigateTo(item.view);
  };

  return (
    <header
      role="banner"
      className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-md border-b-2 border-black"
      aria-label="UBIT Results site navigation"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex justify-between items-center h-14 sm:h-16">

        {/* Logo & Branding */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden border-2 border-black shadow-[2px_2px_0px_0px_#000] flex-shrink-0 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              <img
                src="/images/ubit_logo.webp"
                alt="UBIT – Umaer Basha Institute of Information Technology, University of Karachi"
                width="36"
                height="36"
                className="w-full h-full object-cover"
              />

            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="font-black text-xs sm:text-sm tracking-tight text-black">
                UBIT <span className="bg-[#801618] text-white px-1.5 py-0.5 rounded border border-black text-[10px] sm:text-xs font-black">RESULTS</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-gray-600 tracking-wide uppercase mt-0.5">
                BSCS Batch 2024–28
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2 ml-4" aria-label="Primary navigation">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const active = isActive(item);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item)}
                  aria-current={active ? 'page' : undefined}
                  aria-label={`Navigate to ${item.label}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all border-2 ${
                    active
                      ? 'bg-[#801618] text-white border-black shadow-[2px_2px_0px_0px_#000]'
                      : 'text-gray-700 hover:text-black border-transparent hover:border-black/30 hover:bg-gray-100'
                  }`}
                >
                  <IconComp size={13} strokeWidth={2.5} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Share Button */}
          <button
            onClick={async () => {
              const shared = await shareNative();
              if (!shared) {
                const ok = await copyToClipboard();
                if (ok) {
                  toast.success('Link copied! Share it with your classmates 🚀');
                } else {
                  shareWhatsApp();
                }
              }
            }}
            aria-label="Share UBIT Portal"
            title="Share UBIT GPA Calculator with friends"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 hover:text-black rounded-lg font-bold text-xs border-2 border-black/30 hover:border-black shadow-[1px_1px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Share2 size={13} strokeWidth={2.5} aria-hidden="true" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Auth Controls */}
          {user && profile ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="menu"
                aria-label={`${profile.full_name} account menu`}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#801618] hover:bg-[#9b1b1e] text-white rounded-lg font-bold text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <div className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-black border border-white/30">
                  {profile.full_name.charAt(0)}
                </div>
                <span className="max-w-[80px] sm:max-w-[120px] truncate text-[11px] sm:text-xs">
                  {profile.full_name.split(' ')[0]}
                </span>
                {profile.is_admin && <Shield size={11} className="text-white" />}
                <ChevronDown size={12} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    role="menu"
                    aria-label="Account options"
                    className="absolute right-0 mt-2 w-52 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_#000] overflow-hidden z-50"
                  >
                    <div className="px-3.5 py-2.5 border-b border-gray-200 bg-rose-50/70">
                      <p className="text-xs font-black text-black truncate">{profile.full_name}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5 truncate">{profile.seat_no ? `Seat No: ${profile.seat_no}` : profile.email}</p>
                      {profile.is_admin && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-extrabold bg-[#801618] text-white px-1.5 py-0.5 rounded border border-black">
                          ADMIN
                        </span>
                      )}
                    </div>

                    <div className="p-1.5 space-y-0.5">
                      <button
                        onClick={() => { setIsDropdownOpen(false); navigateTo('profile'); }}
                        role="menuitem"
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-gray-800 hover:bg-[#801618] hover:text-white transition-colors text-left"
                      >
                        <User size={13} />
                        My Profile & Marks
                      </button>
                      <button
                        onClick={handleSignOut}
                        role="menuitem"
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
              aria-label="Sign in to your UBIT student account"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-gray-900 text-white rounded-lg font-bold text-xs border-2 border-black shadow-[2px_2px_0px_0px_#801618] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <User size={13} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

