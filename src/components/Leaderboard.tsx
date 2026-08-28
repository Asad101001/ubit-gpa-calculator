import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Database, X, Sparkles, UserCheck } from 'lucide-react';
import { validateName } from '../lib/validation';
import { toast } from 'react-hot-toast';

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
      <div className="flex flex-col justify-center items-center h-56 text-black font-black animate-pulse space-y-3">
        <div className="w-10 h-10 border-4 border-black border-t-yellow-400 rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-wider">Fetching live rankings...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-56 text-center px-4 bg-yellow-50/60 border-2 border-dashed border-black/20 rounded-2xl">
        <div className="w-14 h-14 rounded-2xl bg-yellow-400 border-2 border-black flex items-center justify-center mb-3 shadow-[2px_2px_0px_0px_#000]">
          <Trophy className="text-black" size={28} />
        </div>
        <p className="text-black font-black text-base">The podium is currently open!</p>
        <p className="text-gray-600 font-medium text-xs mt-0.5">Calculate your CGPA above and claim the first spot on the leaderboard.</p>
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
    <div className="space-y-10">
      {/* ── 3-TIER PODIUM ── */}
      <div className="flex items-end justify-center gap-2.5 sm:gap-6 pt-10 h-[320px] sm:h-[380px] w-full max-w-2xl mx-auto">
        {podiumData.map((student, idx) => {
          if (!student) return <div key={`empty-${idx}`} className="w-1/3 max-w-[120px] sm:max-w-[180px]" />;
          
          const isCenter = idx === 1;
          const isLeft = idx === 0;
          
          const heightClass = isCenter ? "h-44 sm:h-56" : isLeft ? "h-32 sm:h-40" : "h-24 sm:h-32";
          
          const podiumBg = isCenter 
            ? "bg-yellow-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_#000]" 
            : isLeft 
            ? "bg-gray-100 text-black border-2 border-black shadow-[3px_3px_0px_0px_#000]" 
            : "bg-amber-100 text-black border-2 border-black shadow-[3px_3px_0px_0px_#000]";

          return (
            <motion.div 
              key={student.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: isCenter ? 0.05 : isLeft ? 0.15 : 0.25, duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
              className={`flex flex-col justify-end w-1/3 max-w-[170px] relative ${isCenter ? 'z-10' : 'z-0'}`}
            >
              {/* Student Header Card on Podium */}
              <div className="mb-2 sm:mb-3 text-center px-1 w-full flex flex-col items-center justify-end relative">
                {isCenter ? (
                  <motion.div 
                    animate={{ y: [-3, 3, -3] }} 
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center mb-1.5 shadow-[2px_2px_0px_0px_#000]"
                  >
                    <Trophy className="text-black w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.div>
                ) : isLeft ? (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 border-2 border-black flex items-center justify-center mb-1 shadow-[1.5px_1.5px_0px_0px_#000]">
                    <Medal className="text-gray-700 w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-200 border-2 border-black flex items-center justify-center mb-1 shadow-[1.5px_1.5px_0px_0px_#000]">
                    <Medal className="text-amber-800 w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                )}
                
                <span className="font-black block text-xs sm:text-sm text-black w-full truncate px-0.5" title={student.name}>
                  {student.name} 
                </span>
                
                <div className={`mt-1 px-2.5 py-0.5 rounded-md border border-black font-mono font-black text-xs sm:text-sm ${isCenter ? 'bg-black text-yellow-400' : 'bg-white text-black'}`}>
                  {student.cgpa.toFixed(2)}
                </div>
              </div>

              {/* Step Block */}
              <div className={`w-full rounded-t-2xl flex flex-col items-center justify-start pt-3 font-black ${heightClass} ${podiumBg}`}>
                <span className="text-3xl sm:text-5xl opacity-90 font-mono">#{student.rank}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── RANKINGS 4+ LIST ── */}
      {rest.length > 0 && (
        <div className="space-y-2.5 max-w-2xl mx-auto pt-4">
          <div className="flex items-center gap-2 mb-1 px-1">
            <Sparkles size={14} className="text-yellow-600" />
            <span className="text-[11px] font-black text-gray-700 uppercase tracking-wider">Top Batch Contenders</span>
          </div>
          {rest.map((student, idx) => (
            <motion.div 
              key={student.name}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              viewport={{ once: true }}
              className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-1 transition-all group"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-lg flex items-center justify-center font-mono font-black text-xs sm:text-sm text-black bg-gray-100 border-2 border-black">
                  #{student.rank}
                </div>
                <span className="font-bold text-xs sm:text-sm text-black truncate">{student.name}</span>
              </div>
              <div className="px-3 py-1 bg-yellow-400 border-2 border-black rounded-lg font-mono font-black text-xs sm:text-sm text-black shadow-[1px_1px_0px_0px_#000]">
                {student.cgpa.toFixed(2)} <span className="text-[10px] uppercase font-bold text-black/70">CGPA</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export const SubmitModal = ({ isOpen, onClose, onSubmit, name, setName, isSubmitting, error, currentCgpa }: any) => {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validated = validateName(name);
    if (!validated.isValid) {
      toast.error(validated.error || 'Invalid name input');
      return;
    }
    setName(validated.sanitized);
    onSubmit(e);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-white border-[2.5px] border-black rounded-2xl p-6 sm:p-8 max-w-md w-full relative overflow-hidden shadow-[6px_6px_0px_0px_#000]"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-1.5 bg-gray-100 hover:bg-yellow-400 rounded-lg border-2 border-black text-black transition-colors shadow-[1px_1px_0px_0px_#000] active:scale-95"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-yellow-400 border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_#000]">
                <Trophy size={28} className="text-black" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">Join the Leaderboard</h2>
              <p className="text-gray-600 font-medium mb-5 text-xs sm:text-sm mt-1">
                Post your calculated CGPA of <strong className="text-black font-mono font-black">{currentCgpa}</strong> to the official Batch '28 rankings.
              </p>
              
              <form onSubmit={handleFormSubmit} className="w-full space-y-4 text-left">
                {error && (
                  <div className="bg-red-50 border-2 border-red-500 text-red-800 text-xs p-3 rounded-xl font-bold">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-black text-xs font-black uppercase tracking-wider mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Muhammad Asad"
                    className="w-full bg-gray-50 text-black py-2.5 px-3.5 rounded-xl font-bold text-sm border-2 border-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-[2px_2px_0px_0px_#000] placeholder:text-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-black text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck size={16} strokeWidth={2.5} />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit to Leaderboard'}</span>
                </button>
              </form>
              
              <p className="text-gray-500 text-[10px] mt-3.5 uppercase tracking-wider font-bold">
                1 submission allowed per verified student record
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const Leaderboard = ({
  leaderboardData,
  isLeaderboardLoading,
  setIsSubmitModalOpen,
  cgpa,
  hasSubmitted
}: any) => {
  return (
    <section id="leaderboard" className="space-y-4 sm:space-y-6 pt-4 sm:pt-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 sm:mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-yellow-400 border-2 border-black text-black shadow-[2px_2px_0px_0px_#000]">
            <Trophy className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest leading-none mb-1">Batch 2024–28</p>
            <h2 className="text-2xl sm:text-3xl font-black text-textMain tracking-tight">Class Leaderboard</h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-textMuted font-medium">Rankings updated dynamically as scores are submitted.</p>
      </motion.div>

      <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border-2 border-black shadow-[4px_4px_0px_0px_#000] relative overflow-hidden">
        <PodiumLeaderboard data={leaderboardData} isLoading={isLeaderboardLoading} />

        <div className="mt-10 pt-8 border-t-2 border-black flex flex-col items-center justify-center gap-2">
          <button 
            onClick={() => setIsSubmitModalOpen(true)}
            disabled={Number(cgpa) <= 0}
            className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black rounded-xl text-black font-black text-xs sm:text-sm tracking-wide transition-all shadow-[3px_3px_0px_0px_#000] active:scale-95 flex items-center gap-2"
          >
            <Database size={16} strokeWidth={2.5} />
            <span>{hasSubmitted ? "Update Score on Leaderboard" : "Submit Your Score to Leaderboard"}</span>
          </button>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Live Community Standings</span>
        </div>
      </div>
    </section>
  );
};

