import { motion } from 'framer-motion';
import { 
  Calculator, Table, User, Target, 
  BookOpen, Award, ArrowRight, ShieldCheck, Sparkles, CheckCircle2,
  GraduationCap, FileText, Zap, ChevronRight
} from 'lucide-react';
import type { ViewType } from '../App';
import { useAuthStore } from '../store/useAuthStore';

interface HomePageProps {
  navigateTo: (view: ViewType) => void;
  gpa1?: string;
  gpa2?: string;
  cgpa?: string;
  hasGrades?: boolean;
}

export const HomePage = ({ navigateTo }: HomePageProps) => {

  const { user, profile, openAuthModal } = useAuthStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
  };


  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 sm:space-y-12 pb-8"
    >
      {/* ── 1. HERO SECTION ── */}
      <motion.section variants={itemVariants} className="relative">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-black shadow-[6px_6px_0px_0px_#000000] bg-surface group">
          <img
            src="/images/ubit_building_day.jpg"
            alt="UBIT Building"
            className="w-full h-52 sm:h-72 md:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
            loading="eager"
          />

          {/* Floating Badges */}
          <div className="absolute top-3 right-3 hidden sm:flex items-center gap-2">
            <div className="px-3 py-1.5 bg-yellow-400 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 text-xs font-black text-black">
              <Zap size={13} className="text-black" />
              <span>BSCS Batch 2024–28</span>
            </div>
            <div className="px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 text-xs font-black text-black">
              <Award size={13} className="text-yellow-500" />
              <span>4.00 A+ Scale</span>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent flex items-end p-5 sm:p-8">
            <div className="text-left max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-400 text-black border-2 border-black font-black text-[10px] sm:text-xs tracking-wider uppercase mb-2 shadow-[1.5px_1.5px_0px_0px_#000]">
                <BookOpen size={11} strokeWidth={2.5} />
                Umaer Basha Institute of Information Technology
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Academic Results & GPA Hub
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-200 font-bold mt-1.5 leading-relaxed">
                Official results portal, real-time GPA/CGPA simulator, target path advisor, and departmental analytics for Department of Computer Science (DCS), University of Karachi.
              </p>

              {/* Action Buttons in Hero */}
              <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-6">
                <button
                  onClick={() => navigateTo('calculator')}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-yellow-400 hover:bg-yellow-300 text-black rounded-xl border-2 border-black font-black text-xs sm:text-sm shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  <Calculator size={16} strokeWidth={2.5} />
                  <span>Launch GPA Calculator</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  onClick={() => navigateTo('results')}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white hover:bg-gray-100 text-black rounded-xl border-2 border-black font-black text-xs sm:text-sm shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  <Table size={16} strokeWidth={2.5} />
                  <span>Explore Class Results</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 2. QUICK STATS BANNER ── */}
      <motion.section variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Batch Enrollment', value: '75 Students', sub: 'BSCS Morning 2024–28', icon: GraduationCap, color: 'bg-yellow-400 text-black' },
          { label: 'Active Curricula', value: '18 Courses', sub: 'Sem 1, Sem 2 & Sem 3', icon: BookOpen, color: 'bg-black text-yellow-400' },
          { label: 'Grading Ceiling', value: '4.00 Max GP', sub: '85+ A+ Grade Benchmark', icon: Award, color: 'bg-yellow-400 text-black' },
          { label: 'Transcripts', value: '1-Page PDF', sub: 'Instant Export & Print', icon: FileText, color: 'bg-black text-yellow-400' },
        ].map((stat, idx) => {
          const IconComp = stat.icon;
          return (
            <div
              key={idx}
              className="p-3.5 sm:p-4 rounded-2xl bg-surface border-2 border-black shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-textMuted">{stat.label}</span>
                <div className={`p-1.5 rounded-lg border-2 border-black ${stat.color}`}>
                  <IconComp size={14} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-base sm:text-xl font-black font-mono text-textMain tracking-tight">{stat.value}</p>
                <p className="text-[10px] font-bold text-textMuted mt-0.5">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </motion.section>

      {/* ── 3. BRIEF ABOUT UBIT & THE PLATFORM ── */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: About Department */}
        <div className="lg:col-span-2 p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-surface border-2 border-black shadow-[5px_5px_0px_0px_#000] space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b-2 border-black/10">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 border-2 border-black flex items-center justify-center font-black text-black">
              <BookOpen size={16} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-textMain tracking-tight">
                About UBIT & DCS
              </h2>
              <p className="text-[10px] sm:text-xs font-bold text-textMuted uppercase tracking-wider">
                Department of Computer Science · University of Karachi
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-textMain font-medium leading-relaxed">
            <p>
              The <strong>Umaer Basha Institute of Information Technology (UBIT)</strong> is the dedicated computing institute at the Department of Computer Science (DCS), University of Karachi. Established to pioneer computer science education and software engineering in Pakistan, it nurtures students across modern paradigms of AI, Systems, Web Technologies, and Computational Theory.
            </p>
            <p>
              This portal serves the <strong>BSCS Batch 2024–2028</strong> with high-precision academic grade calculations, semester historical comparisons, single-page official transcripts, and automated target CGPA roadmap simulations.
            </p>
          </div>

          {/* Key Platform Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-yellow-50 rounded-xl border-2 border-black flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-black">Authentic 4.0 A+ Scale</h4>
                <p className="text-[11px] text-gray-700 mt-0.5">Strict adherence to UOK official grading policies with 85+ awarded as 4.0 (A+).</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border-2 border-black flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-black shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-black">Verified & Secure</h4>
                <p className="text-[11px] text-gray-700 mt-0.5">Authenticated student editing with live Supabase security & fallbacks.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Launch Card */}
        <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-yellow-400 border-2 border-black shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black text-yellow-400 rounded text-[10px] font-black uppercase tracking-wider mb-2">
              <Sparkles size={11} />
              Quick Launch
            </div>
            <h3 className="text-xl font-black text-black tracking-tight leading-tight">
              Calculate Your CGPA & Targets
            </h3>
            <p className="text-xs text-black/85 font-bold mt-2 leading-relaxed">
              Input marks for Semester 1, 2, and 3 to see live GPAs, visual grade radar charts, and achievable roadmaps.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => navigateTo('calculator')}
              className="w-full py-3 bg-black hover:bg-gray-900 text-yellow-400 rounded-xl border-2 border-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <Calculator size={16} />
              <span>Go to Calculator</span>
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => navigateTo('results')}
              className="w-full py-2.5 bg-white hover:bg-yellow-100 text-black rounded-xl border-2 border-black font-black text-xs flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <Table size={14} />
              <span>View All 75 Students</span>
            </button>
          </div>
        </div>
      </motion.section>

      {/* ── 4. FOUR MAIN MODULE CARDS ── */}
      <motion.section variants={itemVariants} className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
          <h3 className="text-xs font-black font-mono uppercase tracking-wider text-textMuted">
            Explore Platform Features
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 'calc',
              title: 'GPA Calculator',
              desc: 'Enter subject scores with step controls, real-time GP calculation, and 54 credit hour tracking.',
              action: () => navigateTo('calculator'),
              btnText: 'Open Calculator',
              icon: Calculator,
              badge: 'Interactive'
            },
            {
              id: 'results',
              title: 'Results Portal',
              desc: 'Search batch results by name or seat number, filter courses, and export single-page PDF transcripts.',
              action: () => navigateTo('results'),
              btnText: 'Browse Results',
              icon: Table,
              badge: 'Batch Data'
            },
            {
              id: 'target',
              title: 'Target CGPA Advisor',
              desc: 'Simulate target GPAs, determine required improvement scores, and plan future semester targets.',
              action: () => navigateTo('calculator'),
              btnText: 'Simulate Target',
              icon: Target,
              badge: 'Smart Roadmap'
            },
            {
              id: 'profile',
              title: 'Student Profile',
              desc: 'Claim your seat number, verify student credentials, and securely manage your semester marks.',
              action: () => {
                if (user && profile) {
                  navigateTo('profile');
                } else {
                  openAuthModal('signin');
                }
              },
              btnText: user ? 'View Profile' : 'Sign In',
              icon: User,
              badge: user ? 'Verified' : 'Auth Required'
            },
          ].map((card) => {
            const IconComp = card.icon;
            return (
              <div
                key={card.id}
                onClick={card.action}
                className="group p-5 rounded-2xl bg-surface border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-yellow-400 border-2 border-black text-black group-hover:scale-110 transition-transform shadow-[1.5px_1.5px_0px_0px_#000]">
                      <IconComp size={18} strokeWidth={2.5} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 border border-black text-black">
                      {card.badge}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-textMain group-hover:text-yellow-600 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-xs text-textMuted font-medium mt-1.5 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-black text-black">
                  <span>{card.btnText}</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>
    </motion.div>
  );
};
