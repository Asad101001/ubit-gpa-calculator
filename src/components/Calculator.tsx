import { motion, type Variants } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getGradePoint, SEM1_COURSES, SEM2_COURSES, SEM3_COURSES } from '../lib/utils';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

export const CourseSelect = ({ course, value, onChange }: any) => {
  const gp = getGradePoint(value);
  
  return (
    <motion.div 
      variants={itemVariants}
      className="group flex flex-col p-2 sm:p-4 rounded-xl hover:bg-surface/60 border border-transparent hover:border-border/50 transition-all gap-2 sm:gap-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <div className="flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-surface/70 border border-border text-brand-400 group-hover:scale-105 group-hover:bg-gradient-to-br group-hover:from-brand-500/10 group-hover:to-accent-500/10 group-hover:border-accent-500/30 group-hover:text-accent-500 transition-all shrink-0">
            <span className="text-[8px] sm:text-[10px] uppercase font-bold text-textMuted mb-[-2px] group-hover:text-accent-400 transition-colors">{course.code.split('-')[0]}</span>
            <span className="text-[12px] sm:text-base font-extrabold">{course.code.split('-')[1]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-textMain group-hover:text-textMain/90 transition-colors text-[12px] sm:text-[14px] leading-tight h-[34px] sm:h-[42px] flex items-center">
              <span className="line-clamp-2 w-full pr-2">{course.name}</span>
            </div>
            <div className="text-[10px] sm:text-[11px] font-medium text-textMuted mt-0.5 sm:mt-1 truncate w-full">
              {course.instructor}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 sm:w-24 flex items-center justify-center">
            <button
              onClick={() => {
                const val = typeof value === 'number' ? value : 0;
                if (val > 0) onChange(val - 1);
              }}
              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-l-lg sm:rounded-l-xl bg-surface/70 hover:bg-surfaceHighlight border border-border border-r-0 text-textMuted font-bold"
            >-</button>
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
                if (!isNaN(val)) {
                  if (val >= 0 && val <= 100) {
                    onChange(val);
                  } else {
                    toast.error('Marks must be between 0 and 100', { id: 'marks-error' });
                  }
                }
              }}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="0"
              className="w-12 sm:w-16 h-6 sm:h-8 glass-input text-textMain py-0 px-1 rounded-none border-y border-border font-bold text-[10px] sm:text-sm focus:ring-0 focus:outline-none placeholder:text-textMuted/50 text-center"
            />
            <button
              onClick={() => {
                const val = typeof value === 'number' ? value : 0;
                if (val < 100) onChange(val + 1);
              }}
              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-r-lg sm:rounded-r-xl bg-surface/70 hover:bg-surfaceHighlight border border-border border-l-0 text-textMuted font-bold"
            >+</button>
          </div>
          <div className="w-12 sm:w-16 text-center py-1 px-1 sm:py-2 sm:px-2 rounded-lg sm:rounded-xl bg-surface/70 border border-border font-mono font-bold text-brand-400 flex flex-col justify-center">
            <span className="text-[8px] sm:text-[9px] text-textMuted leading-none mb-0.5 sm:mb-1">GP</span>
            <span className="text-sm sm:text-base leading-none">{value === '' ? '-' : gp.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="w-full px-1 mt-1 sm:mt-2">
        <div className="w-full h-1.5 sm:h-2 bg-border/40 rounded-full overflow-hidden relative opacity-70 group-hover:opacity-100 transition-opacity">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value === '' ? 0 : value}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`absolute top-0 left-0 h-full rounded-full ${
              typeof value === 'number' && value >= 80 ? 'bg-green-500' : 
              typeof value === 'number' && value >= 50 ? 'bg-brand-500' : 'bg-red-500'
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
}: any) => {
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
      {/* Semester 1 */}
      <motion.div 
        variants={itemVariants}
        className="glass rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 md:p-10 relative overflow-hidden"
      >
        <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-500/5 border border-brand-500/20 flex items-center justify-center text-sm sm:text-lg font-bold text-brand-400 shadow-[0_0_20px_rgba(var(--color-brand-500),0.15)]">
              01
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-textMain tracking-tight">Semester One</h2>
              <p className="text-[10px] sm:text-sm font-medium text-textMuted uppercase tracking-widest mt-0.5 sm:mt-1">18 Credits</p>
            </div>
          </div>
        </div>
        <div className="space-y-3 relative z-10">
          {SEM1_COURSES.map((course) => (
            <CourseSelect 
              key={course.code} course={course} value={sem1Grades[course.code]}
              onChange={(val: number | '') => setSem1Grades((prev: any) => ({ ...prev, [course.code]: val }))}
            />
          ))}
        </div>
      </motion.div>

      {/* Semester 2 */}
      <motion.div 
        variants={itemVariants}
        className="glass rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 md:p-10 relative overflow-hidden"
      >
        <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-brand-600/20 to-brand-600/5 border border-brand-600/20 flex items-center justify-center text-sm sm:text-lg font-bold text-brand-600 shadow-[0_0_20px_rgba(var(--color-brand-600),0.15)]">
              02
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-textMain tracking-tight">Semester Two</h2>
              <p className="text-[10px] sm:text-sm font-medium text-textMuted uppercase tracking-widest mt-0.5 sm:mt-1">18 Credits</p>
            </div>
          </div>
        </div>
        <div className="space-y-3 relative z-10">
          {SEM2_COURSES.map((course) => (
            <CourseSelect 
              key={course.code} course={course} value={sem2Grades[course.code]}
              onChange={(val: number | '') => setSem2Grades((prev: any) => ({ ...prev, [course.code]: val }))}
            />
          ))}
        </div>
      </motion.div>

      {/* Semester 3 — full-width */}
      <motion.div 
        variants={itemVariants}
        className="glass rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 md:p-10 relative overflow-hidden xl:col-span-2"
      >
        <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-accent-500/20 to-accent-500/5 border border-accent-500/20 flex items-center justify-center text-sm sm:text-lg font-bold text-accent-500 shadow-[0_0_20px_rgba(var(--color-accent-500),0.15)]">
              03
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-textMain tracking-tight">Semester Three</h2>
              <p className="text-[10px] sm:text-sm font-medium text-textMuted uppercase tracking-widest mt-0.5 sm:mt-1">18 Credits</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 relative z-10">
          {SEM3_COURSES.map((course) => (
            <CourseSelect 
              key={course.code} course={course} value={sem3Grades[course.code]}
              onChange={(val: number | '') => setSem3Grades((prev: any) => ({ ...prev, [course.code]: val }))}
            />
          ))}
        </div>
      </motion.div>

      {/* Semester 4 — Coming Soon (yellow caution tape) */}
      <motion.div 
        variants={itemVariants}
        className="xl:col-span-2 w-full bg-surface/70 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden border border-border shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] group"
      >
        {/* Diagonal stripe background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]">
          <div 
            className="absolute inset-0 opacity-[0.06] group-hover:opacity-[0.10] transition-opacity duration-500"
            style={{
              backgroundImage: `repeating-linear-gradient(-45deg, #f5c518 0px, #f5c518 24px, transparent 24px, transparent 48px)`
            }}
          />
        </div>

        {/* Top caution tape strip */}
        <div className="absolute top-0 left-0 right-0 h-6 sm:h-8 z-10 overflow-hidden opacity-75">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(-45deg, #f5c518 0px, #f5c518 14px, #111 14px, #111 28px)`
            }}
          />
        </div>
        {/* Bottom caution tape strip */}
        <div className="absolute bottom-0 left-0 right-0 h-6 sm:h-8 z-10 overflow-hidden opacity-75">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(-45deg, #f5c518 0px, #f5c518 14px, #111 14px, #111 28px)`
            }}
          />
        </div>

        <div className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-6 sm:py-7 my-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 flex items-center justify-center text-sm sm:text-lg font-bold text-yellow-500 shadow-[0_0_20px_rgba(245,197,24,0.15)]">
              04
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-textMain tracking-tight">Semester Four</h2>
              <p className="text-[9px] sm:text-sm font-medium text-yellow-500/80 uppercase tracking-widest mt-0.5 sm:mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                Coming Soon — Not Yet Available
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 font-bold rounded-xl text-sm border border-yellow-500/20">
            🚧 Under Construction
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
