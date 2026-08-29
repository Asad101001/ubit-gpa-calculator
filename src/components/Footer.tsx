import { Code, Zap, Database, Activity, ArrowUp, ShieldCheck, FileText, Scale, ExternalLink, Heart, BookOpen } from 'lucide-react';
import type { ViewType } from '../App';


export const Footer = ({ navigateTo }: { navigateTo?: (view: ViewType) => void }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-white border-t-2 border-black mt-12 sm:mt-20 pb-32 sm:pb-14 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-8 sm:space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Col 1: About UBIT & Department */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg overflow-hidden border-2 border-black shadow-[2px_2px_0px_0px_#000] flex-shrink-0">
                <img src="/images/ubit_logo.webp" alt="UBIT Logo" width="36" height="36" className="w-full h-full object-cover" />
              </div>

              <div>
                <h3 className="font-black text-sm text-black tracking-tight leading-none">
                  UBIT <span className="bg-yellow-400 px-1 py-0.2 rounded border border-black text-[10px]">RESULTS</span>
                </h3>
                <p className="text-[10px] text-gray-600 font-bold uppercase mt-0.5">DCS · University of Karachi</p>
              </div>
            </div>

            <p className="text-xs text-gray-700 font-medium leading-relaxed">
              Official academic results, transcript generator, target CGPA advisor, and analytics for BSCS Batch 2024–2028.
            </p>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-400 border border-black text-[10px] font-black text-black shadow-[1px_1px_0px_0px_#000]">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              BSCS Batch 2024–28 · DCS UOK
            </div>
          </div>

          {/* Col 2: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b-2 border-black/10">
              <BookOpen size={13} className="text-yellow-600" />
              Navigation
            </h4>
            <ul className="grid grid-cols-1 gap-2 text-xs font-bold text-gray-700">
              <li>
                <button 
                  onClick={() => { navigateTo?.('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-black hover:underline transition-colors text-left flex items-center gap-1.5 py-0.5"
                >
                  <span className="text-yellow-500 font-black">›</span> Home & Overview
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { navigateTo?.('calculator'); setTimeout(() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                  className="hover:text-black hover:underline transition-colors text-left flex items-center gap-1.5 py-0.5"
                >
                  <span className="text-yellow-500 font-black">›</span> GPA Calculator
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { navigateTo?.('calculator'); setTimeout(() => document.getElementById('target-advisor')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                  className="hover:text-black hover:underline transition-colors text-left flex items-center gap-1.5 py-0.5"
                >
                  <span className="text-yellow-500 font-black">›</span> Target CGPA Advisor
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo?.('results')}
                  className="hover:text-black hover:underline transition-colors text-left flex items-center gap-1.5 py-0.5"
                >
                  <span className="text-yellow-500 font-black">›</span> Class Results Portal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo?.('profile')}
                  className="hover:text-black hover:underline transition-colors text-left flex items-center gap-1.5 py-0.5"
                >
                  <span className="text-yellow-500 font-black">›</span> Student Profile & Account
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal, Terms & Grading Policy */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b-2 border-black/10">
              <Scale size={13} className="text-yellow-600" />
              Policies & Info
            </h4>
            <ul className="space-y-2 text-xs font-bold text-gray-700">
              <li>
                <button 
                  onClick={() => navigateTo?.('terms')}
                  className="hover:text-black hover:underline transition-colors flex items-center gap-2 text-left py-0.5"
                >
                  <FileText size={13} className="text-gray-500" />
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo?.('privacy')}
                  className="hover:text-black hover:underline transition-colors flex items-center gap-2 text-left py-0.5"
                >
                  <ShieldCheck size={13} className="text-gray-500" />
                  Privacy & Disclaimer
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo?.('grading')}
                  className="hover:text-black hover:underline transition-colors flex items-center gap-2 text-left py-0.5"
                >
                  <Scale size={13} className="text-gray-500" />
                  Official Grading Scale
                </button>
              </li>
              <li>
                <a 
                  href="https://uok.edu.pk/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-black hover:underline transition-colors flex items-center gap-1.5 py-0.5"
                >
                  <ExternalLink size={12} className="text-gray-500" />
                  University of Karachi Official
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: AI & Developer Credits */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b-2 border-black/10">
              <Code size={13} className="text-yellow-600" />
              Engineering
            </h4>
            <div className="p-3 bg-gray-50 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1.5">
              <p className="text-xs font-black text-black flex items-center gap-1.5">
                <Heart size={13} className="text-red-500 fill-red-500" /> Crafted by Asad
              </p>
              <p className="text-[11px] text-gray-600 font-medium">
                High-performance academic suite built for DCS UBIT students.
              </p>
              <div className="pt-1 flex items-center gap-2 text-xs font-bold">
                <a 
                  href="https://muhammadasad-portfolio.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-black underline hover:text-yellow-600 transition-colors"
                >
                  Portfolio
                </a>
                <span className="text-gray-400">·</span>
                <a 
                  href="https://github.com/Asad101001/ubit-gpa-calculator" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-black flex items-center gap-1 transition-colors"
                >
                  <Code size={12} /> GitHub
                </a>
              </div>
            </div>

            {/* Tech Badges */}
            <div className="flex items-center gap-1.5 pt-0.5">
              {[
                { icon: Code, name: "React 19" },
                { icon: Zap, name: "Vite" },
                { icon: Database, name: "Supabase" },
                { icon: Activity, name: "Tailwind" },
              ].map((Tech, i) => (
                <div 
                  key={i}
                  className="px-2 py-1 rounded-md bg-white border border-black text-[10px] font-bold text-gray-700 flex items-center gap-1 shadow-[1px_1px_0px_0px_#000]"
                >
                  <Tech.icon size={11} />
                  <span>{Tech.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Line & Scroll to Top */}
        <div className="pt-6 sm:pt-8 border-t-2 border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-gray-600">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-4 text-center sm:text-left">
            <span>© {new Date().getFullYear()} UBIT Academic Results & GPA Hub</span>
            <span className="hidden sm:inline text-gray-400">•</span>
            <span className="text-[11px] font-mono text-gray-500">BSCS Batch 2024–28</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:scale-95 text-xs font-black transition-all"
          >
            <ArrowUp size={13} strokeWidth={2.5} />
            <span>Back to Top</span>
          </button>
        </div>

      </div>
    </footer>
  );
};

