import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Calculator, CheckCircle, XCircle, AlertTriangle, Send, Loader2 } from 'lucide-react';
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

export function getMarkColor(m: number) {
  if (m >= 80) return 'text-green-600 font-black drop-shadow-[0_0_8px_rgba(22,163,74,0.4)]';
  if (m >= 75) return 'text-green-700 font-bold';
  if (m >= 60) return 'text-blue-700 font-semibold';
  if (m >= 50) return 'text-orange-600 font-semibold';
  if (m >= 25) return 'text-textMuted font-bold';
  return 'text-red-700 font-black drop-shadow-[0_0_8px_rgba(185,28,28,0.4)]';
}

interface Props {
  student: Record<string, any>;
  onPrefill?: (s1: Record<string, number | ''>, s2: Record<string, number | ''>) => void;
}

export const StudentResultCard = ({ student, onPrefill }: Props) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const sem1Subs = SUBJECTS_META.filter(s => s.sem === 1);
  const sem2Subs = SUBJECTS_META.filter(s => s.sem === 2);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportMessage.trim()) return;
    setIsSubmittingReport(true);
    
    try {
      const response = await fetch("https://formsubmit.co/ajax/muhammadasadk42@gmail.com", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            name: student['Name'],
            seat_no: student['Seat No'],
            message: reportMessage,
            _subject: `Correction Request for Seat No: ${student['Seat No']}`,
            _template: "table"
        })
      });

      if (response.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setIsReportModalOpen(false);
          setReportSuccess(false);
          setReportMessage('');
        }, 2500);
      } else {
        alert("Failed to submit report. Please try again.");
      }
    } catch (error) {
      alert("Network error. Please try again later.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const calcSemStats = (subs: typeof SUBJECTS_META) => {
    let qp = 0, cr = 0;
    let missing = false;
    subs.forEach(s => {
      const raw = student[s.id];
      const m = raw !== undefined && !isNaN(Number(raw)) ? Number(raw) : null;
      if (m !== null) { qp += getGradePoint(m) * s.credits; cr += s.credits; }
      else { missing = true; }
    });
    return { gpa: cr > 0 && !missing ? (qp / cr).toFixed(2) : '—', qp, cr, missing };
  };

  const s1Stats = calcSemStats(sem1Subs);
  const s2Stats = calcSemStats(sem2Subs);
  const hasMissing = s1Stats.missing || s2Stats.missing;
  const allQP = s1Stats.qp + s2Stats.qp;
  const allCr = s1Stats.cr + s2Stats.cr;
  const cgpa = allCr > 0 && !hasMissing ? (allQP / allCr).toFixed(3) : '—';

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
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-3 sm:py-4 border-b border-border/40 last:border-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1">
          <span className="text-[10px] font-black text-textMuted/60 w-14 shrink-0 font-mono hidden sm:block">{sub.code}</span>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm text-textMain font-medium leading-tight">{sub.name} <span className="sm:hidden text-[10px] text-textMuted/60 font-mono ml-1">({sub.code})</span></span>
            <span className="sm:hidden text-[10px] text-textMuted mt-0.5">{sub.credits} Credit Hours</span>
          </div>
        </div>
        
        <span className="hidden sm:block text-[10px] text-textMuted shrink-0 w-24 text-center">{sub.credits} Credit Hours</span>
        
        {isMissing ? (
          <span className="shrink-0 sm:w-32 text-left sm:text-right text-[10px] text-textMuted/50 italic pr-2 mt-1 sm:mt-0">— Missing Marks</span>
        ) : (
          <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 sm:gap-1.5 w-full sm:w-32 mt-2 sm:mt-0 bg-surfaceHighlight/30 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:rounded-none">
            <div className="flex items-center gap-3 sm:gap-1.5">
              <span className={`text-sm ${getMarkColor(marks!)} w-6 text-center sm:text-right`}>{marks}</span>
              <span className="text-[10px] bg-surfaceHighlight border border-border px-1.5 py-0.5 rounded font-bold text-textMuted w-6 text-center">{getLetterGrade(marks!)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="sm:hidden text-[10px] font-bold text-textMuted uppercase tracking-wider">GPA:</span>
              <span className="text-xs sm:text-[10px] font-bold sm:font-normal text-textMain sm:text-textMuted w-6 sm:w-8 text-right">{gp?.toFixed(1)}</span>
            </div>
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
            <div className={`flex flex-col items-center px-5 py-3 border-2 rounded-xl ${hasMissing ? 'bg-surfaceHighlight border-border' : 'bg-brand-500/10 border-brand-500'}`}>
              <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">CGPA</span>
              {hasMissing ? (
                <span className="text-xl font-bold text-textMuted mt-1">Incomplete</span>
              ) : (
                <span className="text-3xl font-black text-brand-500">{cgpa}</span>
              )}
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
            onClick={() => {
              if (hasMissing) {
                alert("Cannot generate transcript: Marks are missing for one or more subjects. A complete CGPA cannot be calculated.");
              } else {
                generateTranscriptImage(student);
              }
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold text-sm rounded-xl transition-all active:scale-95 ${hasMissing ? 'bg-surfaceHighlight text-textMuted border border-border cursor-not-allowed' : 'bg-accent-500/10 hover:bg-accent-500/20 border border-accent-500/40 text-accent-600'}`}
          >
            <Download size={16} />
            Download Transcript
          </button>
          
          {/* Report Issue Button */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 font-bold text-sm rounded-xl transition-all active:scale-95 sm:w-auto w-full"
            title="Submit a correction for missing or erroneous marks"
          >
            <AlertTriangle size={16} />
            Report Issue
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
              <span className="text-xs text-textMuted">{stats.cr} / {subs.reduce((a,s)=>a+s.credits,0)} Credit Hours</span>
              <span className="text-sm font-black text-brand-500 bg-brand-500/10 px-3 py-1 rounded-lg border border-brand-500/30">
                GPA {stats.gpa}
              </span>
            </div>
          </div>

          {/* Column headers */}
          <div className="hidden sm:flex items-center gap-3 sm:gap-4 px-5 py-2 bg-surfaceHighlight/50 border-b border-border/30">
            <span className="text-[9px] font-bold text-textMuted/60 uppercase w-14 shrink-0">Code</span>
            <span className="flex-1 text-[9px] font-bold text-textMuted/60 uppercase">Course</span>
            <span className="text-[9px] font-bold text-textMuted/60 uppercase w-24 text-center shrink-0">Credit Hours</span>
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

      {/* Report Issue Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            onClick={() => !isSubmittingReport && setIsReportModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg glass rounded-3xl overflow-hidden border border-border shadow-2xl"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-textMain tracking-tight">Report Issue</h3>
                      <p className="text-sm text-textMuted">Submit corrections for missing or incorrect marks.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsReportModalOpen(false)}
                    disabled={isSubmittingReport}
                    className="p-2 text-textMuted hover:text-textMain hover:bg-surfaceHighlight rounded-full transition-colors disabled:opacity-50"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                {reportSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center border-2 border-green-500 mb-4">
                      <CheckCircle size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-textMain mb-2">Report Submitted!</h4>
                    <p className="text-textMuted text-sm">We've received your request and will review it shortly.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleReportSubmit} className="space-y-4">
                    <div className="flex gap-4 p-4 bg-surfaceHighlight/50 rounded-xl border border-border/50">
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block mb-1">Name</span>
                        <span className="text-sm font-semibold text-textMain">{student['Name']}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block mb-1">Seat No</span>
                        <span className="text-sm font-bold text-textMain">{student['Seat No']}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-textMain uppercase tracking-wider pl-1">Describe the Issue</label>
                      <textarea
                        value={reportMessage}
                        onChange={(e) => setReportMessage(e.target.value)}
                        placeholder="e.g. My marks for Applied Physics are missing. I got 78."
                        className="w-full h-32 px-4 py-3 bg-surface border border-border rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all text-sm text-textMain resize-none placeholder:text-textMuted/50"
                        required
                        disabled={isSubmittingReport}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReport || !reportMessage.trim()}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-brand-500 hover:bg-brand-600 disabled:bg-surfaceHighlight disabled:text-textMuted disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-brand-500/20"
                    >
                      {isSubmittingReport ? (
                        <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                      ) : (
                        <><Send size={18} /> Submit Report</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
