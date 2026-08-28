import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Code2, Cpu, Binary, BookOpen, MessageSquare, Sparkles, Plus, Minus, 
  ChevronDown, GraduationCap, Award, BookMarked, Trophy
} from 'lucide-react';

import { getGradePoint, SEM1_COURSES, SEM2_COURSES, SEM3_COURSES } from '../lib/utils';
import { validateMarks } from '../lib/validation';
import { TentativeCGPA } from './TentativeCGPA';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { 
    opacity: 1, y: 0, scale: 1, 
    transition: { type: 'spring', stiffness: 280, damping: 24 } 
  }
};

const getCourseIcon = (courseCode: string, type: string) => {
  if (courseCode === 'CS-354' || courseCode === 'CS-455') return Cpu;
  if (type === 'Programming') return Code2;
  if (type === 'Math') return Binary;
  if (courseCode === 'CS-359' || courseCode === 'CS-360') return MessageSquare;
  if (courseCode === 'CS-361' || courseCode === 'CS-362' || courseCode === 'CS-461') return BookOpen;
  return Sparkles;
};

export const CourseSelect = ({ course, value, onChange }: any) => {
  const gp = getGradePoint(typeof value === 'number' ? value : 0);
  const IconComponent = getCourseIcon(course.code, course.type);
  
  const handleDirectChange = (raw: string) => {
    if (raw === '') {
      onChange('');
      return;
    }
    const validation = validateMarks(raw);
    if (validation.isValid) {
      onChange(validation.parsed);
    } else {
      toast.error(validation.error || 'Marks must be between 0 and 100', { id: 'marks-validation-err' });
    }
  };

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group flex flex-col p-2.5 sm:p-3.5 rounded-xl hover:bg-surface/60 border border-transparent hover:border-black/20 transition-all gap-2 sm:gap-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3.5 flex-1 min-w-0">
          <div className="flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-surface border-2 border-black text-black group-hover:scale-105 group-hover:bg-yellow-400 group-hover:shadow-[2px_2px_0px_0px_#000] transition-all shrink-0">
            <IconComponent size={14} className="mb-0.5 text-black" strokeWidth={2.25} />
            <span className="text-[10px] sm:text-xs font-black font-mono tracking-tight leading-none">{course.code.split('-')[1]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-textMain group-hover:text-black transition-colors text-[13px] sm:text-[14px] leading-tight flex items-center">
              <span className="line-clamp-2 w-full pr-1">{course.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-textMuted mt-0.5 truncate">
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-gray-100 text-gray-700 border border-gray-300">
                {course.credits} Cr
              </span>
              <span className="truncate">{course.instructor}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => {
                const val = typeof value === 'number' ? value : 0;
                if (val > 0) onChange(val - 1);
              }}
              aria-label="Decrease marks"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-l-lg bg-gray-100 hover:bg-yellow-400 border-2 border-black border-r-0 text-black font-black text-sm active:bg-yellow-300 transition-colors select-none"
            >
              <Minus size={13} strokeWidth={3} />
            </button>
            <input
              type="number"
              min="0"
              max="100"
              value={value === '' ? '' : value}
              onChange={(e) => handleDirectChange(e.target.value)}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="0"
              className="w-12 sm:w-14 h-8 sm:h-9 bg-white text-black py-0 px-1 border-y-2 border-black font-mono font-black text-xs sm:text-sm focus:outline-none placeholder:text-gray-400 text-center"
            />
            <button
              onClick={() => {
                const val = typeof value === 'number' ? value : 0;
                if (val < 100) onChange(val + 1);
              }}
              aria-label="Increase marks"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-r-lg bg-gray-100 hover:bg-yellow-400 border-2 border-black border-l-0 text-black font-black text-sm active:bg-yellow-300 transition-colors select-none"
            >
              <Plus size={13} strokeWidth={3} />
            </button>
          </div>
          <div className="w-12 sm:w-14 h-8 sm:h-9 text-center rounded-lg bg-yellow-50 border-2 border-black font-mono font-black text-black flex flex-col justify-center shadow-[1.5px_1.5px_0px_0px_#000]">
            <span className="text-[7.5px] sm:text-[8px] uppercase tracking-wider text-gray-600 leading-none mb-0.5">GP</span>
            <span className="text-xs sm:text-sm leading-none">{value === '' ? '-' : gp.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="w-full px-0.5 mt-0.5">
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value === '' ? 0 : Math.min(100, Math.max(0, Number(value)))}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.05 }}
            className={`absolute top-0 left-0 h-full rounded-full ${
              typeof value === 'number' && value >= 85 ? 'bg-emerald-500' : 
              typeof value === 'number' && value >= 80 ? 'bg-green-600' :
              typeof value === 'number' && value >= 70 ? 'bg-blue-600' :
              typeof value === 'number' && value >= 60 ? 'bg-gray-500' :
              typeof value === 'number' && value >= 50 ? 'bg-amber-500' :
              typeof value === 'number' && value >= 35 ? 'bg-red-700' : 'bg-[#ff0033]'
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export const Calculator = ({ 
  sem1Grades, setSem1Grades, 
  sem2Grades, setSem2Grades,
  sem3Grades, setSem3Grades,
  cgpa,
}: any) => {

  const [isSem4Expanded, setIsSem4Expanded] = useState(false);

  const getSemStats = (courses: any[], grades: Record<string, number | ''>) => {
    let totalQP = 0;
    let totalCredits = 0;
    let filledCount = 0;
    courses.forEach(c => {
      const val = grades[c.code];
      if (typeof val === 'number' && !isNaN(val)) {
        totalQP += getGradePoint(val) * c.credits;
        totalCredits += c.credits;
        filledCount++;
      }

    });
    const gpa = totalCredits > 0 ? (totalQP / totalCredits).toFixed(2) : '—';
    const isComplete = filledCount === courses.length;
    return { gpa, totalQP, totalCredits, filledCount, isComplete };
  };

  const s1Stats = getSemStats(SEM1_COURSES, sem1Grades);
  const s2Stats = getSemStats(SEM2_COURSES, sem2Grades);
  const s3Stats = getSemStats(SEM3_COURSES, sem3Grades);

  const totalCompletedCr = s1Stats.totalCredits + s2Stats.totalCredits + s3Stats.totalCredits;
  const totalCompletedCount = s1Stats.filledCount + s2Stats.filledCount + s3Stats.filledCount;

  // Concrete CGPA: Sem 1 & 2 full with 0 Sem 3 OR all 18 complete
  const isConcrete = (s1Stats.filledCount === 6 && s2Stats.filledCount === 6 && s3Stats.filledCount === 0) || 
                     (s1Stats.filledCount === 6 && s2Stats.filledCount === 6 && s3Stats.filledCount === 6);
  const isPartialSem3 = s1Stats.filledCount === 6 && s2Stats.filledCount === 6 && s3Stats.filledCount > 0 && s3Stats.filledCount < 6;
  const missingCount = (s1Stats.filledCount < 6 ? 6 - s1Stats.filledCount : 0) + (s2Stats.filledCount < 6 ? 6 - s2Stats.filledCount : 0);

  return (
    <motion.div 
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className="grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-10"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
      }}
    >
      {/* ── SEMESTER 1 CARD ── */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="glass rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 md:p-8 relative overflow-hidden flex flex-col justify-between"
      >
        <div>
          <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-yellow-400 border-2 border-black flex items-center justify-center font-mono text-base sm:text-lg font-black text-black shadow-[2px_2px_0px_0px_#000]">
                01
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-textMain tracking-tight">Semester One</h2>
                  <GraduationCap size={16} className="text-yellow-600 hidden sm:inline" />
                </div>
                <p className="text-[10px] sm:text-xs font-mono font-bold text-textMuted uppercase tracking-wider mt-0.5">18 Total Credit Hours</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-2.5 relative z-10">
            {SEM1_COURSES.map((course) => (
              <CourseSelect 
                key={course.code} course={course} value={sem1Grades[course.code]}
                onChange={(val: number | '') => setSem1Grades((prev: any) => ({ ...prev, [course.code]: val }))}
              />
            ))}
          </div>
        </div>

        {/* Semester 1 GPA Pill Directly Below Courses */}
        <div className="mt-5 pt-3.5 border-t-2 border-black/10 flex items-center justify-between bg-yellow-50/90 p-3 sm:p-3.5 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-yellow-400 border-2 border-black flex items-center justify-center font-mono font-black text-xs text-black shadow-[1px_1px_0px_0px_#000]">
              01
            </div>
            <div>
              <span className="text-xs font-black uppercase text-black tracking-wide">Semester 1 GPA</span>
              <p className="text-[10px] font-bold text-gray-600">{s1Stats.filledCount} of 6 courses ({s1Stats.totalCredits}/18 Cr)</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-xl bg-black text-yellow-400 border-2 border-black font-mono font-black text-base sm:text-lg shadow-[1.5px_1.5px_0px_0px_#000]">
            {s1Stats.filledCount > 0 ? (s1Stats.isComplete ? s1Stats.gpa : `${s1Stats.gpa}*`) : '—'}
          </div>
        </div>
      </motion.div>

      {/* ── SEMESTER 2 CARD ── */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="glass rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 md:p-8 relative overflow-hidden flex flex-col justify-between"
      >
        <div>
          <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-yellow-400 border-2 border-black flex items-center justify-center font-mono text-base sm:text-lg font-black text-black shadow-[2px_2px_0px_0px_#000]">
                02
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-textMain tracking-tight">Semester Two</h2>
                  <Award size={16} className="text-yellow-600 hidden sm:inline" />
                </div>
                <p className="text-[10px] sm:text-xs font-mono font-bold text-textMuted uppercase tracking-wider mt-0.5">18 Total Credit Hours</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-2.5 relative z-10">
            {SEM2_COURSES.map((course) => (
              <CourseSelect 
                key={course.code} course={course} value={sem2Grades[course.code]}
                onChange={(val: number | '') => setSem2Grades((prev: any) => ({ ...prev, [course.code]: val }))}
              />
            ))}
          </div>
        </div>

        {/* Semester 2 GPA Pill Directly Below Courses */}
        <div className="mt-5 pt-3.5 border-t-2 border-black/10 flex items-center justify-between bg-yellow-50/90 p-3 sm:p-3.5 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-yellow-400 border-2 border-black flex items-center justify-center font-mono font-black text-xs text-black shadow-[1px_1px_0px_0px_#000]">
              02
            </div>
            <div>
              <span className="text-xs font-black uppercase text-black tracking-wide">Semester 2 GPA</span>
              <p className="text-[10px] font-bold text-gray-600">{s2Stats.filledCount} of 6 courses ({s2Stats.totalCredits}/18 Cr)</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-xl bg-black text-yellow-400 border-2 border-black font-mono font-black text-base sm:text-lg shadow-[1.5px_1.5px_0px_0px_#000]">
            {s2Stats.filledCount > 0 ? (s2Stats.isComplete ? s2Stats.gpa : `${s2Stats.gpa}*`) : '—'}
          </div>
        </div>
      </motion.div>

      {/* ── SEMESTER 3 CARD ── */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="glass rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 md:p-8 relative overflow-hidden xl:col-span-2 max-w-3xl mx-auto w-full flex flex-col justify-between"
      >
        <div>
          <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-yellow-400 border-2 border-black flex items-center justify-center font-mono text-base sm:text-lg font-black text-black shadow-[2px_2px_0px_0px_#000]">
                03
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-textMain tracking-tight">Semester Three</h2>
                  <BookMarked size={16} className="text-yellow-600 hidden sm:inline" />
                </div>
                <p className="text-[10px] sm:text-xs font-mono font-bold text-textMuted uppercase tracking-wider mt-0.5">18 Total Credit Hours</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-2.5 relative z-10">
            {SEM3_COURSES.map((course) => (
              <CourseSelect 
                key={course.code} course={course} value={sem3Grades[course.code]}
                onChange={(val: number | '') => setSem3Grades((prev: any) => ({ ...prev, [course.code]: val }))}
              />
            ))}
          </div>
        </div>

        {/* Semester 3 GPA Pill Directly Below Courses */}
        <div className="mt-5 pt-3.5 border-t-2 border-black/10 flex items-center justify-between bg-yellow-50/90 p-3 sm:p-3.5 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-yellow-400 border-2 border-black flex items-center justify-center font-mono font-black text-xs text-black shadow-[1px_1px_0px_0px_#000]">
              03
            </div>
            <div>
              <span className="text-xs font-black uppercase text-black tracking-wide">Semester 3 GPA</span>
              <p className="text-[10px] font-bold text-gray-600">{s3Stats.filledCount} of 6 courses ({s3Stats.totalCredits}/18 Cr)</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-xl bg-black text-yellow-400 border-2 border-black font-mono font-black text-base sm:text-lg shadow-[1.5px_1.5px_0px_0px_#000]">
            {s3Stats.filledCount > 0 ? (s3Stats.isComplete ? s3Stats.gpa : `${s3Stats.gpa}*`) : '—'}
          </div>
        </div>
      </motion.div>

      {/* ── SEMESTER 4 — EXPANDING PILL (Last Present Semester) ── */}
      <motion.div 
        variants={itemVariants}
        className="xl:col-span-2 max-w-3xl mx-auto w-full"
      >
        <div 
          onClick={() => setIsSem4Expanded(!isSem4Expanded)}
          className="glass rounded-2xl sm:rounded-full px-5 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between cursor-pointer hover:bg-yellow-50 transition-all border-2 border-black shadow-[3px_3px_0px_0px_#000] group active:translate-x-0.5 active:translate-y-0.5"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 border-2 border-black flex items-center justify-center text-xs sm:text-sm font-mono font-black text-black shadow-[1.5px_1.5px_0px_0px_#000] group-hover:scale-105 transition-transform">
              04
            </div>
            <h2 className="text-sm sm:text-lg font-black text-textMain tracking-tight">Semester Four</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[9.5px] sm:text-xs font-mono font-bold text-black uppercase tracking-wider bg-yellow-400 px-2.5 sm:px-3 py-1 rounded-md border border-black shadow-[1px_1px_0px_0px_#000]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              Upcoming
            </span>
            <div className={`text-black transition-transform duration-300 ${isSem4Expanded ? 'rotate-180' : ''}`}>
              <ChevronDown size={18} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isSem4Expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="glass rounded-[2rem] p-6 sm:p-10 relative overflow-hidden border border-yellow-500/30 shadow-[0_0_40px_rgba(245,197,24,0.1)]">
                 <div className="absolute inset-0 pointer-events-none opacity-20 sm:opacity-40 overflow-hidden flex flex-col justify-center gap-8 -rotate-12 scale-150 mix-blend-overlay">
                   {[...Array(6)].map((_, i) => (
                     <div key={i} className="w-full h-12 bg-yellow-400 text-black font-black text-2xl tracking-widest uppercase flex items-center overflow-hidden" style={{ transform: i % 2 === 0 ? 'translateX(-10%)' : 'translateX(-5%)' }}>
                       <div className="flex whitespace-nowrap animate-tape-scroll" style={{ animationDirection: i % 2 === 0 ? 'normal' : 'reverse', animationDuration: '4s' }}>
                         {[...Array(10)].map((_, j) => (
                           <span key={j} className="px-4">🎓 SEMESTER JUST STARTED 🎓</span>
                         ))}
                       </div>
                     </div>
                   ))}
                </div>
                
                <div className="relative z-10 flex flex-col items-center justify-center text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-textMain mb-2 uppercase tracking-tight">Hold Your Horses</h3>
                  <p className="text-textMuted font-medium max-w-md mx-auto">Bro, the semester literally just started. No results yet — go touch some grass first.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── OVERALL CUMULATIVE CGPA PILL (Above Advisor) ── */}
      <motion.div
        variants={itemVariants}
        className="xl:col-span-2 max-w-3xl mx-auto w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-yellow-400 border-2 border-black shadow-[5px_5px_0px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-black text-yellow-400 flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000] flex-shrink-0">
            <Trophy size={22} strokeWidth={2.5} />
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-sm sm:text-base font-black text-black uppercase tracking-tight">
                Cumulative CGPA
              </span>
              {isConcrete && (
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black text-yellow-400 border border-black">
                  Official
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-black/80 mt-0.5">
              {totalCompletedCr} of 54 Credit Hours Completed ({totalCompletedCount} Subjects Entered)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isConcrete ? (
            <div className="px-5 py-2 rounded-xl bg-black text-yellow-400 border-2 border-black font-mono font-black text-2xl sm:text-3xl shadow-[3px_3px_0px_0px_#000] tracking-tight">
              {cgpa}
            </div>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-white text-black border-2 border-black shadow-[3px_3px_0px_0px_#000]">
              <TentativeCGPA cgpa={cgpa} isPartialSem3={isPartialSem3} missingCount={missingCount} size="sm" />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

