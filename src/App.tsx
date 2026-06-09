import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Calculator, Award, ChevronDown, Sparkles, 
  Trophy, Medal, Activity, Database, Code, Zap, Flame
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, ReferenceLine 
} from 'recharts';

const GRADE_MAPPING = {
  "A+ (90% & above)": 4.0,
  "A  (85% - 89%)": 4.0,
  "A- (80% - 84%)": 3.8,
  "B+ (75% - 79%)": 3.4,
  "B  (71% - 74%)": 3.0,
  "B- (68% - 70%)": 2.8,
  "C+ (64% - 67%)": 2.4,
  "C  (61% - 63%)": 2.0,
  "D+ (57% - 60%)": 1.8,
  "D  (45% - 56%)": 1.0,
  "FAIL (Below 45%)": 0.0
};

const GRADE_OPTIONS = Object.keys(GRADE_MAPPING);

const SEM1_COURSES = [
  { code: "CS-351", name: "Programming Fundamentals", credits: 4 },
  { code: "CS-353", name: "Intro to Information & Comm. Technologies", credits: 3 },
  { code: "CS-355", name: "Calculus & Analytical Geometry", credits: 3 },
  { code: "CS-357", name: "Applied Physics", credits: 3 },
  { code: "CS-359", name: "Functional English", credits: 3 },
  { code: "CS-361", name: "Islamic Studies / Ethics", credits: 2 }
];

const SEM2_COURSES = [
  { code: "CS-352", name: "Object Oriented Concepts & Programming", credits: 4 },
  { code: "CS-354", name: "Digital Logic Design", credits: 3 },
  { code: "CS-356", name: "Linear Algebra", credits: 3 },
  { code: "CS-358", name: "Discrete Structures", credits: 3 },
  { code: "CS-360", name: "Communication & Presentation Skills", credits: 3 },
  { code: "CS-362", name: "Ideology & Constitution of Pakistan", credits: 2 }
];

// MOCK LEADERBOARD DATA (Will be replaced by Supabase)
const MOCK_LEADERBOARD = [
  { rank: 1, name: "Muhammad Asad Khan", cgpa: 3.98 },
  { rank: 2, name: "Aisha Rehman", cgpa: 3.95 },
  { rank: 3, name: "Syed Ali Haider", cgpa: 3.91 },
  { rank: 4, name: "Fatima Noor", cgpa: 3.88 },
  { rank: 5, name: "Usman Tariq", cgpa: 3.85 },
  { rank: 6, name: "Bilal Ahmed", cgpa: 3.82 },
  { rank: 7, name: "Zainab Abbas", cgpa: 3.80 },
  { rank: 8, name: "Hassan Raza", cgpa: 3.75 },
  { rank: 9, name: "Sara Iqbal", cgpa: 3.72 },
  { rank: 10, name: "Omar Farooq", cgpa: 3.70 },
  { rank: 11, name: "Hira Malik", cgpa: 3.65 },
  { rank: 12, name: "Saad Imran", cgpa: 3.61 },
];

const Header = () => (
  <motion.header 
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    className="sticky top-0 z-50 w-full glass border-b border-white/5 py-4"
  >
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="bg-brand-500/20 p-2 rounded-xl border border-brand-500/30">
          <GraduationCap className="text-brand-400" size={24} />
        </div>
        <div className="font-bold text-xl tracking-tight text-white/90">
          DCS <span className="text-brand-400">UBIT</span>
        </div>
      </div>
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
        <a href="#calculator" className="hover:text-white transition-colors">Calculator</a>
        <a href="#analytics" className="hover:text-white transition-colors">Analytics</a>
        <a href="#leaderboard" className="hover:text-white transition-colors">Leaderboard</a>
        <div className="px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold pixel-hover tracking-wider">
          BATCH '28
        </div>
      </nav>
    </div>
  </motion.header>
);

