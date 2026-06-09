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
      className="group flex flex-col p-2 sm:p-4 rounded-xl hover:bg-white/60 border border-transparent hover:border-slate-300/50 transition-all gap-2 sm:gap-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <div className="flex flex-col items-center justify-center w-6 h-6 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/70 border border-slate-300 text-brand-400 group-hover:scale-105 group-hover:bg-brand-500/10 transition-transform shrink-0">
            <span className="text-[6px] sm:text-[10px] uppercase font-bold text-slate-500 mb-[-2px]">{course.code.split('-')[0]}</span>
            <span className="text-[10px] sm:text-base font-extrabold">{course.code.split('-')[1]}</span>
          </div>
          <div>
            <div className="font-semibold text-slate-800 group-hover:text-slate-900 transition-colors text-[11px] sm:text-[15px] leading-tight min-h-[24px] sm:min-h-[44px] flex items-end sm:items-center">
              <span className="line-clamp-2">{course.name}</span>
            </div>
            <div className="text-[9px] sm:text-[11px] font-medium text-slate-500 mt-0.5 sm:mt-1 truncate max-w-[200px] sm:max-w-none">
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
              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-l-lg sm:rounded-l-xl bg-white/70 hover:bg-slate-200 border border-slate-300 border-r-0 text-slate-600 font-bold"
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
              className="w-12 sm:w-16 h-6 sm:h-8 glass-input text-slate-800 py-0 px-1 rounded-none border-y border-slate-300 font-bold text-[10px] sm:text-sm focus:ring-0 focus:outline-none placeholder:text-slate-400 text-center"
            />
            <button
              onClick={() => {
                const val = typeof value === 'number' ? value : 0;
                if (val < 100) onChange(val + 1);
              }}
              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-r-lg sm:rounded-r-xl bg-white/70 hover:bg-slate-200 border border-slate-300 border-l-0 text-slate-600 font-bold"
            >+</button>
          </div>
          <div className="w-12 sm:w-16 text-center py-1 px-1 sm:py-2 sm:px-2 rounded-lg sm:rounded-xl bg-white/70 border border-slate-300 font-mono font-bold text-brand-400 flex flex-col justify-center">
            <span className="text-[8px] sm:text-[9px] text-slate-500 leading-none mb-0.5 sm:mb-1">GP</span>
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
          className="w-full h-2 sm:h-1.5 bg-slate-200 rounded-lg appearance-none pointer-events-none accent-brand-500 transition-all opacity-70 group-hover:opacity-100"
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
        className="glass rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 md:p-10 border-slate-300 relative overflow-hidden"
      >
        <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-500/5 border border-brand-500/20 flex items-center justify-center text-sm sm:text-lg font-bold text-brand-400 shadow-[0_0_20px_rgba(20,184,166,0.15)]">
              01
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-800 tracking-tight">Semester One</h2>
              <p className="text-[10px] sm:text-sm font-medium text-slate-500 uppercase tracking-widest mt-0.5 sm:mt-1">18 Credits</p>
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
        className="glass rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 md:p-10 border-slate-300 relative overflow-hidden"
      >
        <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center text-sm sm:text-lg font-bold text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
              02
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-800 tracking-tight">Semester Two</h2>
              <p className="text-[10px] sm:text-sm font-medium text-slate-500 uppercase tracking-widest mt-0.5 sm:mt-1">18 Credits</p>
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
