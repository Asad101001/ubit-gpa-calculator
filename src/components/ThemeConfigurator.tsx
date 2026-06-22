import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, X, Check } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import gsap from 'gsap';

const themes = [
  { id: 'light', name: 'Light', color: 'bg-indigo-500' },
  { id: 'midnight', name: 'Midnight', color: 'bg-violet-500' },
  { id: 'neon', name: 'Neon', color: 'bg-pink-500' }
] as const;

export const ThemeConfigurator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme: currentTheme, setTheme } = useAppStore();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && listRef.current) {
      gsap.fromTo(
        listRef.current.children,
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.05,
          duration: 0.4,
          ease: 'power3.out',
        }
      );
    }
  }, [isOpen]);

  const toggleOpen = () => {
    if (isOpen && listRef.current) {
      gsap.to(listRef.current.children, {
        opacity: 0,
        x: 20,
        stagger: 0.03,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => setIsOpen(false)
      });
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)', transition: { delay: 0.2 } }}
            className="mb-4 bg-surface/90 backdrop-blur-2xl border border-border p-4 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] flex flex-col gap-3 min-w-[200px]"
          >
            <div className="text-xs font-bold text-textMuted uppercase tracking-widest px-2 pb-2 border-b border-border/50">
              Select Theme
            </div>
            <div className="flex flex-col gap-1" ref={listRef}>
              {themes.map(theme => {
                const isActive = currentTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setTheme(theme.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all group ${
                      isActive 
                        ? 'bg-brand-500/10 text-brand-600' 
                        : 'hover:bg-surfaceHighlight text-textMain'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full ${theme.color} shadow-sm group-hover:scale-110 group-active:scale-95 transition-transform border border-border/20`} />
                      <span className={`text-sm font-semibold transition-colors ${isActive ? 'text-brand-600' : 'text-textMain'}`}>
                        {theme.name}
                      </span>
                    </div>
                    {isActive && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-brand-500"
                      >
                        <Check size={16} strokeWidth={3} />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleOpen}
        className="w-14 h-14 bg-gradient-to-br from-brand-500 to-accent-500 text-white rounded-full shadow-[0_8px_32px_0_rgba(var(--color-brand-500),0.4)] flex items-center justify-center hover:from-brand-600 hover:to-accent-600 transition-all border-2 border-white/20 z-10 relative overflow-hidden group"
      >
        <motion.div 
          className="absolute inset-0 bg-white/20 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.5, opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
        <div className="relative z-10 flex items-center justify-center text-white">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Palette size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>
    </div>
  );
};
