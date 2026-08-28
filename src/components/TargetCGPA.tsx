import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, ChevronDown, ChevronUp, Lightbulb, CheckCircle2, Lock, Sparkles, Filter, Calculator, RefreshCw } from 'lucide-react';
import { getGradePoint, SEM1_COURSES, SEM2_COURSES, SEM3_COURSES } from '../lib/utils';
import { useAuthStore } from '../store/useAuthStore';
import { validateTargetCgpa } from '../lib/validation';

const ALL_COURSES = [...SEM1_COURSES, ...SEM2_COURSES, ...SEM3_COURSES];
const GRADE_BOUNDARIES = [50, 53, 54, 55, 56, 57, 61, 64, 68, 71, 75, 80, 85];

interface TargetCGPAProps {
  sem1Grades: Record<string, number | ''>;
  sem2Grades: Record<string, number | ''>;
  sem3Grades: Record<string, number | ''>;
  currentCgpa: string;
}

interface CourseItem {
  code: string;
  name: string;
  credits: number;
  type: string;
  instructor: string;
}

interface CourseSuggestion {
  course: CourseItem;
  currentMark: number;
  currentGP: number;
  suggestedMark: number;
  suggestedGP: number;
  gpGain: number;
  cgpaImpact: number;
  marksNeeded: number;
  qpGain: number;
}

