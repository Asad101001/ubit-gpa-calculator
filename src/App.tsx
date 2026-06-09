import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Calculator, Award, ChevronDown, Sparkles, 
  Trophy, Medal, Activity, Database, Code, Zap, Flame,
  TrendingUp, TrendingDown, BookOpen
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
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
  { code: "CS-351", name: "Programming Fundamentals", credits: 4, type: "Programming" },
  { code: "CS-353", name: "Intro to Information & Comm. Technologies", credits: 3, type: "Programming" },
  { code: "CS-355", name: "Calculus & Analytical Geometry", credits: 3, type: "Math" },
  { code: "CS-357", name: "Applied Physics", credits: 3, type: "Math" },
  { code: "CS-359", name: "Functional English", credits: 3, type: "Soft Skills" },
  { code: "CS-361", name: "Islamic Studies / Ethics", credits: 2, type: "Soft Skills" }
];

const SEM2_COURSES = [
  { code: "CS-352", name: "Object Oriented Concepts & Programming", credits: 4, type: "Programming" },
  { code: "CS-354", name: "Digital Logic Design", credits: 3, type: "Programming" },
  { code: "CS-356", name: "Linear Algebra", credits: 3, type: "Math" },
  { code: "CS-358", name: "Discrete Structures", credits: 3, type: "Math" },
  { code: "CS-360", name: "Communication & Presentation Skills", credits: 3, type: "Soft Skills" },
  { code: "CS-362", name: "Ideology & Constitution of Pakistan", credits: 2, type: "Soft Skills" }
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

const Header = () => (
  <motion.header 
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    transition={{ type: "spring", stiffness: 100, damping: 20 }}
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
        <div className="px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold tracking-wider">
          BATCH '28
        </div>
      </nav>
    </div>
  </motion.header>
);

const Footer = () => (
  <footer className="w-full border-t border-white/10 mt-32 py-10 bg-black/40 backdrop-blur-md relative overflow-hidden">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
      
      {/* Reduced Name Tag */}
      <div className="flex flex-col items-center md:items-start opacity-70 hover:opacity-100 transition-opacity">
        <div className="text-sm text-white/60 font-medium">
          <strong>Developed by AI</strong>
        </div>
        <div className="text-xs text-white/40 mt-1">
          + Asad (Batch '28)
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
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all group relative cursor-pointer"
            >
              <Tech.icon size={14} />
              <span className="absolute -top-7 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {Tech.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

const MetricCard = ({ title, value, icon: Icon, highlight = false, subtitle = "" }: any) => (
  <motion.div
    variants={itemVariants}
    className={`relative overflow-hidden p-6 rounded-[2rem] transition-all hover:-translate-y-1 ${highlight ? 'bg-gradient-to-br from-brand-600/90 to-brand-400/90 border border-brand-400/50 shadow-[0_0_40px_rgba(20,184,166,0.2)] text-white' : 'glass-card border border-white/5 hover:border-white/10'}`}
  >
    {highlight && (
      <>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-8 -mb-8" />
      </>
    )}
    <div className="relative z-10 flex items-center justify-between mb-4">
      <h3 className={`text-xs font-semibold uppercase tracking-widest ${highlight ? 'text-white/90' : 'text-white/50'}`}>
        {title}
      </h3>
      <div className={`p-2.5 rounded-2xl ${highlight ? 'bg-white/20 text-white backdrop-blur-md' : 'bg-white/5 text-brand-400'}`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
    </div>
    <div className="relative z-10">
      <div className="flex items-baseline gap-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight"
          >
            {value}
          </motion.div>
        </AnimatePresence>
        {!subtitle && <span className={`text-lg font-medium ${highlight ? 'text-white/70' : 'text-white/30'}`}>/ 4.0</span>}
      </div>
      {subtitle && (
        <div className={`mt-1 text-sm font-medium ${highlight ? 'text-white/80' : 'text-white/50'} truncate`}>
          {subtitle}
        </div>
      )}
    </div>
  </motion.div>
);

const CourseSelect = ({ course, value, onChange }: any) => (
  <motion.div 
    variants={itemVariants}
    className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.05] transition-all gap-4"
  >
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-brand-400 group-hover:scale-105 group-hover:bg-brand-500/10 transition-transform shrink-0">
        <span className="text-[10px] uppercase font-bold text-white/40 mb-[-2px]">{course.code.split('-')[0]}</span>
        <span className="font-extrabold">{course.code.split('-')[1]}</span>
      </div>
      <div>
        <div className="font-semibold text-white/90 group-hover:text-white transition-colors text-[15px] leading-tight">
          {course.name}
        </div>
        <div className="text-xs font-bold text-white/30 uppercase mt-1 tracking-wider">
          {course.credits} Credits • {course.type}
        </div>
      </div>
    </div>
    <div className="relative min-w-[140px] sm:min-w-[180px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full glass-input text-white/90 py-3 pl-4 pr-10 rounded-xl cursor-pointer font-bold text-sm hover:bg-white/[0.08] transition-colors focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
      >
        {GRADE_OPTIONS.map((grade) => (
          <option key={grade} value={grade} className="bg-[#0f172a] text-white py-2 font-medium">{grade}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none group-hover:text-brand-400 transition-colors" size={16} />
    </div>
  </motion.div>
);

const PodiumLeaderboard = ({ data }: { data: typeof MOCK_LEADERBOARD }) => {
  const top3 = data.slice(0, 3);
  const rest = data.slice(3, 10);
  
  // Reorder for podium visual: 2, 1, 3
  const podiumData = [top3[1], top3[0], top3[2]];

  return (
    <div className="space-y-16">
      {/* PODIUM VISUAL */}
      <div className="flex items-end justify-center gap-2 sm:gap-6 pt-10 h-72 sm:h-80">
        {podiumData.map((student, idx) => {
          if (!student) return null;
          
          const isFirst = student.rank === 1;
          const isSecond = student.rank === 2;
          const isThird = student.rank === 3;
          
          const heightClass = isFirst ? "h-48 sm:h-56" : isSecond ? "h-36 sm:h-40" : "h-24 sm:h-28";
          const bgClass = isFirst 
            ? "bg-gradient-to-t from-yellow-500/20 to-yellow-400/40 border-t-2 border-yellow-400 shadow-[0_-10px_30px_rgba(250,204,21,0.2)]" 
            : isSecond 
            ? "bg-gradient-to-t from-slate-400/10 to-slate-300/30 border-t-2 border-slate-300" 
            : "bg-gradient-to-t from-amber-700/10 to-amber-600/30 border-t-2 border-amber-600";
          
          const textClass = isFirst ? "text-yellow-400" : isSecond ? "text-slate-300" : "text-amber-600";
          
          return (
            <motion.div 
              key={student.rank}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: isFirst ? 0.1 : isSecond ? 0.3 : 0.5, type: "spring", stiffness: 100 }}
              viewport={{ once: true }}
              className={`flex flex-col items-center w-1/3 max-w-[140px] relative ${isFirst ? 'z-10' : 'z-0'}`}
            >
              <div className="mb-4 text-center px-1">
                {isFirst && (
                  <motion.div 
                    animate={{ y: [-5, 5, -5] }} 
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="absolute -top-16 left-1/2 -translate-x-1/2"
                  >
                    <Trophy className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" size={40} />
                  </motion.div>
                )}
                {!isFirst && <Medal className={`${textClass} mx-auto mb-2 opacity-80`} size={24} />}
                
                <span className={`font-bold block text-sm sm:text-base truncate w-full ${isFirst ? 'text-white' : 'text-white/80'}`}>
                  {student.name.split(' ')[0]} {/* Show first name to fit */}
                </span>
                <span className={`text-xl sm:text-3xl font-extrabold block mt-1 ${textClass} ${isFirst ? 'drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : ''}`}>
                  {student.cgpa.toFixed(2)}
                </span>
              </div>
              <div className={`w-full rounded-t-xl flex justify-center pt-4 font-extrabold ${heightClass} ${bgClass} ${textClass}`}>
                <span className={isFirst ? "text-6xl opacity-90" : "text-4xl opacity-50"}>{student.rank}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* REST OF LEADERBOARD */}
      <div className="space-y-3">
        {rest.map((student, idx) => (
          <motion.div 
            key={student.rank}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            viewport={{ once: true }}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-brand-400 bg-brand-400/10 border border-brand-400/20">
                {student.rank}
              </div>
              <span className="font-bold text-white/80">{student.name}</span>
            </div>
            <div className="text-xl font-extrabold text-brand-400/80">
              {student.cgpa.toFixed(2)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};


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
    let highest = { name: "", gp: -1 };
    let lowest = { name: "", gp: 5 };

    courses.forEach(c => {
      const gp = GRADE_MAPPING[grades[c.code] as keyof typeof GRADE_MAPPING];
      totalQP += gp * c.credits;
      totalCredits += c.credits;
      
      if (gp > highest.gp) highest = { name: c.name, gp };
      if (gp < lowest.gp) lowest = { name: c.name, gp };
    });
    return { gpa: totalQP / totalCredits, totalQP, totalCredits, highest, lowest };
  };

  const { gpa1, gpa2, cgpa, bestCourse, worstCourse, radarData } = useMemo(() => {
    const s1Calc = calculateGPA(SEM1_COURSES, sem1Grades);
    const s2Calc = calculateGPA(SEM2_COURSES, sem2Grades);
    const cgpaCalc = (s1Calc.totalQP + s2Calc.totalQP) / (s1Calc.totalCredits + s2Calc.totalCredits);
    
    // Find absolute best/worst across both semesters
    let allCourses = [
      ...SEM1_COURSES.map(c => ({ name: c.name, type: c.type, gp: GRADE_MAPPING[sem1Grades[c.code] as keyof typeof GRADE_MAPPING] })),
      ...SEM2_COURSES.map(c => ({ name: c.name, type: c.type, gp: GRADE_MAPPING[sem2Grades[c.code] as keyof typeof GRADE_MAPPING] }))
    ];

    allCourses.sort((a, b) => b.gp - a.gp);
    const best = allCourses[0];
    const worst = allCourses[allCourses.length - 1];

    // Calculate averages by category for Radar Chart
    const typeGroups: Record<string, { total: number, count: number }> = {};
    allCourses.forEach(c => {
      if (!typeGroups[c.type]) typeGroups[c.type] = { total: 0, count: 0 };
      typeGroups[c.type].total += c.gp;
      typeGroups[c.type].count += 1;
    });

    const rData = Object.keys(typeGroups).map(type => ({
      subject: type,
      A: (typeGroups[type].total / typeGroups[type].count).toFixed(2),
      fullMark: 4.0
    }));

    return {
      gpa1: s1Calc.gpa.toFixed(2),
      gpa2: s2Calc.gpa.toFixed(2),
      cgpa: cgpaCalc.toFixed(3),
      bestCourse: best,
      worstCourse: worst,
      radarData: rData
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
        <div className="glass p-3 rounded-xl border border-white/10 text-sm shadow-xl">
          <p className="font-bold text-white mb-1">{payload[0].payload.fullname || payload[0].payload.subject}</p>
          {payload[0].payload.semester && <p className="text-white/60 text-xs mb-2">{payload[0].payload.semester}</p>}
          <p className="text-brand-400 font-extrabold text-xl">GPA: {Number(payload[0].value).toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen relative selection:bg-brand-500/30 font-sans">
      <Header />

      {/* Smooth Glow Backgrounds (Pixel bg removed) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-[#020617]">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-600/10 blur-[150px] mix-blend-screen animate-blob" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-blue-600/10 blur-[150px] mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute top-[30%] left-[30%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[150px] mix-blend-screen animate-blob animation-delay-4000" />
      </div>

      <main className="pb-24 space-y-32">
        
        {/* HERO SECTION WITH BUILDING IMAGE */}
        <section id="calculator" className="relative pt-24 pb-16 px-4">
          <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden">
             {/* Excellent University Building placeholder to mimic modern UBIT/MIT architecture */}
             <img 
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                alt="University Building" 
                className="w-full h-full object-cover opacity-20 mask-image-b"
                style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }}
             />
             <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/50 via-[#020617]/90 to-[#020617]" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center relative max-w-4xl mx-auto"
          >
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-brand-500/30 blur-2xl rounded-full" />
              <div className="relative inline-flex items-center justify-center p-5 bg-white/5 border border-white/10 rounded-3xl mb-8 shadow-2xl backdrop-blur-xl">
                <GraduationCap size={48} className="text-brand-400" />
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40 mb-6 tracking-tighter">
              GPA Calculator
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium max-w-2xl mx-auto flex items-center justify-center gap-3">
              <Sparkles size={24} className="text-brand-400" />
              Department of Computer Science
            </p>
          </motion.div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          
          {/* METRICS & CALCULATION SECTION */}
          <section className="space-y-12">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10"
            >
              <MetricCard title="Semester One GPA" value={gpa1} icon={Calculator} />
              <MetricCard title="Semester Two GPA" value={gpa2} icon={Calculator} />
              <MetricCard title="Cumulative CGPA" value={cgpa} icon={Award} highlight />
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-10"
            >
              {/* SEMESTER 1 */}
              <motion.div 
                variants={itemVariants}
                className="glass rounded-[2.5rem] p-6 md:p-10 border-white/5 relative overflow-hidden"
              >
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
                  {SEM1_COURSES.map((course) => (
                    <CourseSelect 
                      key={course.code} course={course} value={sem1Grades[course.code]}
                      onChange={(val: string) => setSem1Grades(prev => ({ ...prev, [course.code]: val }))}
                    />
                  ))}
                </div>
              </motion.div>

              {/* SEMESTER 2 */}
              <motion.div 
                variants={itemVariants}
                className="glass rounded-[2.5rem] p-6 md:p-10 border-white/5 relative overflow-hidden"
              >
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
                  {SEM2_COURSES.map((course) => (
                    <CourseSelect 
                      key={course.code} course={course} value={sem2Grades[course.code]}
                      onChange={(val: string) => setSem2Grades(prev => ({ ...prev, [course.code]: val }))}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* EXTENDED ANALYTICS SECTION */}
          <section id="analytics" className="space-y-8 pt-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <Activity className="text-brand-400" size={24} />
              </div>
              <h2 className="text-3xl font-extrabold text-white">Advanced Analytics</h2>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <MetricCard title="Best Performing Course" value={bestCourse.gp.toFixed(1)} subtitle={bestCourse.name} icon={TrendingUp} />
              <MetricCard title="Needs Improvement" value={worstCourse.gp.toFixed(1)} subtitle={worstCourse.name} icon={TrendingDown} />
              <MetricCard title="Total Credits Taken" value="36" subtitle="Across 2 Semesters" icon={BookOpen} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Radar Chart for Skill Distribution */}
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="glass rounded-[2.5rem] p-6 border-white/5 lg:col-span-1 h-[400px] flex flex-col items-center justify-center"
              >
                <h3 className="text-white/80 font-bold mb-4">Skill Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 12}} />
                    <PolarRadiusAxis angle={30} domain={[0, 4]} tick={false} axisLine={false} />
                    <Radar name="GPA" dataKey="A" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.4} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Bar Chart for Semester Comparison */}
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="glass rounded-[2.5rem] p-6 md:p-10 border-white/5 lg:col-span-2 h-[400px]"
              >
                <h3 className="text-white/80 font-bold mb-6">Course by Course Comparison</h3>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 11}} />
                    <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 11}} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
                    <ReferenceLine y={3.0} stroke="rgba(20,184,166,0.3)" strokeDasharray="3 3" />
                    <Bar dataKey="gpa" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.semester === 'Sem 1' ? '#14b8a6' : '#3b82f6'} fillOpacity={0.9} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </section>

          {/* PODIUM LEADERBOARD SECTION */}
          <section id="leaderboard" className="space-y-8 pt-12 pb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-2 text-center justify-center flex-col"
            >
              <div className="bg-gradient-to-br from-yellow-400 to-amber-600 p-4 rounded-2xl shadow-[0_0_30px_rgba(250,204,21,0.3)] mb-4 inline-flex">
                <Trophy className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500">Hall of Fame</h2>
                <p className="text-white/50 text-base mt-2 max-w-md mx-auto">The absolute best of Batch '28. Submit your CGPA to claim your spot on the podium.</p>
              </div>
            </motion.div>

            <div className="glass rounded-[3rem] p-4 sm:p-8 md:p-12 border-white/5 relative overflow-hidden">
              <PodiumLeaderboard data={MOCK_LEADERBOARD} />

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-16 pt-10 border-t border-white/5 text-center relative z-10"
              >
                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold tracking-wide transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-3 mx-auto">
                  <Database size={18} className="text-brand-400" />
                  Submit Your CGPA to Leaderboard
                </button>
                <p className="text-white/30 text-xs mt-4">Powered by Supabase (Waiting for Backend Setup)</p>
              </motion.div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
