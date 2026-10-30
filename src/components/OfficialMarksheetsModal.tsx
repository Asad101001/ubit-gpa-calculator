import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, ExternalLink, Search, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { OFFICIAL_MARKSHEETS, type MarksheetDocument } from '../lib/resultsArchive';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialSemester?: number | 'all';
}

export const OfficialMarksheetsModal = ({ isOpen, onClose, initialSemester = 'all' }: Props) => {
  const [selectedSem, setSelectedSem] = useState<number | 'all'>(initialSemester);
  const [search, setSearch] = useState('');

  const filteredDocs = OFFICIAL_MARKSHEETS.filter((doc: MarksheetDocument) => {
    if (selectedSem !== 'all' && doc.semester !== selectedSem) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        doc.code.toLowerCase().includes(q) ||
        doc.title.toLowerCase().includes(q) ||
        doc.instructor.toLowerCase().includes(q) ||
        (doc.subInstructor && doc.subInstructor.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-4xl bg-white border-2 border-black rounded-[2rem] shadow-[8px_8px_0px_0px_#000] overflow-hidden my-auto max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-red-50 via-white to-amber-50 border-b-2 border-black flex items-start justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#801618] border-2 border-black flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0px_0px_#000]">
                  <FileText size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-xl font-black text-black">Official Result Marksheets Archive</h3>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-400 rounded-full">
                      <ShieldCheck size={12} /> Verified Documents
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5 leading-snug">
                    Browse and inspect the authentic university marksheets issued by Department of Computer Science (UBIT).
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close modal"
                className="w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors shrink-0 shadow-[2px_2px_0px_0px_#000]"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Controls Bar: Semester Filters & Search */}
            <div className="p-4 sm:p-5 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['all', 1, 2, 3] as const).map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSem(sem)}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all border-2 border-black shrink-0 ${
                      selectedSem === sem
                        ? 'bg-[#801618] text-white shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    {sem === 'all' ? 'All Semesters' : `Semester ${sem}`}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[220px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by course or teacher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white border-2 border-black rounded-xl outline-none focus:ring-2 focus:ring-[#801618] shadow-[1px_1px_0px_0px_#000]"
                />
              </div>
            </div>

            {/* Document Cards List */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
              {filteredDocs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 font-bold text-sm">No marksheets found matching your filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredDocs.map((doc: MarksheetDocument) => (
                    <div
                      key={doc.id}
                      className="p-4 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between hover:translate-x-0.5 hover:-translate-y-0.5 transition-transform"
                    >
                      <div>
                        {/* Badges row */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono font-black text-xs px-2 py-0.5 bg-gray-100 border border-black rounded-lg text-black">
                            {doc.code}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-gray-500">
                              Sem {doc.semester}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                doc.fileType === 'pdf'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              }`}
                            >
                              {doc.fileType === 'pdf' ? <FileText size={10} /> : <FileSpreadsheet size={10} />}
                              {doc.fileType.toUpperCase()} • {doc.sizeKB} KB
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="font-black text-sm sm:text-base text-black leading-snug line-clamp-2">
                          {doc.title}
                        </h4>

                        {/* Teacher & Subtext */}
                        <div className="mt-2 text-xs text-gray-600 font-medium">
                          <span className="text-gray-900 font-bold">{doc.instructor}</span>
                          {doc.subInstructor && (
                            <span className="block text-[11px] text-gray-500 font-normal">
                              ({doc.subInstructor})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#801618] hover:bg-[#9b1b1e] text-white font-black text-xs rounded-xl border border-black shadow-[2px_2px_0px_0px_#000] transition-colors"
                        >
                          <ExternalLink size={12} strokeWidth={2.5} />
                          <span>View {doc.fileType.toUpperCase()}</span>
                        </a>
                        <a
                          href={doc.url}
                          download
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-gray-100 text-black font-black text-xs rounded-xl border border-black shadow-[2px_2px_0px_0px_#000] transition-colors"
                          title="Download copy"
                        >
                          <Download size={12} strokeWidth={2.5} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Notice */}
            <div className="p-3.5 bg-gray-50 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 font-medium shrink-0 gap-2">
              <span>Source: Official Department of Computer Science (UBIT) marksheets.</span>
              <span className="font-mono text-black font-bold">16 Documents Available</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
