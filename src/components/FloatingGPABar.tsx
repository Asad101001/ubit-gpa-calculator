import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, FileDown, ArrowUp } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { triggerConfetti } from '../lib/confetti';

interface FloatingGPABarProps {
  cgpa: string;
  gpa1: string;
  gpa2: string;
  gpa3: string;
  onGeneratePdf?: () => void;
}

export const FloatingGPABar = ({ cgpa, gpa1, gpa2, gpa3, onGeneratePdf }: FloatingGPABarProps) => {

  const numCgpa = parseFloat(cgpa) || 0;
  if (numCgpa <= 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-xl"
      >
        <div className="bg-white/95 backdrop-blur-md border-2 border-black rounded-2xl p-2.5 sm:p-3 shadow-[4px_4px_0px_0px_#000000,7px_7px_0px_0px_#E6B400] flex items-center justify-between gap-2 sm:gap-4">
          
          {/* CGPA Score with animated ticker */}
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div 
              whileHover={{ rotate: [0, -10, 10, 0] }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-yellow-400 border-2 border-black flex items-center justify-center text-black shrink-0 shadow-[1.5px_1.5px_0px_0px_#000]"
            >
              <Trophy size={18} strokeWidth={2.5} />
            </motion.div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-gray-700">Live CGPA</span>
                {numCgpa >= 3.5 && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[8.5px] font-black bg-green-100 text-green-800 border border-green-400 px-1.5 py-0.2 rounded-full">
                    <Sparkles size={9} /> Honors
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-black leading-none">
                  <AnimatedCounter value={numCgpa} decimals={2} />
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-gray-500">/ 4.00</span>
              </div>
            </div>
          </div>

          {/* Semester pills (tablet/desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <div className="px-2 py-1 bg-yellow-50 border border-black rounded-lg text-center font-mono text-[10px]">
              <span className="text-gray-500 font-bold block text-[8px] uppercase">S1</span>
              <span className="font-black text-black">{gpa1 || '—'}</span>
            </div>
            <div className="px-2 py-1 bg-yellow-50 border border-black rounded-lg text-center font-mono text-[10px]">
              <span className="text-gray-500 font-bold block text-[8px] uppercase">S2</span>
              <span className="font-black text-black">{gpa2 || '—'}</span>
            </div>
            <div className="px-2 py-1 bg-yellow-50 border border-black rounded-lg text-center font-mono text-[10px]">
              <span className="text-gray-500 font-bold block text-[8px] uppercase">S3</span>
              <span className="font-black text-black">{gpa3 || '—'}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onGeneratePdf && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  triggerConfetti();
                  onGeneratePdf();
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-black rounded-xl border-2 border-black font-black text-xs shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                title="Download Single-Page Official PDF Transcript"
              >
                <FileDown size={13} strokeWidth={2.5} />
                <span className="hidden sm:inline">PDF Transcript</span>
                <span className="sm:hidden">PDF</span>
              </motion.button>
            )}

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-black rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              title="Scroll to Top"
            >
              <ArrowUp size={14} strokeWidth={2.5} />
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
