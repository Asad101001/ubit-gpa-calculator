import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronDown, ChevronUp, Lightbulb, CheckCircle2, Sparkles, Calculator, RefreshCw, AlertCircle, Award } from 'lucide-react';
import { getGradePoint, getMarkColor, SEM1_COURSES, SEM2_COURSES, SEM3_COURSES } from '../lib/utils';
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
  id?: string;
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

  const currentVal = parseFloat(currentCgpa) || 0;
  const targetVal = validateTargetCgpa(targetCgpa).parsed || 0;

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

  // Optimization knapsack algorithm for course improvement
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

    return {
      requiredAvgGpa: Math.max(0, requiredAvgGpa),
      totalProgramCredits,
      totalFutureCredits,
      isPossible,
    };
  }, [currentVal, completedCredits, remainingSemesters, targetVal]);

  const isTargetAchievable = suggestions.length > 0 && projectedCgpa >= targetVal - 0.005;
  const hasGrades = Object.values(allGrades).some(v => v !== '' && v !== undefined);
  const alreadyMet = targetVal > 0 && currentVal >= targetVal;
  const totalMarksToImprove = suggestions.reduce((sum: number, s) => sum + s.marksNeeded, 0);

  const toggleCourseExclusion = (code: string) => {
    setExcludedCourses(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const getDifficultyBadge = (marksNeeded: number) => {
    if (marksNeeded <= 5) return { label: 'Quick Gain', color: 'bg-green-100 text-green-800 border-green-300' };
    if (marksNeeded <= 12) return { label: 'Moderate', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    return { label: 'High Effort', color: 'bg-amber-100 text-amber-800 border-amber-300' };
  };

  return (
    <div className="glass rounded-2xl sm:rounded-3xl border-2 border-black p-4 sm:p-6 md:p-8 space-y-6 shadow-[4px_4px_0px_0px_#000]">
      {/* Header Toggle */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer group select-none"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-yellow-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] shrink-0">
            <Target className="text-black w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-2xl font-black text-black tracking-tight">Target CGPA Advisor</h3>
              <span className="bg-black text-yellow-400 text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase tracking-wider">
                Smart Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              {currentVal > 0 
                ? `Current: ${currentCgpa} CGPA (${completedCredits} Credits Completed)` 
                : 'Enter course marks above to simulate targets and grade roadmaps'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 border-2 border-black flex items-center justify-center text-black group-hover:bg-yellow-400 transition-colors">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden space-y-6 pt-2"
          >
            {/* Control Panel: Goal Input + Presets + Modes */}
            <div className="p-4 sm:p-5 bg-yellow-50 rounded-xl border-2 border-black space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                
                {/* 1. Target Input */}
                <div className="lg:col-span-4 space-y-1.5">
                  <label className="text-[11px] font-black text-black uppercase tracking-wider block">
                    Target CGPA Goal
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1.00"
                      max="4.00"
                      step="0.05"
                      value={targetCgpa}
                      onChange={e => setTargetCgpa(e.target.value)}
                      className="w-28 sm:w-32 px-3 py-2 bg-white text-black font-black text-lg sm:text-xl rounded-lg border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-[2px_2px_0px_0px_#000]"
                    />
                    {currentVal > 0 && targetVal > 0 && (
                      <div className="px-2.5 py-1.5 bg-white border-2 border-black rounded-lg text-xs font-bold text-black">
                        Gap: <span className={targetVal <= currentVal ? 'text-green-600' : 'text-amber-600'}>
                          {targetVal <= currentVal ? '0.00 (Met)' : `+${(targetVal - currentVal).toFixed(3)}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Quick Presets */}
                <div className="lg:col-span-4 space-y-1.5">
                  <span className="text-[11px] font-black text-black uppercase tracking-wider block">
                    Quick Presets
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '3.00 First Div', val: '3.00' },
                      { label: '3.50 Honors', val: '3.50' },
                      { label: '3.75 High', val: '3.75' },
                      { label: '4.00 Max', val: '4.00' },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        onClick={() => setTargetCgpa(preset.val)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border-2 transition-all ${
                          targetCgpa === preset.val
                            ? 'bg-black text-yellow-400 border-black shadow-[2px_2px_0px_0px_#E6B400]'
                            : 'bg-white text-black border-black hover:bg-yellow-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Mode Toggle */}
                <div className="lg:col-span-4 space-y-1.5">
                  <span className="text-[11px] font-black text-black uppercase tracking-wider block">
                    Advisor Mode
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-white rounded-lg border-2 border-black">
                    <button
                      onClick={() => setMode('improvement')}
                      className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-[11px] font-black transition-all ${
                        mode === 'improvement'
                          ? 'bg-yellow-400 text-black border border-black'
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      <RefreshCw size={12} /> Existing Marks
                    </button>
                    <button
                      onClick={() => setMode('future')}
                      className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-[11px] font-black transition-all ${
                        mode === 'future'
                          ? 'bg-yellow-400 text-black border border-black'
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      <Calculator size={12} /> Future Sems
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Empty state when no marks entered */}
            {!hasGrades && (
              <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center gap-3 text-xs sm:text-sm text-gray-700">
                <Lightbulb size={18} className="text-yellow-600 shrink-0" />
                <span>Fill in your subject marks in the calculator above to get custom target recommendations and roadmaps.</span>
              </div>
            )}

            {/* Goal Achieved State */}
            {hasGrades && targetVal > 0 && alreadyMet && (
              <div className="p-4 sm:p-5 bg-green-50 rounded-xl border-2 border-green-500 flex items-center gap-3.5 shadow-[2px_2px_0px_0px_#22c55e]">
                <CheckCircle2 size={24} className="text-green-600 shrink-0" />
                <div>
                  <h4 className="text-sm sm:text-base font-black text-green-900">Target Already Achieved! 🎉</h4>
                  <p className="text-xs sm:text-sm text-green-700 mt-0.5">
                    Your current CGPA of <strong>{currentCgpa}</strong> already meets or exceeds your goal of <strong>{targetVal.toFixed(2)}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* MODE 1: EXISTING SUBJECT IMPROVEMENTS */}
            {mode === 'improvement' && hasGrades && targetVal > 0 && !alreadyMet && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-yellow-500" />
                    <h4 className="text-xs sm:text-sm font-black text-black uppercase tracking-wider">
                      Optimal Improvement Path ({suggestions.length} Subjects Recommended)
                    </h4>
                  </div>
                  {isTargetAchievable && (
                    <span className="text-xs font-black bg-yellow-400 text-black px-2.5 py-1 rounded border border-black self-start sm:self-auto">
                      Projected CGPA: {projectedCgpa.toFixed(3)}
                    </span>
                  )}
                </div>

                {suggestions.length === 0 ? (
                  <div className="p-4 bg-red-50 border-2 border-red-400 rounded-xl text-xs sm:text-sm text-red-800 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle size={15} /> Target cannot be reached via existing courses alone.
                    </p>
                    <p>Try enabling excluded subjects or switch to <strong>Future Semesters</strong> mode to see requirements across upcoming terms.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {suggestions.map((s) => {
                        const isExcluded = excludedCourses[s.course.code];
                        const diffBadge = getDifficultyBadge(s.marksNeeded);
                        return (
                          <div
                            key={s.course.code}
                            className={`p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                              isExcluded
                                ? 'bg-gray-100 border-gray-300 opacity-60'
                                : 'bg-white border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-black bg-yellow-400 text-black px-1.5 py-0.5 rounded border border-black">
                                    {s.course.code}
                                  </span>
                                  <span className="text-[10px] font-bold text-gray-600">{s.course.credits} Cr</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${diffBadge.color}`}>
                                    {diffBadge.label}
                                  </span>
                                  <button
                                    onClick={() => toggleCourseExclusion(s.course.code)}
                                    className="text-[9px] font-bold text-gray-500 hover:text-black underline pl-1"
                                  >
                                    {isExcluded ? 'Enable' : 'Opt Out'}
                                  </button>
                                </div>
                              </div>

                              <p className="text-xs font-bold text-black truncate mb-2" title={s.course.name}>
                                {s.course.name}
                              </p>

                              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2 rounded-lg border border-gray-200 mb-2 font-mono">
                                <div>
                                  <span className="text-[9px] text-gray-500 block uppercase font-sans">Marks</span>
                                  <span className={getMarkColor(s.currentMark)}>{s.currentMark}</span> → <span className="font-black text-green-700">{s.suggestedMark}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-gray-500 block uppercase font-sans">Grade Point</span>
                                  <span className="text-gray-600">{s.currentGP.toFixed(1)}</span> → <span className="font-black text-green-700">{s.suggestedGP.toFixed(1)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-gray-200 text-[10px] font-bold">
                              <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded border border-green-300">
                                +{s.marksNeeded} marks needed
                              </span>
                              <span className="text-gray-700">
                                +{s.cgpaImpact.toFixed(3)} CGPA
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {isTargetAchievable && (
                      <div className="p-3.5 bg-yellow-400 text-black rounded-xl border-2 border-black font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-[2px_2px_0px_0px_#000]">
                        <Award size={18} className="shrink-0" />
                        <span>
                          Target <strong>{targetVal.toFixed(2)} CGPA</strong> is achievable by securing a combined <strong>+{totalMarksToImprove} marks</strong> across the {suggestions.length} subjects above!
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* MODE 2: FUTURE SEMESTER TARGET SIMULATOR */}
            {mode === 'future' && hasGrades && targetVal > 0 && (
              <div className="space-y-4">
                <div className="p-4 sm:p-5 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
                    <div>
                      <h4 className="text-sm font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                        <Calculator size={15} /> Future Semester GPA Requirements
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Calculates required average GPA across remaining semesters to hit {targetVal.toFixed(2)} CGPA.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-black whitespace-nowrap">Remaining Semesters:</span>
                      <select
                        value={remainingSemesters}
                        onChange={e => setRemainingSemesters(Number(e.target.value))}
                        className="bg-yellow-50 text-black font-bold text-xs px-2.5 py-1.5 rounded-lg border-2 border-black outline-none focus:bg-yellow-200"
                      >
                        {[1, 2, 3, 4, 5, 6].map(n => (
                          <option key={n} value={n}>{n} Sem ({n * 18} Cr)</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {futureSemesterAnalysis && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      
                      <div className="p-3.5 bg-gray-50 rounded-xl border-2 border-black">
                        <span className="text-[10px] font-black uppercase text-gray-600 tracking-wider block mb-1">Completed</span>
                        <p className="text-lg font-black text-black">{completedCredits} / {futureSemesterAnalysis.totalProgramCredits} Cr</p>
                        <p className="text-[11px] text-gray-600">Current CGPA: {currentCgpa}</p>
                      </div>

                      <div className={`p-3.5 rounded-xl border-2 ${
                        futureSemesterAnalysis.isPossible
                          ? 'bg-yellow-100 border-black text-black'
                          : 'bg-red-100 border-red-500 text-red-900'
                      }`}>
                        <span className="text-[10px] font-black uppercase tracking-wider block mb-1">Required Avg GPA</span>
                        <p className="text-2xl font-black">
                          {futureSemesterAnalysis.isPossible ? futureSemesterAnalysis.requiredAvgGpa.toFixed(2) : '4.00+ (Impossible)'}
                        </p>
                        <p className="text-[11px] font-medium">Per semester across next {remainingSemesters} semesters</p>
                      </div>

                      <div className="p-3.5 bg-gray-50 rounded-xl border-2 border-black">
                        <span className="text-[10px] font-black uppercase text-gray-600 tracking-wider block mb-1">Feasibility</span>
                        <p className="text-base font-black text-black">
                          {!futureSemesterAnalysis.isPossible ? '❌ Mathematically Unreachable' :
                            futureSemesterAnalysis.requiredAvgGpa <= currentVal ? '🟢 Very Comfortable' :
                            futureSemesterAnalysis.requiredAvgGpa <= 3.5 ? '🟡 Moderate (Achievable)' : '🔴 High Effort (3.7+ Needed)'}
                        </p>
                        <p className="text-[11px] text-gray-600">Target Goal: {targetVal.toFixed(2)} CGPA</p>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
