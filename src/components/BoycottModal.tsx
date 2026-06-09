import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export const BoycottModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-[#0f172a] border border-slate-300 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute inset-0 pointer-events-none opacity-90 overflow-hidden flex flex-col justify-center gap-8 -rotate-12 scale-150">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="w-full h-12 bg-yellow-400 text-black font-black text-2xl tracking-widest uppercase flex items-center overflow-hidden shadow-xl" style={{ transform: i % 2 === 0 ? 'translateX(-10%)' : 'translateX(-5%)' }}>
                   <div className="flex whitespace-nowrap animate-tape-scroll" style={{ animationDirection: i % 2 === 0 ? 'normal' : 'reverse', animationDuration: '4s' }}>
                     {[...Array(10)].map((_, j) => (
                       <span key={j} className="px-4">⚠️ BOYCOTT BOYCOTT ⚠️</span>
                     ))}
                   </div>
                 </div>
               ))}
            </div>

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-slate-800 rounded-full text-slate-600 hover:text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-[250px] text-center bg-white/90 p-6 rounded-2xl backdrop-blur-md border border-slate-300">
              <AlertTriangle size={48} className="text-yellow-400 mb-4" />
              <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Access Denied</h2>
              <p className="text-slate-700 font-medium">Semester 03 data unavailable due to ongoing teachers association boycott.</p>
              <p className="text-slate-500 text-sm mt-4 font-mono">ERR_EXAMS_NOT_CONDUCTED</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
