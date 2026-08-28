import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { RotateCcw, BookOpen } from 'lucide-react';
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
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { GradingPage } from './pages/GradingPage';
import { LegalPage } from './pages/LegalPage';

export type ViewType = 'main' | 'results' | 'profile' | 'terms' | 'privacy' | 'grading' | 'legal';

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
  
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    const hash = window.location.hash;
    if (hash === '#results') return 'results';
    if (hash === '#profile') return 'profile';
    if (hash === '#terms') return 'terms';
    if (hash === '#privacy') return 'privacy';
    if (hash === '#grading') return 'grading';
    if (hash === '#legal') return 'legal';
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
      else if (hash === '#terms') setCurrentView('terms');
      else if (hash === '#privacy') setCurrentView('privacy');
      else if (hash === '#grading') setCurrentView('grading');
      else if (hash === '#legal') setCurrentView('legal');
      else setCurrentView('main');
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const navigateTo = (view: ViewType) => {
    if (view === 'main') window.location.hash = '';
    else window.location.hash = view;
  };
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

  // Legal views are "full page" — clean layout, no hero or calculator behind them
  const isLegalView = currentView === 'terms' || currentView === 'privacy' || currentView === 'grading' || currentView === 'legal';

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
          className: 'text-sm font-bold shadow-xl',
          style: { background: '#000', color: '#fff', padding: '12px 20px', border: '2px solid #E6B400', borderRadius: '8px', zIndex: 99999 }
        }}
      />

      <AuthModal />

      <div className={`min-h-screen relative selection:bg-yellow-400/30 font-sans ${!appLoaded ? 'hidden' : ''}`}>
        <Header currentView={currentView} navigateTo={navigateTo} activeSection={activeSection} />
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

        {/* ── LEGAL PAGES: Clean full-page layout ── */}
        {isLegalView ? (
          <main className="min-h-[calc(100vh-64px)] pb-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
              {currentView === 'terms' && <TermsPage onBack={() => navigateTo('main')} />}
              {currentView === 'privacy' && <PrivacyPage onBack={() => navigateTo('main')} />}
              {currentView === 'grading' && <GradingPage onBack={() => navigateTo('main')} />}
              {currentView === 'legal' && <LegalPage onBack={() => navigateTo('main')} />}
            </div>
          </main>
        ) : (
          <>
            {/* Fixed page background */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
              <div className="absolute inset-0 bg-background" />
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: 'url(/images/ubit_building_night.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center 40%',
                  filter: 'grayscale(100%) contrast(1.2)',
                }}
              />
            </div>

            <main className="pb-6 sm:pb-20">
              {/* ── HERO — only shows on main/results/profile ── */}
              {(currentView === 'main' || currentView === 'results') && (
                <motion.section
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative overflow-hidden pt-6 pb-4"
                >
                  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="relative rounded-xl overflow-hidden mb-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
                        <img
                          src="/images/ubit_building_day.jpg"
                          alt="UBIT Building"
                          className="w-full h-40 sm:h-56 object-cover"
                          loading="eager"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex items-end p-4 sm:p-6">
                          <div className="text-left">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-400 text-black border border-black font-extrabold text-[10px] sm:text-xs tracking-wider uppercase mb-2">
                              <BookOpen size={11} />
                              Umaer Basha Institute of Information Technology
                            </span>
                            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                              {currentView === 'results' ? 'Department Results Portal' : 'Academic Results & GPA Hub'}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-300 font-medium mt-1">
                              University of Karachi · BSCS Batch 2024–28
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.section>
              )}

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
                <AnimatePresence mode="wait">
                  {currentView === 'profile' ? (
                    <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                      {user && profile ? <ProfilePage /> : <AuthGate />}
                    </motion.div>
                  ) : currentView === 'main' ? (
                    <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6 sm:space-y-10">
                      <section id="calculator" className="space-y-4">
                        <div className="flex justify-end">
                          <button
                            onClick={clearGrades}
                            className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 border-2 border-red-300 rounded-lg font-bold text-xs transition-all active:scale-95"
                          >
                            <RotateCcw size={13} />
                            Clear All
                          </button>
                        </div>
                        <Calculator
                          sem1Grades={sem1Grades} setSem1Grades={setSem1Grades}
                          sem2Grades={sem2Grades} setSem2Grades={setSem2Grades}
                          sem3Grades={sem3Grades} setSem3Grades={setSem3Grades}
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
                    </motion.div>
                  ) : (
                    /* Results View — open to everyone, auth only needed to edit */
                    <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                      <ResultsPortal
                        onPrefill={(s1: Record<string, number | ''>, s2: Record<string, number | ''>, s3?: Record<string, number | ''>) => {
                          setSem1Grades(s1);
                          setSem2Grades(s2);
                          setSem3Grades(s3 || SEM3_COURSES.reduce((acc, c) => ({ ...acc, [c.code]: '' }), {}));
                          navigateTo('main');
                          setTimeout(() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' }), 100);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </main>
          </>
        )}

        <Footer navigateTo={navigateTo} />
      </div>
    </>
  );
}

export default App;

