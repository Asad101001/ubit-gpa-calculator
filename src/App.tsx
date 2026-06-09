import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Calculator, Award, Sparkles, 
  Trophy, Medal, Activity, Database, Code, Zap,
  TrendingUp, TrendingDown, BookOpen, AlertTriangle, X
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { supabase } from './lib/supabase';

const getGradePoint = (marks: number): number => {
  if (marks >= 85) return 4.0; // Covers 90+ and 85-89
  if (marks >= 80) return 3.8;
  if (marks >= 75) return 3.4;
  if (marks >= 71) return 3.0;
  if (marks >= 68) return 2.8;
  if (marks >= 64) return 2.4;
  if (marks >= 61) return 2.0;
  if (marks >= 57) return 1.8;
  if (marks === 56) return 1.4;
  if (marks === 55) return 1.3;
  if (marks === 54) return 1.2;
  if (marks === 53) return 1.1;
  if (marks >= 50) return 1.0; // 50-52
  return 0.0;
};

const SEM1_COURSES = [
  { code: "CS-351", name: "Programming Fundamentals", credits: 4, type: "Programming", instructor: "Mr. Badr Sami" },
  { code: "CS-353", name: "Intro to Information & Comm. Technologies", credits: 3, type: "Programming", instructor: "Mr. Zaeem Tariq" },
  { code: "CS-355", name: "Calculus & Analytical Geometry", credits: 3, type: "Math", instructor: "Mr. M. Aslam" },
  { code: "CS-357", name: "Applied Physics", credits: 3, type: "Math", instructor: "Ms. Farheen Shafiq" },
  { code: "CS-359", name: "Functional English", credits: 3, type: "Soft Skills", instructor: "Ms. Ayesha Khwaja & Muhammad Qasim" },
  { code: "CS-361", name: "Islamic Studies / Ethics", credits: 2, type: "Soft Skills", instructor: "Dr. Waqar Hussain" }
];

const SEM2_COURSES = [
  { code: "CS-352", name: "Object Oriented Concepts & Programming", credits: 4, type: "Programming", instructor: "Dr. Humera Tariq" },
  { code: "CS-354", name: "Digital Logic Design", credits: 3, type: "Programming", instructor: "Mr. Bari Ahmed" },
  { code: "CS-356", name: "Linear Algebra", credits: 3, type: "Math", instructor: "Mr. Muhammad Huzaifa" },
  { code: "CS-358", name: "Discrete Structures", credits: 3, type: "Math", instructor: "Ms. Maryam Feroze" },
  { code: "CS-360", name: "Communication & Presentation Skills", credits: 3, type: "Soft Skills", instructor: "Mr. Sami-ul-Huda" },
  { code: "CS-362", name: "Ideology & Constitution of Pakistan", credits: 2, type: "Soft Skills", instructor: "Dr. Mehrunnissa" }
];

