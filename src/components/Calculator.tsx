import { motion, type Variants } from 'framer-motion';
import { getGradePoint, SEM1_COURSES, SEM2_COURSES } from '../lib/utils';

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
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <div className="flex flex-col items-center justify-center w-6 h-6 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-surface/70 border border-border text-brand-400 group-hover:scale-105 group-hover:bg-gradient-to-br group-hover:from-brand-500/10 group-hover:to-accent-500/10 group-hover:border-accent-500/30 group-hover:text-accent-500 transition-all shrink-0">
            <span className="text-[6px] sm:text-[10px] uppercase font-bold text-textMuted mb-[-2px] group-hover:text-accent-400 transition-colors">{course.code.split('-')[0]}</span>
            <span className="text-[10px] sm:text-base font-extrabold">{course.code.split('-')[1]}</span>
          </div>
          <div>
            <div className="font-semibold text-textMain group-hover:text-textMain/90 transition-colors text-[11px] sm:text-[15px] leading-tight min-h-[24px] sm:min-h-[44px] flex items-end sm:items-center">
              <span className="line-clamp-2">{course.name}</span>
            </div>
            <div className="text-[9px] sm:text-[11px] font-medium text-textMuted mt-0.5 sm:mt-1 truncate max-w-[200px] sm:max-w-none">
              {course.instructor}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
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
                if (!isNaN(val) && val >= 0 && val <= 100) {
                  onChange(val);
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

      <div className="w-full px-1">
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={value === '' ? 0 : value}
          readOnly
          className="w-full h-2 sm:h-1.5 bg-border rounded-lg appearance-none pointer-events-none accent-brand-500 transition-all opacity-70 group-hover:opacity-100 group-hover:accent-accent-500"
        />
      </div>
    </motion.div>
  );
};

export const Calculator = ({ 
  sem1Grades, setSem1Grades, 
  sem2Grades, setSem2Grades 
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
    </motion.div>
  );
};
