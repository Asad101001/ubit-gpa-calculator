import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Cpu, Layout, ShieldCheck, HeartHandshake, 
  Smartphone, BookOpen, Clock, Layers, CheckCircle2, ChevronRight 
} from 'lucide-react';

export interface Sem5CourseDetail {
  code: string;
  name: string;
  credits: number;
  theoryCr: number;
  labCr: number;
  category: 'Core Computing' | 'Domain Elective' | 'General';
  prerequisite: string;
  scheduleHint?: string;
  description: string;
  keyTopics: string[];
  icon: any;
  accentColor: string;
  bgColor: string;
}

export const SEM5_DETAILED_COURSES: Sem5CourseDetail[] = [
  {
    code: 'CS-551',
    name: 'Artificial Intelligence',
    credits: 3,
    theoryCr: 2,
    labCr: 1,
    category: 'Core Computing',
    prerequisite: 'Data Structures & Applications (CS-451)',
    description: 'Foundations of intelligent agents, problem-solving through search, heuristics, knowledge representation, probabilistic reasoning, and introduction to modern machine learning.',
    keyTopics: ['Uninformed & Informed Search', 'Adversarial Search & Game Theory', 'Knowledge Bases & First-Order Logic', 'Probabilistic Reasoning & Bayesian Networks', 'Introduction to Machine Learning & Neural Networks'],
    icon: Sparkles,
    accentColor: 'text-purple-700 border-purple-400 bg-purple-50',
    bgColor: 'bg-purple-600',
  },
  {
    code: 'CS-553',
    name: 'Operating System',
    credits: 4,
    theoryCr: 3,
    labCr: 1,
    category: 'Core Computing',
    prerequisite: 'Computer Architecture (CS-454) & Data Structures (CS-451)',
    description: 'Comprehensive study of operating system abstractions, process synchronization, CPU scheduling algorithms, virtual memory management, deadlock prevention, and distributed file systems.',
    keyTopics: ['Process & Thread Management', 'CPU Scheduling & Real-Time Scheduling', 'Mutual Exclusion, Semaphores & Deadlocks', 'Paging, Segmentation & Virtual Memory', 'File System Implementation & Disk I/O'],
    icon: Cpu,
    accentColor: 'text-blue-700 border-blue-400 bg-blue-50',
    bgColor: 'bg-blue-600',
  },
  {
    code: 'CS-555',
    name: 'HCI & Computer Graphics',
    credits: 3,
    theoryCr: 2,
    labCr: 1,
    category: 'Domain Elective',
    prerequisite: 'Linear Algebra (CS-356) & Programming Fundamentals',
    description: 'Human-computer interaction principles combined with fundamental computer graphics. Covers usability heuristics, interaction design, raster graphics, 2D/3D transformations, and GPU rendering pipelines.',
    keyTopics: ['Usability Heuristics & User-Centered Design', 'Information Architecture & Prototyping', '2D/3D Affine Transformations', 'Rasterization, Shading & Lighting Models', 'OpenGL / WebGL Shader Pipeline'],
    icon: Layout,
    accentColor: 'text-emerald-700 border-emerald-400 bg-emerald-50',
    bgColor: 'bg-emerald-600',
  },
  {
    code: 'CS-557',
    name: 'Information Security',
    credits: 3,
    theoryCr: 3,
    labCr: 0,
    category: 'Core Computing',
    prerequisite: 'Data Communication and Networking (CS-460)',
    description: 'Principles of confidentiality, integrity, and availability in computing systems. Covers modern cryptographic algorithms, authentication protocols, network vulnerability assessment, and defensive security.',
    keyTopics: ['Symmetric & Asymmetric Cryptography (AES, RSA)', 'Cryptographic Hash Functions & Digital Signatures', 'Authentication & Access Control Frameworks', 'Network Attacks, Firewalls & Intrusion Detection', 'Web Application Security & OWASP Top 10'],
    icon: ShieldCheck,
    accentColor: 'text-rose-700 border-rose-400 bg-rose-50',
    bgColor: 'bg-rose-600',
  },
  {
    code: 'CS-559',
    name: 'Civics & Community Engagement',
    credits: 2,
    theoryCr: 2,
    labCr: 0,
    category: 'General',
    prerequisite: 'None',
    scheduleHint: '11:00 AM - 01:30 PM',
    description: 'Understanding societal structures, active citizenship, democratic institutions, civic responsibilities, and participatory community service projects.',
    keyTopics: ['Constitutional Rights & Civic Duties', 'Community Engagement & Social Action', 'Public Policy & Local Governance', 'Ethics in Public Life', 'Fieldwork & Social Impact Projects'],
    icon: HeartHandshake,
    accentColor: 'text-amber-700 border-amber-400 bg-amber-50',
    bgColor: 'bg-amber-600',
  },
  {
    code: 'CS-575',
    name: 'Mobile Application Development',
    credits: 3,
    theoryCr: 2,
    labCr: 1,
    category: 'Domain Elective',
    prerequisite: 'Object Oriented Programming (CS-352) & Data Structures (CS-451)',
    description: 'Design and engineering of high-performance mobile applications. Covers responsive mobile UI layout, asynchronous network requests, local caching, state management, and device hardware integration.',
    keyTopics: ['Mobile Architecture & Lifecycle Management', 'Declarative UI (Flutter / Jetpack Compose / React Native)', 'State Management & Async Data Streams', 'RESTful API Integration & Offline SQLite Cache', 'Device Sensors, GPS & App Store Deployment'],
    icon: Smartphone,
    accentColor: 'text-indigo-700 border-indigo-400 bg-indigo-50',
    bgColor: 'bg-indigo-600',
  },
];

