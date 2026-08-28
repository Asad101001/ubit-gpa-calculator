import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, BarChart, Bar, XAxis, YAxis, ReferenceLine, Cell } from 'recharts';
import { TrendingUp, TrendingDown, BookOpen, Award, GraduationCap, Trophy, Download } from 'lucide-react';

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
  gpa1, gpa2, gpa3, cgpa,
  bestCourse, worstCourse, radarData, chartData,
  sem1Grades, sem2Grades, sem3Grades,
}: any) => {

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 rounded-xl border-2 border-black text-sm shadow-[3px_3px_0px_0px_#000]">
          <p className="font-black text-textMain mb-0.5">{payload[0].payload.fullname || payload[0].payload.subject}</p>
          {payload[0].payload.semester && <p className="text-textMuted text-xs font-bold mb-1.5">{payload[0].payload.semester}</p>}
          <p className="text-black font-mono font-black text-base">GPA: {Number(payload[0].value).toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div id="analytics" className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6 relative z-10 mt-8 mb-12">
        <MetricCard title="Semester 1 GPA" value={gpa1} icon={GraduationCap} />
        <MetricCard title="Semester 2 GPA" value={gpa2} icon={BookOpen} />
        <MetricCard title="Semester 3 GPA" value={gpa3 ?? '—'} icon={Award} />
        <MetricCard title="Cumulative CGPA" value={cgpa} icon={Trophy} highlight />
      </div>


      <div className="flex justify-center -mt-8 mb-12 relative z-10">
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
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm rounded-2xl transition-all shadow-lg active:scale-95 group ${
            (Object.values(sem1Grades).some(m => m === '') || Object.values(sem2Grades).some(m => m === ''))
            ? 'bg-surfaceHighlight text-textMuted border border-border cursor-not-allowed opacity-50' 
            : 'bg-surfaceHighlight hover:bg-brand-500/10 border border-border hover:border-brand-500/40 text-textMain hover:text-brand-500'
          }`}
        >
          <Download size={20} className="text-textMuted group-hover:text-brand-500 transition-colors" />
          Download Unofficial Transcript
        </button>
      </div>

      <section id="analytics" className="space-y-4 sm:space-y-8 pt-4 sm:pt-8">
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-6 sm:mb-10"
        >
          <div>
            <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">Performance Breakdown</p>
            <h2 className="text-2xl sm:text-3xl font-black text-textMain tracking-tight">Advanced Analytics</h2>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <MetricCard title="Best Performing Course" value={bestCourse.gp.toFixed(1)} subtitle={bestCourse.name} icon={TrendingUp} />
          <MetricCard title="Needs Improvement" value={worstCourse.gp.toFixed(1)} subtitle={worstCourse.name} icon={TrendingDown} />
          <MetricCard title="Total Credits Taken" value="36" subtitle="Across 2 Semesters" icon={BookOpen} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <motion.div 
             initial={{ opacity: 0, y: 15 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, ease: "easeOut" }}
             viewport={{ once: true }}
             className="glass rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 border-border lg:col-span-1 h-[250px] sm:h-[400px] flex flex-col"
          >
            <h3 className="text-textMain font-bold mb-4 text-center">Skill Distribution</h3>
            <div className="w-full flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <RadarChart cx="50%" cy="50%" outerRadius="55%" margin={{ top: 10, right: 25, bottom: 10, left: 25 }} data={radarData}>
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#000000', fontSize: 11, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 4]} tick={false} axisLine={false} />
                  <Radar name="GPA" dataKey="A" stroke="#000000" fill="#fbbf24" fillOpacity={0.6} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>

            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, y: 15 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
             viewport={{ once: true }}
             className="glass rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 md:p-10 border-border lg:col-span-2 h-[250px] sm:h-[400px] flex flex-col"
          >
            <h3 className="text-textMain font-bold mb-6">Course by Course Comparison</h3>
            <div className="w-full flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="var(--color-border)" tick={{fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 600}} />
                  <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} stroke="var(--color-border)" tick={{fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 600}} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--color-border)', opacity: 0.5}} />
                  <ReferenceLine y={3.0} stroke="var(--color-brand-500)" opacity={0.3} strokeDasharray="3 3" />
                  <Bar dataKey="gpa" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.semester === 'Sem 1' ? 'var(--color-brand-500)' : 'var(--color-brand-600)'} fillOpacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};
