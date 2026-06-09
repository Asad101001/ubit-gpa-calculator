import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Sparkles, AlertTriangle } from 'lucide-react';
import { getGradePoint, SEM1_COURSES, SEM2_COURSES } from './lib/utils';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Calculator } from './components/Calculator';
import { Analytics } from './components/Analytics';
import { Leaderboard, SubmitModal } from './components/Leaderboard';
import { BoycottModal } from './components/BoycottModal';
import { SplashScreen } from './components/SplashScreen';

function App() {
  const [appLoaded, setAppLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);

  // Submit Modal States
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitName, setSubmitName] = useState(() => localStorage.getItem('submitName') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(() => localStorage.getItem('hasSubmitted') === 'true');

  useEffect(() => {
    localStorage.setItem('submitName', submitName);
  }, [submitName]);

  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isDownloadingWrapped, setIsDownloadingWrapped] = useState(false);

  // Initialize from LocalStorage
  const [sem1Grades, setSem1Grades] = useState<Record<string, number | ''>>(() => {
    const saved = localStorage.getItem('sem1Grades');
    return saved ? JSON.parse(saved) : SEM1_COURSES.reduce((acc, c) => ({ ...acc, [c.code]: '' }), {});
  });
  const [sem2Grades, setSem2Grades] = useState<Record<string, number | ''>>(() => {
    const saved = localStorage.getItem('sem2Grades');
    return saved ? JSON.parse(saved) : SEM2_COURSES.reduce((acc, c) => ({ ...acc, [c.code]: '' }), {});
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('sem1Grades', JSON.stringify(sem1Grades));
  }, [sem1Grades]);

  useEffect(() => {
    localStorage.setItem('sem2Grades', JSON.stringify(sem2Grades));
  }, [sem2Grades]);

  // Fetch Live Leaderboard
  const fetchLeaderboard = async () => {
    setIsLeaderboardLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setLeaderboardData(data);
      } else {
        console.error("Failed to fetch leaderboard from Edge Cache");
      }
    } catch (e) {
      console.error(e);
    }
    setIsLeaderboardLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const calculateGPA = (courses: typeof SEM1_COURSES, grades: Record<string, number | ''>) => {
    let totalQP = 0;
    let totalCredits = 0;
    let highest = { name: "N/A", gp: -1 };
    let lowest = { name: "N/A", gp: 5 };

    courses.forEach(c => {
      if (grades[c.code] !== '') {
        const marks = grades[c.code] as number;
        const gp = getGradePoint(marks);
        totalQP += gp * c.credits;
        totalCredits += c.credits;
        
        if (gp > highest.gp) highest = { name: c.name, gp };
        if (gp < lowest.gp) lowest = { name: c.name, gp };
      }
    });
    return { gpa: totalCredits > 0 ? totalQP / totalCredits : 0, totalQP, totalCredits, highest, lowest };
  };

  const { gpa1, gpa2, cgpa, bestCourse, worstCourse, radarData } = useMemo(() => {
    const s1Calc = calculateGPA(SEM1_COURSES, sem1Grades);
    const s2Calc = calculateGPA(SEM2_COURSES, sem2Grades);
    
    const validCredits = s1Calc.totalCredits + s2Calc.totalCredits;
    const cgpaCalc = validCredits > 0 ? (s1Calc.totalQP + s2Calc.totalQP) / validCredits : 0;
    
    let allCourses = [
      ...SEM1_COURSES.filter(c => sem1Grades[c.code] !== '').map(c => ({ name: c.name, type: c.type, gp: getGradePoint(sem1Grades[c.code] as number) })),
      ...SEM2_COURSES.filter(c => sem2Grades[c.code] !== '').map(c => ({ name: c.name, type: c.type, gp: getGradePoint(sem2Grades[c.code] as number) }))
    ];

    allCourses.sort((a, b) => b.gp - a.gp);
    const best = allCourses.length > 0 ? allCourses[0] : { name: "N/A", gp: 0 };
    const worst = allCourses.length > 0 ? allCourses[allCourses.length - 1] : { name: "N/A", gp: 0 };

    const typeGroups: Record<string, { total: number, count: number }> = {};
    allCourses.forEach(c => {
      if (!typeGroups[c.type]) typeGroups[c.type] = { total: 0, count: 0 };
      typeGroups[c.type].total += c.gp;
      typeGroups[c.type].count += 1;
    });

    const rData = Object.keys(typeGroups).length > 0 
      ? Object.keys(typeGroups).map(type => ({
          subject: type,
          A: Number((typeGroups[type].total / typeGroups[type].count).toFixed(2)),
          fullMark: 4.0
        }))
      : [
          { subject: 'Programming', A: 0, fullMark: 4.0 },
          { subject: 'Math', A: 0, fullMark: 4.0 },
          { subject: 'Soft Skills', A: 0, fullMark: 4.0 }
        ];

    return {
      gpa1: s1Calc.gpa.toFixed(2),
      gpa2: s2Calc.gpa.toFixed(2),
      cgpa: cgpaCalc.toFixed(3),
      bestCourse: best,
      worstCourse: worst,
      radarData: rData
    };
  }, [sem1Grades, sem2Grades]);

  const chartData = useMemo(() => {
    return [
      ...SEM1_COURSES.filter(c => sem1Grades[c.code] !== '').map(c => ({
        name: c.code,
        fullname: c.name,
        semester: 'Sem 1',
        gpa: getGradePoint(sem1Grades[c.code] as number),
      })),
      ...SEM2_COURSES.filter(c => sem2Grades[c.code] !== '').map(c => ({
        name: c.code,
        fullname: c.name,
        semester: 'Sem 2',
        gpa: getGradePoint(sem2Grades[c.code] as number),
      }))
    ];
  }, [sem1Grades, sem2Grades]);

  const userPercentile = useMemo(() => {
    if (!hasSubmitted || Number(cgpa) <= 0 || leaderboardData.length === 0) return null;
    const userScore = Number(cgpa);
    const lowerScores = leaderboardData.filter(student => student.cgpa < userScore).length;
    const percentile = Math.floor((lowerScores / leaderboardData.length) * 100);
    return Math.max(1, percentile); 
  }, [hasSubmitted, cgpa, leaderboardData]);

  const globalStats = useMemo(() => {
    if (leaderboardData.length === 0) return null;
    
    const sorted = [...leaderboardData].sort((a, b) => a.cgpa - b.cgpa);
    const total = sorted.length;
    const sum = sorted.reduce((acc, curr) => acc + curr.cgpa, 0);
    const avg = sum / total;
    const median = sorted[Math.floor(total / 2)].cgpa;
    const top10Index = Math.floor(total * 0.9);
    const top10Cutoff = sorted[top10Index]?.cgpa || sorted[total - 1].cgpa;

    return {
      total,
      avg: avg.toFixed(2),
      median: median.toFixed(2),
      top10Cutoff: top10Cutoff.toFixed(2)
    };
  }, [leaderboardData]);

  const handleDownloadWrapped = async () => {
    setIsDownloadingWrapped(true);
    try {
      const params = new URLSearchParams({
        name: submitName || 'Student',
        cgpa: cgpa,
        percentile: userPercentile ? userPercentile.toString() : '',
        bestCourseName: bestCourse.name,
        bestCourseGP: bestCourse.gp.toFixed(1),
      });

      const res = await fetch(`/api/wrapped?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to generate wrapped image');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `UBIT_Wrapped_${submitName || 'Batch28'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to fetch wrapped image from edge API", err);
    } finally {
      setIsDownloadingWrapped(false);
    }
  };

  const handleLeaderboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitName.trim() || Number(cgpa) <= 0) return;
    
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = { 
        name: submitName.trim(), 
        cgpa: Number(cgpa), 
        gpa1: Number(gpa1), 
        gpa2: Number(gpa2),
      };
      
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setHasSubmitted(true);
      localStorage.setItem('hasSubmitted', 'true');
      setIsSubmitModalOpen(false);
      fetchLeaderboard(); // Refresh from Edge API
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!appLoaded && <SplashScreen onComplete={() => setAppLoaded(true)} />}
      </AnimatePresence>

      <div className={`min-h-screen relative selection:bg-brand-500/30 font-sans ${!appLoaded ? 'hidden' : ''}`}>
        <Header />
        <BoycottModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        <SubmitModal 
          isOpen={isSubmitModalOpen} 
          onClose={() => !isSubmitting && setIsSubmitModalOpen(false)} 
          onSubmit={handleLeaderboardSubmit}
          name={submitName}
          setName={setSubmitName}
          isSubmitting={isSubmitting}
          error={submitError}
          currentCgpa={cgpa}
        />

        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-slate-50">
          <div className="absolute inset-0 opacity-[0.25] mix-blend-luminosity" />
          <div className="hidden sm:block absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-400/40 blur-[150px] mix-blend-multiply animate-blob" />
          <div className="hidden sm:block absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-teal-400/40 blur-[150px] mix-blend-multiply animate-blob animation-delay-2000" />
          <div className="hidden sm:block absolute top-[30%] left-[30%] w-[50vw] h-[50vw] rounded-full bg-emerald-300/40 blur-[150px] mix-blend-multiply animate-blob animation-delay-4000" />
          <div className="sm:hidden absolute inset-0 bg-gradient-to-br from-emerald-100 via-slate-50 to-teal-100" />
        </div>

        <main className="pb-6 sm:pb-16 space-y-6 sm:space-y-16">
          <section id="calculator" className="relative pt-4 sm:pt-12 pb-4 sm:pb-8 px-4">
            <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 via-slate-50/90 to-slate-50" />
            </div>

            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center relative max-w-4xl mx-auto"
            >
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-brand-500/30 blur-xl rounded-full" />
                <div className="relative inline-flex items-center justify-center p-3 sm:p-4 bg-white/70 border border-slate-300 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-2xl backdrop-blur-xl">
                  <GraduationCap className="text-brand-400 w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-slate-800 to-slate-500 mb-3 sm:mb-4 tracking-tighter">
                GPA Calculator
              </h1>
              <p className="text-sm sm:text-lg md:text-xl text-slate-600 font-medium max-w-2xl mx-auto flex items-center justify-center gap-2 sm:gap-3">
                <Sparkles className="text-brand-400 w-4 h-4 sm:w-5 sm:h-5" />
                Department of Computer Science
              </p>
            </motion.div>
          </section>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-16">
            <section className="space-y-4 sm:space-y-8">
              <Calculator 
                sem1Grades={sem1Grades} setSem1Grades={setSem1Grades}
                sem2Grades={sem2Grades} setSem2Grades={setSem2Grades}
              />
              
              <motion.div 
                onClick={() => setIsModalOpen(true)}
                className="w-full glass rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 md:p-8 border-slate-300 relative overflow-hidden cursor-pointer hover:border-yellow-400/30 transition-colors group mt-8"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/20 flex items-center justify-center text-sm sm:text-lg font-bold text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.15)] group-hover:scale-110 transition-transform">
                      03
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-2xl font-bold text-slate-800 tracking-tight">Semester Three</h2>
                      <p className="text-[9px] sm:text-sm font-medium text-yellow-400/80 uppercase tracking-widest mt-0.5 sm:mt-1 flex items-center gap-1 sm:gap-2">
                        <AlertTriangle size={12} className="w-[10px] h-[10px] sm:w-[14px] sm:h-[14px]" /> Pending Exams
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-yellow-400/10 text-yellow-400 font-bold rounded-xl text-sm hidden sm:block border border-yellow-400/20">
                    Click to Uncover
                  </div>
                </div>
              </motion.div>
            </section>

            <Analytics 
              gpa1={gpa1} gpa2={gpa2} cgpa={cgpa}
              bestCourse={bestCourse} worstCourse={worstCourse}
              radarData={radarData} chartData={chartData}
              sem1Grades={sem1Grades} sem2Grades={sem2Grades}
              isStatsOpen={isStatsOpen} setIsStatsOpen={setIsStatsOpen}
              globalStats={globalStats}
            />

            <Leaderboard 
              leaderboardData={leaderboardData}
              isLeaderboardLoading={isLeaderboardLoading}
              setIsSubmitModalOpen={setIsSubmitModalOpen}
              cgpa={cgpa}
              hasSubmitted={hasSubmitted}
              userPercentile={userPercentile}
              handleDownloadWrapped={handleDownloadWrapped}
              isDownloadingWrapped={isDownloadingWrapped}
            />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default App;