interface Semester5ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourseCode?: string | null;
}

export const Semester5Modal = ({ isOpen, onClose, selectedCourseCode }: Semester5ModalProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'lab' | 'theory'>('all');
  const [activeCourseCode, setActiveCourseCode] = useState<string>(
    selectedCourseCode || 'CS-551'
  );

  const filteredCourses = SEM5_DETAILED_COURSES.filter(c => {
    if (activeTab === 'lab') return c.labCr > 0;
    if (activeTab === 'theory') return c.labCr === 0;
    return true;
  });

  const selectedCourse = SEM5_DETAILED_COURSES.find(c => c.code === activeCourseCode) || SEM5_DETAILED_COURSES[0];
  const IconComponent = selectedCourse.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl border-3 border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden my-auto z-10 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#801618] text-white p-5 sm:p-6 border-b-3 border-black flex items-center justify-between relative shrink-0">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-black text-white border-2 border-white flex items-center justify-center font-mono font-black text-lg shadow-[2px_2px_0px_0px_#fff] shrink-0">
                  05
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tight">
                      Semester Five Curriculum
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-black border border-black uppercase">
                      BS 3rd Year • Upcoming
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-100 font-medium mt-0.5">
                    Official DCS UBIT Course Allocation & 18 Credit Hours Breakdown
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white text-black hover:bg-rose-100 border-2 border-black flex items-center justify-center font-black transition-all active:scale-95 shadow-[2px_2px_0px_0px_#000] shrink-0 ml-3"
                aria-label="Close modal"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="bg-rose-50/90 border-b-2 border-black px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold text-gray-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#801618]" />
                  <span>Total: <strong>18 Credits</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span>Theory: <strong>14 Cr</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Labs: <strong>4 Cr</strong></span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                    activeTab === 'all' ? 'bg-[#801618] text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All (6)
                </button>
                <button
                  onClick={() => setActiveTab('lab')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                    activeTab === 'lab' ? 'bg-[#801618] text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  With Labs (4)
                </button>
                <button
                  onClick={() => setActiveTab('theory')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                    activeTab === 'theory' ? 'bg-[#801618] text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Theory Only (2)
                </button>
              </div>
            </div>

            {/* Content: Two-column layout on medium+ screens */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
              {/* Course list selector */}
              <div className="lg:col-span-5 space-y-2.5 order-2 lg:order-1">
                <span className="text-[11px] font-mono font-black uppercase text-gray-500 tracking-wider block mb-1">
                  Select Course to Inspect
                </span>
                {filteredCourses.map((c) => {
                  const Icon = c.icon;
                  const isCurrent = c.code === activeCourseCode;
                  return (
                    <button
                      key={c.code}
                      onClick={() => setActiveCourseCode(c.code)}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-rose-50 border-black shadow-[3px_3px_0px_0px_#801618] translate-x-1'
                          : 'bg-white hover:bg-gray-50 border-black/30 hover:border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.06)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shrink-0 ${c.accentColor}`}>
                          <Icon size={18} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-black text-black">{c.code}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-100 border border-gray-300 text-gray-700">
                              {c.credits} Cr ({c.theoryCr}+{c.labCr})
                            </span>
                          </div>
                          <p className="font-bold text-xs sm:text-sm text-textMain truncate leading-tight mt-0.5">
                            {c.name}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className={`shrink-0 ${isCurrent ? 'text-[#801618]' : 'text-gray-400'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Course Detail Card */}
              <div className="lg:col-span-7 order-1 lg:order-2">
                <div className="bg-white rounded-3xl border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000] h-full flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 pb-4 border-b-2 border-black/10">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl ${selectedCourse.bgColor} text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]`}>
                          <IconComponent size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black uppercase text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-300">
                              {selectedCourse.code}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-[#801618] border border-rose-300 uppercase">
                              {selectedCourse.category}
                            </span>
                          </div>
                          <h4 className="text-lg sm:text-xl font-black text-textMain mt-1 leading-tight">
                            {selectedCourse.name}
                          </h4>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="px-3 py-1 bg-black text-white rounded-xl font-mono font-black text-base border-2 border-black shadow-[1.5px_1.5px_0px_0px_#801618]">
                          {selectedCourse.credits} Cr
                        </div>
                        <span className="text-[9px] font-mono text-gray-500 font-bold block mt-1">
                          {selectedCourse.theoryCr} Th + {selectedCourse.labCr} Lab
                        </span>
                      </div>
                    </div>

                    {/* Schedule / Timetable note if present */}
                    {selectedCourse.scheduleHint && (
                      <div className="mt-4 p-3 bg-amber-50 border-2 border-amber-300 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 font-bold">
                        <Clock size={16} className="text-amber-700 shrink-0" />
                        <span>Timetable Slot: <strong>{selectedCourse.scheduleHint}</strong> (Effective from Dept Schedule)</span>
                      </div>
                    )}

                    {/* Prerequisite */}
                    <div className="mt-4 p-3 bg-gray-50 border-2 border-black/20 rounded-xl flex items-start gap-2.5">
                      <BookOpen size={16} className="text-[#801618] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-mono font-black text-gray-500 block">Recommended Prerequisite</span>
                        <span className="text-xs font-bold text-gray-900">{selectedCourse.prerequisite}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mt-4">
                      <span className="text-[10px] uppercase font-mono font-black text-gray-500 block mb-1">
                        Course Overview
                      </span>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                        {selectedCourse.description}
                      </p>
                    </div>

                    {/* Key Syllabus Modules */}
                    <div className="mt-4">
                      <span className="text-[10px] uppercase font-mono font-black text-gray-500 block mb-2">
                        Core Syllabus Modules
                      </span>
                      <div className="space-y-1.5">
                        {selectedCourse.keyTopics.map((topic, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-800 font-bold bg-rose-50/40 p-2 rounded-lg border border-black/10">
                            <CheckCircle2 size={13} className="text-[#801618] shrink-0" />
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer notification */}
                  <div className="mt-6 pt-3 border-t-2 border-black/10 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Layers size={13} />
                      Curriculum planned for upcoming 5th Semester
                    </span>
                    <span className="font-mono font-bold text-black">Section A & B</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom button */}
            <div className="p-4 bg-gray-50 border-t-2 border-black flex justify-end shrink-0">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#801618] active:scale-95 transition-all"
              >
                Close Curriculum
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
