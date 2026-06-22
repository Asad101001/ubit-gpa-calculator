import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, BarChart, Bar, XAxis, YAxis, ReferenceLine, Cell } from 'recharts';
import { Activity, Code, TrendingUp, TrendingDown, BookOpen, Users, ChevronUp, ChevronDown, Calculator, Award } from 'lucide-react';
import { exportToJson } from '../lib/utils';

export const MetricCard = ({ title, value, subtitle, icon: Icon, highlight = false }: any) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={`p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border relative overflow-hidden group ${
    highlight 
      ? 'bg-gradient-to-br from-brand-500/15 via-accent-500/10 to-transparent border-brand-500/40 shadow-[0_0_30px_rgba(var(--color-brand-500),0.2)]' 
      : 'glass border-border hover:border-accent-500/30 hover:shadow-[0_0_20px_rgba(var(--color-accent-500),0.1)] transition-all'
  }`}>
    {highlight && (
      <div className="absolute inset-0 bg-accent-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
    )}
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-colors ${highlight ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-background shadow-lg shadow-brand-500/30' : 'bg-surfaceHighlight text-textMuted group-hover:text-accent-500 group-hover:bg-accent-500/10'}`}>
          <Icon size={24} className="sm:w-[28px] sm:h-[28px]" />
        </div>
        <h3 className="text-sm sm:text-base font-extrabold text-textMuted uppercase tracking-widest">{title}</h3>
      </div>
      <div className="flex items-baseline gap-3">
        <span className={`text-5xl sm:text-7xl font-black tracking-tight transition-all duration-300 ${highlight ? 'text-transparent bg-clip-text bg-gradient-to-br from-brand-600 to-accent-400 drop-shadow-sm' : 'text-textMain'}`}>
          {value}
        </span>
        {subtitle && <span className="text-sm sm:text-base font-bold text-textMuted truncate max-w-[150px] sm:max-w-none">{subtitle}</span>}
      </div>
    </div>
  </motion.div>
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
        <div className="glass p-3 rounded-xl border border-border text-sm shadow-xl">
          <p className="font-bold text-textMain mb-1">{payload[0].payload.fullname || payload[0].payload.subject}</p>
          {payload[0].payload.semester && <p className="text-textMuted text-xs mb-2">{payload[0].payload.semester}</p>}
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
            <div className="bg-surface/70 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-border">
              <Activity className="text-brand-400 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-textMain">Advanced Analytics</h2>
          </div>
          <button
            onClick={() => exportToJson(sem1Grades, sem2Grades, { cgpa, gpa1, gpa2 })}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface/70 hover:bg-surface/90 border border-border rounded-xl text-textMain hover:text-brand-500 text-sm font-bold transition-colors"
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
             className="glass rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 border-border lg:col-span-1 h-[250px] sm:h-[400px] flex flex-col items-center justify-center"
          >
            <h3 className="text-textMain font-bold mb-4">Skill Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="subject" tick={{fill: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600}} />
                <PolarRadiusAxis angle={30} domain={[0, 4]} tick={false} axisLine={false} />
                <Radar name="GPA" dataKey="A" stroke="var(--color-brand-500)" fill="var(--color-brand-500)" fillOpacity={0.4} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, y: 15 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
             viewport={{ once: true }}
             className="glass rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 md:p-10 border-border lg:col-span-2 h-[250px] sm:h-[400px]"
          >
            <h3 className="text-textMain font-bold mb-6">Course by Course Comparison</h3>
            <ResponsiveContainer width="100%" height="90%">
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
          </motion.div>
        </div>

        <div className="mt-8">
          <button 
            onClick={() => setIsStatsOpen(!isStatsOpen)}
            className="w-full flex items-center justify-between p-4 sm:p-6 glass rounded-2xl border border-border hover:bg-surface/60 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-brand-600/10 p-2 rounded-lg group-hover:bg-brand-600/20 transition-colors">
                <Users className="text-brand-600 w-5 h-5" />
              </div>
              <span className="font-bold text-textMain text-sm sm:text-base">View Global Batch Insights</span>
            </div>
            {isStatsOpen ? <ChevronUp className="text-textMuted" /> : <ChevronDown className="text-textMuted" />}
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
                  <div className="glass-card p-5 sm:p-6 rounded-2xl border border-border">
                     <p className="text-sm font-bold text-textMain mb-3 tracking-wide">The Competition is Strong ⚔️</p>
                     <p className="text-textMuted text-sm leading-relaxed">
                       Based on <span className="font-bold text-brand-500">{globalStats.total}</span> students currently on the leaderboard, the median CGPA sits at a solid <span className="font-bold text-textMain">{globalStats.median}</span>. Half the batch is scoring above this mark!
                     </p>
                  </div>
                  <div className="glass-card p-5 sm:p-6 rounded-2xl border border-border">
                     <p className="text-sm font-bold text-textMain mb-3 tracking-wide">The Elite Tier 👑</p>
                     <p className="text-textMuted text-sm leading-relaxed">
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
