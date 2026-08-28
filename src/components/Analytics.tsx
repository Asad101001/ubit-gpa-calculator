import { motion } from 'framer-motion';
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, ReferenceLine, Cell } from 'recharts';
import { TrendingUp, TrendingDown, BookOpen, Download } from 'lucide-react';
import { generateTranscriptPDF } from '../lib/transcriptGenerator';
import { AnimatedCounter } from './AnimatedCounter';

export const MetricCard = ({ title, value, subtitle, icon: Icon, highlight = false }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -3 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={`p-4 sm:p-6 rounded-2xl border-2 transition-all relative overflow-hidden group ${
    highlight 
      ? 'bg-yellow-400 border-black shadow-[4px_4px_0px_0px_#000]' 
      : 'glass border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5'
  }`}>
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
        <div className={`p-2 sm:p-2.5 rounded-xl border-2 border-black ${highlight ? 'bg-black text-yellow-400 shadow-[1.5px_1.5px_0px_0px_#000]' : 'bg-yellow-400 text-black shadow-[1.5px_1.5px_0px_0px_#000]'}`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <h3 className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${highlight ? 'text-black' : 'text-gray-700'}`}>{title}</h3>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl sm:text-5xl font-black font-mono tracking-tight ${highlight ? 'text-black' : 'text-textMain'}`}>
          {typeof value === 'number' || (!isNaN(parseFloat(value)) && isFinite(Number(value))) ? (
            <AnimatedCounter value={value} decimals={2} />
          ) : (
            value
          )}
        </span>
        {subtitle && <span className={`text-xs sm:text-sm font-mono font-bold truncate max-w-[120px] sm:max-w-none ${highlight ? 'text-black/80' : 'text-textMuted'}`}>{subtitle}</span>}
      </div>
    </div>
  </motion.div>
);

export const Analytics = ({
  bestCourse, worstCourse, chartData,
  sem1Grades, sem2Grades, sem3Grades,
}: any) => {

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 rounded-xl border-2 border-black text-sm shadow-[3px_3px_0px_0px_#000]">
          <p className="font-black text-textMain mb-0.5">{payload[0].payload.fullname || payload[0].payload.name}</p>
          {payload[0].payload.semester && <p className="text-textMuted text-xs font-bold mb-1.5">{payload[0].payload.semester}</p>}
          <p className="text-black font-mono font-black text-base">GPA: {Number(payload[0].value).toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <section className="space-y-4 sm:space-y-8 pt-4 sm:pt-8">
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8"
        >
          <div>
            <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest mb-1">Performance Breakdown</p>
            <h2 className="text-2xl sm:text-3xl font-black text-textMain tracking-tight">Advanced Analytics</h2>
          </div>

          <button
            onClick={() => {
              const hasMissingMarks = Object.values(sem1Grades).some(m => m === '') || Object.values(sem2Grades).some(m => m === '');
              if (hasMissingMarks) {
                alert("Cannot generate transcript: Marks are missing for one or more subjects.");
                return;
              }
              const studentObj: Record<string, any> = {
                'Name': localStorage.getItem('submitName') || 'Guest Student',
                'Seat No': 'Calculator Preview'
              };
              const mapCodeToId = (code: string) => code.toLowerCase().replace('-', '');
              Object.entries(sem1Grades).forEach(([code, mark]) => {
                if (mark !== '') studentObj[mapCodeToId(code)] = mark;
              });
              Object.entries(sem2Grades).forEach(([code, mark]) => {
                if (mark !== '') studentObj[mapCodeToId(code)] = mark;
              });
              if (sem3Grades) Object.entries(sem3Grades).forEach(([code, mark]) => {
                if (mark !== '') studentObj[mapCodeToId(code)] = mark;
              });
              generateTranscriptPDF(studentObj);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 font-black text-xs rounded-xl border-2 border-black transition-all shadow-[2px_2px_0px_0px_#000] active:scale-95 group ${
              (Object.values(sem1Grades).some(m => m === '') || Object.values(sem2Grades).some(m => m === ''))
              ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed opacity-60 shadow-none' 
              : 'bg-white hover:bg-yellow-400 text-black'
            }`}
          >
            <Download size={15} strokeWidth={2.5} />
            <span>Download Unofficial Transcript</span>
          </button>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">

          <MetricCard title="Best Performing Course" value={bestCourse.gp.toFixed(1)} subtitle={bestCourse.name} icon={TrendingUp} />
          <MetricCard title="Needs Improvement" value={worstCourse.gp.toFixed(1)} subtitle={worstCourse.name} icon={TrendingDown} />
          <MetricCard title="Total Credits Taken" value="36" subtitle="Across 2 Semesters" icon={BookOpen} />
        </div>

        {/* Full-width Course by Course Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
          className="glass rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-10 border-2 border-black shadow-[4px_4px_0px_0px_#000] w-full min-h-[320px] sm:min-h-[400px] flex flex-col"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-black text-textMain tracking-tight">Course by Course GPA Comparison</h3>
              <p className="text-xs text-textMuted font-bold mt-0.5">Visual representation of grade points earned per subject</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-yellow-400 border border-black" /> Semester 1</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-yellow-600 border border-black" /> Semester 2</span>
            </div>
          </div>

          <div className="w-full flex-1 min-h-[240px] sm:min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#000000" tick={{ fill: '#000000', fontSize: 11, fontWeight: 700 }} angle={-25} textAnchor="end" height={40} />
                <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} stroke="#000000" tick={{ fill: '#000000', fontSize: 11, fontWeight: 700 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                <ReferenceLine y={3.0} stroke="#000000" strokeDasharray="3 3" />
                <Bar dataKey="gpa" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.semester === 'Sem 1' ? '#fbbf24' : '#d97706'} stroke="#000000" strokeWidth={1.5} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>
    </>
  );
};

