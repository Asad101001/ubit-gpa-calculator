import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, ChevronDown, ChevronUp, Lightbulb, CheckCircle2 } from 'lucide-react';
import { getGradePoint, SEM1_COURSES, SEM2_COURSES, SEM3_COURSES } from '../lib/utils';

const ALL_COURSES = [...SEM1_COURSES, ...SEM2_COURSES, ...SEM3_COURSES];

// Grade boundaries — what mark gets you to the next grade point
const GRADE_BOUNDARIES = [50, 53, 54, 55, 56, 57, 61, 64, 68, 71, 75, 80, 85];

function getNextBoundary(currentMark: number): number | null {
  for (const b of GRADE_BOUNDARIES) {
    if (b > currentMark) return b;
  }
  return null;
}

interface TargetCGPAProps {
  sem1Grades: Record<string, number | ''>;
  sem2Grades: Record<string, number | ''>;
  sem3Grades: Record<string, number | ''>;
  currentCgpa: string;
}

export const TargetCGPA = ({ sem1Grades, sem2Grades, sem3Grades, currentCgpa }: TargetCGPAProps) => {
  const [targetCgpa, setTargetCgpa] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const allGrades: Record<string, number | ''> = {
    ...sem1Grades, ...sem2Grades, ...sem3Grades
  };

  const currentVal = parseFloat(currentCgpa);
  const targetVal = parseFloat(targetCgpa);

  const suggestions = useMemo(() => {
    if (!targetVal || isNaN(targetVal) || targetVal <= 0 || targetVal > 4) return [];
    if (currentVal >= targetVal) return [];

    // Build current state
    let currentTotalQP = 0;
    let currentTotalCredits = 0;

    ALL_COURSES.forEach(c => {
      const marks = allGrades[c.code];
      if (marks !== '' && marks !== undefined && !isNaN(Number(marks))) {
        const gp = getGradePoint(Number(marks));
        currentTotalQP += gp * c.credits;
        currentTotalCredits += c.credits;
      }
    });

    if (currentTotalCredits === 0) return [];

    const neededTotalQP = targetVal * currentTotalCredits;
    const qpDeficit = neededTotalQP - currentTotalQP;

    if (qpDeficit <= 0) return [];

    // Find courses where improving marks would help
    const improvements: {
      course: typeof ALL_COURSES[0];
      currentMark: number;
      currentGP: number;
      suggestedMark: number;
      suggestedGP: number;
      gpGain: number;
      cgpaImpact: number;
      marksNeeded: number;
    }[] = [];

    ALL_COURSES.forEach(course => {
      const marks = allGrades[course.code];
      if (marks === '' || marks === undefined || isNaN(Number(marks))) return;
      const currentMark = Number(marks);
      if (currentMark >= 100) return;

      const currentGP = getGradePoint(currentMark);
      const nextBoundary = getNextBoundary(currentMark);
      if (!nextBoundary) return;

      const nextGP = getGradePoint(nextBoundary);
      const gpGain = nextGP - currentGP;
      if (gpGain <= 0) return;

      const cgpaImpact = (gpGain * course.credits) / currentTotalCredits;
      const marksNeeded = nextBoundary - currentMark;

      improvements.push({
        course,
        currentMark,
        currentGP,
        suggestedMark: nextBoundary,
        suggestedGP: nextGP,
        gpGain,
        cgpaImpact,
        marksNeeded,
      });
    });

    // Sort by: most CGPA impact per mark needed (efficiency)
    improvements.sort((a, b) => (b.cgpaImpact / b.marksNeeded) - (a.cgpaImpact / a.marksNeeded));

    // Greedily pick suggestions until we hit target
    let remainingDeficit = qpDeficit;
    const selected: typeof improvements = [];

    for (const imp of improvements) {
      if (remainingDeficit <= 0) break;
      selected.push(imp);
      remainingDeficit -= imp.gpGain * imp.course.credits;
    }

    return selected;
  }, [targetVal, currentVal, allGrades]);

  const projectedCgpa = useMemo(() => {
    if (suggestions.length === 0) return currentVal;
    
    let totalQP = 0, totalCredits = 0;
    ALL_COURSES.forEach(c => {
      const marks = allGrades[c.code];
      if (marks !== '' && marks !== undefined && !isNaN(Number(marks))) {
        const suggestion = suggestions.find(s => s.course.code === c.code);
        const effectiveMark = suggestion ? suggestion.suggestedMark : Number(marks);
        totalQP += getGradePoint(effectiveMark) * c.credits;
        totalCredits += c.credits;
      }
    });
    return totalCredits > 0 ? totalQP / totalCredits : 0;
  }, [suggestions, allGrades]);

  const isTargetAchievable = suggestions.length > 0 && projectedCgpa >= targetVal - 0.005;
  const hasGrades = Object.values(allGrades).some(v => v !== '' && v !== undefined);
  const alreadyMet = targetVal > 0 && currentVal >= targetVal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden"
    >
      {/* Header — always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 sm:p-8 flex items-center justify-between group"
      >
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/20 to-brand-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.15)] group-hover:scale-105 transition-transform shrink-0">
            <Target className="text-emerald-400 w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <div className="text-left">
            <h3 className="text-base sm:text-xl font-bold text-textMain tracking-tight">Target CGPA Advisor</h3>
            <p className="text-[10px] sm:text-sm text-textMuted font-medium mt-0.5">
              {currentVal > 0 ? `Current: ${currentCgpa} CGPA` : 'Enter marks to get started'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {targetVal > 0 && currentVal > 0 && (
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
              alreadyMet ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              isTargetAchievable ? 'bg-brand-500/10 text-brand-400 border-brand-500/30' :
              'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              {alreadyMet ? <CheckCircle2 size={12} /> : <TrendingUp size={12} />}
              {alreadyMet ? 'Target Met!' : isTargetAchievable ? `Achievable (${projectedCgpa.toFixed(3)})` : 'Needs Work'}
            </div>
          )}
          <div className="text-textMuted group-hover:text-textMain transition-colors">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-8 pb-6 sm:pb-8 space-y-5 border-t border-border/50 pt-5">
              {/* Input */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1">
                  <label className="text-[11px] font-bold text-textMuted uppercase tracking-widest mb-2 block">
                    Your Target CGPA
                  </label>
                  <div className="relative flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="4"
                      step="0.1"
                      value={targetCgpa}
                      onChange={e => setTargetCgpa(e.target.value)}
                      placeholder="e.g. 3.5"
                      className="w-36 px-4 py-3 glass-input text-textMain font-bold text-xl rounded-xl border border-border focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                    {currentVal > 0 && targetVal > 0 && (
                      <div className="flex items-center gap-2 text-sm font-medium text-textMuted">
                        <span className="text-textMuted/50">Current:</span>
                        <span className={`font-bold ${currentVal >= targetVal ? 'text-emerald-400' : 'text-brand-400'}`}>
                          {currentCgpa}
                        </span>
                        {currentVal < targetVal && (
                          <>
                            <span className="text-textMuted/30">→</span>
                            <span className="font-bold text-emerald-400">+{(targetVal - currentVal).toFixed(3)}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Results */}
              {!hasGrades && (
                <div className="flex items-center gap-3 p-4 bg-surfaceHighlight rounded-xl border border-border text-sm text-textMuted">
                  <Lightbulb size={16} className="text-brand-400 shrink-0" />
                  Enter your marks in the calculator above first, then set a target CGPA.
                </div>
              )}

              {hasGrades && targetVal > 0 && alreadyMet && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30"
                >
                  <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-400 text-sm">You've already hit your target! 🎉</p>
                    <p className="text-textMuted text-xs mt-0.5">Your current CGPA of <span className="font-bold text-textMain">{currentCgpa}</span> meets or exceeds {targetVal.toFixed(2)}.</p>
                  </div>
                </motion.div>
              )}

              {hasGrades && targetVal > 0 && !alreadyMet && suggestions.length === 0 && currentVal > 0 && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-xl border border-red-500/30 text-sm text-red-400">
                  <TrendingUp size={16} className="shrink-0" />
                  <p>Target {targetVal.toFixed(2)} isn't reachable just by improving existing subject marks. You'd need perfect scores in everything.</p>
                </div>
              )}

              {suggestions.length > 0 && !alreadyMet && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-textMuted uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp size={12} className="text-emerald-400" />
                      Suggested Improvements ({suggestions.length} subject{suggestions.length > 1 ? 's' : ''})
                    </p>
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                      isTargetAchievable ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                    }`}>
                      Projected: {projectedCgpa.toFixed(3)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {suggestions.map((s, i) => (
                      <motion.div
                        key={s.course.code}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-surfaceHighlight/60 border border-border hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
                      >
                        <div className="flex flex-col items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-surface border border-border group-hover:border-emerald-500/30 shrink-0 transition-colors">
                          <span className="text-[7px] sm:text-[8px] font-bold text-textMuted/60">{s.course.code.split('-')[0]}</span>
                          <span className="text-[11px] sm:text-sm font-black text-textMain">{s.course.code.split('-')[1]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-textMain truncate">{s.course.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-textMuted font-mono">
                              {s.currentMark} → <span className="text-emerald-400 font-bold">{s.suggestedMark}</span>
                            </span>
                            <span className="text-[9px] text-textMuted/50">•</span>
                            <span className="text-[10px] text-textMuted">
                              GP: {s.currentGP.toFixed(1)} → <span className="text-emerald-400 font-bold">{s.suggestedGP.toFixed(1)}</span>
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            +{s.marksNeeded} marks
                          </div>
                          <div className="text-[9px] text-textMuted/60 mt-0.5">
                            +{s.cgpaImpact.toFixed(3)} CGPA
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {isTargetAchievable && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-xs text-emerald-400 font-medium"
                    >
                      <CheckCircle2 size={14} className="shrink-0" />
                      By improving the above subjects, your CGPA would reach <span className="font-black mx-1">{projectedCgpa.toFixed(3)}</span> — meeting your {targetVal.toFixed(2)} target!
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
