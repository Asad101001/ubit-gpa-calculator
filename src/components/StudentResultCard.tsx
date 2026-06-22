import { motion } from 'framer-motion';
import { Download, Calculator, CheckCircle, XCircle } from 'lucide-react';
import { getGradePoint } from '../lib/utils';
import { generateTranscriptImage } from '../lib/transcriptGenerator';
import { SEM1_COURSES, SEM2_COURSES } from '../lib/utils';

const SUBJECTS_META = [
  { id: 'cs351', code: 'CS-351', name: 'Programming Fundamentals', credits: 4, sem: 1 },
  { id: 'cs353', code: 'CS-353', name: 'Intro to Information & Comm. Technologies', credits: 3, sem: 1 },
  { id: 'cs355', code: 'CS-355', name: 'Calculus & Analytical Geometry', credits: 3, sem: 1 },
  { id: 'cs357', code: 'CS-357', name: 'Applied Physics', credits: 3, sem: 1 },
  { id: 'cs359', code: 'CS-359', name: 'Functional English', credits: 3, sem: 1 },
  { id: 'cs361', code: 'CS-361', name: 'Islamic Studies / Ethics', credits: 2, sem: 1 },
  { id: 'cs352', code: 'CS-352', name: 'Object Oriented Concepts & Programming', credits: 4, sem: 2 },
  { id: 'cs354', code: 'CS-354', name: 'Digital Logic Design', credits: 3, sem: 2 },
  { id: 'cs356', code: 'CS-356', name: 'Linear Algebra', credits: 3, sem: 2 },
  { id: 'cs358', code: 'CS-358', name: 'Discrete Structures', credits: 3, sem: 2 },
  { id: 'cs360', code: 'CS-360', name: 'Communication & Presentation Skills', credits: 3, sem: 2 },
  { id: 'cs362', code: 'CS-362', name: 'Ideology & Constitution of Pakistan', credits: 2, sem: 2 },
];

function getLetterGrade(m: number) {
  if (m >= 85) return 'A';
  if (m >= 80) return 'A-';
  if (m >= 75) return 'B+';
  if (m >= 71) return 'B';
  if (m >= 68) return 'B-';
  if (m >= 64) return 'C+';
  if (m >= 61) return 'C';
  if (m >= 57) return 'D+';
  if (m >= 50) return 'D';
  return 'F';
}

function getMarkColor(m: number) {
  if (m >= 85) return 'text-yellow-600 font-black';
  if (m >= 75) return 'text-green-700 font-bold';
  if (m >= 60) return 'text-blue-700 font-semibold';
  if (m >= 50) return 'text-orange-600 font-semibold';
  return 'text-red-600 font-bold';
}

interface Props {
  student: Record<string, any>;
  onPrefill?: (s1: Record<string, number | ''>, s2: Record<string, number | ''>) => void;
}

