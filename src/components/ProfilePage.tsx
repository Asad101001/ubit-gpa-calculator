import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, LogOut, Edit3, Check, X, Loader2, Users, ChevronDown, ArrowLeft, Search, Trash2, Download, Eye, EyeOff, Mail, RefreshCw, BarChart3 } from 'lucide-react';

import { toast } from 'react-hot-toast';
import { useAuthStore, type Profile } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { getGradePoint, getLetterGrade, getMarkColor, SEM1_COURSES, SEM2_COURSES, SEM3_COURSES, SEM4_COURSES, SEM5_COURSES } from '../lib/utils';
import { TentativeCGPA } from './TentativeCGPA';

const VALID_DB_SUBJECTS = new Set([
  'cs351', 'cs353', 'cs355', 'cs357', 'cs359', 'cs361',
  'cs352', 'cs354', 'cs356', 'cs358', 'cs360', 'cs362',
  'cs451', 'cs453', 'cs455', 'cs457', 'cs459', 'cs461',
]);

const SUBJECTS_META = [
  ...SEM1_COURSES.map(c => ({ id: c.code.toLowerCase().replace('-', ''), code: c.code, name: c.name, credits: c.credits, sem: 1 })),
  ...SEM2_COURSES.map(c => ({ id: c.code.toLowerCase().replace('-', ''), code: c.code, name: c.name, credits: c.credits, sem: 2 })),
  ...SEM3_COURSES.map(c => ({ id: c.code.toLowerCase().replace('-', ''), code: c.code, name: c.name, credits: c.credits, sem: 3 })),
  ...SEM4_COURSES.map(c => ({ id: c.code.toLowerCase().replace('-', ''), code: c.code, name: c.name, credits: c.credits, sem: 4 })),
  ...SEM5_COURSES.map(c => ({ id: c.code.toLowerCase().replace('-', ''), code: c.code, name: c.name, credits: c.credits, sem: 5 })),
];



