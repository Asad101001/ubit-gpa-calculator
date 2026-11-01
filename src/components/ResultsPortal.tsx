import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ChevronDown, ChevronUp, FileText, Filter, ArrowLeft, AlertTriangle, Pencil, X, Lock, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';


import { StudentResultCard, getMarkColor } from './StudentResultCard';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { OfficialMarksheetsModal } from './OfficialMarksheetsModal';
import { getMarksheetBySubject } from '../lib/resultsArchive';
import { SECTION_A_SEATS } from '../lib/sectionA';
import { getGradePoint } from '../lib/utils';

export interface SubjectInfo {
  id: string;
  code: string;
  name: string;
  teacher: string;
  subTeacher?: string;
  semester: number;
  credits: number;
}

const SUBJECTS_DATA: SubjectInfo[] = [
  // 1st Semester
  { id: "cs351", code: "CS-351", name: "Programming Fundamentals", teacher: "Mr. Badr Sami", semester: 1, credits: 4 },
  { id: "cs353", code: "CS-353", name: "Intro to ICT", teacher: "Mr. Zaeem Tariq", semester: 1, credits: 3 },
  { id: "cs355", code: "CS-355", name: "Calculus & Analytical Geo", teacher: "Mr. M. Aslam", semester: 1, credits: 3 },
  { id: "cs357", code: "CS-357", name: "Applied Physics", teacher: "Ms. Farheen Shafiq", semester: 1, credits: 3 },
  { id: "cs359", code: "CS-359", name: "Functional English", teacher: "Ms. Ayesha Khwaja", semester: 1, credits: 3 },
  { id: "cs361", code: "CS-361", name: "Islamic Studies", teacher: "Dr. Waqar Hussain", semester: 1, credits: 2 },

  // 2nd Semester
  { id: "cs352", code: "CS-352", name: "Object Oriented Concepts", teacher: "Dr. Humera Tariq", semester: 2, credits: 4 },
  { id: "cs354", code: "CS-354", name: "Digital Logic Design", teacher: "Mr. Bari Ahmed", semester: 2, credits: 3 },
  { id: "cs356", code: "CS-356", name: "Linear Algebra", teacher: "Mr. Muhammad Huzaifa", semester: 2, credits: 3 },
  { id: "cs358", code: "CS-358", name: "Discrete Structures", teacher: "Ms. Maryam Feroze", semester: 2, credits: 3 },
  { id: "cs360", code: "CS-360", name: "Communication Skills", teacher: "Mr. Sami-ul-Huda", semester: 2, credits: 3 },
  { id: "cs362", code: "CS-362", name: "Ideology of Pakistan", teacher: "Dr. Mehrunnissa", semester: 2, credits: 2 },

  // 3rd Semester (In Progress)
  { id: "cs451", code: "CS-451", name: "Data Structures", teacher: "Ms. Maryam Feroze", semester: 3, credits: 4 },
  { id: "cs453", code: "CS-453", name: "Software Engineering", teacher: "Dr. Shaista Raees", semester: 3, credits: 3 },
  { id: "cs455", code: "CS-455", name: "Computer Organization", teacher: "Mr. Taha Bin Niaz (Late)", subTeacher: "Mr. Mukesh Kumar Rathi", semester: 3, credits: 3 },
  { id: "cs457", code: "CS-457", name: "Multivariable Calculus", teacher: "Mr. Muhammad Aslam", semester: 3, credits: 3 },
  { id: "cs459", code: "CS-459", name: "Probability & Statistics", teacher: "Dr. Humera Bashir", semester: 3, credits: 3 },
  { id: "cs461", code: "CS-461", name: "Urdu", teacher: "Mr. M. Salman", semester: 3, credits: 2 },
];

const ALL_SUBJECTS = "All Subjects Overview";

// Semester GPA helpers for semester-grouped views
export const getStudentSemGpa = (student: any, sem: number): number | null => {
  const subs = SUBJECTS_DATA.filter(s => s.semester === sem);
  let qp = 0;
  let cr = 0;
  subs.forEach(s => {
    const raw = student[s.id];
    if (raw !== undefined && raw !== null && raw !== '' && raw !== 'Results Unannounced' && !isNaN(Number(raw))) {
      qp += getGradePoint(Number(raw)) * s.credits;
      cr += s.credits;
    }
  });
  return cr > 0 ? (qp / cr) : null;
};

export const countMissingInSem = (student: any, sem: number): number => {
  const subs = SUBJECTS_DATA.filter(s => s.semester === sem);
  let missing = 0;
  subs.forEach(s => {
    const raw = student[s.id];
    if (raw === undefined || raw === null || raw === '' || raw === 'Results Unannounced' || isNaN(Number(raw))) {
      missing++;
    }
  });
  return missing;
};

interface ResultsPortalProps {
  onPrefill?: (s1: Record<string, number | ''>, s2: Record<string, number | ''>, s3?: Record<string, number | ''>) => void;
}

