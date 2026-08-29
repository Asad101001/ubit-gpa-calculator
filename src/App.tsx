import { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { RotateCcw } from 'lucide-react';

import { getGradePoint, SEM1_COURSES, SEM2_COURSES, SEM3_COURSES } from './lib/utils';
import { triggerConfetti } from './lib/confetti';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { AuthGate } from './components/AuthGate';
import { MobileBottomNav } from './components/MobileBottomNav';
import { useAuthStore } from './store/useAuthStore';

// Code-split heavy secondary views and modals so initial mobile payload is ultra-lean
const Calculator = lazy(() => import('./components/Calculator').then(m => ({ default: m.Calculator })));
const Analytics = lazy(() => import('./components/Analytics').then(m => ({ default: m.Analytics })));
const TargetCGPA = lazy(() => import('./components/TargetCGPA').then(m => ({ default: m.TargetCGPA })));
const Leaderboard = lazy(() => import('./components/Leaderboard').then(m => ({ default: m.Leaderboard })));
const SubmitModal = lazy(() => import('./components/Leaderboard').then(m => ({ default: m.SubmitModal })));
const BoycottModal = lazy(() => import('./components/BoycottModal').then(m => ({ default: m.BoycottModal })));
const ResultsPortal = lazy(() => import('./components/ResultsPortal').then(m => ({ default: m.ResultsPortal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const ProfilePage = lazy(() => import('./components/ProfilePage').then(m => ({ default: m.ProfilePage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const GradingPage = lazy(() => import('./pages/GradingPage').then(m => ({ default: m.GradingPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then(m => ({ default: m.LegalPage })));

const ViewFallback = () => (
  <div className="py-20 flex flex-col items-center justify-center gap-3">
    <div className="w-8 h-8 border-3 border-black border-t-yellow-400 rounded-full animate-spin" />
    <span className="font-mono text-xs font-bold text-gray-600 uppercase tracking-wider">Loading view...</span>
  </div>
);

export type ViewType = 'home' | 'calculator' | 'results' | 'profile' | 'terms' | 'privacy' | 'grading' | 'legal';


function App() {
  const { user, profile, initialize: initAuth } = useAuthStore();
  
  const [currentView, setCurrentView] = useState<ViewType>(() => {

    const hash = window.location.hash;
    if (hash === '#calculator') return 'calculator';
    if (hash === '#results') return 'results';
    if (hash === '#profile') return 'profile';
    if (hash === '#terms') return 'terms';
    if (hash === '#privacy') return 'privacy';
    if (hash === '#grading') return 'grading';
    if (hash === '#legal') return 'legal';
    return 'home';
  });


  // Initialize auth on mount
  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#calculator') setCurrentView('calculator');
      else if (hash === '#results') setCurrentView('results');
      else if (hash === '#profile') setCurrentView('profile');
      else if (hash === '#terms') setCurrentView('terms');
      else if (hash === '#privacy') setCurrentView('privacy');
      else if (hash === '#grading') setCurrentView('grading');
      else if (hash === '#legal') setCurrentView('legal');
      else setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [activeSection, setActiveSection] = useState<string>('calculator');

  useEffect(() => {
    if (currentView !== 'calculator') return;
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

    const sections = ['calculator', 'target-advisor', 'analytics', 'leaderboard'].map(id => document.getElementById(id));
    sections.forEach(s => s && observer.observe(s));
    return () => observer.disconnect();
  }, [currentView, activeSection]);

  const navigateTo = (view: ViewType) => {
    if (view === 'home') window.location.hash = '';
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

  const { gpa1, gpa2, cgpa, bestCourse, worstCourse } = useMemo(() => {


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
    return {
      gpa1: s1Calc.gpa.toFixed(2),
      gpa2: s2Calc.gpa.toFixed(2),
      gpa3: s3Calc.gpa.toFixed(2),
      cgpa: cgpaCalc.toFixed(3),
      bestCourse: best,
      worstCourse: worst,
    };
  }, [sem1Grades, sem2Grades, sem3Grades]);



  const chartData = useMemo(() => {
    return [
      ...SEM1_COURSES.map(c => {
        const val = sem1Grades[c.code];
        const isFilled = typeof val === 'number' && !isNaN(val);
        return {
          name: c.code,
          fullname: c.name,
          semester: 'Sem 1',
          gpa: isFilled ? getGradePoint(val) : 0,
          isFilled,
        };
      }),
      ...SEM2_COURSES.map(c => {
        const val = sem2Grades[c.code];
        const isFilled = typeof val === 'number' && !isNaN(val);
        return {
          name: c.code,
          fullname: c.name,
          semester: 'Sem 2',
          gpa: isFilled ? getGradePoint(val) : 0,
          isFilled,
        };
      }),
      ...SEM3_COURSES.filter(c => sem3Grades && typeof sem3Grades[c.code] === 'number' && !isNaN(sem3Grades[c.code] as number)).map(c => ({
        name: c.code,
        fullname: c.name,
        semester: 'Sem 3',
        gpa: getGradePoint(sem3Grades[c.code] as number),
        isFilled: true,
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
      triggerConfetti();
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
      <Toaster
        position="top-center"
        gutter={10}
        containerStyle={{
          top: 24,
          zIndex: 99999
        }}
        toastOptions={{
          duration: 3500,
          className: 'text-xs sm:text-sm font-bold tracking-tight',
          style: {
            background: '#ffffff',
            color: '#000000',
            border: '2px solid #000000',
            borderRadius: '14px',
            padding: '12px 18px',
            boxShadow: '4px 4px 0px 0px #000000',
            fontWeight: 800,
            fontSize: '13px',
            maxWidth: '92vw'
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#000000',
              secondary: '#fbbf24'
            },
            style: {
              background: '#ffffff',
              border: '2px solid #000000',
              boxShadow: '4px 4px 0px 0px #000000',
              color: '#000000'
            }
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff'
            },
            style: {
              background: '#fef2f2',
              border: '2px solid #dc2626',
              boxShadow: '4px 4px 0px 0px #000000',
              color: '#991b1b'
            }
          },
          loading: {
            style: {
              background: '#ffffff',
              border: '2px solid #000000',
              boxShadow: '4px 4px 0px 0px #000000',
              color: '#000000'
            }
          }
        }}
      />

      <Suspense fallback={null}>
        <AuthModal />
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
      </Suspense>

      <div className="min-h-screen relative selection:bg-yellow-400/30 font-sans">

        <Header currentView={currentView} navigateTo={navigateTo} activeSection={activeSection} />

        {/* ── LEGAL PAGES: Clean full-page layout ── */}
        {isLegalView ? (
          <main className="min-h-screen pb-16 bg-white pt-16 sm:pt-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
              <Suspense fallback={<ViewFallback />}>
                {currentView === 'terms' && <TermsPage onBack={() => navigateTo('home')} />}
                {currentView === 'privacy' && <PrivacyPage onBack={() => navigateTo('home')} />}
                {currentView === 'grading' && <GradingPage onBack={() => navigateTo('home')} />}
                {currentView === 'legal' && <LegalPage onBack={() => navigateTo('home')} />}
              </Suspense>
            </div>
          </main>


        ) : (
          <>
            {/* Fixed page background - disabled on small screens to save mobile data & paint */}
            <div className="hidden sm:block fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
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

            <main className="pb-24 md:pb-16 pt-16 sm:pt-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <AnimatePresence mode="wait" initial={false}>
                  {currentView === 'home' ? (
                    <motion.div key="home" initial={false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      <HomePage
                        navigateTo={navigateTo}
                        gpa1={gpa1}
                        gpa2={gpa2}
                        cgpa={cgpa}
                        hasGrades={Object.values(sem1Grades).some(v => v !== '') || Object.values(sem2Grades).some(v => v !== '')}
                      />
                    </motion.div>

                  ) : currentView === 'profile' ? (
                    <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                      <Suspense fallback={<ViewFallback />}>
                        {user && profile ? <ProfilePage /> : <AuthGate />}
                      </Suspense>
                    </motion.div>
                  ) : currentView === 'calculator' ? (
                    <motion.div key="calculator" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-6 sm:space-y-10">
                      <Suspense fallback={<ViewFallback />}>
                        <section id="calculator" className="space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b-2 border-black/10">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                              <span className="text-xs font-mono font-black uppercase text-gray-700 tracking-wider">
                                Interactive Mark Inputs
                              </span>
                            </div>
                            <button
                              onClick={clearGrades}
                              className="group flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 border-2 border-red-400 hover:border-red-600 rounded-lg font-black text-xs transition-all active:scale-95 shadow-[1.5px_1.5px_0px_0px_#f87171]"
                            >
                              <RotateCcw size={12} className="group-hover:-rotate-180 transition-transform duration-500" />
                              Clear All Marks
                            </button>
                          </div>
                          <Calculator
                            sem1Grades={sem1Grades} setSem1Grades={setSem1Grades}
                            sem2Grades={sem2Grades} setSem2Grades={setSem2Grades}
                            sem3Grades={sem3Grades} setSem3Grades={setSem3Grades}
                            cgpa={cgpa}
                          />
                        </section>

                        <TargetCGPA
                          sem1Grades={sem1Grades}
                          sem2Grades={sem2Grades}
                          sem3Grades={sem3Grades}
                          currentCgpa={cgpa}
                        />

                        <Analytics
                          bestCourse={bestCourse} worstCourse={worstCourse}
                          chartData={chartData}
                          sem1Grades={sem1Grades} sem2Grades={sem2Grades} sem3Grades={sem3Grades}
                        />

                        <Leaderboard
                          leaderboardData={leaderboardData}
                          isLeaderboardLoading={isLeaderboardLoading}
                          setIsSubmitModalOpen={setIsSubmitModalOpen}
                          cgpa={cgpa}
                          hasSubmitted={hasSubmitted}
                        />
                      </Suspense>
                    </motion.div>
                  ) : (
                    /* Results View — open to everyone, auth only needed to edit */
                    <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                      <Suspense fallback={<ViewFallback />}>
                        <ResultsPortal
                          onPrefill={(s1: Record<string, number | ''>, s2: Record<string, number | ''>, s3?: Record<string, number | ''>) => {
                            setSem1Grades(s1);
                            setSem2Grades(s2);
                            setSem3Grades(s3 || SEM3_COURSES.reduce((acc, c) => ({ ...acc, [c.code]: '' }), {}));
                            navigateTo('calculator');
                            setTimeout(() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' }), 100);
                          }}
                        />
                      </Suspense>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </main>


          </>
        )}

        <Footer navigateTo={navigateTo} />

        {/* ── MOBILE BRUTALIST BOTTOM NAV DOCK ── */}
        <MobileBottomNav
          currentView={currentView}
          navigateTo={navigateTo}
        />

      </div>
    </>
  );
}

export default App;