const exportToJson = (sem1Grades: any, sem2Grades: any, stats: any) => {
  const generateCourseData = (courses: any[], grades: any) => {
    let totalCredits = 0;
    let totalQP = 0;
    
    const courseList = courses.map(c => {
      const score = grades[c.code] === '' ? 0 : grades[c.code];
      const gp = getGradePoint(score);
      const qp = gp * c.credits;
      
      totalCredits += c.credits;
      totalQP += qp;
      
      let letter = "F";
      if (score >= 85) letter = "A+ / A";
      else if (score >= 80) letter = "A-";
      else if (score >= 75) letter = "B+";
      else if (score >= 71) letter = "B";
      else if (score >= 68) letter = "B-";
      else if (score >= 64) letter = "C+";
      else if (score >= 61) letter = "C";
      else if (score >= 57) letter = "D+";
      else if (score >= 50) letter = "D";

      return {
        course_code: c.code,
        course_title: c.name,
        credit_hours: c.credits,
        numeric_score: score,
        letter_grade: letter,
        grade_point: gp,
        quality_points: Number(qp.toFixed(2))
      };
    });

    return {
      courses: courseList,
      total_credit_hours: totalCredits,
      total_quality_points: Number(totalQP.toFixed(2)),
      semester_gpa: totalCredits > 0 ? Number((totalQP / totalCredits).toFixed(2)) : 0
    };
  };

  const sem1Data = generateCourseData(SEM1_COURSES, sem1Grades);
  const sem2Data = generateCourseData(SEM2_COURSES, sem2Grades);

  const data = {
    student_name: "Student", 
    academic_year: "BSCS First Year",
    institution: "Department of Computer Science (DCS UBIT), University of Karachi",
    grading_policy_source: "uok.edu.pk/sem_results",
    transcript: {
      semester_1: sem1Data,
      semester_2: sem2Data
    },
    cumulative_totals: {
      total_credit_hours_attempted: sem1Data.total_credit_hours + sem2Data.total_credit_hours,
      total_quality_points_earned: Number((sem1Data.total_quality_points + sem2Data.total_quality_points).toFixed(2)),
      final_cgpa: Number(stats.cgpa)
    }
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "UBIT_Transcript.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

const Header = () => (
  <motion.header 
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="sticky top-0 z-50 w-full glass border-b border-white/5 py-1.5 sm:py-3"
  >
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="bg-brand-500/20 p-1 sm:p-2 rounded-lg sm:rounded-xl border border-brand-500/30">
          <GraduationCap className="text-brand-400 w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </div>
        <div className="font-bold text-base sm:text-lg tracking-tight text-white/90">
          DCS <span className="text-brand-400">UBIT</span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
          <a href="#calculator" className="hover:text-white transition-colors">Calculator</a>
          <a href="#analytics" className="hover:text-white transition-colors">Analytics</a>
          <a href="#leaderboard" className="hover:text-white transition-colors">Leaderboard</a>
        </nav>
        <div className="px-2 sm:px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-[10px] sm:text-xs font-bold tracking-wider">
          BATCH '28
        </div>
      </div>
    </div>
  </motion.header>
);

const Footer = () => (
  <footer className="w-full border-t border-white/10 mt-16 py-8 bg-black/40 backdrop-blur-md relative overflow-hidden">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
      
      <div className="flex flex-col items-center md:items-start opacity-70 hover:opacity-100 transition-opacity">
        <div className="text-sm text-white/60 font-medium">
          <strong>Developed by AI</strong>
        </div>
        <div className="text-xs text-white/40 mt-1">
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
    className={`relative overflow-hidden p-3 sm:p-6 rounded-2xl sm:rounded-[2rem] transition-all hover:-translate-y-1 ${highlight ? 'bg-gradient-to-br from-brand-600/90 to-brand-400/90 border border-brand-400/50 shadow-[0_0_30px_rgba(20,184,166,0.2)] text-white' : 'glass-card border border-white/5 hover:border-white/10'}`}
  >
    {highlight && (
      <>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-8 -mb-8" />
      </>
    )}
    <div className="relative z-10 flex items-center justify-between mb-2 sm:mb-4">
      <h3 className={`text-[9px] sm:text-xs font-semibold uppercase tracking-widest ${highlight ? 'text-white/90' : 'text-white/50'}`}>
        {title}
      </h3>
      <div className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-2xl ${highlight ? 'bg-white/20 text-white backdrop-blur-md' : 'bg-white/5 text-brand-400'}`}>
        <Icon size={16} className="w-[14px] h-[14px] sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
      </div>
    </div>
    <div className="relative z-10">
      <div className="flex items-baseline gap-1.5 sm:gap-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight"
          >
            {value}
          </motion.div>
        </AnimatePresence>
        {!subtitle && <span className={`text-sm sm:text-lg font-medium ${highlight ? 'text-white/70' : 'text-white/30'}`}>/ 4.0</span>}
      </div>
      {subtitle && (
        <div className={`mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium ${highlight ? 'text-white/80' : 'text-white/50'} truncate`}>
          {subtitle}
        </div>
      )}
    </div>
  </motion.div>
);

const CourseSelect = ({ course, value, onChange }: any) => {
  const gp = getGradePoint(value);
  
  return (
    <motion.div 
      variants={itemVariants}
      className="group flex flex-col p-2 sm:p-4 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.05] transition-all gap-2 sm:gap-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <div className="flex flex-col items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-brand-400 group-hover:scale-105 group-hover:bg-brand-500/10 transition-transform shrink-0">
            <span className="text-[7px] sm:text-[10px] uppercase font-bold text-white/40 mb-[-4px] sm:mb-[-2px]">{course.code.split('-')[0]}</span>
            <span className="text-xs sm:text-base font-extrabold">{course.code.split('-')[1]}</span>
          </div>
          <div>
            <div className="font-semibold text-white/90 group-hover:text-white transition-colors text-[13px] sm:text-[15px] leading-tight">
              {course.name}
            </div>
            <div className="text-[9px] sm:text-[11px] font-medium text-white/40 mt-0.5 sm:mt-1 truncate max-w-[200px] sm:max-w-none">
              {course.instructor}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-24">
            <input
              type="number"
              min="0"
              max="100"
              value={value === '' ? '' : value}
              onChange={(e) => {
                if (e.target.value === '') {
                  onChange('');
                  return;
                }
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 0 && val <= 100) {
                  onChange(val);
                }
              }}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="Marks"
              className="w-full glass-input text-white/90 py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-white/[0.08] transition-colors focus:ring-2 focus:ring-brand-500/50 focus:outline-none placeholder:text-white/20 text-center"
            />
          </div>
          <div className="w-14 sm:w-16 text-center py-1.5 px-1.5 sm:py-2 sm:px-2 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 font-mono font-bold text-brand-400 flex flex-col justify-center">
            <span className="text-[8px] sm:text-[9px] text-white/30 leading-none mb-0.5 sm:mb-1">GP</span>
            <span className="text-sm sm:text-base leading-none">{value === '' ? '-' : gp.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="w-full px-1">
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={value === '' ? 0 : value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-1 sm:h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:accent-brand-400 transition-all opacity-50 group-hover:opacity-100"
        />
      </div>
    </motion.div>
  );
};

// Applies Dense Ranking for Ties
const rankData = (rawList: any[]) => {
  const sorted = [...rawList].sort((a, b) => b.cgpa - a.cgpa);
  let currentRank = 1;
  let prevCgpa = -1;
  
  return sorted.map((student, i) => {
    if (student.cgpa !== prevCgpa && i !== 0) currentRank++;
    prevCgpa = student.cgpa;
    return { ...student, rank: currentRank };
  });
};

const PodiumLeaderboard = ({ data, isLoading }: { data: any[], isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48 text-white/40 font-bold animate-pulse">
        Fetching latest rankings...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center px-4">
        <Trophy className="text-white/10 mb-4" size={48} />
        <p className="text-white/40 font-bold">The podium is currently empty.</p>
        <p className="text-white/30 text-sm mt-1">Be the first to claim a spot!</p>
      </div>
    );
  }

  const rankedData = rankData(data);
  const top3 = rankedData.filter(s => s.rank <= 3).slice(0, 3); // Grab up to 3 for visual podium
  const rest = rankedData.filter(s => !top3.includes(s));

  // Determine visual arrangement for podium based on array length
  const podiumData: any[] = [];
  if (top3.length === 1) {
    podiumData.push(null, top3[0], null);
  } else if (top3.length === 2) {
    podiumData.push(top3[1], top3[0], null);
  } else {
    podiumData.push(top3[1], top3[0], top3[2]);
  }

  return (
    <div className="space-y-12">
      {/* PODIUM VISUAL */}
      <div className="flex items-end justify-center gap-2 sm:gap-6 pt-10 h-72 sm:h-80 w-full max-w-2xl mx-auto overflow-hidden">
        {podiumData.map((student, idx) => {
          if (!student) return <div key={`empty-${idx}`} className="w-1/3 max-w-[140px]" />;
          
          // Visual Height classes (strictly by position 0,1,2 in podiumData which are Left/Center/Right)
          const isCenter = idx === 1;
          const isLeft = idx === 0;
          const isRight = idx === 2;
          
          const heightClass = isCenter ? "h-48 sm:h-56" : isLeft ? "h-36 sm:h-40" : "h-24 sm:h-28";
          
          // We use actual Rank to determine colors
          const rankColorClass = student.rank === 1 
            ? "text-yellow-400" 
            : student.rank === 2 
            ? "text-slate-300" 
            : "text-amber-600";

          const rankBgClass = student.rank === 1
            ? "bg-gradient-to-t from-yellow-500/20 to-yellow-400/40 border-t-2 border-yellow-400 shadow-[0_-10px_30px_rgba(250,204,21,0.2)]" 
            : student.rank === 2
            ? "bg-gradient-to-t from-slate-400/10 to-slate-300/30 border-t-2 border-slate-300" 
            : "bg-gradient-to-t from-amber-700/10 to-amber-600/30 border-t-2 border-amber-600";
          
          return (
            <motion.div 
              key={student.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: isCenter ? 0.05 : isLeft ? 0.15 : 0.25, duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
              className={`flex flex-col justify-end w-1/3 max-w-[140px] relative ${isCenter ? 'z-10' : 'z-0'}`}
            >
              <div className="mb-2 sm:mb-4 text-center px-1 sm:px-2 w-full flex flex-col items-center justify-end relative h-[80px] sm:h-[100px]">
                {student.rank === 1 ? (
                  <motion.div 
                    animate={{ y: [-3, 3, -3] }} 
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="flex items-center justify-center mb-2"
                  >
                    <Trophy className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" size={32} />
                  </motion.div>
                ) : (
                  <Medal className={`${rankColorClass} mx-auto mb-2 opacity-80`} size={24} />
                )}
                
                <span className={`font-bold block text-sm sm:text-base w-full truncate overflow-hidden whitespace-nowrap ${student.rank === 1 ? 'text-white' : 'text-white/80'}`} title={student.name}>
                  {student.name.split(' ')[0]} 
                </span>
                <span className={`text-xl sm:text-3xl font-extrabold block mt-1 ${rankColorClass} ${student.rank === 1 ? 'drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : ''}`}>
                  {student.cgpa.toFixed(2)}
                </span>
              </div>
              <div className={`w-full rounded-t-xl flex justify-center pt-4 font-extrabold ${heightClass} ${rankBgClass} ${rankColorClass}`}>
                <span className={student.rank === 1 ? "text-6xl opacity-90" : "text-4xl opacity-50"}>{student.rank}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* REST OF LEADERBOARD */}
      {rest.length > 0 && (
        <div className="space-y-3">
          {rest.map((student, idx) => (
            <motion.div 
              key={student.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-5 w-[70%]">
                <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-sm text-brand-400 bg-brand-400/10 border border-brand-400/20">
                  {student.rank}
                </div>
                <span className="font-bold text-white/80 truncate w-full">{student.name}</span>
              </div>
              <div className="text-xl font-extrabold text-brand-400/80">
                {student.cgpa.toFixed(2)}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};


const BoycottModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
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
            className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative overflow-hidden shadow-2xl"
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
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white/60 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-[250px] text-center bg-black/40 p-6 rounded-2xl backdrop-blur-md border border-white/5">
              <AlertTriangle size={48} className="text-yellow-400 mb-4" />
              <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Access Denied</h2>
              <p className="text-white/80 font-medium">Semester 03 data unavailable due to ongoing teachers association boycott.</p>
              <p className="text-white/40 text-sm mt-4 font-mono">ERR_EXAMS_NOT_CONDUCTED</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Splash Screen
const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] bg-[#020617] flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-brand-500/30 blur-3xl rounded-full" />
        <div className="relative flex flex-col items-center p-8 bg-white/5 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl">
          <GraduationCap size={64} className="text-brand-400 mb-4" />
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase">UBIT GPA</h1>
          <div className="w-12 h-1 bg-brand-500/50 rounded-full mt-4 overflow-hidden relative">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="absolute top-0 left-0 h-full w-full bg-brand-400 rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Submit Modal
const SubmitModal = ({ isOpen, onClose, onSubmit, name, setName, isSubmitting, error, currentCgpa }: any) => {
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
            className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full relative overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white/60 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="bg-brand-500/20 p-4 rounded-full mb-4">
                <Trophy size={32} className="text-brand-400" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Join the Leaderboard</h2>
              <p className="text-white/60 font-medium mb-6 text-sm">Submit your current CGPA of <span className="text-white font-bold">{currentCgpa}</span> to the Batch '28 rankings.</p>
              
              <form onSubmit={onSubmit} className="w-full space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl font-medium text-left">
                    {error}
                  </div>
                )}
                <div className="text-left">
                  <label className="block text-white/60 text-xs font-bold mb-2 uppercase tracking-wider">Your Full Name</label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Muhammad Asad"
                    className="w-full glass-input text-white/90 py-3 px-4 rounded-xl font-bold text-sm hover:bg-white/[0.08] transition-colors focus:ring-2 focus:ring-brand-500/50 focus:outline-none placeholder:text-white/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="w-full py-4 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:hover:bg-brand-500 text-black font-extrabold rounded-xl transition-all shadow-lg shadow-brand-500/20"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit to Leaderboard'}
                </button>
              </form>
              <p className="text-white/30 text-[10px] mt-4 max-w-xs uppercase tracking-wider font-semibold">
                Only 1 submission allowed per IP address. Ensures fairness.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function App() {
  const [appLoaded, setAppLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);

  // Submit Modal States
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitName, setSubmitName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(() => localStorage.getItem('hasSubmitted') === 'true');

  // Initialize from LocalStorage
  const [sem1Grades, setSem1Grades] = useState<Record<string, number | ''>>(() => {
    const saved = localStorage.getItem('sem1Grades');
    return saved ? JSON.parse(saved) : SEM1_COURSES.reduce((acc, c) => ({ ...acc, [c.code]: '' }), {});
  });
  const [sem2Grades, setSem2Grades] = useState<Record<string, number | ''>>(() => {
    const saved = localStorage.getItem('sem2Grades');
    return saved ? JSON.parse(saved) : SEM2_COURSES.reduce((acc, c) => ({ ...acc, [c.code]: '' }), {});
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('sem1Grades', JSON.stringify(sem1Grades));
  }, [sem1Grades]);

  useEffect(() => {
    localStorage.setItem('sem2Grades', JSON.stringify(sem2Grades));
  }, [sem2Grades]);

  // Fetch Live Leaderboard
  const fetchLeaderboard = async () => {
    setIsLeaderboardLoading(true);
    const { data, error } = await supabase
      .from('leaderboard')
      .select('name, cgpa')
      .order('cgpa', { ascending: false });
    
    if (data) {
      setLeaderboardData(data);
    } else if (error) {
      console.error("Supabase Error:", error);
    }
    setIsLeaderboardLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleLeaderboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitName.trim() || Number(cgpa) <= 0) return;
    
    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (hasSubmitted) {
        throw new Error("You have already submitted a score from this device.");
      }

      // Fetch IP using ipify
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      const ipAddress = ipData.ip;

      // Insert to Supabase
      const { error } = await supabase.from('leaderboard').insert([
        { name: submitName.trim(), cgpa: Number(cgpa), ip_address: ipAddress }
      ]);

      if (error) {
        if (error.code === '23505') { // Postgres Unique Constraint Violation Code
          throw new Error("Looks like you've already submitted a score from this IP address.");
        }
        throw new Error(error.message);
      }

      // Success
      localStorage.setItem('hasSubmitted', 'true');
      setHasSubmitted(true);
      setIsSubmitModalOpen(false);
      fetchLeaderboard(); // Refresh the podium

    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateGPA = (courses: typeof SEM1_COURSES, grades: Record<string, number | ''>) => {
    let totalQP = 0;
    let totalCredits = 0;
    let highest = { name: "N/A", gp: -1 };
    let lowest = { name: "N/A", gp: 5 };

    courses.forEach(c => {
      if (grades[c.code] !== '') {
        const marks = grades[c.code] as number;
        const gp = getGradePoint(marks);
        totalQP += gp * c.credits;
        totalCredits += c.credits;
        
        if (gp > highest.gp) highest = { name: c.name, gp };
        if (gp < lowest.gp) lowest = { name: c.name, gp };
      }
    });
    return { gpa: totalCredits > 0 ? totalQP / totalCredits : 0, totalQP, totalCredits, highest, lowest };
  };

  const { gpa1, gpa2, cgpa, bestCourse, worstCourse, radarData } = useMemo(() => {
    const s1Calc = calculateGPA(SEM1_COURSES, sem1Grades);
    const s2Calc = calculateGPA(SEM2_COURSES, sem2Grades);
    
    const validCredits = s1Calc.totalCredits + s2Calc.totalCredits;
    const cgpaCalc = validCredits > 0 ? (s1Calc.totalQP + s2Calc.totalQP) / validCredits : 0;
    
    let allCourses = [
      ...SEM1_COURSES.filter(c => sem1Grades[c.code] !== '').map(c => ({ name: c.name, type: c.type, gp: getGradePoint(sem1Grades[c.code] as number) })),
      ...SEM2_COURSES.filter(c => sem2Grades[c.code] !== '').map(c => ({ name: c.name, type: c.type, gp: getGradePoint(sem2Grades[c.code] as number) }))
    ];

    allCourses.sort((a, b) => b.gp - a.gp);
    const best = allCourses.length > 0 ? allCourses[0] : { name: "N/A", gp: 0 };
    const worst = allCourses.length > 0 ? allCourses[allCourses.length - 1] : { name: "N/A", gp: 0 };

    const typeGroups: Record<string, { total: number, count: number }> = {};
    allCourses.forEach(c => {
      if (!typeGroups[c.type]) typeGroups[c.type] = { total: 0, count: 0 };
      typeGroups[c.type].total += c.gp;
      typeGroups[c.type].count += 1;
    });

    const rData = Object.keys(typeGroups).length > 0 
      ? Object.keys(typeGroups).map(type => ({
          subject: type,
          A: (typeGroups[type].total / typeGroups[type].count).toFixed(2),
          fullMark: 4.0
        }))
      : [
          { subject: 'Programming', A: 0, fullMark: 4.0 },
          { subject: 'Math', A: 0, fullMark: 4.0 },
          { subject: 'Soft Skills', A: 0, fullMark: 4.0 }
        ];

    return {
      gpa1: s1Calc.gpa.toFixed(2),
      gpa2: s2Calc.gpa.toFixed(2),
      cgpa: cgpaCalc.toFixed(3),
      bestCourse: best,
      worstCourse: worst,
      radarData: rData
    };
  }, [sem1Grades, sem2Grades]);

  const chartData = useMemo(() => {
    return [
      ...SEM1_COURSES.filter(c => sem1Grades[c.code] !== '').map(c => ({
        name: c.code,
        fullname: c.name,
        semester: 'Sem 1',
        gpa: getGradePoint(sem1Grades[c.code] as number),
      })),
      ...SEM2_COURSES.filter(c => sem2Grades[c.code] !== '').map(c => ({
        name: c.code,
        fullname: c.name,
        semester: 'Sem 2',
        gpa: getGradePoint(sem2Grades[c.code] as number),
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
    <>
      <AnimatePresence>
        {!appLoaded && <SplashScreen onComplete={() => setAppLoaded(true)} />}
      </AnimatePresence>

      <div className={`min-h-screen relative selection:bg-brand-500/30 font-sans ${!appLoaded ? 'hidden' : ''}`}>
        <Header />
        <BoycottModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        <SubmitModal 
          isOpen={isSubmitModalOpen} 
          onClose={() => !isSubmitting && setIsSubmitModalOpen(false)} 
          onSubmit={handleLeaderboardSubmit}
          name={submitName}
          setName={setSubmitName}
          isSubmitting={isSubmitting}
          error={submitError}
          currentCgpa={cgpa}
        />

        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-[#020617]">
          {/* Heavy animated blobs are hidden on mobile to prevent Android UI thread lag and save battery */}
          <div className="hidden sm:block absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-600/10 blur-[150px] mix-blend-screen animate-blob" />
          <div className="hidden sm:block absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-blue-600/10 blur-[150px] mix-blend-screen animate-blob animation-delay-2000" />
          <div className="hidden sm:block absolute top-[30%] left-[30%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[150px] mix-blend-screen animate-blob animation-delay-4000" />
          
          {/* Lightweight static fallback for mobile devices */}
          <div className="sm:hidden absolute inset-0 bg-gradient-to-br from-brand-900/20 via-[#020617] to-blue-900/20" />
        </div>

        <main className="pb-6 sm:pb-16 space-y-6 sm:space-y-16">
          
          {/* HERO SECTION - REDUCED PADDING FOR MOBILE */}
          <section id="calculator" className="relative pt-4 sm:pt-12 pb-4 sm:pb-8 px-4">
            <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden">
               <img 
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                  alt="University Building" 
                  className="w-full h-full object-cover opacity-20"
                  style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }}
               />
               <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/50 via-[#020617]/90 to-[#020617]" />
            </div>

            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center relative max-w-4xl mx-auto"
            >
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-brand-500/30 blur-xl rounded-full" />
                <div className="relative inline-flex items-center justify-center p-3 sm:p-4 bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-2xl backdrop-blur-xl">
                  <GraduationCap className="text-brand-400 w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40 mb-3 sm:mb-4 tracking-tighter">
                GPA Calculator
              </h1>
              <p className="text-sm sm:text-lg md:text-xl text-white/60 font-medium max-w-2xl mx-auto flex items-center justify-center gap-2 sm:gap-3">
                <Sparkles className="text-brand-400 w-4 h-4 sm:w-5 sm:h-5" />
                Department of Computer Science
              </p>
            </motion.div>
          </section>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-16">
            
            <section className="space-y-4 sm:space-y-8">
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
                <motion.div 
                  variants={itemVariants}
                  className="glass rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-10 border-white/5 relative overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-8">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-500/5 border border-brand-500/20 flex items-center justify-center text-sm sm:text-lg font-bold text-brand-400 shadow-[0_0_20px_rgba(20,184,166,0.15)]">
                        01
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-2xl font-bold text-white/90 tracking-tight">Semester One</h2>
                        <p className="text-[10px] sm:text-sm font-medium text-white/40 uppercase tracking-widest mt-0.5 sm:mt-1">18 Credits</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 relative z-10">
                    {SEM1_COURSES.map((course) => (
                      <CourseSelect 
                        key={course.code} course={course} value={sem1Grades[course.code]}
                        onChange={(val: number | '') => setSem1Grades(prev => ({ ...prev, [course.code]: val }))}
                      />
                    ))}
                  </div>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  className="glass rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-10 border-white/5 relative overflow-hidden h-fit"
                >
                  <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-8">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center text-sm sm:text-lg font-bold text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                        02
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-2xl font-bold text-white/90 tracking-tight">Semester Two</h2>
                        <p className="text-[10px] sm:text-sm font-medium text-white/40 uppercase tracking-widest mt-0.5 sm:mt-1">18 Credits</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 relative z-10">
                    {SEM2_COURSES.map((course) => (
                      <CourseSelect 
                        key={course.code} course={course} value={sem2Grades[course.code]}
                        onChange={(val: number | '') => setSem2Grades(prev => ({ ...prev, [course.code]: val }))}
                      />
                    ))}
                  </div>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  onClick={() => setIsModalOpen(true)}
                  className="xl:col-span-2 glass rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 border-white/5 relative overflow-hidden cursor-pointer hover:border-yellow-400/30 transition-colors group"
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/20 flex items-center justify-center text-sm sm:text-lg font-bold text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.15)] group-hover:scale-110 transition-transform">
                        03
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-2xl font-bold text-white/90 tracking-tight">Semester Three</h2>
                        <p className="text-[9px] sm:text-sm font-medium text-yellow-400/80 uppercase tracking-widest mt-0.5 sm:mt-1 flex items-center gap-1 sm:gap-2">
                          <AlertTriangle size={12} className="w-[10px] h-[10px] sm:w-[14px] sm:h-[14px]" /> Pending Exams
                        </p>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-yellow-400/10 text-yellow-400 font-bold rounded-xl text-sm hidden sm:block border border-yellow-400/20">
                      Click to Uncover
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </section>

            <section id="analytics" className="space-y-4 sm:space-y-8 pt-4 sm:pt-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center justify-between mb-4 sm:mb-8"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="bg-white/5 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-white/10">
                    <Activity className="text-brand-400 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Advanced Analytics</h2>
                </div>
                <button
                  onClick={() => exportToJson(sem1Grades, sem2Grades, { cgpa, gpa1, gpa2 })}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 hover:text-white text-sm font-bold transition-colors"
                >
                  <Code size={16} />
                  Export JSON
                </button>
              </motion.div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
                <MetricCard title="Best Performing Course" value={bestCourse.gp.toFixed(1)} subtitle={bestCourse.name} icon={TrendingUp} />
                <MetricCard title="Needs Improvement" value={worstCourse.gp.toFixed(1)} subtitle={worstCourse.name} icon={TrendingDown} />
                <MetricCard title="Total Credits Taken" value="36" subtitle="Across 2 Semesters" icon={BookOpen} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <motion.div 
                   initial={{ opacity: 0, y: 15 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.5, ease: "easeOut" }}
                   viewport={{ once: true }}
                   className="glass rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 border-white/5 lg:col-span-1 h-[250px] sm:h-[400px] flex flex-col items-center justify-center"
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

                <motion.div 
                   initial={{ opacity: 0, y: 15 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                   viewport={{ once: true }}
                   className="glass rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-10 border-white/5 lg:col-span-2 h-[250px] sm:h-[400px]"
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

            <section id="leaderboard" className="space-y-4 sm:space-y-8 pt-4 sm:pt-8 pb-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-2 sm:gap-4 mb-2 text-center justify-center flex-col"
              >
                <div className="bg-gradient-to-br from-yellow-400 to-amber-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-[0_0_30px_rgba(250,204,21,0.3)] mb-2 sm:mb-4 inline-flex">
                  <Trophy className="text-white w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500">The Leaderboard</h2>
                  <p className="text-white/50 text-sm sm:text-base mt-2 max-w-md mx-auto">The absolute best of Batch '28. Submit your CGPA to claim your spot on the podium.</p>
                </div>
              </motion.div>

              <div className="glass rounded-[2rem] sm:rounded-[3rem] p-4 sm:p-8 md:p-12 border-white/5 relative overflow-hidden min-h-[250px] sm:min-h-[400px]">
                <PodiumLeaderboard data={leaderboardData} isLoading={isLeaderboardLoading} />

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-16 pt-10 border-t border-white/5 text-center relative z-10 flex flex-col items-center"
                >
                  {hasSubmitted ? (
                    <div className="px-6 py-3 sm:px-8 sm:py-4 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-white/50 font-bold tracking-wide flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                      <Trophy size={16} className="text-yellow-400 sm:w-[18px] sm:h-[18px]" />
                      Your Score is on the Leaderboard!
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsSubmitModalOpen(true)}
                      disabled={Number(cgpa) <= 0}
                      className="px-6 py-3 sm:px-8 sm:py-4 bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 rounded-xl sm:rounded-2xl text-white font-bold tracking-wide transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                    >
                      <Database size={16} className="text-brand-400 sm:w-[18px] sm:h-[18px]" />
                      Submit Your CGPA to Leaderboard
                    </button>
                  )}
                  <p className="text-white/30 text-xs mt-4">Powered by Supabase</p>
                </motion.div>
              </div>
            </section>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default App;
