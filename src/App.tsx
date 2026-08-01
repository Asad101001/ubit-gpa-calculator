import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { GraduationCap, Sparkles, RotateCcw } from 'lucide-react';
import { getGradePoint, SEM1_COURSES, SEM2_COURSES, SEM3_COURSES } from './lib/utils';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Calculator } from './components/Calculator';
import { Analytics } from './components/Analytics';
import { TargetCGPA } from './components/TargetCGPA';
import { Leaderboard, SubmitModal } from './components/Leaderboard';
import { BoycottModal } from './components/BoycottModal';
import { SplashScreen } from './components/SplashScreen';
import { ResultsPortal } from './components/ResultsPortal';
import { AuthModal } from './components/AuthModal';
import { AuthGate } from './components/AuthGate';
import { ProfilePage } from './components/ProfilePage';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const { user, profile, initialize: initAuth } = useAuthStore();

  const [appLoaded, setAppLoaded] = useState(() => {
    const lastSplash = localStorage.getItem('lastSplashTime');
    const now = Date.now();
    if (lastSplash && (now - parseInt(lastSplash) < 10 * 60 * 1000)) {
      return true;
    }
    return false;
  });
  
  const [currentView, setCurrentView] = useState<'main' | 'results' | 'profile'>(() => {
    const hash = window.location.hash;
    if (hash === '#results') return 'results';
    if (hash === '#profile') return 'profile';
    return 'main';
  });

  // Initialize auth on mount
  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#results') setCurrentView('results');
      else if (hash === '#profile') setCurrentView('profile');
      else setCurrentView('main');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [activeSection, setActiveSection] = useState<string>('calculator');

  useEffect(() => {
    if (currentView !== 'main') return;
    const observer = new IntersectionObserver(
      (entries) => {
        let maxRatio = 0;
        let activeId = activeSection;
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            activeId = entry.target.id;
          }
        });
        if (maxRatio > 0) setActiveSection(activeId);
      },
      { rootMargin: '-20% 0px -40% 0px', threshold: [0.1, 0.5] }
    );

    const sections = ['calculator', 'analytics', 'leaderboard'].map(id => document.getElementById(id));
    sections.forEach(s => s && observer.observe(s));
    return () => observer.disconnect();
  }, [currentView, activeSection]);

  const navigateTo = (view: 'main' | 'results' | 'profile') => {
    if (view === 'results') window.location.hash = 'results';
    else if (view === 'profile') window.location.hash = 'profile';
    else window.location.hash = '';
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSem3ModalOpen, setIsSem3ModalOpen] = useState(false);
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



  // Initialize from LocalStorage
  const [sem1Grades, setSem1Grades] = useState<Record<string, number | ''>>(() => {
    const saved = localStorage.getItem('sem1Grades');
    return saved ? JSON.parse(saved) : SEM1_COURSES.reduce((acc, c) => ({ ...acc, [c.code]: '' }), {});
  });
  const [sem2Grades, setSem2Grades] = useState<Record<string, number | ''>>(() => {
    const saved = localStorage.getItem('sem2Grades');
    return saved ? JSON.parse(saved) : SEM2_COURSES.reduce((acc, c) => ({ ...acc, [c.code]: '' }), {});
  });
  const [sem3Grades, setSem3Grades] = useState<Record<string, number | ''>>(() => {
    const saved = localStorage.getItem('sem3Grades');
    return saved ? JSON.parse(saved) : SEM3_COURSES.reduce((acc, c) => ({ ...acc, [c.code]: '' }), {});
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('sem1Grades', JSON.stringify(sem1Grades));
  }, [sem1Grades]);

  useEffect(() => {
    localStorage.setItem('sem2Grades', JSON.stringify(sem2Grades));
  }, [sem2Grades]);

  useEffect(() => {
    localStorage.setItem('sem3Grades', JSON.stringify(sem3Grades));
  }, [sem3Grades]);

  const clearGrades = () => {
    setSem1Grades(SEM1_COURSES.reduce((acc, c) => ({ ...acc, [c.code]: '' }), {}));
    setSem2Grades(SEM2_COURSES.reduce((acc, c) => ({ ...acc, [c.code]: '' }), {}));
    setSem3Grades(SEM3_COURSES.reduce((acc, c) => ({ ...acc, [c.code]: '' }), {}));
    toast.success('Results cleared successfully!', { icon: '✨' });
  };

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

  const { gpa1, gpa2, gpa3, cgpa, bestCourse, worstCourse, radarData } = useMemo(() => {
    const s1Calc = calculateGPA(SEM1_COURSES, sem1Grades);
    const s2Calc = calculateGPA(SEM2_COURSES, sem2Grades);
    const s3Calc = calculateGPA(SEM3_COURSES, sem3Grades);
    
    const validCredits = s1Calc.totalCredits + s2Calc.totalCredits + s3Calc.totalCredits;
    const cgpaCalc = validCredits > 0 ? (s1Calc.totalQP + s2Calc.totalQP + s3Calc.totalQP) / validCredits : 0;
    
    let allCourses = [
      ...SEM1_COURSES.filter(c => sem1Grades[c.code] !== '').map(c => ({ name: c.name, type: c.type, gp: getGradePoint(sem1Grades[c.code] as number) })),
      ...SEM2_COURSES.filter(c => sem2Grades[c.code] !== '').map(c => ({ name: c.name, type: c.type, gp: getGradePoint(sem2Grades[c.code] as number) })),
      ...SEM3_COURSES.filter(c => sem3Grades[c.code] !== '').map(c => ({ name: c.name, type: c.type, gp: getGradePoint(sem3Grades[c.code] as number) }))
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
      gpa3: s3Calc.gpa.toFixed(2),
      cgpa: cgpaCalc.toFixed(3),
      bestCourse: best,
      worstCourse: worst,
      radarData: rData
    };
  }, [sem1Grades, sem2Grades, sem3Grades]);

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
      })),
      ...SEM3_COURSES.filter(c => sem3Grades[c.code] !== '').map(c => ({
        name: c.code,
        fullname: c.name,
        semester: 'Sem 3',
        gpa: getGradePoint(sem3Grades[c.code] as number),
      }))
    ];
  }, [sem1Grades, sem2Grades, sem3Grades]);


  const handleLeaderboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitName.trim() || Number(cgpa) <= 0) {
      toast.error('Please enter a valid name and calculate your CGPA first.');
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(submitName.trim())) {
      toast.error('Name can only contain letters and spaces.');
      return;
    }

    
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
      toast.success('Successfully added to the Leaderboard!', { icon: '🏆' });
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit. Check your connection.");
      toast.error(err.message || "Failed to submit. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!appLoaded && <SplashScreen onComplete={() => {
          localStorage.setItem('lastSplashTime', Date.now().toString());
          setAppLoaded(true);
        }} />}
      </AnimatePresence>

      <Toaster 
        position="top-center" 
        toastOptions={{ 
          className: 'text-lg font-black shadow-2xl tracking-tight',
          style: { background: '#09090b', color: '#fafafa', padding: '20px 30px', border: '2px solid #3f3f46', borderRadius: '24px', zIndex: 99999 }
        }} 
      />

      {/* Auth Modal */}
      <AuthModal />

      <div className={`min-h-screen relative selection:bg-brand-500/30 font-sans ${!appLoaded ? 'hidden' : ''}`}>
        <Header currentView={currentView} navigateTo={navigateTo} activeSection={activeSection} />
        <BoycottModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        <BoycottModal 
          isOpen={isSem3ModalOpen} 
          onClose={() => setIsSem3ModalOpen(false)}
          variant="fresh"
          title="Semester Just Started!"
          message="Bro, the semester literally just started. No results yet — go touch some grass first."
          errorCode="ERR_TOO_EARLY_BRO"
        />
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

        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-background">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-500/20 via-background to-background" />
          <div className="hidden sm:block absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-500/10 blur-[120px] animate-blob" />
          <div className="hidden sm:block absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-accent-500/10 blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
          <div className="hidden sm:block absolute top-[20%] left-[30%] w-[50vw] h-[50vw] rounded-full bg-brand-400/10 blur-[120px] animate-blob" style={{ animationDelay: '4s' }} />
          <div className="sm:hidden absolute inset-0 bg-gradient-to-br from-brand-500/10 via-background to-accent-500/10" />
        </div>

        <main className="pb-6 sm:pb-16 space-y-6 sm:space-y-16">
          <section id="calculator" className="relative pt-4 sm:pt-12 pb-4 sm:pb-8 px-4">
            <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background" />
            </div>

            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center relative max-w-4xl mx-auto"
            >
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-brand-500/30 blur-xl rounded-full" />
                <div className="relative inline-flex items-center justify-center p-3 sm:p-4 bg-surface/70 border border-border rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-2xl backdrop-blur-xl">
                  <GraduationCap className="text-brand-500 w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-textMain via-textMain/90 to-textMuted mb-3 sm:mb-4 tracking-tighter">
                GPA Calculator
              </h1>
              <p className="text-sm sm:text-lg md:text-xl text-textMuted font-medium max-w-2xl mx-auto flex items-center justify-center gap-2 sm:gap-3 mb-6">
                <Sparkles className="text-brand-500 w-4 h-4 sm:w-5 sm:h-5" />
                Department of Computer Science
              </p>

            </motion.div>
          </section>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-16">
            {currentView === 'profile' ? (
              user && profile ? (
                <ProfilePage />
              ) : (
                <AuthGate />
              )
            ) : currentView === 'main' ? (
              <>
                <section className="space-y-4 sm:space-y-8">
                  <div className="flex justify-end">
                    <button 
                      onClick={clearGrades}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95"
                    >
                      <RotateCcw size={16} />
                      Clear Results
                    </button>
                  </div>
                  <Calculator 
                    sem1Grades={sem1Grades} setSem1Grades={setSem1Grades}
                    sem2Grades={sem2Grades} setSem2Grades={setSem2Grades}
                    sem3Grades={sem3Grades} setSem3Grades={setSem3Grades}
                    onSem3InfoClick={() => setIsSem3ModalOpen(true)}
                  />
                </section>

                <TargetCGPA
                  sem1Grades={sem1Grades}
                  sem2Grades={sem2Grades}
                  sem3Grades={sem3Grades}
                  currentCgpa={cgpa}
                />

                <Analytics 
                  gpa1={gpa1} gpa2={gpa2} gpa3={gpa3} cgpa={cgpa}
                  bestCourse={bestCourse} worstCourse={worstCourse}
                  radarData={radarData} chartData={chartData}
                  sem1Grades={sem1Grades} sem2Grades={sem2Grades} sem3Grades={sem3Grades}
                />

                <Leaderboard 
                  leaderboardData={leaderboardData}
                  isLeaderboardLoading={isLeaderboardLoading}
                  setIsSubmitModalOpen={setIsSubmitModalOpen}
                  cgpa={cgpa}
                  hasSubmitted={hasSubmitted}
                />
              </>
            ) : (
              /* Results View — gated behind auth */
              user ? (
                <ResultsPortal 
                  onPrefill={(s1: Record<string, number | ''>, s2: Record<string, number | ''>, s3?: Record<string, number | ''>) => {
                    setSem1Grades(s1);
                    setSem2Grades(s2);
                    setSem3Grades(s3 || SEM3_COURSES.reduce((acc, c) => ({ ...acc, [c.code]: '' }), {}));
                    navigateTo('main');
                    setTimeout(() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                />
              ) : (
                <AuthGate />
              )
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default App;