export const ProfilePage = () => {
  const { profile, user, signOut, updateProfile } = useAuthStore();
  const [studentData, setStudentData] = useState<Record<string, any> | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSavingVisibility, setIsSavingVisibility] = useState(false);
  const [editingMark, setEditingMark] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSavingMark, setIsSavingMark] = useState(false);
  const [adminUsers, setAdminUsers] = useState<Profile[]>([]);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminSelectedUser, setAdminSelectedUser] = useState<Profile | null>(null);
  const [adminCustomSeatNo, setAdminCustomSeatNo] = useState('');
  const [adminCustomSeatInput, setAdminCustomSeatInput] = useState('');
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  const isAdmin = profile?.is_admin ?? false;
  const isVerified = profile?.is_verified ?? false;

  const currentTargetSeatNo = (adminSelectedUser
    ? adminSelectedUser.seat_no
    : adminCustomSeatNo || profile?.seat_no || '')?.toUpperCase().trim();

  const isOwner = !!profile?.seat_no && !!currentTargetSeatNo && profile.seat_no.toUpperCase().trim() === currentTargetSeatNo;
  // SECURITY FIX: verified users can only edit their own marks (not any seat).
  // Previously `isVerified` alone allowed any verified user to edit anyone's marks.
  const canEditMarks = isAdmin || isOwner;

  useEffect(() => {
    const fetchStudentData = async () => {
      // Admin can either select a profile user OR type a custom seat no
      const targetSeatNo = (adminSelectedUser
        ? adminSelectedUser.seat_no
        : adminCustomSeatNo || profile?.seat_no || '')?.toUpperCase().trim();
      if (!targetSeatNo) { setStudentData(null); setIsLoadingData(false); return; }
      
      setIsLoadingData(true);
      try {
        // For the authenticated owner / admin: fetch directly from Supabase
        // so that privacy-masked API response never hides the owner's own marks
        const { data: rows, error } = await supabase
          .from('student_results')
          .select('*')
          .eq('seat_no', targetSeatNo)
          .maybeSingle();

        if (!error && rows) {
          const mapped: Record<string, any> = { 'Seat No': rows.seat_no, 'Name': rows.name };
          SUBJECTS_META.forEach(sub => { if (rows[sub.id] !== undefined) mapped[sub.id] = rows[sub.id]; });
          setStudentData(mapped);
          setIsLoadingData(false);
          return;
        }

        // Fallback to public API (covers edge cases / local dev)
        let resultsData: any[] | null = null;
        try {
          const res = await fetch('/api/results');
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && (contentType.includes('application/json') || res.status === 200)) {
            const rawText = await res.text();
            if (rawText.trim().startsWith('[') || rawText.trim().startsWith('{')) {
              resultsData = JSON.parse(rawText);
            }
          }
        } catch {
          // Local dev or API unreachable, will proceed to fallback
        }
        if (!resultsData) {
          const fallbackRes = await fetch('/fallback-results.json');
          if (fallbackRes.ok) resultsData = await fallbackRes.json();
        }
        if (resultsData) {
          const match = resultsData.find((row: any) => String(row.seat_no).toUpperCase().trim() === targetSeatNo);
          if (match) {
            const mapped: Record<string, any> = { 'Seat No': match.seat_no, 'Name': match.name };
            SUBJECTS_META.forEach(sub => { if (match[sub.id] !== undefined) mapped[sub.id] = match[sub.id]; });
            setStudentData(mapped);
          } else {
            setStudentData(null);
          }
        }
      } catch (e) { console.error('Failed to fetch student data:', e); }
      setIsLoadingData(false);
    };
    fetchStudentData();
  }, [profile?.seat_no, adminSelectedUser, adminCustomSeatNo]);


  const stats = useMemo(() => {
    if (!studentData) return null;
    let totalQP = 0, totalCR = 0;
    const semS: Record<number, { qp: number; cr: number; count: number; total: number }> = {
      1: { qp: 0, cr: 0, count: 0, total: 6 },
      2: { qp: 0, cr: 0, count: 0, total: 6 },
      3: { qp: 0, cr: 0, count: 0, total: 6 },
    };

    SUBJECTS_META.forEach(sub => {
      const raw = studentData[sub.id];
      const m = raw !== undefined && raw !== null && raw !== '' && !isNaN(Number(raw)) ? Number(raw) : null;
      if (m !== null) {
        const gp = getGradePoint(m);
        totalQP += gp * sub.credits;
        totalCR += sub.credits;
        if (semS[sub.sem]) {
          semS[sub.sem].qp += gp * sub.credits;
          semS[sub.sem].cr += sub.credits;
          semS[sub.sem].count += 1;
        }
      }
    });

    const s1Count = semS[1].count;
    const s2Count = semS[2].count;
    const s3Count = semS[3].count;

    const isConcrete = (s1Count === SEM1_COURSES.length && s2Count === SEM2_COURSES.length && s3Count === 0)
      || (s1Count === SEM1_COURSES.length && s2Count === SEM2_COURSES.length && s3Count === SEM3_COURSES.length);
    const isPartialSem3 = s1Count === SEM1_COURSES.length && s2Count === SEM2_COURSES.length && s3Count > 0 && s3Count < SEM3_COURSES.length;
    const missingCount = (s1Count < SEM1_COURSES.length ? SEM1_COURSES.length - s1Count : 0)
      + (s2Count < SEM2_COURSES.length ? SEM2_COURSES.length - s2Count : 0);

    return {
      cgpa: totalCR > 0 ? (totalQP / totalCR).toFixed(3) : '0.000',
      isConcrete,
      isPartialSem3,
      missingCount,
      gpa1: semS[1].cr > 0 && semS[1].count === 6 ? (semS[1].qp / semS[1].cr).toFixed(2) : semS[1].cr > 0 ? (semS[1].qp / semS[1].cr).toFixed(2) + '*' : '—',
      gpa2: semS[2].cr > 0 && semS[2].count === 6 ? (semS[2].qp / semS[2].cr).toFixed(2) : semS[2].cr > 0 ? (semS[2].qp / semS[2].cr).toFixed(2) + '*' : '—',
      gpa3: semS[3].cr > 0 && semS[3].count === 6 ? (semS[3].qp / semS[3].cr).toFixed(2) : semS[3].cr > 0 ? (semS[3].qp / semS[3].cr).toFixed(2) + '*' : '—',
    };
  }, [studentData]);


  const toggleVisibility = async () => {
    if (!profile) return;
    setIsSavingVisibility(true);
    const newVal = !profile.show_results_publicly;
    const result = await updateProfile({ show_results_publicly: newVal });
    if (result.error) {
      toast.error('Failed to update visibility.');
    } else {
      if (profile.seat_no) {
        const mySeat = profile.seat_no.toUpperCase().trim();
        try {
          const savedHidden = localStorage.getItem('hidden_seats');
          const hiddenSet = new Set<string>(savedHidden ? JSON.parse(savedHidden) : []);
          if (!newVal) hiddenSet.add(mySeat);
          else hiddenSet.delete(mySeat);
          localStorage.setItem('hidden_seats', JSON.stringify(Array.from(hiddenSet)));
        } catch {}
      }
      toast.success(newVal ? 'Results are now public.' : 'Results are now hidden.', { icon: newVal ? '👁️' : '🔒' });
    }
    setIsSavingVisibility(false);
  };

  const handleSaveMark = async (subjectId: string) => {
    const targetSeatNo = (adminSelectedUser
      ? adminSelectedUser.seat_no
      : adminCustomSeatNo || profile?.seat_no || '')?.toUpperCase().trim();
    if (!targetSeatNo) return;
    
    const isClearing = editValue.trim() === '' || editValue.trim() === '-';
    let numVal: number | null = null;
    
    if (!isClearing) {
      const parsed = Number(editValue);
      if (isNaN(parsed) || parsed < 0 || parsed > 100) { 
        toast.error('Enter a valid mark (0-100) or leave empty.'); 
        return; 
      }
      numVal = parsed;
    }

    setIsSavingMark(true);
    // Fix: replace ALL hyphens in subject ID, not just the first one
    const cleanKey = subjectId.toLowerCase().replace(/-/g, '');

    if (!VALID_DB_SUBJECTS.has(cleanKey)) {
      toast.error('Only Semesters 1, 2, and 3 marks can be edited.');
      setIsSavingMark(false);
      return;
    }

    try {
      // 1. Direct Supabase update (fast and works locally in Vite and in prod)
      const { error: sbError } = await supabase
        .from('student_results')
        .update({ [cleanKey]: numVal })
        .eq('seat_no', targetSeatNo);

      if (!sbError) {
        toast.success(numVal !== null ? 'Mark updated!' : 'Mark cleared / set to pending');
        setStudentData(prev => prev ? { ...prev, [cleanKey]: numVal } : prev);
        setEditingMark(null);
        setEditValue('');
        setIsSavingMark(false);
        return;
      }

      // 2. Serverless API endpoint fallback
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/update-marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ seat_no: targetSeatNo, subject_id: subjectId, marks: numVal }),
      });
      if (res.ok) {
        toast.success(numVal !== null ? 'Mark updated!' : 'Mark cleared / set to pending');
        setStudentData(prev => prev ? { ...prev, [cleanKey]: numVal } : prev);
        setEditingMark(null);
        setEditValue('');
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || sbError?.message || 'Failed to update.');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Network error.');
    } finally {
      setIsSavingMark(false);
    }
  };


  const fetchAdminUsers = async () => {
    if (!isAdmin) return;
    setIsLoadingAdmin(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && data) setAdminUsers(data as Profile[]);
    } catch (e) { console.error(e); }
    setIsLoadingAdmin(false);
  };

  const adminToggleVerified = async (userId: string, currentVal: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_verified: !currentVal }).eq('id', userId);
    if (!error) { toast.success(`User ${!currentVal ? 'verified' : 'unverified'}.`); fetchAdminUsers(); }
    else toast.error('Failed to update.');
  };

  const adminToggleRole = async (userId: string, currentVal: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_admin: !currentVal }).eq('id', userId);
    if (!error) { toast.success(`User is ${!currentVal ? 'now an admin' : 'no longer an admin'}.`); fetchAdminUsers(); }
    else toast.error('Failed to update role.');
  };

  const adminDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to FULLY DELETE the account for ${name}?\n\nThis removes both their profile AND their auth account. This cannot be undone.`)) return;
    try {
      // Call server endpoint which uses service key to delete from auth.users
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin-delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ target_user_id: userId }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(`User ${name} fully deleted from auth and profiles.`);
        fetchAdminUsers();
      } else {
        toast.error(result.error || 'Failed to delete user.');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Network error during delete.');
    }
  };

  const adminSendPasswordReset = async (email: string, name: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) toast.error(`Failed to send reset email: ${error.message}`);
      else toast.success(`Password reset email sent to ${name} (${email})`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send reset email.');
    }
  };

  const adminToggleUserVisibility = async (userId: string, currentVal: boolean, name: string) => {
    const { error } = await supabase.from('profiles')
      .update({ show_results_publicly: !currentVal })
      .eq('id', userId);
    if (!error) {
      const targetUser = adminUsers.find(u => u.id === userId);
      if (targetUser?.seat_no) {
        const sNo = targetUser.seat_no.toUpperCase().trim();
        try {
          const savedHidden = localStorage.getItem('hidden_seats');
          const hiddenSet = new Set<string>(savedHidden ? JSON.parse(savedHidden) : []);
          if (currentVal) hiddenSet.add(sNo);
          else hiddenSet.delete(sNo);
          localStorage.setItem('hidden_seats', JSON.stringify(Array.from(hiddenSet)));
        } catch {}
      }
      toast.success(`${name}: results are now ${!currentVal ? 'public' : 'hidden'}`);
      fetchAdminUsers();
    } else {
      toast.error('Failed to update visibility.');
    }
  };

  const handleBulkExport = () => {
    if (adminUsers.length === 0) { toast.error('No users to export. Load users first.'); return; }
    const headers = ['Full Name', 'Email', 'Seat No', 'Verified', 'Admin', 'Public', 'Created At'];
    const rows = adminUsers.map(u => [
      `"${u.full_name}"`,
      `"${u.email}"`,
      u.seat_no || '',
      u.is_verified ? 'Yes' : 'No',
      u.is_admin ? 'Yes' : 'No',
      u.show_results_publicly ? 'Public' : 'Private',
      new Date(u.created_at).toLocaleDateString('en-US'),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ubit-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${adminUsers.length} users to CSV`);
  };

  const filteredAdminUsers = useMemo(() => {
    if (!adminSearchQuery.trim()) return adminUsers;
    const q = adminSearchQuery.toLowerCase();
    return adminUsers.filter(u => 
      u.full_name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) || 
      (u.seat_no && u.seat_no.toLowerCase().includes(q))
    );
  }, [adminUsers, adminSearchQuery]);

  const handleSignOut = async () => { await signOut(); window.location.hash = ''; };

  if (!profile || !user) return null;

  const brutalistBox = { boxShadow: '5px 5px 0px 0px #000000, 9px 9px 0px 0px #801618' };
  const smallBox = { boxShadow: '3px 3px 0px 0px #801618' };

  return (
    <section className="pt-4 sm:pt-8 pb-12 animate-in fade-in duration-500 space-y-6">
      <button 
        onClick={() => window.location.hash = ''} 
        className="group flex items-center gap-2 mb-2 px-4 py-2 bg-black text-white hover:bg-brand-500 rounded-sm font-black uppercase tracking-wider text-xs transition-colors border-2 border-black w-fit shadow-[3px_3px_0px_0px_#801618]"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Calculator
      </button>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-surface border-[2.5px] border-black rounded-sm p-6 sm:p-8" style={brutalistBox}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black text-white rounded-sm flex items-center justify-center text-xl sm:text-2xl font-black uppercase shrink-0 border-2 border-black" style={smallBox}>
              {profile.full_name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-textMain tracking-tight">{profile.full_name}</h2>
              <p className="text-sm text-textMuted font-mono">{profile.email}</p>
              {profile.seat_no && <p className="text-xs text-textMuted font-mono mt-1">Seat: <span className="font-bold text-textMain">{profile.seat_no}</span></p>}
              <div className="flex items-center gap-2 mt-2">
                {isAdmin && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#801618]/15 text-[#801618] text-[10px] font-bold uppercase tracking-wider rounded-sm border border-[#801618]/30"><Shield size={10} /> Admin</span>}
                {isVerified
                  ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-sm border border-green-500/30"><ShieldCheck size={10} /> Verified</span>
                  : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surfaceHighlight text-textMuted text-[10px] font-bold uppercase tracking-wider rounded-sm border border-border">Unverified</span>}
              </div>
            </div>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 font-bold text-xs rounded-sm transition-all border-2 border-red-500/30 uppercase tracking-wider self-start">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </motion.div>

      {/* Privacy & Visibility Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-surface border-[2.5px] border-black rounded-xl p-5 sm:p-7 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-textMain uppercase tracking-tight flex items-center gap-2">
                <Shield size={16} /> Privacy & Results Visibility
              </h3>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                profile.show_results_publicly 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-red-100 text-red-800 border-red-300'
              }`}>
                {profile.show_results_publicly ? 'Publicly Visible' : '🔒 Private & Hidden'}
              </span>
            </div>
            <p className="text-xs text-textMuted font-medium leading-relaxed max-w-xl">
              {profile.show_results_publicly 
                ? 'Your student record and grades are visible in the batch class directory. You can toggle this off at any time to hide your results from public view.' 
                : 'Your name and marks are redacted in the public results directory. Only you and verified admins can view your full transcript.'}
            </p>
          </div>
          
          <button 
            onClick={toggleVisibility} 
            disabled={isSavingVisibility}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 border-black font-black text-xs transition-all active:scale-95 shadow-[2px_2px_0px_0px_#000] shrink-0 ${
              profile.show_results_publicly 
                ? 'bg-[#801618] hover:bg-[#9b1b1e] text-white' 
                : 'bg-gray-800 hover:bg-black text-white'
            }`}
          >
            {isSavingVisibility ? (
              <Loader2 size={15} className="animate-spin" />
            ) : profile.show_results_publicly ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>Visible Publicly</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>Hidden (Private)</span>
              </>
            )}
          </button>
        </div>
      </motion.div>


      {/* Academic Data */}
      {isLoadingData ? (
        <div className="flex justify-center items-center h-48"><div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" /></div>
      ) : studentData ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-surface border-[2.5px] border-black rounded-sm p-6 sm:p-8" style={brutalistBox}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-textMain uppercase tracking-wider flex items-center gap-2">
                {adminSelectedUser
                  ? <span className="text-brand-500">Managing: {adminSelectedUser.full_name}</span>
                  : adminCustomSeatNo
                  ? <span className="text-brand-500">Managing Seat: {adminCustomSeatNo}</span>
                  : 'Your Results'}
              </h3>
              {(adminSelectedUser || adminCustomSeatNo) && (
                <button onClick={() => { setAdminSelectedUser(null); setAdminCustomSeatNo(''); setAdminCustomSeatInput(''); }} className="text-xs text-textMuted hover:text-brand-500 font-bold uppercase tracking-wider mt-1">
                  ← Back to my profile
                </button>
              )}
            </div>
            {stats && (stats.isConcrete ? (
              <div className="flex flex-col items-center px-4 py-2.5 bg-[#801618] text-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <span className="text-[10px] font-black uppercase tracking-wider">CGPA</span>
                <span className="text-2xl font-black">{stats.cgpa}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center px-4 py-2 border-2 border-dashed border-gray-400 rounded-xl bg-gray-50/80 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                <TentativeCGPA 
                  cgpa={stats.cgpa} 
                  missingCount={stats.missingCount} 
                  isPartialSem3={stats.isPartialSem3} 
                  size="md" 
                />
              </div>
            ))}
          </div>

          {[1, 2, 3].map(sem => (
            <div key={sem} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-textMain uppercase tracking-wider">Semester {sem}</span>
                  {sem === 3 && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-100 text-[#801618] border border-rose-300">
                      Ongoing
                    </span>
                  )}
                </div>
                <span className="text-sm font-black text-textMain">GPA: {sem === 1 ? stats?.gpa1 : sem === 2 ? stats?.gpa2 : stats?.gpa3}</span>
              </div>
              <div className="space-y-1">

                {SUBJECTS_META.filter(s => s.sem === sem).map(sub => {
                  const raw = studentData[sub.id];
                  const marks = raw !== undefined && raw !== null && !isNaN(Number(raw)) ? Number(raw) : null;
                  const isEditing = editingMark === sub.id;
                  return (
                    <div key={sub.id} className="flex items-center justify-between py-2.5 px-3 hover:bg-surfaceHighlight/50 transition-colors rounded-sm group">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-[10px] font-mono font-bold text-textMuted/50 w-14 shrink-0 hidden sm:block">{sub.code}</span>
                        <span className="text-xs sm:text-sm font-medium text-textMain truncate">{sub.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input type="number" min={0} max={100} value={editValue} onChange={e => setEditValue(e.target.value)}
                              className="w-16 px-2 py-1 text-sm font-bold text-center border-2 border-black rounded-sm bg-surface focus:outline-none" autoFocus />
                            <button onClick={() => handleSaveMark(sub.id)} disabled={isSavingMark}
                              className="p-1.5 bg-green-500/10 text-green-600 rounded-sm border border-green-500/30">
                              {isSavingMark ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            </button>
                            <button onClick={() => { setEditingMark(null); setEditValue(''); }}
                              className="p-1.5 bg-red-500/10 text-red-500 rounded-sm border border-red-500/30"><X size={14} /></button>
                          </div>
                        ) : (
                          <>
                            {marks !== null ? (
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold w-7 text-right ${getMarkColor(marks)}`}>{marks}</span>
                                <span className="text-[10px] bg-surfaceHighlight px-1.5 py-0.5 rounded-sm font-bold text-textMuted border border-border w-7 text-center">{getLetterGrade(marks)}</span>
                                <span className="text-[10px] font-mono text-textMuted w-7 text-right">{getGradePoint(marks).toFixed(1)}</span>
                              </div>
                            ) : <span className="text-xs text-textMuted/50 italic">— Missing</span>}
                            {canEditMarks && sub.sem <= 3 && (
                              <button onClick={() => { setEditingMark(sub.id); setEditValue(marks !== null ? String(marks) : ''); }}
                                className="p-1.5 text-textMuted/40 hover:text-brand-500 hover:bg-brand-500/10 rounded-sm transition-colors opacity-70 sm:opacity-0 sm:group-hover:opacity-100" title="Edit mark">
                                <Edit3 size={12} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {!canEditMarks && !isAdmin && (
            <div className="mt-4 p-4 bg-surfaceHighlight rounded-sm border border-border text-center">
              <p className="text-xs text-textMuted"><ShieldCheck size={14} className="inline mr-1 -mt-0.5" />Contact the admin to get <span className="font-bold text-textMain">verified</span> and enable mark editing.</p>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="bg-surface border-[2.5px] border-black rounded-sm p-8 text-center" style={brutalistBox}>
          <p className="text-textMuted font-medium">{profile.seat_no ? `No results found for ${profile.seat_no}.` : 'No seat number linked.'}</p>
        </div>
      )}

      {/* Admin Panel */}
      {isAdmin && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-surface border-[2.5px] border-black rounded-sm overflow-hidden" style={brutalistBox}>
          <button onClick={() => { setIsAdminPanelOpen(!isAdminPanelOpen); if (!isAdminPanelOpen && adminUsers.length === 0) fetchAdminUsers(); }}
            className="w-full flex items-center justify-between p-6 sm:p-8 hover:bg-surfaceHighlight/30 transition-colors">
            <h3 className="text-lg font-black text-textMain uppercase tracking-wider flex items-center gap-2">
              <Shield size={18} className="text-[#801618]" /> Admin Control Panel
              <span className="text-xs font-bold text-textMuted normal-case tracking-normal ml-2">
                {adminUsers.length > 0 && `${adminUsers.length} Users`}
              </span>
            </h3>
            <ChevronDown size={20} className={`text-textMuted transition-transform ${isAdminPanelOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isAdminPanelOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="border-t-2 border-black overflow-hidden">
                <div className="p-6 sm:p-8">
                  {/* Admin Stats Summary */}
                  {adminUsers.length > 0 && (() => {
                    const totalUsers = adminUsers.length;
                    const verifiedCount = adminUsers.filter(u => u.is_verified).length;
                    const hiddenCount = adminUsers.filter(u => !u.show_results_publicly).length;
                    const withSeatCount = adminUsers.filter(u => !!u.seat_no).length;
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                        {[
                          { label: 'Total Accounts', value: totalUsers, icon: <Users size={14} />, color: 'bg-blue-50 border-blue-200 text-blue-800' },
                          { label: 'Verified', value: verifiedCount, icon: <ShieldCheck size={14} />, color: 'bg-green-50 border-green-200 text-green-800' },
                          { label: 'Seat Linked', value: withSeatCount, icon: <BarChart3 size={14} />, color: 'bg-amber-50 border-amber-200 text-amber-800' },
                          { label: 'Privacy On', value: hiddenCount, icon: <EyeOff size={14} />, color: 'bg-red-50 border-red-200 text-red-800' },
                        ].map(({ label, value, icon, color }) => (
                          <div key={label} className={`flex items-center gap-2 p-2.5 rounded-lg border-2 ${color}`}>
                            {icon}
                            <div>
                              <p className="text-xs font-black">{value}</p>
                              <p className="text-[9px] font-bold uppercase tracking-wide opacity-70">{label}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <span className="text-sm font-bold text-textMuted flex items-center gap-2"><Users size={14} /> Users ({filteredAdminUsers.length})</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-textMuted" />
                        <input 
                          type="text" 
                          placeholder="Search users..." 
                          value={adminSearchQuery}
                          onChange={e => setAdminSearchQuery(e.target.value)}
                          className="pl-8 pr-3 py-1.5 bg-surface text-xs text-textMain border border-border rounded-sm focus:outline-none focus:border-brand-500 w-full sm:w-44"
                        />
                      </div>
                      <button onClick={fetchAdminUsers} disabled={isLoadingAdmin}
                        className="flex items-center gap-1 text-xs font-bold text-brand-500 hover:underline shrink-0 disabled:opacity-50">
                        <RefreshCw size={12} className={isLoadingAdmin ? 'animate-spin' : ''} />
                        {isLoadingAdmin ? 'Loading...' : 'Refresh'}
                      </button>
                      <button onClick={handleBulkExport}
                        className="flex items-center gap-1 text-xs font-bold text-green-700 hover:underline shrink-0 px-2 py-1 bg-green-50 border border-green-300 rounded">
                        <Download size={12} /> Export CSV
                      </button>
                    </div>
                  </div>
                  {/* Edit marks for any seat number — no account required */}
                  <div className="mb-4 p-3 bg-brand-500/5 border border-brand-500/20 rounded-sm">
                    <p className="text-[10px] font-bold text-brand-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Edit3 size={10} /> Edit Marks by Seat No (No Account Required)
                    </p>
                    <form className="flex gap-2" onSubmit={(e) => {
                      e.preventDefault();
                      if (!adminCustomSeatInput.trim()) return;
                      setAdminSelectedUser(null);
                      setAdminCustomSeatNo(adminCustomSeatInput.toUpperCase().trim());
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}>
                      <input
                        type="text"
                        placeholder="e.g. CS-123456"
                        value={adminCustomSeatInput}
                        onChange={e => setAdminCustomSeatInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-surface text-xs text-textMain border border-border rounded-sm focus:outline-none focus:border-brand-500 font-mono uppercase"
                      />
                      <button type="submit" className="px-3 py-1.5 bg-brand-500 text-white text-xs font-bold rounded-sm hover:bg-brand-600 transition-colors shrink-0">
                        Load
                      </button>
                    </form>
                  </div>
                  {isLoadingAdmin ? <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-textMuted" /></div>
                  : filteredAdminUsers.length === 0 ? <p className="text-textMuted text-sm text-center py-8">No users found.</p>
                  : <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {filteredAdminUsers.map(u => (
                        <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surfaceHighlight rounded-sm border border-border">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-textMain truncate">{u.full_name}</span>
                              {u.is_admin && <span className="text-[9px] bg-[#801618]/15 text-[#801618] px-1.5 py-0.5 rounded-sm font-bold border border-[#801618]/30">ADMIN</span>}
                              {!u.show_results_publicly && <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-sm font-bold border border-red-300 flex items-center gap-0.5"><EyeOff size={8} /> Hidden</span>}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-textMuted font-mono">{u.email}</span>
                              {u.seat_no && <span className="text-[10px] text-textMuted font-mono font-bold">📋 {u.seat_no}</span>}
                              <span className="text-[9px] text-textMuted">{new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                            {/* Edit Marks */}
                            <button onClick={() => {
                              if (!u.seat_no) { toast.error(`${u.full_name} has no seat number linked.`); return; }
                              setAdminCustomSeatNo('');
                              setAdminCustomSeatInput('');
                              setAdminSelectedUser(u);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                              className="p-1.5 bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 rounded-sm border border-brand-500/30 transition-colors" title="Manage Marks">
                              <Edit3 size={13} />
                            </button>
                            {/* Toggle Visibility */}
                            <button onClick={() => adminToggleUserVisibility(u.id, u.show_results_publicly, u.full_name)}
                              className={`p-1.5 rounded-sm border transition-colors ${
                                u.show_results_publicly
                                  ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                                  : 'bg-red-50 text-red-600 border-red-300 hover:bg-red-100'
                              }`}
                              title={u.show_results_publicly ? 'Results Public — click to hide' : 'Results Hidden — click to make public'}>
                              {u.show_results_publicly ? <Eye size={13} /> : <EyeOff size={13} />}
                            </button>
                            {/* Verify */}
                            <button onClick={() => adminToggleVerified(u.id, u.is_verified)}
                              className={`flex items-center gap-1 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border-2 transition-all ${
                                u.is_verified ? 'bg-green-500/10 text-green-700 border-green-500/30' : 'bg-surfaceHighlight text-textMuted border-border'
                              }`}>
                              <ShieldCheck size={11} /> {u.is_verified ? 'Verified' : 'Verify'}
                            </button>
                            {/* Admin Role (can't demote self) */}
                            {u.id !== profile.id && (
                              <button onClick={() => adminToggleRole(u.id, u.is_admin)}
                                className={`flex items-center gap-1 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border-2 transition-all ${
                                  u.is_admin ? 'bg-[#801618]/15 text-[#801618] border-[#801618]/30' : 'bg-surfaceHighlight text-textMuted border-border'
                                }`} title="Toggle Admin Role">
                                <Shield size={11} /> {u.is_admin ? 'Admin' : 'Make Admin'}
                              </button>
                            )}
                            {/* Password Reset */}
                            <button onClick={() => adminSendPasswordReset(u.email, u.full_name)}
                              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-sm border border-blue-300 transition-colors" title="Send password reset email">
                              <Mail size={13} />
                            </button>
                            {/* Delete (full auth + profile) */}
                            {u.id !== profile.id && (
                              <button onClick={() => adminDeleteUser(u.id, u.full_name)}
                                className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-sm border border-red-500/30 transition-colors" title="Fully delete account (auth + profile)">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
};
