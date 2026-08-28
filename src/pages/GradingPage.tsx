import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Calculator, Info } from 'lucide-react';

interface GradingPageProps {
  onBack: () => void;
}

export const GradingPage = ({ onBack }: GradingPageProps) => {
  const gradingScale = [
    { range: '85 - 100', gp: '4.0', letter: 'A+ / A', status: 'Outstanding', color: 'text-emerald-600' },
    { range: '80 - 84', gp: '3.8', letter: 'A-', status: 'Excellent', color: 'text-emerald-600' },
    { range: '75 - 79', gp: '3.4', letter: 'B+', status: 'Very Good', color: 'text-yellow-600' },
    { range: '71 - 74', gp: '3.0', letter: 'B', status: 'Good', color: 'text-yellow-600' },
    { range: '68 - 70', gp: '2.8', letter: 'B-', status: 'Above Average', color: 'text-textMain' },
    { range: '64 - 67', gp: '2.4', letter: 'C+', status: 'Average', color: 'text-textMain' },
    { range: '61 - 63', gp: '2.0', letter: 'C', status: 'Satisfactory', color: 'text-textMain' },
    { range: '57 - 60', gp: '1.8', letter: 'C-', status: 'Below Average', color: 'text-orange-600' },
    { range: '50 - 56', gp: '1.0 - 1.4', letter: 'D+, D', status: 'Pass (Minimum)', color: 'text-orange-600' },
    { range: '< 50', gp: '0.0', letter: 'F', status: 'Fail', color: 'text-red-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-4xl mx-auto space-y-8 pb-28 sm:pb-16 pt-4"

    >
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-surfaceHighlight hover:bg-surfaceHighlight/80 text-textMain rounded-xl border-2 border-black font-extrabold text-xs shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          <ArrowLeft size={16} />
          Back to Calculator
        </button>
        <div className="text-right">
          <span className="text-[10px] font-extrabold tracking-widest text-textMuted uppercase">Grading Regulations</span>
          <p className="text-xs font-bold text-textMain">University of Karachi</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="glass-card p-6 sm:p-10 space-y-8 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex items-center gap-4 pb-6 border-b-2 border-black">
          <div className="p-3 bg-yellow-400 text-black border-2 border-black rounded-xl font-black shadow-[3px_3px_0px_0px_#000000]">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-textMain tracking-tight">Official UBIT Grading Policy</h1>
            <p className="text-xs sm:text-sm text-textMuted font-semibold mt-1">
              Semester System Rules • Department of Computer Science
            </p>
          </div>
        </div>

        {/* Formula Explainer */}
        <div className="p-5 bg-surfaceHighlight border-2 border-black rounded-2xl space-y-3 shadow-[3px_3px_0px_0px_#000000]">
          <div className="flex items-center gap-2 text-sm font-extrabold text-textMain">
            <Calculator size={18} className="text-yellow-600" />
            Formula: Semester GPA & Cumulative CGPA
          </div>
          <p className="text-xs sm:text-sm text-textMuted leading-relaxed">
            GPA (Grade Point Average) is calculated by multiplying the credit hours of each course by the Grade Point earned, summing them up across all registered subjects, and dividing by total credit hours attempted.
          </p>
          <div className="p-3 bg-white border border-black rounded-xl font-mono text-xs font-bold text-black text-center shadow-inner">
            SGPA = Σ (Grade Points × Course Credit Hours) ÷ Total Credit Hours
          </div>
        </div>

        {/* Grading Table */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-textMain flex items-center gap-2">
            <Info size={18} className="text-yellow-600" /> Marks to Grade Point Mapping Table
          </h2>

          <div className="overflow-x-auto rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000000]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-yellow-400 text-black font-extrabold border-b-2 border-black">
                <tr>
                  <th className="py-3 px-4">Marks Range</th>
                  <th className="py-3 px-4">Grade Point (GP)</th>
                  <th className="py-3 px-4">Letter Grade</th>
                  <th className="py-3 px-4">Academic Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black text-textMain font-mono font-bold">
                {gradingScale.map((row, i) => (
                  <tr key={i} className="hover:bg-yellow-50/80 transition-colors">
                    <td className={`py-3 px-4 ${row.color}`}>{row.range}</td>
                    <td className="py-3 px-4 text-black text-sm">{row.gp}</td>
                    <td className="py-3 px-4">{row.letter}</td>
                    <td className={`py-3 px-4 ${row.color}`}>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t-2 border-black flex justify-between items-center">
          <span className="text-xs font-bold text-textMuted">Official UOK Semester Section Regulations</span>
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-yellow-400 text-black font-extrabold text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-yellow-300 transition-all"
          >
            Return to Calculator
          </button>
        </div>
      </div>
    </motion.div>
  );
};