const Footer = () => (
  <footer className="w-full border-t border-white/10 mt-32 py-12 bg-black/40 backdrop-blur-md relative overflow-hidden">
    {/* Subtle pixel decoration */}
    <div className="absolute bottom-0 left-0 w-full h-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMzM2QiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+')] opacity-20" />
    
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex flex-col items-center md:items-start">
        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Flame className="text-brand-400" size={20} /> Developed by
        </h4>
        <div className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-blue-500 tracking-tight">
          Muhammad Asad Khan
        </div>
        <p className="text-white/40 text-sm mt-1">Batch '28 • BSCS First Year</p>
      </div>

      <div className="flex flex-col items-center md:items-end">
        <div className="text-sm font-medium text-white/50 mb-3 uppercase tracking-widest text-[10px]">Powered By</div>
        <div className="flex gap-4">
          {[
            { icon: Code, name: "React" },
            { icon: Zap, name: "Vite" },
            { icon: Database, name: "Supabase" },
            { icon: Activity, name: "Tailwind" },
          ].map((Tech, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.2, rotate: 5 }}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-brand-400 hover:border-brand-400/50 transition-colors group relative"
            >
              <Tech.icon size={20} />
              <span className="absolute -top-8 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {Tech.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

const MetricCard = ({ title, value, icon: Icon, highlight = false, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`relative overflow-hidden p-6 rounded-[2rem] ${highlight ? 'bg-gradient-to-br from-brand-600 to-brand-400 border border-brand-400/50 shadow-[0_0_40px_rgba(20,184,166,0.3)] text-white' : 'glass-card'}`}
  >
    {highlight && (
      <>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-8 -mb-8" />
      </>
    )}
    <div className="relative z-10 flex items-center justify-between mb-6">
      <h3 className={`text-sm font-semibold uppercase tracking-widest ${highlight ? 'text-white/80' : 'text-white/50'}`}>
        {title}
      </h3>
      <div className={`p-2.5 rounded-2xl ${highlight ? 'bg-white/20 text-white backdrop-blur-md' : 'bg-white/5 text-brand-400'}`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
    </div>
    <div className="relative z-10 flex items-baseline gap-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl font-extrabold tracking-tight"
        >
          {value}
        </motion.div>
      </AnimatePresence>
      <span className={`text-lg font-medium ${highlight ? 'text-white/70' : 'text-white/40'}`}>/ 4.0</span>
    </div>
  </motion.div>
);

const CourseSelect = ({ course, value, onChange, delay = 0 }: any) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/[0.05] transition-all gap-4"
  >
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-brand-400 group-hover:scale-105 group-hover:bg-brand-500/10 transition-all shrink-0">
        <span className="text-[10px] uppercase font-bold text-white/40 mb-[-2px]">{course.code.split('-')[0]}</span>
        <span className="font-extrabold">{course.code.split('-')[1]}</span>
      </div>
      <div>
        <div className="font-semibold text-white/90 group-hover:text-white transition-colors text-[15px] leading-tight">
          {course.name}
        </div>
        <div className="text-xs font-bold text-white/30 uppercase mt-1 tracking-wider">
          {course.credits} Credits
        </div>
      </div>
    </div>
    <div className="relative min-w-[140px] sm:min-w-[180px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full glass-input text-white/90 py-3 pl-4 pr-10 rounded-xl cursor-pointer font-bold text-sm hover:bg-white/[0.05]"
      >
        {GRADE_OPTIONS.map((grade) => (
          <option key={grade} value={grade} className="bg-surface text-white py-2 font-medium">{grade}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none group-hover:text-brand-400 transition-colors" size={16} />
    </div>
  </motion.div>
);

function App() {
  const [sem1Grades, setSem1Grades] = useState<Record<string, string>>(
    SEM1_COURSES.reduce((acc, c) => ({ ...acc, [c.code]: GRADE_OPTIONS[4] }), {})
  );
  const [sem2Grades, setSem2Grades] = useState<Record<string, string>>(
    SEM2_COURSES.reduce((acc, c) => ({ ...acc, [c.code]: GRADE_OPTIONS[4] }), {})
  );

  const calculateGPA = (courses: typeof SEM1_COURSES, grades: Record<string, string>) => {
    let totalQP = 0;
    let totalCredits = 0;
    courses.forEach(c => {
      const gp = GRADE_MAPPING[grades[c.code] as keyof typeof GRADE_MAPPING];
      totalQP += gp * c.credits;
      totalCredits += c.credits;
    });
    return { gpa: totalQP / totalCredits, totalQP, totalCredits };
  };

  const { s1, s2, gpa1, gpa2, cgpa } = useMemo(() => {
    const s1Calc = calculateGPA(SEM1_COURSES, sem1Grades);
    const s2Calc = calculateGPA(SEM2_COURSES, sem2Grades);
    const cgpaCalc = (s1Calc.totalQP + s2Calc.totalQP) / (s1Calc.totalCredits + s2Calc.totalCredits);
    
    return {
      s1: s1Calc,
      s2: s2Calc,
      gpa1: s1Calc.gpa.toFixed(2),
      gpa2: s2Calc.gpa.toFixed(2),
      cgpa: cgpaCalc.toFixed(3)
    };
  }, [sem1Grades, sem2Grades]);

  // Chart Data
  const chartData = useMemo(() => {
    return [
      ...SEM1_COURSES.map(c => ({
        name: c.code,
        fullname: c.name,
        semester: 'Sem 1',
        gpa: GRADE_MAPPING[sem1Grades[c.code] as keyof typeof GRADE_MAPPING],
      })),
      ...SEM2_COURSES.map(c => ({
        name: c.code,
        fullname: c.name,
        semester: 'Sem 2',
        gpa: GRADE_MAPPING[sem2Grades[c.code] as keyof typeof GRADE_MAPPING],
      }))
    ];
  }, [sem1Grades, sem2Grades]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-4 rounded-xl border border-white/10 text-sm">
          <p className="font-bold text-white mb-1">{payload[0].payload.fullname}</p>
          <p className="text-white/60 text-xs mb-2">{payload[0].payload.semester}</p>
          <p className="text-brand-400 font-extrabold text-xl">GPA: {payload[0].value.toFixed(1)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen relative selection:bg-brand-500/30 font-sans">
      <Header />

      {/* Animated Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-500/10 blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-purple-500/10 blur-[120px] mix-blend-screen animate-blob animation-delay-4000" />
        
        {/* Pixel Overlay pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]" />
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 space-y-32">
        
        {/* HERO SECTION */}
        <section id="calculator" className="space-y-16">
          <motion.div 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center relative"
          >
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-brand-500/20 blur-xl rounded-full" />
              <div className="relative inline-flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-3xl mb-6 shadow-2xl backdrop-blur-md">
                <GraduationCap size={40} className="text-brand-400" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6 tracking-tighter">
              GPA Calculator
            </h1>
            <p className="text-xl text-white/50 font-medium max-w-2xl mx-auto flex items-center justify-center gap-2">
              <Sparkles size={20} className="text-brand-400" />
              Department of Computer Science (UBIT)
            </p>
          </motion.div>

          {/* METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <MetricCard title="Semester One GPA" value={gpa1} icon={Calculator} delay={0.1} />
            <MetricCard title="Semester Two GPA" value={gpa2} icon={Calculator} delay={0.2} />
            <MetricCard title="Cumulative CGPA" value={cgpa} icon={Award} highlight delay={0.3} />
          </div>

          {/* CALCULATOR FORMS */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-10">
            {/* SEMESTER 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-[2.5rem] p-6 md:p-10 border-white/10 relative overflow-hidden group"
            >
              {/* Subtle hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-500/5 border border-brand-500/20 flex items-center justify-center text-lg font-bold text-brand-400 shadow-[0_0_20px_rgba(20,184,166,0.15)]">
                    01
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white/90 tracking-tight">Semester One</h2>
                    <p className="text-sm font-medium text-white/40 uppercase tracking-widest mt-1">18 Credits</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                {SEM1_COURSES.map((course, idx) => (
                  <CourseSelect 
                    key={course.code} course={course} value={sem1Grades[course.code]}
                    onChange={(val: string) => setSem1Grades(prev => ({ ...prev, [course.code]: val }))}
                    delay={0.5 + (idx * 0.05)}
                  />
                ))}
              </div>
            </motion.div>

            {/* SEMESTER 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-[2.5rem] p-6 md:p-10 border-white/10 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center text-lg font-bold text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                    02
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white/90 tracking-tight">Semester Two</h2>
                    <p className="text-sm font-medium text-white/40 uppercase tracking-widest mt-1">18 Credits</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                {SEM2_COURSES.map((course, idx) => (
                  <CourseSelect 
                    key={course.code} course={course} value={sem2Grades[course.code]}
                    onChange={(val: string) => setSem2Grades(prev => ({ ...prev, [course.code]: val }))}
                    delay={0.6 + (idx * 0.05)}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ANALYTICS SECTION */}
        <section id="analytics" className="space-y-8 pt-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <Activity className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-extrabold text-white">Performance Analytics</h2>
          </div>
          
          <div className="glass rounded-[2.5rem] p-6 md:p-10 border-white/10 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <ReferenceLine y={3.0} stroke="rgba(20,184,166,0.5)" strokeDasharray="3 3" />
                <Bar dataKey="gpa" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.semester === 'Sem 1' ? '#14b8a6' : '#3b82f6'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* LEADERBOARD SECTION */}
        <section id="leaderboard" className="space-y-8 pt-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-yellow-500/20 p-3 rounded-xl border border-yellow-500/30">
              <Trophy className="text-yellow-400" size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-white">Global Leaderboard</h2>
              <p className="text-white/50 text-sm mt-1">Batch '28 High Achievers</p>
            </div>
          </div>

          <div className="glass rounded-[2.5rem] p-6 md:p-10 border-white/10">
            <div className="space-y-3">
              {MOCK_LEADERBOARD.map((student) => {
                const isTop3 = student.rank <= 3;
                const isTop10 = student.rank <= 10;
                
                let rankStyle = "text-white/40 bg-white/5";
                let rowStyle = "hover:bg-white/[0.02] border-transparent";
                
                if (student.rank === 1) {
                  rankStyle = "text-yellow-900 bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]";
                  rowStyle = "bg-yellow-400/5 border-yellow-400/20 hover:bg-yellow-400/10";
                } else if (student.rank === 2) {
                  rankStyle = "text-slate-900 bg-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.5)]";
                  rowStyle = "bg-slate-300/5 border-slate-300/20 hover:bg-slate-300/10";
                } else if (student.rank === 3) {
                  rankStyle = "text-amber-900 bg-amber-600 shadow-[0_0_15px_rgba(217,119,6,0.5)]";
                  rowStyle = "bg-amber-600/5 border-amber-600/20 hover:bg-amber-600/10";
                } else if (isTop10) {
                  rankStyle = "text-brand-400 bg-brand-400/10";
                  rowStyle = "hover:bg-brand-400/5 border-brand-400/10";
                }

                return (
                  <motion.div 
                    key={student.rank}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${rowStyle}`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${rankStyle}`}>
                        {student.rank}
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-bold text-lg ${isTop3 ? 'text-white' : 'text-white/80'}`}>
                          {student.name}
                        </span>
                        {isTop3 && (
                          <span className="text-[10px] uppercase tracking-widest font-bold text-white/50 flex items-center gap-1">
                            <Medal size={12} className={student.rank === 1 ? "text-yellow-400" : student.rank === 2 ? "text-slate-300" : "text-amber-600"} />
                            {student.rank === 1 ? "Gold" : student.rank === 2 ? "Silver" : "Bronze"} Medalist
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`text-2xl font-extrabold ${isTop3 ? 'text-white' : isTop10 ? 'text-brand-400' : 'text-white/50'}`}>
                      {student.cgpa.toFixed(2)}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Placeholder for Supabase Submit Button */}
            <div className="mt-10 pt-8 border-t border-white/10 text-center">
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold tracking-wide transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-3 mx-auto pixel-hover">
                <Database size={18} />
                Submit Your CGPA to Leaderboard
              </button>
              <p className="text-white/40 text-xs mt-3">Requires Supabase Configuration</p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default App;
