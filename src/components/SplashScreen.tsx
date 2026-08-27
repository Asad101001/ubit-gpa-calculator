import { useEffect } from 'react';
import { motion } from 'framer-motion';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center"
    >
      {/* Background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'url(/images/ubit_building_night.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(60%) brightness(0.5)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center gap-5"
      >
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-brand-500/30 shadow-2xl shadow-brand-500/20">
          <img
            src="/images/ubit_logo.jpg"
            alt="UBIT Logo"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-center">
          <h1 className="text-xl font-black text-white tracking-tight">UBIT GPA Calculator</h1>
          <p className="text-xs text-white/50 mt-1 font-medium">
            Umaer Basha Institute of IT · Batch '28
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-40 h-0.5 bg-border rounded-full overflow-hidden">
          <motion.div 
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.8, ease: 'linear', delay: 0.2 }}
            className="h-full w-full bg-brand-400 rounded-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
