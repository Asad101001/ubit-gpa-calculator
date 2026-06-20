import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, X } from 'lucide-react';

const themes = [
  { id: 'rose', name: 'Rose', color: 'bg-rose-500' },
  { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500' },
  { id: 'cyberpunk', name: 'Cyberpunk', color: 'bg-violet-500' },
  { id: 'sunset', name: 'Sunset', color: 'bg-amber-500' },
  { id: 'ocean', name: 'Ocean', color: 'bg-blue-500' }
];

export const ThemeConfigurator = () => {
  const [isOpen, setIsOpen] = useState(false);

  const applyTheme = (themeId: string) => {
    document.documentElement.setAttribute('data-theme', themeId === 'emerald' ? 'emerald' : themeId);
    // Note: Since rose is default in CSS, we can also use '' for rose.
    if (themeId === 'rose') {
        document.documentElement.removeAttribute('data-theme');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-white/95 backdrop-blur-xl border border-slate-200/60 p-4 rounded-2xl shadow-2xl flex flex-col gap-3"
          >
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
              Select Theme
            </div>
            <div className="flex flex-col gap-2">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => applyTheme(theme.id)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors w-full text-left group"
                >
                  <div className={`w-5 h-5 rounded-full ${theme.color} shadow-sm group-hover:scale-110 transition-transform`} />
                  <span className="text-sm font-semibold text-slate-700">{theme.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-500 text-white rounded-full shadow-[0_8px_32px_0_rgba(var(--color-brand-500),0.4)] flex items-center justify-center hover:bg-brand-600 transition-colors border-2 border-white/20"
      >
        {isOpen ? <X size={24} /> : <Palette size={24} />}
      </motion.button>
    </div>
  );
};
