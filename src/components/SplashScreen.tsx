import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 0);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] bg-slate-50 flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-brand-500/30 blur-3xl rounded-full" />
        <div className="relative flex flex-col items-center p-8 bg-white/70 border border-slate-300 rounded-3xl shadow-2xl backdrop-blur-xl">
          <GraduationCap size={64} className="text-brand-400 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-widest uppercase">UBIT GPA</h1>
          <div className="w-12 h-1 bg-brand-500/50 rounded-full mt-4 overflow-hidden relative">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="absolute top-0 left-0 h-full w-full bg-brand-400 rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
