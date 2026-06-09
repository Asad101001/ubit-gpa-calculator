import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Database, Share2, Activity, X } from 'lucide-react';

const rankData = (rawList: any[]) => {
  const sorted = [...rawList].sort((a, b) => b.cgpa - a.cgpa);
  let currentRank = 1;
  let prevCgpa = -1;
  
  return sorted.map((student, i) => {
    if (student.cgpa !== prevCgpa && i !== 0) currentRank++;
    prevCgpa = student.cgpa;
    return { ...student, rank: currentRank };
  });
};

const PodiumLeaderboard = ({ data, isLoading }: { data: any[], isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48 text-slate-500 font-bold animate-pulse">
        Fetching latest rankings...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center px-4">
        <Trophy className="text-slate-900/10 mb-4" size={48} />
        <p className="text-slate-500 font-bold">The podium is currently empty.</p>
        <p className="text-slate-500 text-sm mt-1">Be the first to claim a spot!</p>
      </div>
    );
  }

  const rankedData = rankData(data);
  const top3 = rankedData.filter(s => s.rank <= 3).slice(0, 3);
  const rest = rankedData.filter(s => !top3.includes(s));

  const podiumData: any[] = [];
  if (top3.length === 1) {
    podiumData.push(null, top3[0], null);
  } else if (top3.length === 2) {
    podiumData.push(top3[1], top3[0], null);
  } else {
    podiumData.push(top3[1], top3[0], top3[2]);
  }

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-center gap-2 sm:gap-6 pt-16 h-[320px] sm:h-[360px] w-full max-w-2xl mx-auto">
        {podiumData.map((student, idx) => {
          if (!student) return <div key={`empty-${idx}`} className="w-1/3 max-w-[120px] sm:max-w-[180px]" />;
          
          const isCenter = idx === 1;
          const isLeft = idx === 0;
          
          const heightClass = isCenter ? "h-48 sm:h-56" : isLeft ? "h-36 sm:h-40" : "h-24 sm:h-28";
          
          const rankColorClass = student.rank === 1 
            ? "text-yellow-400" 
            : student.rank === 2 
            ? "text-slate-400" 
            : "text-amber-600";

          const rankBgClass = student.rank === 1
            ? "bg-gradient-to-t from-yellow-500/20 to-yellow-400/40 border-t-2 border-yellow-400 shadow-[0_-10px_30px_rgba(250,204,21,0.2)]" 
            : student.rank === 2
            ? "bg-gradient-to-t from-slate-400/10 to-slate-300/30 border-t-2 border-slate-300" 
            : "bg-gradient-to-t from-amber-700/10 to-amber-600/30 border-t-2 border-amber-600";
          
          return (
            <motion.div 
              key={student.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: isCenter ? 0.05 : isLeft ? 0.15 : 0.25, duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
              className={`flex flex-col justify-end w-1/3 max-w-[140px] relative ${isCenter ? 'z-10' : 'z-0'}`}
            >
              <div className="mb-2 sm:mb-4 text-center px-0.5 sm:px-2 w-full flex flex-col items-center justify-end relative h-[100px] sm:h-[120px]">
                {student.rank === 1 ? (
                  <motion.div 
                    animate={{ y: [-3, 3, -3] }} 
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="flex items-center justify-center mb-2"
                  >
                    <Trophy className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" size={32} />
                  </motion.div>
                ) : (
                  <Medal className={`${rankColorClass} mx-auto mb-2 opacity-80`} size={24} />
                )}
                
                <span className={`font-bold block text-[11px] sm:text-base w-full truncate overflow-hidden whitespace-nowrap px-0.5 sm:px-1 ${student.rank === 1 ? 'text-slate-900' : 'text-slate-700'}`} title={student.name}>
                  {student.name.length > 15 ? `${student.name.substring(0, 13)}...` : student.name} 
                </span>
                <span className={`text-xl sm:text-3xl font-extrabold block mt-1 ${rankColorClass} ${student.rank === 1 ? 'drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : ''}`}>
                  {student.cgpa.toFixed(2)}
                </span>
              </div>
              <div className={`w-full rounded-t-xl flex justify-center pt-4 font-extrabold ${heightClass} ${rankBgClass} ${rankColorClass}`}>
                <span className={student.rank === 1 ? "text-5xl sm:text-6xl opacity-90" : "text-3xl sm:text-4xl opacity-50"}>{student.rank}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <div className="space-y-3">
          {rest.map((student, idx) => (
            <motion.div 
              key={student.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-slate-300 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-5 w-[70%]">
                <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-sm text-brand-400 bg-brand-400/10 border border-brand-400/20">
                  {student.rank}
                </div>
                <span className="font-bold text-slate-700 truncate w-full">{student.name}</span>
              </div>
              <div className="text-xl font-extrabold text-brand-400/80">
                {student.cgpa.toFixed(2)}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export const SubmitModal = ({ isOpen, onClose, onSubmit, name, setName, isSubmitting, error, currentCgpa }: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-[#0a0a0a] border border-slate-300 rounded-3xl p-6 sm:p-8 max-w-md w-full relative overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-slate-800 rounded-full text-slate-600 hover:text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="bg-brand-500/20 p-4 rounded-full mb-4">
                <Trophy size={32} className="text-brand-400" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Join the Leaderboard</h2>
              <p className="text-slate-600 font-medium mb-6 text-sm">Submit your current CGPA of <span className="text-slate-900 font-bold">{currentCgpa}</span> to the Batch '28 rankings.</p>
              
              <form onSubmit={onSubmit} className="w-full space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl font-medium text-left">
                    {error}
                  </div>
                )}
                <div className="text-left">
                  <label className="block text-slate-600 text-xs font-bold mb-2 uppercase tracking-wider">Your Full Name</label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Muhammad Asad"
                    className="w-full glass-input text-slate-800 py-3 px-4 rounded-xl font-bold text-sm hover:bg-white/80 transition-colors focus:ring-2 focus:ring-brand-500/50 focus:outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="w-full py-4 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:hover:bg-brand-500 text-black font-extrabold rounded-xl transition-all shadow-lg shadow-brand-500/20"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit to Leaderboard'}
                </button>
              </form>
              <p className="text-slate-500 text-[10px] mt-4 max-w-xs uppercase tracking-wider font-semibold">
                Only 1 submission allowed per IP address. Ensures fairness.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const Leaderboard = ({
  leaderboardData,
  isLeaderboardLoading,
  setIsSubmitModalOpen,
  cgpa,
  hasSubmitted,
  userPercentile,
  handleDownloadWrapped,
  isDownloadingWrapped
}: any) => {
  return (
    <section id="leaderboard" className="space-y-4 sm:space-y-8 pt-4 sm:pt-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-2 sm:gap-4 mb-2 text-center justify-center flex-col"
      >
        <div className="bg-gradient-to-br from-yellow-400 to-amber-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-[0_0_30px_rgba(250,204,21,0.3)] mb-2 sm:mb-4 inline-flex">
          <Trophy className="text-slate-900 w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500">The Leaderboard</h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-md mx-auto">The absolute best of Batch '28. Submit your CGPA to claim your spot on the podium.</p>
        </div>
      </motion.div>

      <div className="glass rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 md:p-12 border-slate-300 relative overflow-hidden min-h-[250px] sm:min-h-[400px]">
        <PodiumLeaderboard data={leaderboardData} isLoading={isLeaderboardLoading} />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 pt-10 border-t border-slate-300 text-center relative z-10 flex flex-col items-center"
        >
          <button 
            onClick={() => setIsSubmitModalOpen(true)}
            disabled={Number(cgpa) <= 0}
            className="px-6 py-3 sm:px-8 sm:py-4 bg-white/70 hover:bg-white/90 disabled:opacity-50 border border-slate-300 rounded-xl sm:rounded-2xl text-slate-900 font-bold tracking-wide transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
          >
            <Database size={16} className="text-brand-400 sm:w-[18px] sm:h-[18px]" />
            {hasSubmitted ? "Update Score on Leaderboard" : "Submit Your CGPA to Leaderboard"}
          </button>
          <p className="text-slate-500 text-xs mt-4">Powered by Supabase</p>

          <AnimatePresence>
            {hasSubmitted && userPercentile && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-8 flex flex-col items-center gap-5 w-full"
              >
                <div className="bg-brand-500/10 border border-brand-500/20 px-5 py-2.5 rounded-full">
                  <p className="text-brand-600 text-[11px] sm:text-sm font-semibold text-center">
                    You rank in the <span className="font-extrabold text-brand-500 text-sm sm:text-base">{userPercentile}{userPercentile % 10 === 1 && userPercentile !== 11 ? 'st' : userPercentile % 10 === 2 && userPercentile !== 12 ? 'nd' : userPercentile % 10 === 3 && userPercentile !== 13 ? 'rd' : 'th'} percentile</span> of the class.
                  </p>
                </div>

                <button 
                  onClick={handleDownloadWrapped}
                  disabled={isDownloadingWrapped}
                  className="flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl sm:rounded-2xl font-bold shadow-[0_10px_30px_rgba(15,23,42,0.3)] transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 w-full sm:w-auto text-sm sm:text-base"
                >
                  {isDownloadingWrapped ? <Activity className="animate-spin" size={18} /> : <Share2 size={18} />}
                  {isDownloadingWrapped ? "Generating..." : "Get Your Wrapped Snapshot"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