export const ResultsPortal = ({ onPrefill }: ResultsPortalProps) => {
  const { user, profile } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hiddenSeatNos, setHiddenSeatNos] = useState<Set<string>>(new Set());
  const [showAdminPrivateRecords, setShowAdminPrivateRecords] = useState(false);
  const [error, setError] = useState('');

  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(ALL_SUBJECTS);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'Seat No', direction: 'asc' });
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedStudentModal, setSelectedStudentModal] = useState<any | null>(null);
  const [modalStartEditing, setModalStartEditing] = useState(false);
  const [isMarksheetsModalOpen, setIsMarksheetsModalOpen] = useState(false);

  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const isTouchDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isTouchDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
    const dy = Math.abs(e.touches[0].clientY - touchStartPos.current.y);
    if (dx > 7 || dy > 7) {
      isTouchDragging.current = true;
    }
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      isTouchDragging.current = false;
      touchStartPos.current = null;
    }, 150);
  };

  const isSemesterView = selectedSubject.startsWith('sem-');
  const selectedSemNumber = isSemesterView ? Number(selectedSubject.replace('sem-', '')) : null;
  const isSingleSubject = selectedSubject !== ALL_SUBJECTS && !isSemesterView;

  const currentSubjectDoc = useMemo(() => {
    return isSingleSubject ? getMarksheetBySubject(selectedSubject) : undefined;
  }, [selectedSubject, isSingleSubject]);


  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    if (typeof window !== 'undefined') {
      const acceptedTime = localStorage.getItem('disclaimer_accepted');
      // Extend TTL from 10 min to 24h — avoids nagging users who revisit frequently
      if (acceptedTime && (Date.now() - parseInt(acceptedTime) < 24 * 60 * 60 * 1000)) {
        return false;
      }
      return true;
    }
    return true;
  });

  const dismissDisclaimer = () => {
    localStorage.setItem('disclaimer_accepted', Date.now().toString());
    setShowDisclaimer(false);
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const hidden = new Set<string>();

        // 0. Load cached hidden seat numbers from localStorage
        const savedHidden = localStorage.getItem('hidden_seats');
        if (savedHidden) {
          try {
            JSON.parse(savedHidden).forEach((s: string) => {
              if (s) hidden.add(String(s).toUpperCase());
            });
          } catch {}
        }

        // 1. If current logged-in user has hidden results, sync immediately
        if (profile?.seat_no) {
          const mySeat = String(profile.seat_no).toUpperCase();
          if (profile.show_results_publicly === false) {
            hidden.add(mySeat);
          } else {
            hidden.delete(mySeat);
          }
          localStorage.setItem('hidden_seats', JSON.stringify(Array.from(hidden)));
        }

        // 2. Fetch profiles from Supabase to sync visibility
        try {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('seat_no, show_results_publicly');
          if (profiles && Array.isArray(profiles)) {
            profiles.forEach((p: any) => { 
              if (p.seat_no) {
                const s = String(p.seat_no).toUpperCase().trim();
                if (p.show_results_publicly === false) {
                  hidden.add(s);
                } else {
                  hidden.delete(s);
                }
              }
            });
            localStorage.setItem('hidden_seats', JSON.stringify(Array.from(hidden)));
          }
        } catch { /* profiles table policy fallback */ }

        let json: any = null;
        try {
          const res = await fetch('/api/results');
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && (contentType.includes('application/json') || res.status === 200)) {
            const text = await res.text();
            if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
              json = JSON.parse(text);
            }
          }
        } catch {
          // Local dev or API unreachable, will proceed to fallback
        }

        const mySeat = String(profile?.seat_no || '').toUpperCase().trim();
        const isMyProfileHidden = profile?.show_results_publicly === false;

        if (json && Array.isArray(json) && json.length > 0) {
          const sectionAOnly = json.filter((row: any) => {
            const seatNo = row.seat_no ? String(row.seat_no).toUpperCase().trim() : '';
            return SECTION_A_SEATS.has(seatNo);
          });
          const formatted = sectionAOnly.map((row: any) => {
            const seatNo = row.seat_no ? String(row.seat_no).toUpperCase().trim() : '';
            if (row.is_hidden && seatNo) {
              hidden.add(seatNo);
            }
            const isRowHidden = (seatNo && hidden.has(seatNo)) || !!row.is_hidden || (seatNo === mySeat && isMyProfileHidden);
            if (isRowHidden && seatNo) {
              hidden.add(seatNo);
            }

            const mappedRow: any = {
              'Seat No': seatNo,
              'Name': row.name,
              'is_hidden': isRowHidden,
            };
            
            SUBJECTS_DATA.forEach(sub => {
              if (row[sub.id] !== undefined && row[sub.id] !== null && row[sub.id] !== '') {
                mappedRow[sub.id] = row[sub.id];
              } else {
                mappedRow[sub.id] = 'Results Unannounced';
              }
            });
            
            return mappedRow;
          });
          setHiddenSeatNos(hidden);
          setData(formatted);
          setIsLoading(false);
          return;
        }

        // Fallback to local JSON snapshot for local dev / offline testing
        try {
          const fallbackRes = await fetch('/fallback-results.json');
          if (fallbackRes.ok) {
            const fallbackJson = await fallbackRes.json();
            if (Array.isArray(fallbackJson) && fallbackJson.length > 0) {
              const sectionAOnly = fallbackJson.filter((row: any) => {
                const seatNo = row.seat_no ? String(row.seat_no).toUpperCase().trim() : '';
                return SECTION_A_SEATS.has(seatNo);
              });
              const formatted = sectionAOnly.map((row: any) => {
                const seatNo = row.seat_no ? String(row.seat_no).toUpperCase().trim() : '';
                const isRowHidden = (seatNo && hidden.has(seatNo)) || !!row.is_hidden || (seatNo === mySeat && isMyProfileHidden);
                if (isRowHidden && seatNo) {
                  hidden.add(seatNo);
                }

                const mappedRow: any = { 
                  'Seat No': seatNo, 
                  'Name': row.name, 
                  'is_hidden': isRowHidden 
                };
                SUBJECTS_DATA.forEach(sub => {
                  if (row[sub.id] !== undefined && row[sub.id] !== null && row[sub.id] !== '') {
                    mappedRow[sub.id] = row[sub.id];
                  } else {
                    mappedRow[sub.id] = 'Results Unannounced';
                  }
                });
                return mappedRow;
              });
              setHiddenSeatNos(hidden);
              setData(formatted);
              setIsLoading(false);
              return;
            }
          }
        } catch { /* no fallback available */ }

        setData([]);
        setError("No data found or database connection issue.");
      } catch (e) {
        console.error("Failed to load results.", e);
        setError("Could not connect to the database.");
        setData([]);
      }
      setIsLoading(false);
    };

    fetchResults();
  }, [profile?.show_results_publicly, profile?.seat_no]);

  // Live visibility state sync whenever profile privacy changes in auth store
  useEffect(() => {
    if (!profile?.seat_no) return;
    const mySeat = String(profile.seat_no).toUpperCase().trim();
    const isHidden = profile.show_results_publicly === false;

    setHiddenSeatNos(prev => {
      const next = new Set(prev);
      if (isHidden) next.add(mySeat);
      else next.delete(mySeat);
      localStorage.setItem('hidden_seats', JSON.stringify(Array.from(next)));
      return next;
    });

    setData(prev => prev.map(student => {
      const sSeat = String(student['Seat No'] || '').toUpperCase().trim();
      if (sSeat === mySeat) {
        return { ...student, is_hidden: isHidden };
      }
      return student;
    }));
  }, [profile?.show_results_publicly, profile?.seat_no]);

  const handleEditClick = (student: any, startEditing: boolean = false) => {
    setSelectedStudentModal(student);
    setModalStartEditing(startEditing);
  };

  const handleMarksUpdated = (seatNo: string, updatedMarks: Record<string, any>) => {
    const normalized: Record<string, any> = {};
    Object.entries(updatedMarks).forEach(([k, v]) => {
      normalized[k] = (v === null || v === undefined || v === '') ? 'Results Unannounced' : v;
    });

    setData(prev => prev.map(student => {
      const sNo = String(student['Seat No'] || '').toUpperCase().trim();
      if (sNo === seatNo.toUpperCase().trim()) {
        return { ...student, ...normalized };
      }
      return student;
    }));

    setSelectedStudentModal((prev: any) => {
      if (!prev) return null;
      const sNo = String(prev['Seat No'] || '').toUpperCase().trim();
      if (sNo === seatNo.toUpperCase().trim()) {
        return { ...prev, ...normalized };
      }
      return prev;
    });
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredData = useMemo(() => {
    let filtered = [...data];

    // Filter by Search Query (Name or Seat No)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        (item['Seat No'] && String(item['Seat No']).toLowerCase().includes(q)) ||
        (item['Name'] && String(item['Name']).toLowerCase().includes(q))
      );
    }

    // Sort Data
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        // Semester GPA sort when viewing a semester group
        if (sortConfig.key === 'sem_gpa' && selectedSemNumber) {
          const aGpa = getStudentSemGpa(a, selectedSemNumber);
          const bGpa = getStudentSemGpa(b, selectedSemNumber);
          if (aGpa === null && bGpa !== null) return sortConfig.direction === 'asc' ? 1 : -1;
          if (aGpa !== null && bGpa === null) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aGpa === null && bGpa === null) return 0;
          if (aGpa! < bGpa!) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aGpa! > bGpa!) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }

        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        // Text columns: always string comparison
        if (sortConfig.key === 'Name' || sortConfig.key === 'Seat No') {
          const aStr = String(aVal || '').toLowerCase();
          const bStr = String(bVal || '').toLowerCase();
          if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }

        // Handle missing/unannounced strings for Mark columns
        const isAString = typeof aVal === 'string' && isNaN(Number(aVal));
        const isBString = typeof bVal === 'string' && isNaN(Number(bVal));

        if (isAString && !isBString) return sortConfig.direction === 'asc' ? 1 : -1;
        if (!isAString && isBString) return sortConfig.direction === 'asc' ? -1 : 1;
        if (isAString && isBString) return 0;

        const aNum = Number(aVal);
        const bNum = Number(bVal);

        if (!isNaN(aNum) && !isNaN(bNum)) {
          if (aNum < bNum) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aNum > bNum) return sortConfig.direction === 'asc' ? 1 : -1;
        }

        return 0;
      });
    }

    return filtered;
  // PERF FIX: hiddenSeatNos and profile are NOT used in this memo—filtering by hidden
  // is done inline during render. Including them here caused unnecessary recomputation.
  }, [data, searchQuery, sortConfig]);

  // Single-pass displayNames computation (O(n) instead of the previous O(n²) double-loop)
  const displayNames = useMemo(() => {
    const formattedMap = new Map<string, string>();
    const truncatedCounts = new Map<string, number>();

    // Single pass: compute abbreviated names and count collisions simultaneously
    data.forEach(student => {
      let name = (student['Name'] || '').trim();

      if (name.startsWith('SYED MUHAMMAD ')) {
        name = 'S.M ' + name.substring('SYED MUHAMMAD '.length);
      } else if (name.startsWith('MUHAMMAD ')) {
        name = 'M. ' + name.substring('MUHAMMAD '.length);
      }

      const parts = name.split(/\s+/);
      const truncated = parts.length > 3 ? parts.slice(0, 3).join(' ') : name;

      // Store both the full abbreviated and the truncated version
      formattedMap.set(student['Seat No'], name);
      truncatedCounts.set(truncated, (truncatedCounts.get(truncated) || 0) + 1);
    });

    // Second pass: use truncated version only if it's unique
    data.forEach(student => {
      const abbrevName = formattedMap.get(student['Seat No'])!;
      const parts = abbrevName.split(/\s+/);
      const truncated = parts.length > 3 ? parts.slice(0, 3).join(' ') : abbrevName;
      if ((truncatedCounts.get(truncated) || 0) === 1) {
        formattedMap.set(student['Seat No'], truncated);
      }
    });

    return formattedMap;
  }, [data]);

  const displayedSubjects = useMemo(() => {
    if (selectedSubject === ALL_SUBJECTS) {
      return SUBJECTS_DATA;
    }
    if (isSemesterView && selectedSemNumber) {
      return SUBJECTS_DATA.filter(s => s.semester === selectedSemNumber);
    }
    if (isSingleSubject) {
      return SUBJECTS_DATA.filter(s => s.id === selectedSubject);
    }
    return SUBJECTS_DATA;
  }, [selectedSubject, isSemesterView, selectedSemNumber, isSingleSubject]);

  const totalColSpan = 3 + (isSingleSubject ? 1 : displayedSubjects.length + (isSemesterView && selectedSemNumber ? 1 : 0));



  return (
    <section id="results" className="pt-8 sm:pt-16 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Centered Popup Disclaimer */}
      <AnimatePresence>
        {showDisclaimer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={dismissDisclaimer}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />
            
            {/* Popup Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-lg glass-card p-8 sm:p-10 text-center flex flex-col items-center"
            >
              
              {/* Pulse Icon Container */}
              <div className="relative mb-6">
                <div className="relative bg-surfaceHighlight p-5 rounded-sm border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <AlertTriangle className="text-black w-10 h-10 animate-pulse" style={{ animationDuration: '3s' }} />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl font-extrabold text-textMain uppercase tracking-tight mb-4">
                Important Disclaimer
              </h3>

              {/* Content */}
              <p className="text-textMuted text-sm sm:text-base font-medium leading-relaxed mb-8 border-l-4 border-brand-500 pl-4 text-left">
                The academic results and marks displayed in this portal have been compiled via automated extraction and manual entry. 
                <span className="block mt-3 font-bold text-black bg-accent-500/20 border-2 border-black p-3">
                  This data is unofficial and may be incomplete or contain errors.
                </span>
                Please always refer to your official physical transcript from the university administration for authoritative results.
              </p>

              {/* Accept Button */}
              <button 
                onClick={dismissDisclaimer}
                className="w-full py-4 px-6 bg-gradient-to-r"
              >
                I Understand & Accept
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <button 
            onClick={() => window.location.hash = ''} 
            className="group flex items-center gap-2 mb-6 px-4 py-2 bg-black text-white hover:bg-brand-500 rounded-sm font-black uppercase tracking-wider text-xs transition-colors border-2 border-black w-fit shadow-[3px_3px_0px_0px_rgba(230,180,0,1)]"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Calculator
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-accent-500 tracking-tight flex items-center gap-3 pb-1">
              <div className="bg-gradient-to-br from-brand-500/20 to-accent-500/20 p-2 rounded-xl border border-brand-500/30 shadow-[0_0_15px_rgba(var(--color-brand-500),0.1)]">
                <FileText className="text-brand-500 w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <span>Official Results Portal</span>
              <button 
                onClick={() => setShowDisclaimer(true)}
                className="text-textMuted/40 hover:text-brand-500 transition-all p-1.5 rounded-xl hover:bg-brand-500/10 cursor-pointer flex items-center justify-center border border-transparent hover:border-brand-500/20 shadow-sm"
                title="Show disclaimer regarding results data"
              >
                <AlertTriangle size={18} />
              </button>
            </h2>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsMarksheetsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-[#801618] text-white hover:bg-[#9b1b1e] border-2 border-black transition-all shadow-[2px_2px_0px_0px_#000] active:scale-95 cursor-pointer"
                title="View authentic, scanned marksheets issued by Department of Computer Science"
              >
                <FileText size={13} strokeWidth={2.5} />
                <span>View Official Marksheets (PDF Archive)</span>
              </button>

              {profile?.is_admin && (
                <button
                  onClick={() => setShowAdminPrivateRecords(!showAdminPrivateRecords)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black border-2 transition-all shadow-[2px_2px_0px_0px_#000] active:scale-95 ${
                    showAdminPrivateRecords 
                      ? 'bg-red-500 text-white border-black' 
                      : 'bg-white hover:bg-rose-50 text-black border-black'
                  }`}
                  title="Admin mode: toggle to preview hidden private records"
                >
                  <Lock size={12} />
                  <span>{showAdminPrivateRecords ? 'Admin: Showing Private Records' : 'Public View (Private Hidden)'}</span>
                </button>
              )}
            </div>
          </div>
          <p className="text-textMuted font-medium max-w-xl text-sm sm:text-base mt-1">
            Browse and filter academic results
          </p>

          {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
        </div>
      </div>

      <div className="glass rounded-[2rem] p-4 sm:p-6 md:p-8 relative overflow-hidden shadow-xl">
        {/* Privacy Education & Notice Banner */}
        <div className="mb-6 p-4 bg-rose-50/90 border-2 border-black rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[3px_3px_0px_0px_#000]">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#801618] border-2 border-black flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-[1px_1px_0px_0px_#000]">
              <Lock size={15} className="text-white" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-black">Student Privacy Control</h4>
              <p className="text-[11px] sm:text-xs text-gray-600 font-medium leading-tight mt-0.5">
                Want to keep your subject grades private? Sign in to your verified account and toggle <strong>"Privacy & Results Visibility"</strong> in your Profile anytime.
              </p>
            </div>
          </div>
          <button
            onClick={() => window.location.hash = 'profile'}
            className="px-3.5 py-2 bg-black hover:bg-gray-900 text-white font-black text-xs rounded-xl border border-black shrink-0 active:scale-95 transition-all shadow-[2px_2px_0px_0px_#801618] text-center"
          >
            Manage Privacy
          </button>
        </div>

        {/* Logged-In Student Quick Action Banner to Edit Marks */}
        {user && profile?.seat_no && (
          <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border-2 border-black rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#801618] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                <Pencil size={18} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-black text-black">
                    Your Verified Seat: <span className="font-mono text-[#801618]">{profile.seat_no}</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-400">
                    Logged In
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-gray-700 font-medium mt-0.5">
                  You can edit or update your subject marks directly in the results portal.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const mySeat = String(profile?.seat_no || '').toUpperCase().trim();
                if (!mySeat) return;
                const myStudent = data.find(s => String(s['Seat No'] || '').toUpperCase().trim() === mySeat);
                if (myStudent) {
                  const isHidden = (mySeat && hiddenSeatNos.has(mySeat)) || !!myStudent.is_hidden || profile?.show_results_publicly === false;
                  setSelectedStudentModal({ ...myStudent, is_hidden: isHidden });
                  setModalStartEditing(true);
                }
              }}
              className="px-4 py-2.5 bg-[#801618] hover:bg-[#9b1b1e] text-white font-black text-xs sm:text-sm rounded-xl border-2 border-black shrink-0 active:scale-95 transition-all shadow-[3px_3px_0px_0px_#000] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Pencil size={14} strokeWidth={2.5} />
              <span>Edit My Marks</span>
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted/50 w-5 h-5 group-focus-within:text-brand-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by Name or Seat Number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-surface/60 focus:bg-surface text-textMain outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium shadow-sm placeholder:text-textMuted/50 text-base sm:text-sm touch-manipulation"
            />
          </div>
          
          <div className="lg:w-[40%] flex flex-col">
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted/50 w-5 h-5 group-focus-within:text-brand-500 transition-colors z-10" />
              <select 
                value={selectedSubject}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedSubject(val);
                  if (val === ALL_SUBJECTS) {
                    setSortConfig({ key: 'Seat No', direction: 'asc' });
                  } else if (val.startsWith('sem-')) {
                    setSortConfig({ key: 'sem_gpa', direction: 'desc' });
                  } else {
                    setSortConfig({ key: val, direction: 'desc' });
                  }
                }}
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-border bg-surface/60 focus:bg-surface text-textMain outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium appearance-none shadow-sm cursor-pointer relative text-base sm:text-sm touch-manipulation"
              >
                <option value={ALL_SUBJECTS} className="font-bold text-brand-600">
                  All Courses (Semesters 1 – 3 Overview)
                </option>

                <optgroup label="Single Semester Views (All Marks for Semester)">
                  <option value="sem-1">Semester 1 (All 6 Courses + GPA)</option>
                  <option value="sem-2">Semester 2 (All 6 Courses + GPA)</option>
                  <option value="sem-3">Semester 3 (All 6 Courses — In Progress)</option>
                </optgroup>

                <optgroup label="1st Semester — Individual Courses">
                  {SUBJECTS_DATA.filter(s => s.semester === 1).map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                  ))}
                </optgroup>

                <optgroup label="2nd Semester — Individual Courses">
                  {SUBJECTS_DATA.filter(s => s.semester === 2).map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                  ))}
                </optgroup>

                <optgroup label="3rd Semester — Individual Courses (In Progress)">
                  {SUBJECTS_DATA.filter(s => s.semester === 3).map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted/50 w-5 h-5 pointer-events-none group-focus-within:text-brand-500 transition-colors" />
            </div>

            {currentSubjectDoc ? (
              <div className="mt-2.5 flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-red-50 to-amber-50 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={14} className="text-[#801618] shrink-0" strokeWidth={2.5} />
                  <span className="text-[11px] font-bold text-gray-800 truncate">
                    Official marksheet for {currentSubjectDoc.code}
                  </span>
                </div>
                <a
                  href={currentSubjectDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#801618] text-white rounded-lg text-[10px] font-black hover:bg-[#9b1b1e] border border-black shadow-[1px_1px_0px_0px_#000] shrink-0 transition-transform active:scale-95 cursor-pointer"
                >
                  <ExternalLink size={10} strokeWidth={2.5} />
                  <span>Open {currentSubjectDoc.fileType.toUpperCase()}</span>
                </a>
              </div>
            ) : isSemesterView && selectedSemNumber ? (
              <div className="mt-2.5 flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-rose-50 to-amber-50 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={14} className="text-[#801618] shrink-0" strokeWidth={2.5} />
                  <span className="text-[11px] font-bold text-gray-800 truncate">
                    Viewing all Semester {selectedSemNumber} courses & GPA
                  </span>
                </div>
                <button
                  onClick={() => setIsMarksheetsModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#801618] text-white rounded-lg text-[10px] font-black hover:bg-[#9b1b1e] border border-black shadow-[1px_1px_0px_0px_#000] shrink-0 transition-transform active:scale-95 cursor-pointer"
                >
                  <ExternalLink size={10} strokeWidth={2.5} />
                  <span>View Marksheets</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
        
        {searchQuery.trim() !== '' && (
          <div className="mb-4 text-xs font-semibold text-accent-600 bg-accent-500/10 inline-flex items-center px-3 py-1.5 rounded-lg border border-accent-500/20">
            Viewing all subjects for searched student
          </div>
        )}


        {/* Results View */}
        {sortedAndFilteredData.length === 1 && searchQuery.trim() !== '' ? (
          (() => {
            const single = sortedAndFilteredData[0];
            const sSeat = String(single['Seat No'] || '').toUpperCase().trim();
            const mySeat = String(profile?.seat_no || '').toUpperCase().trim();
            const isOwner = !!mySeat && sSeat === mySeat;
            const isHidden = (sSeat && hiddenSeatNos.has(sSeat)) || !!single.is_hidden || (isOwner && profile?.show_results_publicly === false);
            return (
              <StudentResultCard 
                student={{ ...single, is_hidden: isHidden }} 
                onPrefill={onPrefill} 
                onMarksUpdated={handleMarksUpdated}
              />
            );
          })()
        ) : (
          <div>
            {/* Mobile Horizontal Swipe Helper */}
            {!isSingleSubject && (
              <div className="sm:hidden flex items-center justify-between px-3 py-1.5 mb-2.5 text-[10px] font-bold text-gray-700 bg-amber-50 border border-amber-300/80 rounded-xl shadow-[1px_1px_0px_0px_#000]">
                <span className="flex items-center gap-1.5">
                  <span className="text-xs">👉</span> {isSemesterView ? `Swipe to view Semester ${selectedSemNumber} courses & GPA` : `Swipe sideways to view all courses`}
                </span>
                <span className="font-mono text-[9px] text-[#801618] font-black">
                  {sortedAndFilteredData.length} records
                </span>
              </div>
            )}

            <div 
              className="overflow-x-auto overflow-y-auto max-h-[65vh] sm:max-h-[75vh] rounded-2xl border-2 border-black bg-surface/40 shadow-inner relative overscroll-x-contain [-webkit-overflow-scrolling:touch] touch-pan-x"
              onScroll={(e) => setIsScrolled(e.currentTarget.scrollLeft > 5)}
            >
              <table className="w-full text-left border-separate border-spacing-0 whitespace-nowrap">
                <thead className="sticky top-0 z-40 shadow-sm">
                  <tr className="bg-surfaceHighlight shadow-sm">
                    <th className="hidden sm:table-cell p-2 sm:p-4 font-bold text-textMuted text-xs sm:text-sm min-w-[40px] sm:min-w-[60px] text-center bg-surfaceHighlight sticky top-0 z-20 border-b border-border">#</th>
                    <th 
                      className="hidden sm:table-cell p-2 sm:p-4 font-bold text-textMuted text-xs sm:text-sm min-w-[90px] sm:min-w-[140px] cursor-pointer hover:bg-border/30 transition-colors bg-surfaceHighlight sticky top-0 z-20 border-b border-border"
                      onClick={() => handleSort('Seat No')}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        Seat No {sortConfig?.key === 'Seat No' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-brand-500" /> : <ChevronDown size={14} className="text-brand-500" />)}
                      </div>
                    </th>
                    <th 
                      className="py-1.5 px-2 sm:p-4 font-bold text-textMuted text-[9.5px] sm:text-sm transition-colors w-[125px] min-w-[125px] max-w-[135px] sm:w-auto sm:min-w-[200px] sm:max-w-[280px] sticky top-0 left-0 z-30 bg-surfaceHighlight shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15),1px_0_0_rgba(var(--color-border),0.5)] border-b border-border"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 w-full">
                        <div className="flex items-center gap-1 cursor-pointer hover:text-brand-500 transition-colors" onClick={() => handleSort('Name')}>
                          <span>Name</span> {sortConfig?.key === 'Name' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-brand-500" /> : <ChevronDown size={12} className="text-brand-500" />)}
                        </div>
                        <div className="sm:hidden flex items-center gap-1 font-mono text-[8px] font-normal cursor-pointer hover:text-brand-500 transition-colors" onClick={() => handleSort('Seat No')}>
                          <span>Seat</span> {sortConfig?.key === 'Seat No' && (sortConfig.direction === 'asc' ? <ChevronUp size={10} className="text-brand-500" /> : <ChevronDown size={10} className="text-brand-500" />)}
                        </div>
                      </div>
                    </th>
                    {isSingleSubject ? (
                      <th 
                        className="p-1.5 sm:p-4 font-bold text-brand-600 text-xs sm:text-sm cursor-pointer hover:bg-brand-500/20 transition-colors bg-brand-500/10 sticky top-0 z-10 border-b border-brand-500/20"
                        onClick={() => handleSort(selectedSubject)}
                      >
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <span className="text-[7.5px] sm:text-[9px] font-bold px-1 py-0.5 sm:px-1.5 rounded bg-brand-500/25 text-brand-600 uppercase tracking-wider mr-1 sm:mr-2">
                            Sem {SUBJECTS_DATA.find(s => s.id === selectedSubject)?.semester}
                          </span>
                          <span className="max-w-[100px] sm:max-w-none truncate" title={SUBJECTS_DATA.find(s => s.id === selectedSubject)?.name}>
                            {SUBJECTS_DATA.find(s => s.id === selectedSubject)?.name}
                          </span> Marks 
                          {sortConfig?.key === selectedSubject && (sortConfig.direction === 'asc' ? <ChevronUp size={13} className="text-brand-600" /> : <ChevronDown size={13} className="text-brand-600" />)}
                        </div>
                      </th>
                    ) : (
                      <>
                        {displayedSubjects.map(sub => {
                          const semColors: Record<number, string> = {
                            1: 'bg-blue-50 text-blue-700 border-blue-200',
                            2: 'bg-green-50 text-green-700 border-green-200',
                            3: 'bg-amber-50 text-amber-700 border-amber-200',
                          };
                          const semBadge: Record<number, string> = {
                            1: 'bg-blue-100 text-blue-700',
                            2: 'bg-green-100 text-green-700',
                            3: 'bg-amber-100 text-amber-700',
                          };
                          const colClass = semColors[sub.semester] || 'bg-surface text-textMuted border-border';
                          const badgeClass = semBadge[sub.semester] || 'bg-surface text-textMuted';
                          return (
                            <th
                              key={sub.id}
                              className={`p-1 px-1.5 sm:p-4 font-bold text-[9.5px] sm:text-sm cursor-pointer hover:opacity-80 transition-opacity border-l border-b ${colClass} sticky top-0 z-10 min-w-[56px] sm:min-w-[85px]`}
                              onClick={() => handleSort(sub.id)}
                            >
                              <div className="flex flex-col items-end gap-0.5 sm:gap-1">
                                <span className={`text-[7.5px] sm:text-[9px] font-bold px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded ${badgeClass} uppercase tracking-wider`}>
                                  Sem {sub.semester}{sub.semester === 3 ? ' ⚠' : ''}
                                </span>
                                <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-xs font-semibold uppercase tracking-wider">
                                  {sub.code}
                                  {sortConfig?.key === sub.id && (sortConfig.direction === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                                </div>
                                <div className="text-[8.5px] sm:text-xs max-w-[60px] sm:max-w-none truncate" title={sub.name}>{sub.name}</div>
                              </div>
                            </th>
                          );
                        })}
                        {isSemesterView && selectedSemNumber && (
                          <th
                            className="p-1 px-2 sm:p-4 font-black text-[9.5px] sm:text-sm cursor-pointer hover:opacity-90 transition-opacity border-l-2 border-b border-black bg-[#801618] text-white sticky top-0 z-10 min-w-[70px] sm:min-w-[95px] text-right"
                            onClick={() => handleSort('sem_gpa')}
                            title={`Sort by Semester ${selectedSemNumber} GPA`}
                          >
                            <div className="flex flex-col items-end gap-0.5 sm:gap-1">
                              <span className="text-[7.5px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/20 text-white uppercase tracking-wider">
                                {selectedSemNumber === 3 ? 'Tentative' : 'Official'}
                              </span>
                              <div className="flex items-center gap-1 text-[9.5px] sm:text-xs font-black uppercase tracking-wider text-white">
                                <span>Sem {selectedSemNumber} GPA</span>
                                {sortConfig?.key === 'sem_gpa' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-white" /> : <ChevronDown size={12} className="text-white" />)}
                              </div>
                            </div>
                          </th>
                        )}
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={totalColSpan} className="p-12 text-center text-textMuted font-medium">
                        <div className="animate-spin w-10 h-10 border-4 border-brand-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                        Loading official results...
                      </td>
                    </tr>
                  ) : sortedAndFilteredData.length === 0 ? (
                    <tr>
                      <td colSpan={totalColSpan} className="p-12 text-center text-textMuted font-medium">
                        <div className="bg-surface border border-border rounded-xl p-6 inline-block">
                          No matching results found for "{searchQuery}".
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedAndFilteredData.map((student, index) => {
                      const seatNo = String(student['Seat No'] || '').toUpperCase().trim();
                      const mySeatNo = String(profile?.seat_no || '').toUpperCase().trim();
                      const isMyProfileHidden = profile?.show_results_publicly === false;
                      const isHidden = (seatNo && hiddenSeatNos.has(seatNo)) || !!student.is_hidden || (seatNo === mySeatNo && isMyProfileHidden);
                      const isOwner = !!mySeatNo && seatNo === mySeatNo;
                      const canViewMarks = !isHidden || isOwner || (!!profile?.is_admin && showAdminPrivateRecords);

                      return (
                        <tr
                          key={student['Seat No']}
                          onTouchStart={handleTouchStart}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          onClick={() => {
                            if (isTouchDragging.current) return;
                            setSelectedStudentModal({ ...student, is_hidden: isHidden });
                            setModalStartEditing(false);
                          }}
                          className={`transition-colors group cursor-pointer animate-in fade-in duration-200 ${
                            isOwner 
                              ? 'bg-amber-50/80 hover:bg-amber-100/60 border-l-4 border-l-[#801618]' 
                              : 'hover:bg-rose-50/40'
                          }`}
                          title="Click to view full student results & load into calculator"
                          style={{ animationDelay: `${Math.min(index * 15, 400)}ms` }}
                        >
                          <td className={`hidden sm:table-cell p-2 sm:p-4 text-center font-medium text-xs sm:text-sm min-w-[40px] sm:min-w-[60px] group-hover:bg-surfaceHighlight transition-colors duration-150 border-b border-border/50 ${isOwner ? 'bg-amber-50 font-bold text-[#801618]' : 'bg-surface text-textMuted'}`}>
                            {index + 1}
                          </td>
                          <td className={`hidden sm:table-cell p-2 sm:p-4 font-mono text-xs sm:text-sm font-bold min-w-[90px] sm:min-w-[140px] group-hover:bg-surfaceHighlight transition-colors duration-150 border-b border-border/50 ${isOwner ? 'bg-amber-50 text-[#801618]' : 'bg-surface text-textMuted'}`}>
                            {student['Seat No']}
                          </td>
                          <td className={`py-1.5 px-2 sm:p-4 text-[10px] sm:text-xs text-textMain font-semibold w-[125px] min-w-[125px] max-w-[135px] sm:w-auto sm:min-w-[200px] sm:max-w-[280px] sticky left-0 z-20 group-hover:bg-surfaceHighlight transition-colors duration-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15),1px_0_0_rgba(var(--color-border),0.5)] border-b border-border/50 ${isOwner ? 'bg-amber-50' : 'bg-surface'}`}>
                            <div className="flex items-center justify-between gap-1 w-full h-full">
                              <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                                <span className="truncate leading-tight font-bold group-hover:text-[#801618] transition-colors flex items-center gap-1 text-[9.5px] sm:text-xs" title={student['Name']}>
                                  <span className="truncate">{isScrolled ? (displayNames.get(student['Seat No']) || student['Name']) : student['Name']}</span>
                                  {isOwner && (
                                    <span className="text-[7.5px] sm:text-[9px] font-black uppercase tracking-wider px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded bg-[#801618] text-white border border-black shadow-[1px_1px_0px_0px_#000] shrink-0">
                                      You
                                    </span>
                                  )}
                                  {isHidden && (
                                    <span className={`text-[7.5px] sm:text-[9px] font-black uppercase tracking-wider px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded border shrink-0 flex items-center gap-0.5 ${isOwner ? 'bg-red-100 text-red-800 border-red-400' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                                      <Lock size={8} />
                                      <span className="hidden sm:inline">{isOwner ? 'Private' : 'Hidden'}</span>
                                    </span>
                                  )}
                                </span>

                                <span className="sm:hidden font-mono text-[8px] text-textMuted mt-0.5 leading-none truncate">
                                  {student['Seat No']}
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick({ ...student, is_hidden: isHidden }, isOwner || !!profile?.is_admin);
                                }}
                                title={isOwner ? "Edit your marks" : `Open and load marks for ${student['Name']}`}
                                className={`${isOwner ? 'opacity-100 flex' : !isScrolled ? 'opacity-0 group-hover:opacity-100' : 'hidden'} transition-opacity p-0.5 sm:p-1 px-1 sm:px-1.5 rounded bg-[#801618] text-white border border-black sm:border-2 shrink-0 ml-0.5 shadow-[1px_1px_0px_0px_#000] active:scale-95 items-center gap-0.5 text-[8.5px] sm:text-[10px] font-black`}
                              >
                                <Pencil size={9} strokeWidth={2.5} className="sm:w-[11px] sm:h-[11px]" />
                                {isOwner && <span className="hidden sm:inline">Edit</span>}
                              </button>
                            </div>
                          </td>
                          
                          {isSingleSubject ? (
                            <td className="p-1 px-1.5 sm:p-4 text-right bg-brand-500/5 group-hover:bg-brand-500/10 transition-colors border-b border-border/30 min-w-[70px] sm:min-w-[100px]">
                              {(() => {
                                const mark = student[selectedSubject];
                                const isMissing = mark === undefined || mark === null || mark === '' || (typeof mark === 'string' && isNaN(Number(mark)));
                                const unannounced = mark === "Results Unannounced" || mark === undefined || mark === null || mark === '';
                                return !canViewMarks ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[9.5px] sm:text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                    <Lock size={10} />
                                    <span>Marks Hidden</span>
                                  </span>
                                ) : isMissing ? (
                                  <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[9.5px] sm:text-xs font-bold bg-surfaceHighlight text-gray-500 border border-border">
                                    {unannounced ? "Results Unannounced" : mark}
                                  </span>
                                ) : (
                                  <span className={`inline-flex items-center px-2 py-0.5 sm:px-3.5 sm:py-1.5 rounded-lg text-xs sm:text-sm border shadow-sm ${getMarkColor(Number(mark))} ${Number(mark) >= 80 ? 'bg-green-500/10 border-green-500/30' : Number(mark) < 25 ? 'bg-red-500/10 border-red-500/30' : 'bg-surfaceHighlight border-border'}`}>
                                    {mark}
                                  </span>
                                );
                              })()}
                            </td>
                          ) : (
                            <>
                              {displayedSubjects.map(sub => {
                                const mark = student[sub.id];
                                const isMissing = mark === undefined || mark === null || mark === '' || (typeof mark === 'string' && isNaN(Number(mark)));
                                const unannounced = mark === "Results Unannounced" || mark === undefined || mark === null || mark === '';
                                return (
                                  <td key={sub.id} className={`p-1 px-1.5 sm:p-4 text-right border-l border-b border-border/30 min-w-[56px] sm:min-w-[85px] ${!canViewMarks ? 'bg-gray-50/60' : ''}`}>
                                    {!canViewMarks ? (
                                      <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded text-[7.5px] sm:text-[9.5px] font-mono font-bold bg-gray-100 text-gray-500 border border-gray-200" title="Marks hidden by student">
                                        <Lock size={8} className="opacity-70" />
                                        <span>Hidden</span>
                                      </span>
                                    ) : isMissing ? (
                                      <span className="inline-flex items-center px-1 py-0.5 rounded text-[7.5px] sm:text-[10px] font-bold bg-surfaceHighlight text-gray-500 border border-border/40">
                                        {unannounced ? "Unannounced" : "Missing"}
                                      </span>
                                    ) : (
                                      <span className={`inline-flex items-center text-[10.5px] sm:text-sm font-semibold ${getMarkColor(Number(mark))}`}>
                                        {mark}
                                      </span>
                                    )}
                                  </td>
                                );
                              })}
                              {isSemesterView && selectedSemNumber && (
                                <td className="p-1 px-2 sm:p-4 text-right border-l-2 border-b border-black/20 bg-rose-50/40 group-hover:bg-rose-100/50 transition-colors min-w-[70px] sm:min-w-[95px]">
                                  {!canViewMarks ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                      <Lock size={9} /> Hidden
                                    </span>
                                  ) : (() => {
                                    const gpaVal = getStudentSemGpa(student, selectedSemNumber);
                                    if (gpaVal === null) {
                                      return <span className="text-[10px] sm:text-xs text-textMuted font-mono">—</span>;
                                    }
                                    const hasMissing = countMissingInSem(student, selectedSemNumber) > 0;
                                    return (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs sm:text-sm font-black font-mono bg-[#801618] text-white border border-black shadow-[1px_1px_0px_0px_#000]">
                                        {gpaVal.toFixed(2)}{hasMissing ? '*' : ''}
                                      </span>
                                    );
                                  })()}
                                </td>
                              )}
                            </>
                          )}

                        </tr>
                      )
                    })

                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── STUDENT RESULT CARD MODAL WITH LOAD INTO CALCULATOR ── */}
      <AnimatePresence>
        {selectedStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedStudentModal(null);
                setModalStartEditing(false);
              }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto my-auto"
            >
              <div className="relative">
                <button
                  onClick={() => {
                    setSelectedStudentModal(null);
                    setModalStartEditing(false);
                  }}
                  className="absolute -top-3 -right-3 z-30 p-2 bg-[#801618] hover:bg-[#9b1b1e] text-white rounded-full border-2 border-black font-black text-xs shadow-[2px_2px_0px_0px_#000] active:scale-95"
                  aria-label="Close student card"
                >
                  <X size={16} />
                </button>
                <StudentResultCard
                  student={selectedStudentModal}
                  initialIsEditing={modalStartEditing}
                  onMarksUpdated={handleMarksUpdated}
                  onPrefill={(s1, s2, s3) => {
                    setSelectedStudentModal(null);
                    setModalStartEditing(false);
                    if (onPrefill) onPrefill(s1, s2, s3);
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Marksheets Modal */}
      <OfficialMarksheetsModal
        isOpen={isMarksheetsModalOpen}
        onClose={() => setIsMarksheetsModalOpen(false)}
      />
    </section>
  );
};

