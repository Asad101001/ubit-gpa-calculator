import { motion } from 'framer-motion';
import { Code, Zap, Database, Activity } from 'lucide-react';

export const Footer = () => (
  <footer className="w-full border-t border-slate-300 mt-16 py-8 bg-white/90 backdrop-blur-md relative overflow-hidden">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
      
      <div className="flex flex-col items-center md:items-start opacity-70 hover:opacity-100 transition-opacity">
        <div className="text-sm text-slate-600 font-medium">
          <strong>Developed by AI</strong>
        </div>
        <div className="text-xs text-slate-500 mt-1">
          <a 
            href="https://muhammadasad-portfolio.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-brand-400 transition-colors font-semibold"
          >
            + Asad (Batch '28)
          </a>
        </div>
      </div>

      <div className="flex flex-col items-center md:items-end">
        <div className="flex gap-3">
          {[
            { icon: Code, name: "React" },
            { icon: Zap, name: "Vite" },
            { icon: Database, name: "Supabase" },
            { icon: Activity, name: "Tailwind" },
          ].map((Tech, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.15, y: -2 }}
              className="w-8 h-8 rounded-lg bg-white/70 border border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-white/30 transition-all group relative cursor-pointer"
            >
              <Tech.icon size={14} />
              <span className="absolute -top-7 bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {Tech.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </footer>
);
