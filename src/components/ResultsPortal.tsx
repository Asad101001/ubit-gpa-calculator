import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, FileText, Filter, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

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

export const ResultsPortal = () => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(ALL_SUBJECTS);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'Seat No', direction: 'asc' });

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
        (item['Seat No'] && item['Seat No'].toLowerCase().includes(q)) || 
        (item['Name'] && item['Name'].toLowerCase().includes(q))
      );
    }

    // Sort Data
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        // Handle missing/unannounced strings
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

  // When searching, force effective selected subject to ALL_SUBJECTS to show all marks
  const effectiveSubject = searchQuery.trim() !== '' ? ALL_SUBJECTS : selectedSubject;

  return (
    <section id="results" className="pt-8 sm:pt-16 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Data Inaccuracy Disclaimer */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-left shadow-sm">
          <AlertTriangle className="text-amber-500 w-6 h-6 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-amber-800 font-bold text-sm sm:text-base">Disclaimer regarding Results Data</h3>
            <p className="text-amber-700/90 text-xs sm:text-sm font-medium leading-relaxed">
              The academic results and marks displayed or utilized in this portal have been extracted via automated processes and manual data entry. 
              <strong> This data may be incomplete, unannounced, or contain inaccuracies. </strong>
              Always refer to your official transcript from the university administration for the final, authoritative results.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3 mb-2">
            <FileText className="text-emerald-500 w-8 h-8" />
            Official Results Portal
          </h2>
          <p className="text-slate-500 font-medium max-w-xl text-sm sm:text-base">
            Browse and filter academic results for Semester 1.
          </p>
          {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
        </div>
      </div>

      <div className="glass rounded-[2rem] p-4 sm:p-6 md:p-8 border-slate-300 relative overflow-hidden shadow-xl">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by Name or Seat Number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 bg-white/60 focus:bg-white text-slate-800 outline-none focus:ring-4 focus:ring-emerald-400/20 focus:border-emerald-400 transition-all font-medium shadow-sm"
            />
          </div>
          
          <div className="lg:w-[40%] relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors z-10" />
            <select 
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSortConfig({ key: e.target.value === ALL_SUBJECTS ? 'Seat No' : 'Name', direction: 'asc' });
              }}
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-300 bg-white/60 focus:bg-white text-slate-800 outline-none focus:ring-4 focus:ring-emerald-400/20 focus:border-emerald-400 transition-all font-medium appearance-none shadow-sm cursor-pointer relative"
              disabled={searchQuery.trim() !== ''}
            >
              <option value={ALL_SUBJECTS} className="font-bold text-emerald-700">{ALL_SUBJECTS}</option>
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
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-focus-within:text-emerald-500 transition-colors" />
          </div>
        </div>
        
        {searchQuery.trim() !== '' && (
          <div className="mb-4 text-xs font-semibold text-emerald-600 bg-emerald-50 inline-flex items-center px-3 py-1.5 rounded-lg border border-emerald-200">
            Viewing all subjects for searched student
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/40 shadow-inner">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              {effectiveSubject === ALL_SUBJECTS && (
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th colSpan={3} className="p-2 border-r border-slate-200 bg-white"></th>
                  <th colSpan={6} className="p-2 text-center text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/50 border-r border-slate-200 border-t-[3px] border-t-emerald-400">
                    1st Semester
                  </th>
                  <th colSpan={6} className="p-2 text-center text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-100/50 border-t-[3px] border-t-blue-400">
                    2nd Semester
                  </th>
                </tr>
              )}
              <tr className="bg-slate-100/80 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600 text-sm w-16 text-center">#</th>
                <th 
                  className="p-4 font-bold text-slate-600 text-sm w-32 cursor-pointer hover:bg-slate-200/80 transition-colors"
                  onClick={() => handleSort('Seat No')}
                >
                  <div className="flex items-center gap-2">
                    Seat No {sortConfig?.key === 'Seat No' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-emerald-500" /> : <ChevronDown size={14} className="text-emerald-500" />)}
                  </div>
                </th>
                <th 
                  className="p-4 font-bold text-slate-600 text-sm cursor-pointer hover:bg-slate-200/80 transition-colors min-w-[200px]"
                  onClick={() => handleSort('Name')}
                >
                  <div className="flex items-center gap-2">
                    Name {sortConfig?.key === 'Name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-emerald-500" /> : <ChevronDown size={14} className="text-emerald-500" />)}
                  </div>
                </th>
                
                {effectiveSubject === ALL_SUBJECTS ? (
                  SUBJECTS_DATA.map(sub => (
                    <th 
                      key={sub.id}
                      className={`p-4 font-bold text-slate-600 text-sm cursor-pointer hover:bg-slate-200/80 transition-colors border-l border-slate-200/50 ${sub.semester === 1 ? 'border-t border-t-emerald-200 bg-emerald-50/20' : 'border-t border-t-blue-200 bg-blue-50/20'}`}
                      onClick={() => handleSort(sub.id)}
                    >
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                          {sub.code}
                          {sortConfig?.key === sub.id && (sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-emerald-500" /> : <ChevronDown size={12} className="text-emerald-500" />)}
                        </div>
                        <div className="text-xs">{sub.name}</div>
                      </div>
                    </th>
                  ))
                ) : (
                  <th 
                    className="p-4 font-bold text-emerald-700 text-sm cursor-pointer hover:bg-emerald-100/50 transition-colors bg-emerald-50/50"
                    onClick={() => handleSort(effectiveSubject)}
                  >
                    <div className="flex items-center justify-end gap-2">
                      {SUBJECTS_DATA.find(s => s.id === effectiveSubject)?.name} Marks 
                      {sortConfig?.key === effectiveSubject && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-emerald-600" /> : <ChevronDown size={14} className="text-emerald-600" />)}
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={effectiveSubject === ALL_SUBJECTS ? SUBJECTS_DATA.length + 3 : 4} className="p-12 text-center text-slate-500 font-medium">
                    <div className="animate-spin w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    Loading official results...
                  </td>
                </tr>
              ) : sortedAndFilteredData.length === 0 ? (
                <tr>
                  <td colSpan={effectiveSubject === ALL_SUBJECTS ? SUBJECTS_DATA.length + 3 : 4} className="p-12 text-center text-slate-500 font-medium">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 inline-block">
                      No matching results found for "{searchQuery}".
                    </div>
                  </td>
                </tr>
              ) : (
                sortedAndFilteredData.map((student, index) => {
                  return (
                    <motion.tr 
                      key={student['Seat No']} 
                      className="border-b border-slate-100/80 last:border-0 hover:bg-white/80 transition-colors group"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5), ease: "easeOut" }}
                    >
                      <td className="p-4 text-center text-slate-400 font-medium text-sm bg-white/90 group-hover:bg-slate-50/90">
                        {index + 1}
                      </td>
                      <td className="p-4 font-mono text-sm text-slate-600 font-bold bg-white/90 group-hover:bg-slate-50/90">
                        {student['Seat No']}
                      </td>
                      <td className="p-4 text-sm text-slate-800 font-semibold truncate max-w-[250px]" title={student['Name']}>
                        {student['Name']}
                      </td>
                      
                      {effectiveSubject === ALL_SUBJECTS ? (
                        SUBJECTS_DATA.map(sub => {
                          const mark = student[sub.id];
                          const isMissing = typeof mark === 'string' && isNaN(Number(mark));
                          return (
                            <td key={sub.id} className="p-4 text-right border-l border-slate-100/50">
                              {isMissing ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                                  {mark === "Marks Missing" ? "Missing" : "Unannounced"}
                                </span>
                              ) : (
                                <span className={`inline-flex items-center text-sm font-bold ${Number(mark) >= 90 ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] scale-110 transition-transform' : 'text-slate-700'}`}>
                                  {mark}
                                </span>
                              )}
                            </td>
                          );
                        })
                      ) : (
                        <td className="p-4 text-right bg-emerald-50/20 group-hover:bg-emerald-50/40 transition-colors">
                          {(() => {
                            const mark = student[effectiveSubject];
                            const isMissing = typeof mark === 'string' && isNaN(Number(mark));
                            return isMissing ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-100/80 text-slate-500 border border-slate-200/50">
                                {mark}
                              </span>
                            ) : (
                              <span className={`inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm font-black border shadow-sm ${Number(mark) >= 90 ? 'bg-amber-100 text-amber-800 border-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] scale-105' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
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
      </div>
    </section>
  );
};