export const StudentResultCard = ({ student, onPrefill }: Props) => {
  const sem1Subs = SUBJECTS_META.filter(s => s.sem === 1);
  const sem2Subs = SUBJECTS_META.filter(s => s.sem === 2);

  const calcSemStats = (subs: typeof SUBJECTS_META) => {
    let qp = 0, cr = 0;
    subs.forEach(s => {
      const raw = student[s.id];
      const m = raw !== undefined && !isNaN(Number(raw)) ? Number(raw) : null;
      if (m !== null) { qp += getGradePoint(m) * s.credits; cr += s.credits; }
    });
    return { gpa: cr > 0 ? (qp / cr).toFixed(2) : '—', qp, cr };
  };

  const s1Stats = calcSemStats(sem1Subs);
  const s2Stats = calcSemStats(sem2Subs);
  const allQP = s1Stats.qp + s2Stats.qp;
  const allCr = s1Stats.cr + s2Stats.cr;
  const cgpa = allCr > 0 ? (allQP / allCr).toFixed(3) : '—';

  const handlePrefill = () => {
    if (!onPrefill) return;
    const s1: Record<string, number | ''> = SEM1_COURSES.reduce((a, c) => ({ ...a, [c.code]: '' }), {});
    const s2: Record<string, number | ''> = SEM2_COURSES.reduce((a, c) => ({ ...a, [c.code]: '' }), {});
    sem1Subs.forEach((sub, i) => {
      const raw = student[sub.id];
      const m = raw !== undefined && !isNaN(Number(raw)) ? Number(raw) : null;
      if (m !== null) s1[SEM1_COURSES[i]?.code] = m;
    });
    sem2Subs.forEach((sub, i) => {
      const raw = student[sub.id];
      const m = raw !== undefined && !isNaN(Number(raw)) ? Number(raw) : null;
      if (m !== null) s2[SEM2_COURSES[i]?.code] = m;
    });
    onPrefill(s1, s2);
  };

  const SubjectRow = ({ sub, delay }: { sub: typeof SUBJECTS_META[0], delay: number }) => {
    const raw = student[sub.id];
    const marks = raw !== undefined && raw !== null && !isNaN(Number(raw)) ? Number(raw) : null;
    const isMissing = marks === null;
    const gp = marks !== null ? getGradePoint(marks) : null;

    return (
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.35 }}
        className="flex items-center gap-3 sm:gap-4 py-3 border-b border-border/40 last:border-0"
      >
        <span className="text-[10px] font-black text-textMuted/60 w-14 shrink-0 font-mono">{sub.code}</span>
        <span className="flex-1 text-xs sm:text-sm text-textMain font-medium leading-tight">{sub.name}</span>
        <span className="text-[10px] text-textMuted shrink-0 w-6 text-center">{sub.credits}cr</span>
        {isMissing ? (
          <span className="shrink-0 w-32 text-right text-[10px] text-textMuted/50 italic pr-2">—</span>
        ) : (
          <div className="shrink-0 flex items-center gap-1.5 w-32 justify-end">
            <span className={`text-sm ${getMarkColor(marks!)} w-6 text-right`}>{marks}</span>
            <span className="text-[10px] bg-surfaceHighlight border border-border px-1.5 py-0.5 rounded font-bold text-textMuted w-6 text-center">{getLetterGrade(marks!)}</span>
            <span className="text-[10px] text-textMuted w-8 text-right">{gp?.toFixed(1)}</span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Header Card */}
      <div className="glass rounded-2xl p-5 sm:p-8 border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Search Result</p>
            <h2 className="text-2xl sm:text-3xl font-black text-textMain tracking-tight">{student['Name']}</h2>
            <p className="text-sm text-textMuted font-mono mt-1">Seat No: <span className="font-bold text-textMain">{student['Seat No']}</span></p>
          </div>
          <div className="flex items-center gap-2">
            {/* CGPA Badge */}
            <div className="flex flex-col items-center px-5 py-3 bg-brand-500/10 border-2 border-brand-500 rounded-xl">
              <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">CGPA</span>
              <span className="text-3xl font-black text-brand-500">{cgpa}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-border/50">
          {onPrefill && (
            <button
              onClick={handlePrefill}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-all active:scale-95 shadow-lg shadow-brand-500/20"
            >
              <Calculator size={16} />
              Load into Calculator
            </button>
          )}
          <button
            onClick={() => generateTranscriptImage(student)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent-500/10 hover:bg-accent-500/20 border border-accent-500/40 text-accent-600 font-bold text-sm rounded-xl transition-all active:scale-95"
          >
            <Download size={16} />
            Download Transcript
          </button>
        </div>
      </div>

      {/* Semester Cards */}
      {[{ subs: sem1Subs, stats: s1Stats, label: 'Semester 1' }, { subs: sem2Subs, stats: s2Stats, label: 'Semester 2' }].map(({ subs, stats, label }, si) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + si * 0.1 }}
          className="glass rounded-2xl border-border overflow-hidden"
        >
          {/* Sem header */}
          <div className="flex items-center justify-between px-5 py-3 bg-surfaceHighlight border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-500" />
              <span className="text-sm font-black text-textMain uppercase tracking-wider">{label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-textMuted">{stats.cr} / {subs.reduce((a,s)=>a+s.credits,0)} credits</span>
              <span className="text-sm font-black text-brand-500 bg-brand-500/10 px-3 py-1 rounded-lg border border-brand-500/30">
                GPA {stats.gpa}
              </span>
            </div>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-3 sm:gap-4 px-5 py-2 bg-surfaceHighlight/50 border-b border-border/30">
            <span className="text-[9px] font-bold text-textMuted/60 uppercase w-14 shrink-0">Code</span>
            <span className="flex-1 text-[9px] font-bold text-textMuted/60 uppercase">Course</span>
            <span className="text-[9px] font-bold text-textMuted/60 uppercase w-6 text-center shrink-0">Cr</span>
            <span className="text-[9px] font-bold text-textMuted/60 uppercase w-32 text-right shrink-0">Marks / Grade / GP</span>
          </div>

          <div className="px-5">
            {subs.map((sub, i) => (
              <SubjectRow key={sub.id} sub={sub} delay={0.2 + si * 0.1 + i * 0.04} />
            ))}
          </div>

          {/* Passing indicator */}
          <div className="px-5 py-3 bg-surfaceHighlight/30 border-t border-border/30 flex items-center gap-2">
            {Number(stats.gpa) >= 2.0 ? (
              <><CheckCircle size={14} className="text-green-600" /><span className="text-xs font-semibold text-green-700">Passing</span></>
            ) : stats.gpa === '—' ? (
              <span className="text-xs text-textMuted">No marks recorded</span>
            ) : (
              <><XCircle size={14} className="text-red-500" /><span className="text-xs font-semibold text-red-600">Below passing threshold</span></>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
