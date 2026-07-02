import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, FileText, Filter, AlertTriangle, Edit2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { StudentResultCard, getMarkColor } from './StudentResultCard';

// Format name helper removed in favor of smart truncation logic in component


const SUBJECTS_DATA = [
  // 1st Semester
  { id: "cs351", code: "CS-351", name: "Programming Fundamentals", teacher: "Mr. Badr Sami", semester: 1 },
  { id: "cs353", code: "CS-353", name: "Intro to ICT", teacher: "Mr. Zaeem Tariq", semester: 1 },
  { id: "cs355", code: "CS-355", name: "Calculus & Analytical Geo", teacher: "Mr. M. Aslam", semester: 1 },
  { id: "cs357", code: "CS-357", name: "Applied Physics", teacher: "Ms. Farheen Shafiq", semester: 1 },
  { id: "cs359", code: "CS-359", name: "Functional English", teacher: "Ms. Ayesha Khwaja", semester: 1 },
  { id: "cs361", code: "CS-361", name: "Islamic Studies", teacher: "Dr. Waqar Hussain", semester: 1 },
  
  // 2nd Semester
  { id: "cs352", code: "CS-352", name: "Object Oriented Concepts", teacher: "Dr. Humera Tariq", semester: 2 },
  { id: "cs354", code: "CS-354", name: "Digital Logic Design", teacher: "Mr. Bari Ahmed", semester: 2 },
  { id: "cs356", code: "CS-356", name: "Linear Algebra", teacher: "Mr. Muhammad Huzaifa", semester: 2 },
  { id: "cs358", code: "CS-358", name: "Discrete Structures", teacher: "Ms. Maryam Feroze", semester: 2 },
  { id: "cs360", code: "CS-360", name: "Communication Skills", teacher: "Mr. Sami-ul-Huda", semester: 2 },
  { id: "cs362", code: "CS-362", name: "Ideology of Pakistan", teacher: "Dr. Mehrunnissa", semester: 2 }
];

const ALL_SUBJECTS = "All Subjects Overview";

interface ResultsPortalProps {
  onPrefill?: (s1: Record<string, number | ''>, s2: Record<string, number | ''>) => void;
}