export const TargetCGPA = ({ sem1Grades, sem2Grades, sem3Grades, currentCgpa }: TargetCGPAProps) => {
  const [targetCgpa, setTargetCgpa] = useState('3.50');
  const [isExpanded, setIsExpanded] = useState(true);
  const [mode, setMode] = useState<'improvement' | 'future'>('improvement');
  
  const [excludedCourses, setExcludedCourses] = useState<Record<string, boolean>>({});
  const [remainingSemesters, setRemainingSemesters] = useState(5);

  const { profile } = useAuthStore();
  const [officialMarks, setOfficialMarks] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const fetchOfficial = async () => {
      if (!profile?.seat_no) return;
      try {
        let resultsData: Record<string, unknown>[] | null = null;
        try {
          const res = await fetch('https://ubit-results-28-api.vercel.app/api/results');
          if (res.ok) resultsData = await res.json();
        } catch {
          // ignore network error
        }

        if (!resultsData) {
          const fallbackRes = await fetch('/fallback-results.json');
          if (fallbackRes.ok) resultsData = await fallbackRes.json();
        }

        if (resultsData) {
          const match = resultsData.find((row) => row.seat_no === profile.seat_no);
          if (match) setOfficialMarks(match);
        }
      } catch {
        // ignore error
      }
    };
    fetchOfficial();
  }, [profile?.seat_no]);

  const allGrades: Record<string, number | ''> = useMemo(() => ({
    ...sem1Grades, ...sem2Grades, ...sem3Grades
  }), [sem1Grades, sem2Grades, sem3Grades]);

  const currentVal = parseFloat(currentCgpa);
  const targetVal = validateTargetCgpa(targetCgpa).parsed;

  const completedCredits = useMemo(() => {
    let credits = 0;
    ALL_COURSES.forEach(c => {
      const m = allGrades[c.code];
      if (m !== '' && m !== undefined && !isNaN(Number(m))) {
        credits += c.credits;
      }
    });
    return credits;
  }, [allGrades]);

  const suggestions = useMemo<CourseSuggestion[]>(() => {
    if (!targetVal || isNaN(targetVal) || targetVal <= 0 || targetVal > 4) return [];
    if (currentVal >= targetVal) return [];

    let currentTotalQP = 0;
    let currentTotalCredits = 0;
    const editableCourses: CourseItem[] = [];

    ALL_COURSES.forEach(c => {
      const marks = allGrades[c.code];
      if (marks !== '' && marks !== undefined && !isNaN(Number(marks))) {
        const gp = getGradePoint(Number(marks));
        currentTotalQP += gp * c.credits;
        currentTotalCredits += c.credits;
        
        const dbKey = c.code.toLowerCase().replace('-', '');
        const officialVal = officialMarks[dbKey];
        const isLocked = officialVal !== undefined && officialVal !== '' && officialVal !== 'Results Unannounced' && officialVal !== 'Marks Missing';
        const isExcludedByUser = excludedCourses[c.code];

        if (!isLocked && !isExcludedByUser && Number(marks) < 85) {
          editableCourses.push(c);
        }
      }
    });

    if (currentTotalCredits === 0) return [];

    const neededTotalQP = targetVal * currentTotalCredits;
    const qpDeficit = neededTotalQP - currentTotalQP;
    if (qpDeficit <= 0) return [];

    const courseOptions = editableCourses.map(course => {
      const currentMark = Number(allGrades[course.code]);
      const currentGP = getGradePoint(currentMark);
      
      const options: CourseSuggestion[] = [];
      for (const b of GRADE_BOUNDARIES) {
        if (b > currentMark) {
          const nextGP = getGradePoint(b);
          const gpGain = nextGP - currentGP;
          if (gpGain > 0) {
            options.push({
              course,
              currentMark,
              currentGP,
              suggestedMark: b,
              suggestedGP: nextGP,
              gpGain,
              cgpaImpact: (gpGain * course.credits) / currentTotalCredits,
              marksNeeded: b - currentMark,
              qpGain: gpGain * course.credits
            });
          }
        }
      }
      return options;
    });

    const targetQpInt = Math.ceil(qpDeficit * 10);
    const MAX_QP = 800;
    
    const dp = new Array(MAX_QP + 1).fill(Infinity);
    const dpChoice: Array<Record<string, CourseSuggestion> | null> = new Array(MAX_QP + 1).fill(null);
    
    dp[0] = 0;
    dpChoice[0] = {};

    for (const options of courseOptions) {
      if (options.length === 0) continue;
      
      for (let q = MAX_QP; q >= 0; q--) {
        if (dp[q] === Infinity) continue;
        
        for (const opt of options) {
          const gainInt = Math.round(opt.qpGain * 10);
          const newQ = Math.min(MAX_QP, q + gainInt);
          const newCost = dp[q] + opt.marksNeeded;
          
          if (newCost < dp[newQ]) {
            dp[newQ] = newCost;
            dpChoice[newQ] = { ...dpChoice[q], [opt.course.code]: opt };
          }
        }
      }
    }

    let bestCost = Infinity;
    let bestChoices: Record<string, CourseSuggestion> | null = null;
    
    for (let q = targetQpInt; q <= MAX_QP; q++) {
      if (dp[q] < bestCost) {
        bestCost = dp[q];
        bestChoices = dpChoice[q];
      }
    }

    if (!bestChoices) return [];
    return Object.values(bestChoices);
  }, [targetVal, currentVal, allGrades, officialMarks, excludedCourses]);

  const projectedCgpa = useMemo(() => {
    if (suggestions.length === 0) return currentVal;
    
    let totalQP = 0, totalCredits = 0;
    ALL_COURSES.forEach(c => {
      const marks = allGrades[c.code];
      if (marks !== '' && marks !== undefined && !isNaN(Number(marks))) {
        const suggestion = suggestions.find((s) => s.course.code === c.code);
        const effectiveMark = suggestion ? suggestion.suggestedMark : Number(marks);
        totalQP += getGradePoint(effectiveMark) * c.credits;
        totalCredits += c.credits;
      }
    });
    return totalCredits > 0 ? totalQP / totalCredits : 0;
  }, [suggestions, allGrades, currentVal]);

  const futureSemesterAnalysis = useMemo(() => {
    if (completedCredits === 0 || !targetVal) return null;

    const currentTotalQP = currentVal * completedCredits;
    const futureCreditsPerSem = 18;
    const totalFutureCredits = remainingSemesters * futureCreditsPerSem;
    const totalProgramCredits = completedCredits + totalFutureCredits;

    const requiredTotalQP = targetVal * totalProgramCredits;
    const requiredFutureQP = requiredTotalQP - currentTotalQP;
    const requiredAvgGpa = requiredFutureQP / totalFutureCredits;

    const isPossible = requiredAvgGpa <= 4.0;
    const isChallenging = requiredAvgGpa > 3.7;

    return {
      requiredAvgGpa: Math.max(0, requiredAvgGpa),
      totalProgramCredits,
      totalFutureCredits,
      isPossible,
      isChallenging
    };
  }, [currentVal, completedCredits, remainingSemesters, targetVal]);

  const isTargetAchievable = suggestions.length > 0 && projectedCgpa >= targetVal - 0.005;
  const hasGrades = Object.values(allGrades).some(v => v !== '' && v !== undefined);
  const alreadyMet = targetVal > 0 && currentVal >= targetVal;
  const totalMarksToImprove = suggestions.reduce((sum: number, s) => sum + s.marksNeeded, 0);

  const toggleCourseExclusion = (code: string) => {
    setExcludedCourses(prev => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-border/80 relative"
    >
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: 'url(/images/analytics_target_bg.jpg)' }}
      />

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 sm:p-8 flex items-center justify-between group relative z-10 text-left"
      >
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/20 to-brand-500/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.2)] group-hover:scale-105 transition-transform shrink-0">
            <Target className="text-emerald-400 w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-2xl font-black text-textMain tracking-tight">Target CGPA Advisor</h3>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                PRO 2.0
              </span>
            </div>
            <p className="text-[11px] sm:text-sm text-textMuted font-medium mt-0.5">
              {currentVal > 0 ? `Current CGPA: ${currentCgpa} • ${completedCredits} Credits Completed` : 'Enter course marks to calculate target paths'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {targetVal > 0 && currentVal > 0 && (
            <div className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border ${
              alreadyMet ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              isTargetAchievable ? 'bg-brand-500/10 text-brand-400 border-brand-500/30' :
              'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {alreadyMet ? <CheckCircle2 size={13} /> : <TrendingUp size={13} />}
              {alreadyMet ? 'Target Met!' : isTargetAchievable ? `Achievable (${projectedCgpa.toFixed(3)})` : 'Needs Work'}
            </div>
          )}
          <div className="w-8 h-8 rounded-lg bg-surfaceHighlight flex items-center justify-center text-textMuted group-hover:text-textMain transition-colors border border-border">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
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
            className="overflow-hidden relative z-10"
          >
            <div className="px-5 sm:px-8 pb-8 space-y-6 border-t border-border/50 pt-6">
              
              <div className="bg-surfaceHighlight/40 p-4 sm:p-5 rounded-2xl border border-border/60 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[11px] font-bold text-textMuted uppercase tracking-widest flex items-center gap-2">
                      Target CGPA Goal
                      {Object.keys(officialMarks).length > 0 && (
                        <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full text-[10px] font-medium lowercase border border-amber-500/20">
                          <Lock size={10} /> {Object.keys(officialMarks).length} locked
                        </span>
                      )}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0.01"
                        max="4.00"
                        step="0.05"
                        value={targetCgpa}
                        onChange={e => setTargetCgpa(e.target.value)}
                        placeholder="e.g. 3.50"
                        className="w-32 sm:w-36 px-4 py-2.5 glass-input text-textMain font-black text-xl rounded-xl border border-border focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-inner"
                      />
                      {currentVal > 0 && targetVal > 0 && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-textMuted">
                          <span>Gap:</span>
                          <span className={`font-bold ${targetVal <= currentVal ? 'text-emerald-400' : 'text-brand-400'}`}>
                            {(targetVal - currentVal > 0 ? `+${(targetVal - currentVal).toFixed(3)}` : '0.00')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Quick Goal Presets</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { label: '3.00 First Div', val: '3.00' },
                        { label: '3.50 Honors', val: '3.50' },
                        { label: '3.80 Gold Medal', val: '3.80' },
                        { label: '4.00 Perfect', val: '4.00' },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          onClick={() => setTargetCgpa(preset.val)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            targetCgpa === preset.val
                              ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                              : 'bg-surface/60 text-textMuted hover:text-textMain border-border hover:bg-surfaceHighlight'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Advisor Mode</span>
                    <div className="flex items-center bg-surface p-1 rounded-xl border border-border">
                      <button
                        onClick={() => setMode('improvement')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          mode === 'improvement' ? 'bg-brand-500 text-white shadow-sm' : 'text-textMuted hover:text-textMain'
                        }`}
                      >
                        <RefreshCw size={12} /> Existing Subjects
                      </button>
                      <button
                        onClick={() => setMode('future')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          mode === 'future' ? 'bg-brand-500 text-white shadow-sm' : 'text-textMuted hover:text-textMain'
                        }`}
                      >
                        <Calculator size={12} /> Future Semesters
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {!hasGrades && (
                <div className="flex items-center gap-3 p-4 bg-surfaceHighlight rounded-xl border border-border text-xs sm:text-sm text-textMuted">
                  <Lightbulb size={16} className="text-brand-400 shrink-0" />
                  Enter your course marks in the calculator above to generate optimal target CGPA advice.
                </div>
              )}

              {hasGrades && targetVal > 0 && alreadyMet && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30"
                >
                  <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-400 text-sm">Goal Achieved! 🎉</p>
                    <p className="text-textMuted text-xs mt-0.5">Your current CGPA of <span className="font-bold text-textMain">{currentCgpa}</span> already meets or exceeds target {targetVal.toFixed(2)}.</p>
                  </div>
                </motion.div>
              )}

              {mode === 'improvement' && hasGrades && targetVal > 0 && !alreadyMet && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <p className="text-xs font-bold text-textMuted uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={14} className="text-emerald-400" />
                      Optimum Course Mark Improvements ({suggestions.length} Required)
                    </p>
                    {isTargetAchievable && (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        Projected CGPA: {projectedCgpa.toFixed(3)}
                      </span>
                    )}
                  </div>

                  {suggestions.length === 0 ? (
                    <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30 text-xs sm:text-sm text-red-400">
                      Target CGPA {targetVal.toFixed(2)} cannot be reached by improving existing non-locked courses alone. Try reducing excluded courses or switch to the <strong>Future Semesters</strong> mode!
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {suggestions.map((s) => {
                          const isExcluded = excludedCourses[s.course.code];
                          return (
                            <motion.div
                              key={s.course.code}
                              whileHover={{ y: -2 }}
                              className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                                isExcluded
                                  ? 'bg-surface/30 border-border/40 opacity-50'
                                  : 'bg-surface/70 border-border hover:border-emerald-500/40 hover:bg-emerald-500/5'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-black text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">
                                      {s.course.code}
                                    </span>
                                    <span className="text-[10px] text-textMuted">{s.course.credits} Cr</span>
                                  </div>
                                  <button
                                    onClick={() => toggleCourseExclusion(s.course.code)}
                                    title={isExcluded ? "Include in calculation" : "Opt out this subject"}
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                                      isExcluded ? 'bg-surfaceHighlight text-textMuted' : 'bg-surfaceHighlight text-textMuted hover:text-red-400'
                                    }`}
                                  >
                                    <Filter size={10} className="inline mr-1" />
                                    {isExcluded ? 'Disabled' : 'Opt Out'}
                                  </button>
                                </div>

                                <p className="text-xs font-bold text-textMain truncate mb-2" title={s.course.name}>
                                  {s.course.name}
                                </p>

                                <div className="grid grid-cols-2 gap-2 text-[11px] bg-surfaceHighlight/50 p-2 rounded-lg border border-border/50 mb-2 font-mono">
                                  <div>
                                    <span className="text-[9px] text-textMuted block">Marks</span>
                                    <span className="text-textMuted">{s.currentMark}</span> → <span className="font-bold text-emerald-400">{s.suggestedMark}</span>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-textMuted block">GP Gain</span>
                                    <span className="text-textMuted">{s.currentGP.toFixed(1)}</span> → <span className="font-bold text-emerald-400">{s.suggestedGP.toFixed(1)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
                                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  +{s.marksNeeded} marks
                                </span>
                                <span className="text-textMuted font-medium">
                                  +{(s.cgpaImpact).toFixed(3)} CGPA
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {isTargetAchievable && (
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 flex items-start gap-3 text-xs sm:text-sm text-emerald-400">
                          <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                          <div>
                            Target CGPA <strong className="text-emerald-300">{targetVal.toFixed(2)}</strong> is achievable by securing <strong className="text-emerald-300">+{totalMarksToImprove} total additional marks</strong> across {suggestions.length} courses above!
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {mode === 'future' && hasGrades && targetVal > 0 && (
                <div className="space-y-5">
                  <div className="p-5 bg-surfaceHighlight/60 rounded-2xl border border-border space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-textMain flex items-center gap-2">
                          <Calculator size={16} className="text-brand-400" />
                          Future Semester Target Simulator
                        </h4>
                        <p className="text-xs text-textMuted mt-0.5">
                          Calculates the exact average GPA required in upcoming semesters to achieve your target.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-textMuted whitespace-nowrap">Semesters Left:</span>
                        <select
                          value={remainingSemesters}
                          onChange={e => setRemainingSemesters(Number(e.target.value))}
                          className="bg-surface text-textMain font-bold text-xs px-3 py-1.5 rounded-lg border border-border outline-none focus:border-brand-500"
                        >
                          {[1, 2, 3, 4, 5, 6, 7].map(n => (
                            <option key={n} value={n}>{n} Semester{n > 1 ? 's' : ''} ({n * 18} Cr)</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {futureSemesterAnalysis && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        
                        <div className="p-4 bg-surface rounded-xl border border-border space-y-1">
                          <span className="text-[10px] font-bold uppercase text-textMuted tracking-wider">Completed Credits</span>
                          <p className="text-xl font-black text-textMain">{completedCredits} / {futureSemesterAnalysis.totalProgramCredits} Cr</p>
                          <p className="text-[11px] text-textMuted">Current CGPA: {currentCgpa}</p>
                        </div>

                        <div className={`p-4 rounded-xl border space-y-1 ${
                          futureSemesterAnalysis.isPossible
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Required Upcoming GPA</span>
                          <p className="text-2xl font-black">
                            {futureSemesterAnalysis.isPossible ? futureSemesterAnalysis.requiredAvgGpa.toFixed(2) : '4.00+ (Impossible)'}
                          </p>
                          <p className="text-[11px] opacity-80">Average across next {remainingSemesters} semesters</p>
                        </div>

                        <div className="p-4 bg-surface rounded-xl border border-border space-y-1">
                          <span className="text-[10px] font-bold uppercase text-textMuted tracking-wider">Target Feasibility</span>
                          <p className="text-base font-bold text-textMain">
                            {!futureSemesterAnalysis.isPossible ? 'Unreachable' :
                              futureSemesterAnalysis.requiredAvgGpa <= currentVal ? 'High (Comfortable Zone)' :
                              futureSemesterAnalysis.requiredAvgGpa <= 3.6 ? 'Moderate (Hard Work)' : 'Challenging (3.7+ Needed)'}
                          </p>
                          <p className="text-[11px] text-textMuted">Target: {targetVal.toFixed(2)} CGPA</p>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
