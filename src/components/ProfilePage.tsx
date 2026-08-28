import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, ShieldCheck, LogOut, Edit3, Check, X, Loader2, Users, ChevronDown, ArrowLeft, Search, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore, type Profile } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { getGradePoint, getLetterGrade, getMarkColor, SEM1_COURSES, SEM2_COURSES, SEM3_COURSES } from '../lib/utils';
import { TentativeCGPA } from './TentativeCGPA';

const SUBJECTS_META = [
  ...SEM1_COURSES.map(c => ({ id: c.code.toLowerCase().replace('-', ''), code: c.code, name: c.name, credits: c.credits, sem: 1 })),
  ...SEM2_COURSES.map(c => ({ id: c.code.toLowerCase().replace('-', ''), code: c.code, name: c.name, credits: c.credits, sem: 2 })),
  ...SEM3_COURSES.map(c => ({ id: c.code.toLowerCase().replace('-', ''), code: c.code, name: c.name, credits: c.credits, sem: 3 })),
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

  useEffect(() => {
    const fetchStudentData = async () => {
      // Admin can either select a profile user OR type a custom seat no
      const targetSeatNo = adminSelectedUser
        ? adminSelectedUser.seat_no
        : adminCustomSeatNo || profile?.seat_no;
      if (!targetSeatNo) { setStudentData(null); setIsLoadingData(false); return; }
      
      setIsLoadingData(true);
      try {
        let resultsData: any[] | null = null;
        const res = await fetch('/api/results');
        if (res.ok) {
          resultsData = await res.json();
        } else {
          // Fallback to local JSON snapshot for local dev
          const fallbackRes = await fetch('/fallback-results.json');
          if (fallbackRes.ok) resultsData = await fallbackRes.json();
        }
        if (resultsData) {
          const match = resultsData.find((row: any) => row.seat_no === targetSeatNo);
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

    const isConcrete = (s1Count === 6 && s2Count === 6 && s3Count === 0) || (s1Count === 6 && s2Count === 6 && s3Count === 6);
    const isPartialSem3 = s1Count === 6 && s2Count === 6 && s3Count > 0 && s3Count < 6;
    const missingCount = (s1Count < 6 ? 6 - s1Count : 0) + (s2Count < 6 ? 6 - s2Count : 0);

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
    if (result.error) toast.error('Failed to update visibility.');
    else toast.success(newVal ? 'Results are now public.' : 'Results are now hidden.', { icon: newVal ? '👁️' : '🔒' });
    setIsSavingVisibility(false);
  };

  const handleSaveMark = async (subjectId: string) => {
    const targetSeatNo = adminSelectedUser
      ? adminSelectedUser.seat_no
      : adminCustomSeatNo || profile?.seat_no;
    if (!targetSeatNo || !editValue.trim()) return;
    const numVal = Number(editValue);
    if (isNaN(numVal) || numVal < 0 || numVal > 100) { toast.error('Enter a valid mark (0-100).'); return; }
    setIsSavingMark(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/update-marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ seat_no: targetSeatNo, subject_id: subjectId, marks: numVal }),
      });
      if (res.ok) {
        toast.success('Mark updated!');
        setStudentData(prev => prev ? { ...prev, [subjectId]: numVal } : prev);
        setEditingMark(null); setEditValue('');
      } else { const d = await res.json(); toast.error(d.error || 'Failed to update.'); }
    } catch { toast.error('Network error.'); }
    setIsSavingMark(false);
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
    if (!confirm(`Are you sure you want to delete the profile for ${name}? This action cannot be undone.`)) return;
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (!error) { toast.success(`User ${name} deleted.`); fetchAdminUsers(); }
    else toast.error('Failed to delete user.');
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

  const brutalistBox = { boxShadow: '5px 5px 0px 0px #000000, 9px 9px 0px 0px rgb(230, 180, 0)' };
  const smallBox = { boxShadow: '3px 3px 0px 0px rgb(230, 180, 0)' };

  return (
    <section className="pt-4 sm:pt-8 pb-12 animate-in fade-in duration-500 space-y-6">
      <button 
        onClick={() => window.location.hash = ''} 
        className="group flex items-center gap-2 mb-2 px-4 py-2 bg-black text-white hover:bg-brand-500 rounded-sm font-black uppercase tracking-wider text-xs transition-colors border-2 border-black w-fit shadow-[3px_3px_0px_0px_rgba(230,180,0,1)]"
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
                {isAdmin && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-400/20 text-yellow-700 text-[10px] font-bold uppercase tracking-wider rounded-sm border border-yellow-500/40"><Shield size={10} /> Admin</span>}
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

      {/* Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-surface border-[2.5px] border-black rounded-sm p-6 sm:p-8" style={brutalistBox}>
        <h3 className="text-lg font-black text-textMain uppercase tracking-wider mb-4 flex items-center gap-2"><User size={18} /> Settings</h3>
        <div className="flex items-center justify-between p-4 bg-surfaceHighlight rounded-sm border border-border">
          <div>
            <h4 className="font-bold text-textMain text-sm">Public Results Visibility</h4>
            <p className="text-xs text-textMuted mt-0.5">{profile.show_results_publicly ? 'Your results are visible to all registered users.' : 'Your results are hidden from the public results page.'}</p>
          </div>
          
          <button 
            onClick={toggleVisibility} 
            disabled={isSavingVisibility}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.show_results_publicly ? 'bg-brand-500' : 'bg-surface border border-border/50'}`}
          >
            <span className="sr-only">Toggle visibility</span>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                profile.show_results_publicly ? 'translate-x-6' : 'translate-x-1 border border-border'
              }`}
            />
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
              <div className="flex flex-col items-center px-4 py-2.5 bg-yellow-400 text-black rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
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
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
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
                            {isVerified && (
                              <button onClick={() => { setEditingMark(sub.id); setEditValue(marks !== null ? String(marks) : ''); }}
                                className="p-1.5 text-textMuted/30 hover:text-brand-500 hover:bg-brand-500/10 rounded-sm transition-colors opacity-0 group-hover:opacity-100" title="Edit mark">
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
          {!isVerified && (
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
            <h3 className="text-lg font-black text-textMain uppercase tracking-wider flex items-center gap-2"><Shield size={18} className="text-yellow-600" /> Admin Panel</h3>
            <ChevronDown size={20} className={`text-textMuted transition-transform ${isAdminPanelOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isAdminPanelOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="border-t-2 border-black overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <span className="text-sm font-bold text-textMuted flex items-center gap-2"><Users size={14} /> Users ({filteredAdminUsers.length})</span>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-textMuted" />
                        <input 
                          type="text" 
                          placeholder="Search users..." 
                          value={adminSearchQuery}
                          onChange={e => setAdminSearchQuery(e.target.value)}
                          className="pl-8 pr-3 py-1.5 bg-surface text-xs text-textMain border border-border rounded-sm focus:outline-none focus:border-brand-500 w-full sm:w-48"
                        />
                      </div>
                      <button onClick={fetchAdminUsers} disabled={isLoadingAdmin} className="text-xs font-bold text-brand-500 hover:underline shrink-0">
                        {isLoadingAdmin ? 'Loading...' : 'Refresh'}
                      </button>
                    </div>
                  </div>
                  {/* Edit marks for any seat number — no account required */}
                  <div className="mb-4 p-3 bg-brand-500/5 border border-brand-500/20 rounded-sm">
                    <p className="text-[10px] font-bold text-brand-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Edit3 size={10} /> Edit Marks by Seat No (No Account Required)
                    </p>
                    <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setAdminSelectedUser(null); setAdminCustomSeatNo(adminCustomSeatInput.toUpperCase().trim()); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
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
                        <div key={u.id} className="flex items-center justify-between p-3 bg-surfaceHighlight rounded-sm border border-border">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-textMain truncate">{u.full_name}</span>
                              {u.is_admin && <span className="text-[9px] bg-yellow-400/20 text-yellow-700 px-1.5 py-0.5 rounded-sm font-bold border border-yellow-500/30">ADMIN</span>}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[10px] text-textMuted font-mono">{u.email}</span>
                              {u.seat_no && <span className="text-[10px] text-textMuted font-mono">Seat: {u.seat_no}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => { setAdminSelectedUser(u); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className="p-1.5 bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 rounded-sm border border-brand-500/30 transition-colors" title="Manage Marks">
                              <Edit3 size={14} />
                            </button>
                            <button onClick={() => adminToggleVerified(u.id, u.is_verified)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border-2 transition-all ${u.is_verified ? 'bg-green-500/10 text-green-700 border-green-500/30' : 'bg-surfaceHighlight text-textMuted border-border'}`}>
                              <ShieldCheck size={12} /> {u.is_verified ? 'Verified' : 'Verify'}
                            </button>
                            {u.id !== profile.id && (
                              <button onClick={() => adminToggleRole(u.id, u.is_admin)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border-2 transition-all ${u.is_admin ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30' : 'bg-surfaceHighlight text-textMuted border-border'}`} title="Toggle Admin Role">
                                <Shield size={12} /> {u.is_admin ? 'Admin' : 'Make Admin'}
                              </button>
                            )}
                            {u.id !== profile.id && (
                              <button onClick={() => adminDeleteUser(u.id, u.full_name)}
                                className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-sm border border-red-500/30 transition-colors" title="Delete Profile">
                                <Trash2 size={14} />
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
