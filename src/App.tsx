import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Calculator, Award, ChevronDown, Sparkles } from 'lucide-react';

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
  { name: "Programming Fundamentals", credits: 4 },
  { name: "Intro to Info. & Comm. Tech", credits: 3 },
  { name: "Calculus & Analytical Geometry", credits: 3 },
  { name: "Applied Physics", credits: 3 },
  { name: "Functional English", credits: 3 },
  { name: "Islamic Studies / Ethics", credits: 2 }
];

const SEM2_COURSES = [
  { name: "Object Oriented Programming", credits: 4 },
  { name: "Digital Logic Design", credits: 3 },
  { name: "Linear Algebra", credits: 3 },
  { name: "Discrete Structures", credits: 3 },
  { name: "Communication Skills", credits: 3 },
  { name: "Ideology & Constitution of Pak", credits: 2 }
];

const MetricCard = ({ title, value, icon: Icon, highlight = false, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`relative overflow-hidden p-6 rounded-[2rem] ${highlight ? 'bg-gradient-to-br from-brand-600 to-brand-400 border border-brand-400/50 shadow-[0_0_40px_rgba(20,184,166,0.3)] text-white' : 'glass-card'}`}
  >
    {/* Highlight Decorative Elements */}
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
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
      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-brand-400 group-hover:scale-110 group-hover:bg-brand-500/10 transition-all">
        {course.credits}
        <span className="text-[10px] text-white/40 ml-[1px]">CR</span>
      </div>
      <span className="font-medium text-white/80 group-hover:text-white transition-colors text-[15px]">{course.name}</span>
    </div>
    <div className="relative min-w-[180px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full glass-input text-white/90 py-2.5 pl-4 pr-10 rounded-xl cursor-pointer font-medium text-sm hover:bg-white/[0.05]"
      >
        {GRADE_OPTIONS.map((grade) => (
          <option key={grade} value={grade} className="bg-surface text-white py-2">{grade}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none group-hover:text-brand-400 transition-colors" size={16} />
    </div>
  </motion.div>
);

function App() {
  const [sem1Grades, setSem1Grades] = useState<Record<string, string>>(
    SEM1_COURSES.reduce((acc, c) => ({ ...acc, [c.name]: GRADE_OPTIONS[4] }), {})
  );
  
  const [sem2Grades, setSem2Grades] = useState<Record<string, string>>(
    SEM2_COURSES.reduce((acc, c) => ({ ...acc, [c.name]: GRADE_OPTIONS[4] }), {})
  );

  const calculateGPA = (courses: typeof SEM1_COURSES, grades: Record<string, string>) => {
    let totalQP = 0;
    let totalCredits = 0;
    courses.forEach(c => {
      const gp = GRADE_MAPPING[grades[c.name] as keyof typeof GRADE_MAPPING];
      totalQP += gp * c.credits;
      totalCredits += c.credits;
    });
    return { gpa: totalQP / totalCredits, totalQP, totalCredits };
  };

  const { gpa1, gpa2, cgpa } = useMemo(() => {
    const s1 = calculateGPA(SEM1_COURSES, sem1Grades);
    const s2 = calculateGPA(SEM2_COURSES, sem2Grades);
    const cgpa = (s1.totalQP + s2.totalQP) / (s1.totalCredits + s2.totalCredits);
    
    return {
      gpa1: s1.gpa.toFixed(2),
      gpa2: s2.gpa.toFixed(2),
      cgpa: cgpa.toFixed(3)
    };
  }, [sem1Grades, sem2Grades]);

  return (
    <div className="min-h-screen relative selection:bg-brand-500/30">
      {/* Animated Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-500/10 blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-purple-500/10 blur-[120px] mix-blend-screen animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 relative"
        >
          <div className="inline-flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-3xl mb-6 shadow-2xl backdrop-blur-md">
            <GraduationCap size={40} className="text-brand-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6 tracking-tighter">
            DCS UBIT Portal
          </h1>
          <p className="text-xl text-white/50 font-medium max-w-2xl mx-auto flex items-center justify-center gap-2">
            <Sparkles size={20} className="text-brand-400" />
            BSCS First Year GPA & CGPA Calculator
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative z-10">
          <MetricCard title="Semester One GPA" value={gpa1} icon={Calculator} delay={0.1} />
          <MetricCard title="Semester Two GPA" value={gpa2} icon={Calculator} delay={0.2} />
          <MetricCard title="Cumulative CGPA" value={cgpa} icon={Award} highlight delay={0.3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-[2.5rem] p-6 md:p-10 border-white/10"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-500/5 border border-brand-500/20 flex items-center justify-center text-lg font-bold text-brand-400 shadow-[0_0_20px_rgba(20,184,166,0.15)]">
                01
              </div>
              <h2 className="text-2xl font-bold text-white/90 tracking-tight">
                Semester One
              </h2>
            </div>
            <div className="space-y-2">
              {SEM1_COURSES.map((course, idx) => (
                <CourseSelect 
                  key={course.name}
                  course={course}
                  value={sem1Grades[course.name]}
                  onChange={(val: string) => setSem1Grades(prev => ({ ...prev, [course.name]: val }))}
                  delay={0.5 + (idx * 0.05)}
                />
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-[2.5rem] p-6 md:p-10 border-white/10"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center text-lg font-bold text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                02
              </div>
              <h2 className="text-2xl font-bold text-white/90 tracking-tight">
                Semester Two
              </h2>
            </div>
            <div className="space-y-2">
              {SEM2_COURSES.map((course, idx) => (
                <CourseSelect 
                  key={course.name}
                  course={course}
                  value={sem2Grades[course.name]}
                  onChange={(val: string) => setSem2Grades(prev => ({ ...prev, [course.name]: val }))}
                  delay={0.6 + (idx * 0.05)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default App;
