import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Calculator, AlertTriangle, Send, Loader2, Edit3, Save, X, CheckCircle, XCircle, Lock } from 'lucide-react';

import { toast } from 'react-hot-toast';


import { getGradePoint, getLetterGrade as getLetterGradeUtil, getMarkColor } from '../lib/utils';
import { generateTranscriptPDF } from '../lib/transcriptGenerator';
import { SEM1_COURSES, SEM2_COURSES, SEM3_COURSES } from '../lib/utils';
import { TentativeCGPA } from './TentativeCGPA';
import { triggerConfetti } from '../lib/confetti';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

// Build subjects meta from canonical course lists in utils.ts
const SUBJECTS_META = [
  ...SEM1_COURSES.map(c => ({ ...c, sem: 1 })),
  ...SEM2_COURSES.map(c => ({ ...c, sem: 2 })),
];
const SEM3_META = SEM3_COURSES.map(c => ({ ...c, sem: 3 }));

// Use canonical grade helper
const getLetterGrade = getLetterGradeUtil;
export { getMarkColor };

interface Props {
  student: Record<string, any>;
  onPrefill?: (s1: Record<string, number | ''>, s2: Record<string, number | ''>, s3?: Record<string, number | ''>) => void;
  autoOpenReport?: boolean;
}

export const StudentResultCard = ({ student: initialStudent, onPrefill, autoOpenReport = false }: Props) => {
  const { user, profile, openAuthModal } = useAuthStore();
  const [student, setStudent] = useState<Record<string, any>>(initialStudent);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(autoOpenReport);
  const [reportMessage, setReportMessage] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Inline editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editedMarks, setEditedMarks] = useState<Record<string, number | ''>>({});
  const [isSavingMarks, setIsSavingMarks] = useState(false);

  const isOwner = !!profile?.seat_no && profile.seat_no.toUpperCase() === String(student['Seat No']).toUpperCase();
  const isAdmin = profile?.is_admin ?? false;
  const canEdit = isOwner || isAdmin;

  const sem1Subs = SUBJECTS_META.filter(s => s.sem === 1);
  const sem2Subs = SUBJECTS_META.filter(s => s.sem === 2);
  const sem3Subs = SEM3_META;

  const startEditing = () => {
    if (!user) {
      toast('Sign in to your student account to edit your official marks.', { icon: '🔒' });
      openAuthModal('signin');
      return;
    }
    if (!canEdit) {
      toast.error(`You can only edit marks for your own seat number (${profile?.seat_no || 'Unassigned'}).`, { id: 'auth-err-edit' });
      return;
    }

    const initial: Record<string, number | ''> = {};
    [...SUBJECTS_META, ...SEM3_META].forEach(s => {
      const val = student[s.id];
      initial[s.id] = (val !== undefined && val !== null && !isNaN(Number(val))) ? Number(val) : '';
    });
    setEditedMarks(initial);
    setIsEditing(true);
  };

  const handleSaveAllMarks = async () => {
    if (!canEdit) return;
    setIsSavingMarks(true);

    try {
      const targetSeatNo = student['Seat No'];
      const updates: Record<string, any> = {};
      
      Object.entries(editedMarks).forEach(([subId, markVal]) => {
        if (markVal !== '' && markVal !== null && markVal !== undefined) {
          updates[subId] = Number(markVal);
        } else {
          updates[subId] = null; // Explicitly allow empty/missing/unannounced marks
        }
      });

      // Try updating via supabase directly if user is logged in
      const { error } = await supabase
        .from('student_results')
        .update(updates)
        .eq('seat_no', targetSeatNo);

      if (error) {
        // Try fallback via API
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch('/api/update-marks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body: JSON.stringify({ seat_no: targetSeatNo, marks_payload: updates }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to save marks');
        }
      }

      setStudent(prev => {
        const next = { ...prev };
        Object.entries(updates).forEach(([k, v]) => {
          next[k] = v;
        });
        return next;
      });
      setIsEditing(false);
      triggerConfetti();
      toast.success('Official marks updated successfully!', { icon: '✅' });
    } catch (err: any) {
      // Local optimistic update if backend is unreachable
      setStudent(prev => {
        const next = { ...prev };
        Object.entries(editedMarks).forEach(([k, v]) => {
          next[k] = v === '' ? null : Number(v);
        });
        return next;
      });
      setIsEditing(false);
      toast.success('Marks updated locally for this session!', { icon: '💾' });
    } finally {
      setIsSavingMarks(false);
    }
  };


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
        toast.success("Report submitted successfully!");
        setTimeout(() => {
          setIsReportModalOpen(false);
          setReportSuccess(false);
          setReportMessage('');
        }, 2500);
      } else {
        toast.error("Failed to submit report. Please try again.");
      }
    } catch (error) {
      toast.error("Network error. Please try again later.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const calcSemStats = (subs: typeof SUBJECTS_META) => {
    let qp = 0, cr = 0;
    let missing = false;
    subs.forEach(s => {
      const raw = isEditing ? editedMarks[s.id] : student[s.id];
      const m = raw !== undefined && raw !== '' && !isNaN(Number(raw)) ? Number(raw) : null;
      if (m !== null) { qp += getGradePoint(m) * s.credits; cr += s.credits; }
      else { missing = true; }
    });
    return { gpa: cr > 0 && !missing ? (qp / cr).toFixed(2) : '—', qp, cr, missing };
  };

  const countValidMarks = (subs: typeof SUBJECTS_META) => {
    return subs.filter(s => {
      const raw = isEditing ? editedMarks[s.id] : student[s.id];
      return raw !== undefined && raw !== null && raw !== '' && !isNaN(Number(raw));
    }).length;
  };

  const s1Count = countValidMarks(sem1Subs);
  const s2Count = countValidMarks(sem2Subs);
  const s3Count = countValidMarks(sem3Subs);

  const s1Stats = calcSemStats(sem1Subs);
  const s2Stats = calcSemStats(sem2Subs);
  const s3Stats = calcSemStats(sem3Subs);

  // Total credits and QP across all entered courses (Sem 1, Sem 2, Sem 3)
  const totalEnteredQP = s1Stats.qp + s2Stats.qp + s3Stats.qp;
  const totalEnteredCr = s1Stats.cr + s2Stats.cr + s3Stats.cr;
  const currentCalculatedCgpa = totalEnteredCr > 0 ? (totalEnteredQP / totalEnteredCr).toFixed(3) : '—';

  // Concrete condition:
  // 1. Both Sem 1 (6) & Sem 2 (6) are full, and Sem 3 has 0 entries (solid historical 1st year complete)
  // OR
  // 2. All 3 Semesters are completely filled (6 + 6 + 6 = 18 courses)
  const isConcrete = (s1Count === 6 && s2Count === 6 && s3Count === 0) || (s1Count === 6 && s2Count === 6 && s3Count === 6);
  const isPartialSem3 = s1Count === 6 && s2Count === 6 && s3Count > 0 && s3Count < 6;
  const missingCount = (s1Count < 6 ? 6 - s1Count : 0) + (s2Count < 6 ? 6 - s2Count : 0);


  const handlePrefill = () => {
    if (!onPrefill) return;
    const s1: Record<string, number | ''> = SEM1_COURSES.reduce((a, c) => ({ ...a, [c.code]: '' }), {});
    const s2: Record<string, number | ''> = SEM2_COURSES.reduce((a, c) => ({ ...a, [c.code]: '' }), {});
    const s3: Record<string, number | ''> = SEM3_COURSES.reduce((a, c) => ({ ...a, [c.code]: '' }), {});
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
    sem3Subs.forEach((sub, i) => {
      const raw = student[sub.id];
      const m = raw !== undefined && !isNaN(Number(raw)) ? Number(raw) : null;
      if (m !== null) s3[SEM3_COURSES[i]?.code] = m;
    });
    onPrefill(s1, s2, s3);
  };

  const SubjectRow = ({ sub, delay }: { sub: typeof SUBJECTS_META[0], delay: number }) => {
    const raw = isEditing ? editedMarks[sub.id] : student[sub.id];
    const marks = raw !== undefined && raw !== '' && raw !== null && !isNaN(Number(raw)) ? Number(raw) : null;
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
        
        {isEditing ? (
          <div className="shrink-0 flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              value={editedMarks[sub.id] ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : Math.min(100, Math.max(0, Number(e.target.value)));
                setEditedMarks(prev => ({ ...prev, [sub.id]: val }));
              }}
              placeholder="0-100"
              className="w-20 px-2 py-1 bg-white border-2 border-black rounded font-mono font-bold text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-[1.5px_1.5px_0px_0px_#000]"
            />
            <span className="text-xs font-bold text-gray-500 w-10 text-right">
              {marks !== null ? `${getLetterGrade(marks)} (${getGradePoint(marks)})` : '—'}
            </span>
          </div>
        ) : isMissing ? (
          <span className="shrink-0 sm:w-32 text-left sm:text-right text-[10px] text-textMuted/50 italic pr-2 mt-1 sm:mt-0">— Missing Marks</span>
        ) : (
          <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 sm:gap-1.5 w-full sm:w-32 mt-2 sm:mt-0 bg-surfaceHighlight/30 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:rounded-none">
            <div className="flex items-center gap-3 sm:gap-1.5">
              <span className={`text-sm ${getMarkColor(marks!)} w-6 text-center sm:text-right font-bold`}>{marks}</span>
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
      <div className="glass rounded-2xl p-5 sm:p-8 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-yellow-400 text-black border border-black shadow-[1px_1px_0px_0px_#000]">
                Verified Student Record
              </span>
              {student.is_hidden && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-400 flex items-center gap-1">
                  <Lock size={10} /> Private Profile
                </span>
              )}
              {canEdit && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-400">
                  {isAdmin ? 'Admin Mode' : 'Your Account'}
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-textMain tracking-tight line-clamp-2">{student['Name']}</h2>
            <p className="text-sm text-textMuted font-mono mt-0.5">Seat No: <span className="font-bold text-textMain">{student['Seat No']}</span></p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* CGPA Badge: Concrete vs Pencilled-in */}
            {isConcrete ? (
              <div className="flex flex-col items-center px-4 py-2.5 border-2 rounded-xl bg-yellow-400 border-black shadow-[2px_2px_0px_0px_#000]">
                <span className="text-[10px] font-black text-black uppercase tracking-wider">CGPA</span>
                <span className="text-2xl sm:text-3xl font-black text-black">{currentCalculatedCgpa}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center px-4 py-2 border-2 border-dashed border-gray-400 rounded-xl bg-gray-50/90 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                <TentativeCGPA 
                  cgpa={currentCalculatedCgpa} 
                  missingCount={missingCount} 
                  isPartialSem3={isPartialSem3}
                  size="lg" 
                />
              </div>
            )}
          </div>

        </div>

        {/* ── 3 PRIMARY ACTION BUTTONS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-6 pt-5 border-t-2 border-black/10">
          
          {/* 1. EDIT MARKS BUTTON */}
          {isEditing ? (
            <div className="flex gap-2 w-full">
              <button
                onClick={handleSaveAllMarks}
                disabled={isSavingMarks}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-500 hover:bg-green-400 text-white border-2 border-black font-black text-xs sm:text-sm rounded-xl shadow-[3px_3px_0px_0px_#000] active:scale-95 transition-all"
              >
                {isSavingMarks ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                <span>Save Marks</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSavingMarks}
                className="px-3 py-2.5 bg-white hover:bg-gray-100 text-black border-2 border-black font-black text-xs sm:text-sm rounded-xl shadow-[2px_2px_0px_0px_#000] active:scale-95 transition-all"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={startEditing}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-black font-black text-xs sm:text-sm rounded-xl shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              title={canEdit ? "Edit your official marks" : "Sign in to edit this record"}
            >
              <Edit3 size={15} strokeWidth={2.5} />
              <span>{canEdit ? 'Edit Marks' : 'Claim & Edit'}</span>
            </button>
          )}

          {/* 2. LOAD INTO CALCULATOR BUTTON */}
          <button
            onClick={handlePrefill}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-black hover:bg-gray-900 text-yellow-400 border-2 border-black font-black text-xs sm:text-sm rounded-xl shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Load marks into the live GPA calculator & target simulator"
          >
            <Calculator size={15} strokeWidth={2.5} />
            <span>Load into Calculator</span>
          </button>

          {/* 3. DOWNLOAD PDF TRANSCRIPT BUTTON */}
          <button
            onClick={() => {
              triggerConfetti();
              toast.promise(
                Promise.resolve(generateTranscriptPDF(student)),
                {
                  loading: 'Generating 1-page PDF transcript...',
                  success: 'Official transcript downloaded!',
                  error: 'Could not generate transcript.',
                }
              );
            }}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white hover:bg-gray-100 text-black border-2 border-black font-black text-xs sm:text-sm rounded-xl shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Download size={15} strokeWidth={2.5} />
            <span>PDF Transcript</span>
          </button>

        </div>

        {/* Small Report Link */}
        <div className="flex justify-end mt-3">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="text-[11px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1 underline"
          >
            <AlertTriangle size={12} />
            <span>Report missing/erroneous mark</span>
          </button>
        </div>

      </div>


      {/* Semester Cards */}
      {[
        { subs: sem1Subs, stats: s1Stats, label: 'Semester 1', accentColor: 'bg-blue-600', badgeClass: 'text-blue-700 bg-blue-50 border-blue-300' },
        { subs: sem2Subs, stats: s2Stats, label: 'Semester 2', accentColor: 'bg-green-600', badgeClass: 'text-green-700 bg-green-50 border-green-300' },
      ].map(({ subs, stats, label, accentColor, badgeClass }, si) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + si * 0.1 }}
          className="glass rounded-xl border-border overflow-hidden"
        >
          {/* Sem header */}
          <div className="flex items-center justify-between px-5 py-3 bg-surfaceHighlight border-b border-border">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm ${accentColor}`} />
              <span className="text-sm font-black text-textMain uppercase tracking-wider">{label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-textMuted">{stats.cr} / {subs.reduce((a,s)=>a+s.credits,0)} Credit Hours</span>
              <span className={`text-sm font-black px-3 py-1 rounded-lg border-2 ${badgeClass}`}>
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

      {/* Semester 3 — In Progress */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass rounded-xl border-border overflow-hidden opacity-80"
      >
        <div className="flex items-center justify-between px-5 py-3 bg-amber-50 border-b-2 border-amber-300">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-amber-500" />
            <span className="text-sm font-black text-amber-900 uppercase tracking-wider">Semester 3</span>
            <span className="ml-2 px-2 py-0.5 text-[9px] font-bold bg-amber-200 text-amber-800 border border-amber-400 rounded uppercase tracking-wider">In Progress</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-amber-700">{s3Stats.cr} / {sem3Subs.reduce((a,s)=>a+s.credits,0)} Credit Hours</span>
            <span className="text-sm font-black px-3 py-1 rounded-lg border-2 text-amber-700 bg-amber-50 border-amber-300">
              {s3Stats.gpa === '—' || s3Stats.missing ? 'Tentative' : `GPA ${s3Stats.gpa}`}
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 px-5 py-2 bg-amber-50/50 border-b border-amber-200/50">
          <span className="text-[9px] font-bold text-amber-700/60 uppercase w-14 shrink-0">Code</span>
          <span className="flex-1 text-[9px] font-bold text-amber-700/60 uppercase">Course</span>
          <span className="text-[9px] font-bold text-amber-700/60 uppercase w-24 text-center shrink-0">Credit Hours</span>
          <span className="text-[9px] font-bold text-amber-700/60 uppercase w-32 text-right shrink-0">Marks / Grade / GP</span>
        </div>
        <div className="px-5">
          {sem3Subs.map((sub) => {
            const raw = student[sub.id];
            const marks = raw !== undefined && raw !== null && !isNaN(Number(raw)) ? Number(raw) : null;
            const gp = marks !== null ? getGradePoint(marks) : null;
            return (
              <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-3 border-b border-amber-100/70 last:border-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1">
                  <span className="text-[10px] font-black text-amber-600/60 w-14 shrink-0 font-mono hidden sm:block">{sub.code}</span>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm text-textMain font-medium leading-tight">{sub.name} <span className="sm:hidden text-[10px] text-amber-600/60 font-mono ml-1">({sub.code})</span></span>
                    <span className="sm:hidden text-[10px] text-textMuted mt-0.5">{sub.credits} Credit Hours</span>
                  </div>
                </div>
                <span className="hidden sm:block text-[10px] text-textMuted shrink-0 w-24 text-center">{sub.credits} Credit Hours</span>
                {marks === null ? (
                  <span className="shrink-0 sm:w-32 text-left sm:text-right text-[10px] text-amber-500/70 italic pr-2">
                    ⏳ Pending
                  </span>
                ) : (
                  <div className="shrink-0 flex items-center justify-end gap-1.5 w-32">
                    <span className={`text-sm ${getMarkColor(marks)} w-6 text-center`}>{marks}</span>
                    <span className="text-[10px] bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded font-bold text-amber-700 w-6 text-center">{getLetterGrade(marks)}</span>
                    <span className="text-xs font-bold text-amber-800 w-8 text-right">{gp?.toFixed(1)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="px-5 py-3 bg-amber-50/30 border-t border-amber-100 flex items-center gap-2">
          <AlertTriangle size={13} className="text-amber-500" />
          <span className="text-xs text-amber-700 italic">Results not yet finalized — marks shown are tentative</span>
        </div>
      </motion.div>

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