export const ResultsPortal = ({ onPrefill }: ResultsPortalProps) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(ALL_SUBJECTS);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'Seat No', direction: 'asc' });
  const [isScrolled, setIsScrolled] = useState(false);
  const [autoOpenReportFor, setAutoOpenReportFor] = useState<string | null>(null);

  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    if (typeof window !== 'undefined') {
      const acceptedTime = localStorage.getItem('disclaimer_accepted');
      if (acceptedTime && (Date.now() - parseInt(acceptedTime) < 10 * 60 * 1000)) {
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
        const res = await fetch('/api/results');
        if (res.ok) {
          const json = await res.json();
          if (json.length > 0) {
            const formatted = json.map((row: any) => {
              const mappedRow: any = {
                'Seat No': row.seat_no,
                'Name': row.name,
              };
              
              SUBJECTS_DATA.forEach(sub => {
                if (row[sub.id] !== undefined) {
                  mappedRow[sub.id] = row[sub.id];
                }
              });
              
              return mappedRow;
            });
            setData(formatted);
            setIsLoading(false);
            return;
          }
        }
        setData([]);
        setError("No data found or database connection issue.");
      } catch (e) {
        console.error("Failed to fetch from API.", e);
        setError("Could not connect to the live database.");
        setData([]);
      }
      setIsLoading(false);
    };

    fetchResults();
  }, []);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      // Toggle back to asc or clear sort if needed, here we just toggle between asc/desc
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredData = useMemo(() => {
    let filtered = [...data];

    // Filter by Search Query
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
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        // If we are sorting by a text column, don't treat text as "Missing Marks"
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
        } else {
            // String comparison (for names/seats)
            const aStr = String(aVal || '').toLowerCase();
            const bStr = String(bVal || '').toLowerCase();
            if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        }
        
        return 0;
      });
    }

    return filtered;
  }, [data, searchQuery, sortConfig]);

  const displayNames = useMemo(() => {
    const formattedMap = new Map<string, string>();
    const abbreviatedCounts = new Map<string, number>();

    // First pass: abbreviate SYED MUHAMMAD and MUHAMMAD, and count truncated versions
    data.forEach(student => {
      let fullName = (student['Name'] || '').trim();
      let scrolledName = fullName;
      
      if (fullName.startsWith('SYED MUHAMMAD ')) {
        scrolledName = 'S.M ' + fullName.substring('SYED MUHAMMAD '.length);
      } else if (fullName.startsWith('MUHAMMAD ')) {
        scrolledName = 'M. ' + fullName.substring('MUHAMMAD '.length);
      }

      const parts = scrolledName.split(/\s+/);
      let truncated = scrolledName;
      if (parts.length > 3) {
        truncated = parts.slice(0, 3).join(' ');
      }
      
      abbreviatedCounts.set(truncated, (abbreviatedCounts.get(truncated) || 0) + 1);
      formattedMap.set(student['Seat No'], scrolledName);
    });

    // Second pass: if the cleanly truncated 3-word version is unique, use it. Otherwise, use full abbreviated name.
    data.forEach(student => {
      const scrolledName = formattedMap.get(student['Seat No'])!;
      const parts = scrolledName.split(/\s+/);
      let truncated = scrolledName;
      if (parts.length > 3) {
        truncated = parts.slice(0, 3).join(' ');
      }

      if ((abbreviatedCounts.get(truncated) || 0) === 1) {
        formattedMap.set(student['Seat No'], truncated);
      } else {
        formattedMap.set(student['Seat No'], scrolledName);
      }
    });

    return formattedMap;
  }, [data]);

  // When searching, force effective selected subject to ALL_SUBJECTS to show all marks
  const effectiveSubject = searchQuery.trim() !== '' ? ALL_SUBJECTS : selectedSubject;

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
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-accent-500 tracking-tight flex items-center gap-3 mb-2 pb-1">
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
          <p className="text-textMuted font-medium max-w-xl text-sm sm:text-base">
            Browse and filter academic results
          </p>
          {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
        </div>
      </div>

      <div className="glass rounded-[2rem] p-4 sm:p-6 md:p-8 relative overflow-hidden shadow-xl">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted/50 w-5 h-5 group-focus-within:text-brand-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by Name or Seat Number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-surface/60 focus:bg-surface text-textMain outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium shadow-sm placeholder:text-textMuted/50"
            />
          </div>
          
          <div className="lg:w-[40%] relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted/50 w-5 h-5 group-focus-within:text-brand-500 transition-colors z-10" />
            <select 
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSortConfig({ key: e.target.value === ALL_SUBJECTS ? 'Seat No' : 'Name', direction: 'asc' });
              }}
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-border bg-surface/60 focus:bg-surface text-textMain outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium appearance-none shadow-sm cursor-pointer relative"
              disabled={searchQuery.trim() !== ''}
            >
              <option value={ALL_SUBJECTS} className="font-bold text-brand-600">{ALL_SUBJECTS}</option>
              <optgroup label="1st Semester">
                {SUBJECTS_DATA.filter(s => s.semester === 1).map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                ))}
              </optgroup>
              <optgroup label="2nd Semester">
                {SUBJECTS_DATA.filter(s => s.semester === 2).map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted/50 w-5 h-5 pointer-events-none group-focus-within:text-brand-500 transition-colors" />
          </div>
        </div>
        
        {searchQuery.trim() !== '' && (
          <div className="mb-4 text-xs font-semibold text-accent-600 bg-accent-500/10 inline-flex items-center px-3 py-1.5 rounded-lg border border-accent-500/20">
            Viewing all subjects for searched student
          </div>
        )}

        {/* Results View */}
        {sortedAndFilteredData.length === 1 && searchQuery.trim() !== '' ? (
          <StudentResultCard 
            student={sortedAndFilteredData[0]} 
            onPrefill={onPrefill} 
            autoOpenReport={autoOpenReportFor === sortedAndFilteredData[0]['Seat No']}
          />
        ) : (
          <div 
            className="overflow-x-auto overflow-y-auto max-h-[75vh] rounded-2xl border border-border bg-surface/40 shadow-inner relative overscroll-contain snap-x snap-mandatory"
            onScroll={(e) => setIsScrolled(e.currentTarget.scrollLeft > 5)}
          >
            <table className="w-full text-left border-separate border-spacing-0 whitespace-nowrap">
              <thead className="sticky top-0 z-40 shadow-sm">
                <tr className="bg-surfaceHighlight shadow-sm">
                  <th className="hidden sm:table-cell p-2 sm:p-4 font-bold text-textMuted text-xs sm:text-sm min-w-[40px] sm:min-w-[60px] text-center bg-surfaceHighlight sticky top-0 z-20 snap-start border-b border-border">#</th>
                  <th 
                    className="hidden sm:table-cell p-2 sm:p-4 font-bold text-textMuted text-xs sm:text-sm min-w-[90px] sm:min-w-[140px] cursor-pointer hover:bg-border/30 transition-colors bg-surfaceHighlight sticky top-0 z-20 snap-start border-b border-border"
                    onClick={() => handleSort('Seat No')}
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      Seat No {sortConfig?.key === 'Seat No' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-brand-500" /> : <ChevronDown size={14} className="text-brand-500" />)}
                    </div>
                  </th>
                  <th 
                    className="p-2 sm:p-4 font-bold text-textMuted text-[10px] sm:text-sm transition-colors min-w-[180px] max-w-[180px] sm:min-w-[200px] sm:max-w-none sticky top-0 left-0 z-30 bg-surfaceHighlight shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15),1px_0_0_rgba(var(--color-border),0.5)] snap-start border-b border-border"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-brand-500 transition-colors" onClick={() => handleSort('Name')}>
                        Name {sortConfig?.key === 'Name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-brand-500" /> : <ChevronDown size={14} className="text-brand-500" />)}
                      </div>
                      <div className="sm:hidden flex items-center gap-1 font-mono text-[9px] font-normal cursor-pointer hover:text-brand-500 transition-colors" onClick={() => handleSort('Seat No')}>
                        Seat No {sortConfig?.key === 'Seat No' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-brand-500" /> : <ChevronDown size={12} className="text-brand-500" />)}
                      </div>
                    </div>
                  </th>
                  {effectiveSubject === ALL_SUBJECTS ? (
                    SUBJECTS_DATA.map(sub => (
                      <th 
                        key={sub.id}
                        className={`p-1 px-1.5 sm:p-4 font-bold text-textMuted text-[10px] sm:text-sm cursor-pointer hover:bg-border/30 transition-colors border-l border-b border-border/50 bg-brand-500/5 sticky top-0 z-10 snap-start`}
                        onClick={() => handleSort(sub.id)}
                      >
                        <div className="flex flex-col items-end gap-0.5 sm:gap-1">
                          <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 uppercase tracking-wider">
                            Sem {sub.semester}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-textMuted/70 font-semibold uppercase tracking-wider">
                            {sub.code}
                            {sortConfig?.key === sub.id && (sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-brand-500" /> : <ChevronDown size={12} className="text-brand-500" />)}
                          </div>
                          <div className="text-[10px] sm:text-xs max-w-[70px] sm:max-w-none truncate" title={sub.name}>{sub.name}</div>
                        </div>
                      </th>
                    ))
                  ) : (
                    <th 
                      className="p-2 sm:p-4 font-bold text-brand-600 text-xs sm:text-sm cursor-pointer hover:bg-brand-500/20 transition-colors bg-brand-500/10 sticky top-0 z-10 snap-start border-b border-brand-500/20"
                      onClick={() => handleSort(effectiveSubject)}
                    >
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-500/25 text-brand-600 uppercase tracking-wider mr-1 sm:mr-2">
                          Sem {SUBJECTS_DATA.find(s => s.id === effectiveSubject)?.semester}
                        </span>
                        <span className="max-w-[100px] sm:max-w-none truncate" title={SUBJECTS_DATA.find(s => s.id === effectiveSubject)?.name}>{SUBJECTS_DATA.find(s => s.id === effectiveSubject)?.name}</span> Marks 
                        {sortConfig?.key === effectiveSubject && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-brand-600" /> : <ChevronDown size={14} className="text-brand-600" />)}
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={effectiveSubject === ALL_SUBJECTS ? SUBJECTS_DATA.length + 3 : 4} className="p-12 text-center text-textMuted font-medium">
                      <div className="animate-spin w-10 h-10 border-4 border-brand-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                      Loading official results...
                    </td>
                  </tr>
                ) : sortedAndFilteredData.length === 0 ? (
                  <tr>
                    <td colSpan={effectiveSubject === ALL_SUBJECTS ? SUBJECTS_DATA.length + 3 : 4} className="p-12 text-center text-textMuted font-medium">
                      <div className="bg-surface border border-border rounded-xl p-6 inline-block">
                        No matching results found for "{searchQuery}".
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedAndFilteredData.map((student, index) => {
                    return (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.03, 0.5), duration: 0.3 }}
                        key={student['Seat No']} 
                        className="hover:bg-brand-500/5 transition-colors group"
                      >
                        <td className="hidden sm:table-cell p-2 sm:p-4 text-center text-textMuted font-medium text-xs sm:text-sm min-w-[40px] sm:min-w-[60px] bg-surface group-hover:bg-surfaceHighlight transition-colors duration-150 snap-start border-b border-border/50">
                          {index + 1}
                        </td>
                        <td className="hidden sm:table-cell p-2 sm:p-4 font-mono text-xs sm:text-sm text-textMuted font-bold min-w-[90px] sm:min-w-[140px] bg-surface group-hover:bg-surfaceHighlight transition-colors duration-150 snap-start border-b border-border/50">
                          {student['Seat No']}
                        </td>
                        <td className="p-2 sm:p-4 text-[11px] sm:text-xs text-textMain font-semibold min-w-[180px] max-w-[180px] sm:max-w-[300px] sm:min-w-[200px] sticky left-0 z-20 bg-surface group-hover:bg-surfaceHighlight transition-colors duration-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15),1px_0_0_rgba(var(--color-border),0.5)] snap-start border-b border-border/50">
                          <div className="flex items-center justify-between gap-1 w-full h-full">
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="truncate leading-tight" title={student['Name']}>
                                {isScrolled ? (displayNames.get(student['Seat No']) || student['Name']) : student['Name']}
                              </span>
                              <span className="sm:hidden font-mono text-[9px] text-textMuted mt-0.5 leading-tight">
                                {student['Seat No']}
                              </span>
                            </div>
                            <button 
                              onClick={() => {
                                setAutoOpenReportFor(student['Seat No']);
                                setSearchQuery(student['Seat No']);
                              }}
                              className="shrink-0 text-textMuted/40 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-surfaceHighlight"
                              title="Report Issue"
                            >
                              <Edit2 size={12} />
                            </button>
                          </div>
                        </td>
                        
                        {effectiveSubject === ALL_SUBJECTS ? (
                          SUBJECTS_DATA.map(sub => {
                            const mark = student[sub.id];
                            const isMissing = typeof mark === 'string' && isNaN(Number(mark));
                            return (
                              <td key={sub.id} className="p-1 px-1.5 sm:p-4 text-right border-l border-b border-border/30 snap-start">
                                {isMissing ? (
                                  <span className="inline-flex items-center px-1 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-surfaceHighlight text-textMuted">
                                    {mark === "Marks Missing" ? "Missing" : "Unannounced"}
                                  </span>
                                ) : (
                                  <span className={`inline-flex items-center text-xs sm:text-sm ${getMarkColor(Number(mark))}`}>
                                    {mark}
                                  </span>
                                )}
                              </td>
                            );
                          })
                        ) : (
                          <td className="p-1 px-1.5 sm:p-4 text-right bg-brand-500/5 group-hover:bg-brand-500/10 transition-colors snap-start border-b border-border/30">
                            {(() => {
                              const mark = student[effectiveSubject];
                              const isMissing = typeof mark === 'string' && isNaN(Number(mark));
                              return isMissing ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-surfaceHighlight text-textMuted border border-border">
                                  {mark}
                                </span>
                              ) : (
                                <span className={`inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm border shadow-sm ${getMarkColor(Number(mark))} ${Number(mark) >= 80 ? 'bg-green-500/10 border-green-500/30' : Number(mark) < 25 ? 'bg-red-500/10 border-red-500/30' : 'bg-surfaceHighlight border-border'}`}>
                                  {mark}
                                </span>
                              );
                            })()}
                          </td>
                        )}
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
