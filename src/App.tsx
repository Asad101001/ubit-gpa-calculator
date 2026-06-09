import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Calculator, Award, ChevronDown } from 'lucide-react';

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

const MetricCard = ({ title, value, icon: Icon, highlight = false }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`p-6 rounded-2xl ${highlight ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/30' : 'glass'}`}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className={`text-sm font-semibold uppercase tracking-wider ${highlight ? 'text-brand-100' : 'text-slate-500'}`}>
        {title}
      </h3>
      <div className={`p-2 rounded-xl ${highlight ? 'bg-white/20' : 'bg-brand-50 text-brand-600'}`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="text-4xl font-bold">
      {value}
    </div>
  </motion.div>
);

const CourseSelect = ({ course, value, onChange }: any) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-100 last:border-0 gap-3">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500">
        {course.credits}c
      </div>
      <span className="font-medium text-slate-700">{course.name}</span>
    </div>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full sm:w-48 bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all cursor-pointer font-medium text-sm"
      >
        {GRADE_OPTIONS.map((grade) => (
          <option key={grade} value={grade}>{grade}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
    </div>
  </div>
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
    <div className="min-h-screen bg-slate-50 relative overflow-hidden pb-20">
      {/* Background decorations */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/10 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-brand-100 text-brand-600 rounded-2xl mb-4">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            DCS UBIT Portal
          </h1>
          <p className="text-lg text-slate-500 font-medium">BSCS First Year GPA & CGPA Calculator</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <MetricCard title="Semester 1 GPA" value={gpa1} icon={Calculator} />
          <MetricCard title="Semester 2 GPA" value={gpa2} icon={Calculator} />
          <MetricCard title="Cumulative CGPA" value={cgpa} icon={Award} highlight />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl p-6 md:p-8"
          >
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">01</span>
              Semester One
            </h2>
            <div className="space-y-1">
              {SEM1_COURSES.map(course => (
                <CourseSelect 
                  key={course.name}
                  course={course}
                  value={sem1Grades[course.name]}
                  onChange={(val: string) => setSem1Grades(prev => ({ ...prev, [course.name]: val }))}
                />
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-3xl p-6 md:p-8"
          >
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">02</span>
              Semester Two
            </h2>
            <div className="space-y-1">
              {SEM2_COURSES.map(course => (
                <CourseSelect 
                  key={course.name}
                  course={course}
                  value={sem2Grades[course.name]}
                  onChange={(val: string) => setSem2Grades(prev => ({ ...prev, [course.name]: val }))}
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
