import { motion } from 'framer-motion';
import { Code, Zap, Database, Activity, ArrowUp, ShieldCheck, FileText, Scale, ExternalLink, Heart } from 'lucide-react';
import type { ViewType } from '../App';

export const Footer = ({ navigateTo }: { navigateTo?: (view: ViewType) => void }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="w-full border-t border-border mt-20 relative overflow-hidden bg-surface/90 backdrop-blur-xl">
        {/* Subtle HD Campus Background Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.07] bg-cover bg-center pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: 'url(/images/campus_bg.jpg)' }}
        />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 space-y-12">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Col 1: About UBIT & Department */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-border/60 shadow-md flex-shrink-0">
                  <img src="/images/ubit_logo.jpg" alt="UBIT Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-textMain tracking-tight">UBIT GPA Portal</h3>
                  <p className="text-[11px] text-textMuted font-medium">University of Karachi</p>
                </div>
              </div>
              <p className="text-xs text-textMuted leading-relaxed">
                Umaer Basha Institute of Information Technology · University of Karachi. Automated GPA/CGPA calculations, target path advisory, and academic analytics.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surfaceHighlight border border-border text-[10px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Batch '28 · BSCS
              </div>
            </div>

            {/* Col 2: Quick Navigation */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-textMain uppercase tracking-widest flex items-center gap-2">
                Quick Navigation
              </h4>
              <ul className="space-y-2 text-xs font-medium text-textMuted">
                <li>
                  <a 
                    href="#calculator" 
                    onClick={(e) => { e.preventDefault(); navigateTo?.('main'); setTimeout(() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                    className="hover:text-brand-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-border">›</span> GPA Calculator
                  </a>
                </li>
                <li>
                  <a 
                    href="#analytics" 
                    onClick={(e) => { e.preventDefault(); navigateTo?.('main'); setTimeout(() => document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                    className="hover:text-brand-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-border">›</span> Analytics & Target Advisor
                  </a>
                </li>
                <li>
                  <a 
                    href="#leaderboard" 
                    onClick={(e) => { e.preventDefault(); navigateTo?.('main'); setTimeout(() => document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                    className="hover:text-brand-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-border">›</span> Class Leaderboard
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo?.('results')}
                    className="hover:text-brand-400 transition-colors text-left flex items-center gap-2"
                  >
                    <span className="text-border">›</span> Department Results Portal
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo?.('profile')}
                    className="hover:text-brand-400 transition-colors text-left flex items-center gap-2"
                  >
                    <span className="text-border">›</span> Student Profile & Account
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Legal, Terms & Grading Policy */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-textMain uppercase tracking-widest flex items-center gap-2">
                Legal & Governance
              </h4>
              <ul className="space-y-2 text-xs font-medium text-textMuted">
                <li>
                  <button 
                    onClick={() => navigateTo?.('terms')}
                    className="hover:text-brand-400 transition-colors flex items-center gap-2 text-left"
                  >
                    <FileText size={13} className="text-brand-400" />
                    Terms of Service (TOC)
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo?.('privacy')}
                    className="hover:text-brand-400 transition-colors flex items-center gap-2 text-left"
                  >
                    <ShieldCheck size={13} className="text-emerald-400" />
                    Privacy & Legal Disclaimer
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo?.('grading')}
                    className="hover:text-brand-400 transition-colors flex items-center gap-2 text-left"
                  >
                    <Scale size={13} className="text-amber-500" />
                    UBIT Grading Scale Policy
                  </button>
                </li>
                <li>
                  <a 
                    href="https://uok.edu.pk/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-brand-400 transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink size={12} /> University of Karachi Official
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: AI & Developer Credits */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-textMain uppercase tracking-widest">
                Platform Engineering
              </h4>
              <div className="p-3 bg-surfaceHighlight/50 rounded-2xl border border-border/80 space-y-2">
                <p className="text-xs font-bold text-textMain flex items-center gap-1.5">
                  <Heart size={14} className="text-red-400 fill-red-400" /> Developed by AI + Asad
                </p>
                <p className="text-[11px] text-textMuted">
                  Built for UBIT students with high-performance modern web stack.
                </p>
                <div className="pt-1 flex items-center gap-3">
                  <a 
                    href="https://muhammadasad-portfolio.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-brand-400 hover:text-brand-300 underline underline-offset-4 transition-colors"
                  >
                    Portfolio
                  </a>
                  <span className="text-border">|</span>
                  <a 
                    href="https://github.com/Asad101001/ubit-gpa-calculator" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-textMuted hover:text-textMain flex items-center gap-1 transition-colors"
                  >
                    <Code size={13} /> Source Code
                  </a>
                </div>
              </div>

              {/* Tech Badges */}
              <div className="flex items-center gap-2 pt-1">
                {[
                  { icon: Code, name: "React 19" },
                  { icon: Zap, name: "Vite" },
                  { icon: Database, name: "Supabase" },
                  { icon: Activity, name: "Tailwind CSS" },
                ].map((Tech, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.15, y: -2 }}
                    className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-textMuted hover:text-textMain hover:border-brand-500/30 transition-all group relative cursor-pointer"
                  >
                    <Tech.icon size={14} />
                    <span className="absolute -top-7 bg-surfaceHighlight px-2 py-1 rounded text-[10px] font-bold text-textMain opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-border shadow-sm">
                      {Tech.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Line & Scroll to Top */}
          <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-textMuted">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <span>© {new Date().getFullYear()} UBIT GPA Calculator. All rights reserved.</span>
              <span className="hidden sm:inline text-border">•</span>
              <button onClick={() => navigateTo?.('terms')} className="hover:text-textMain transition-colors">
                Terms of Use
              </button>
              <span className="hidden sm:inline text-border">•</span>
              <button onClick={() => navigateTo?.('privacy')} className="hover:text-textMain transition-colors">
                Privacy Notice
              </button>
            </div>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surfaceHighlight hover:bg-brand-500/20 text-textMuted hover:text-brand-400 border border-border transition-all active:scale-95 text-xs font-bold"
            >
              <ArrowUp size={14} />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};
