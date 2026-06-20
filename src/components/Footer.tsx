import { motion } from 'framer-motion';
import { Code, Zap, Database, Activity } from 'lucide-react';

export const Footer = () => (
  <footer className="w-full border-t border-slate-300 mt-16 py-8 bg-white/90 backdrop-blur-md relative overflow-hidden">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
      
      <div className="flex flex-col items-center md:items-start opacity-70 hover:opacity-100 transition-opacity">
        <div className="text-sm text-slate-600 font-medium">
          <strong>Developed by AI</strong>
        </div>
        <div className="text-xs text-slate-500 mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <a 
            href="https://muhammadasad-portfolio.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-brand-400 transition-colors font-semibold"
          >
            + Asad (Batch '28)
          </a>
          <span className="hidden sm:inline text-slate-300">|</span>
          <a 
            href="https://github.com/Asad101001/ubit-gpa-calculator" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-slate-800 transition-colors flex items-center gap-1 opacity-70 hover:opacity-100"
          >
            <Code size={12} /> Source
          </a>
        </div>
        
        {/* Theme Switcher */}
        <div className="mt-4 flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200">
          {[
            { id: 'emerald', color: 'bg-emerald-500' },
            { id: 'cyberpunk', color: 'bg-violet-500' },
            { id: 'sunset', color: 'bg-amber-500' },
            { id: 'ocean', color: 'bg-blue-500' },
            { id: 'rose', color: 'bg-rose-500' }
          ].map(theme => (
            <button
              key={theme.id}
              onClick={() => document.documentElement.setAttribute('data-theme', theme.id === 'emerald' ? '' : theme.id)}
              className={`w-6 h-6 rounded-md ${theme.color} hover:scale-110 hover:shadow-md transition-all border border-black/10`}
              title={`Switch to ${theme.id} theme`}
            />
          ))}
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
