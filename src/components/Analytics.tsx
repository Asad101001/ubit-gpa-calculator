import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, BarChart, Bar, XAxis, YAxis, ReferenceLine, Cell } from 'recharts';
import { Activity, Code, TrendingUp, TrendingDown, BookOpen, Users, ChevronUp, ChevronDown, Calculator, Award } from 'lucide-react';
import { exportToJson } from '../lib/utils';

export const MetricCard = ({ title, value, subtitle, icon: Icon, highlight = false }: any) => (
  <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all hover:-translate-y-1 ${
    highlight 
      ? 'bg-gradient-to-br from-brand-500/10 to-brand-400/5 border-brand-500/30 shadow-[0_0_20px_rgba(20,184,166,0.15)]' 
      : 'glass border-slate-300'
  }`}>
    <div className="flex items-center gap-3 mb-2 sm:mb-3">
      <div className={`p-2 rounded-lg sm:rounded-xl ${highlight ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
        <Icon size={16} className="sm:w-[20px] sm:h-[20px]" />
      </div>
      <h3 className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider">{title}</h3>
    </div>
    <div className="flex items-baseline gap-2">
      <span className={`text-3xl sm:text-4xl font-black ${highlight ? 'text-brand-500 drop-shadow-sm' : 'text-slate-800'}`}>
        {value}
      </span>
      {subtitle && <span className="text-xs sm:text-sm font-semibold text-slate-500 truncate max-w-[120px] sm:max-w-none">{subtitle}</span>}
    </div>
  </div>
);

export const Analytics = ({
  gpa1, gpa2, cgpa,
  bestCourse, worstCourse, radarData, chartData,
  sem1Grades, sem2Grades,
  isStatsOpen, setIsStatsOpen,
  globalStats
}: any) => {

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 rounded-xl border border-slate-300 text-sm shadow-xl">
          <p className="font-bold text-slate-900 mb-1">{payload[0].payload.fullname || payload[0].payload.subject}</p>
          {payload[0].payload.semester && <p className="text-slate-600 text-xs mb-2">{payload[0].payload.semester}</p>}
          <p className="text-brand-400 font-extrabold text-xl">GPA: {Number(payload[0].value).toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mt-8 mb-16">
        <MetricCard title="Semester One GPA" value={gpa1} icon={Calculator} />
        <MetricCard title="Semester Two GPA" value={gpa2} icon={Calculator} />
        <MetricCard title="Cumulative CGPA" value={cgpa} icon={Award} highlight />
      </div>

      <section id="analytics" className="space-y-4 sm:space-y-8 pt-4 sm:pt-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-4 sm:mb-8"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-white/70 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-slate-300">
              <Activity className="text-brand-400 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Advanced Analytics</h2>
          </div>
          <button
            onClick={() => exportToJson(sem1Grades, sem2Grades, { cgpa, gpa1, gpa2 })}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/70 hover:bg-white/90 border border-slate-300 rounded-xl text-slate-700 hover:text-slate-900 text-sm font-bold transition-colors"
          >
            <Code size={16} />
            Export JSON
          </button>
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
             className="glass rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 border-slate-300 lg:col-span-1 h-[250px] sm:h-[400px] flex flex-col items-center justify-center"
          >
            <h3 className="text-slate-700 font-bold mb-4">Skill Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(15, 23, 42, 0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#475569', fontSize: 12, fontWeight: 600}} />
                <PolarRadiusAxis angle={30} domain={[0, 4]} tick={false} axisLine={false} />
                <Radar name="GPA" dataKey="A" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.4} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, y: 15 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
             viewport={{ once: true }}
             className="glass rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 md:p-10 border-slate-300 lg:col-span-2 h-[250px] sm:h-[400px]"
          >
            <h3 className="text-slate-700 font-bold mb-6">Course by Course Comparison</h3>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="rgba(15, 23, 42, 0.1)" tick={{fill: '#475569', fontSize: 11, fontWeight: 600}} />
                <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} stroke="rgba(15, 23, 42, 0.1)" tick={{fill: '#475569', fontSize: 11, fontWeight: 600}} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(15, 23, 42, 0.05)'}} />
                <ReferenceLine y={3.0} stroke="rgba(20,184,166,0.3)" strokeDasharray="3 3" />
                <Bar dataKey="gpa" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.semester === 'Sem 1' ? '#14b8a6' : '#3b82f6'} fillOpacity={0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="mt-8">
          <button 
            onClick={() => setIsStatsOpen(!isStatsOpen)}
            className="w-full flex items-center justify-between p-4 sm:p-6 glass rounded-2xl border border-slate-300 hover:bg-white/60 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <Users className="text-blue-500 w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 text-sm sm:text-base">View Global Batch Insights</span>
            </div>
            {isStatsOpen ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
          </button>

          <AnimatePresence>
            {isStatsOpen && globalStats && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-300">
                     <p className="text-sm font-bold text-slate-800 mb-3 tracking-wide">The Competition is Strong ⚔️</p>
                     <p className="text-slate-600 text-sm leading-relaxed">
                       Based on <span className="font-bold text-brand-500">{globalStats.total}</span> students currently on the leaderboard, the median CGPA sits at a solid <span className="font-bold text-slate-800">{globalStats.median}</span>. Half the batch is scoring above this mark!
                     </p>
                  </div>
                  <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-300">
                     <p className="text-sm font-bold text-slate-800 mb-3 tracking-wide">The Elite Tier 👑</p>
                     <p className="text-slate-600 text-sm leading-relaxed">
                       Want to break into the Top 10% of Batch '28? You'll need to aim for a <span className="font-bold text-brand-500">{globalStats.top10Cutoff}</span> or higher to secure your spot among the absolute best.
                     </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
};
