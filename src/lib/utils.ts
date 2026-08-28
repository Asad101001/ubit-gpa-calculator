// Central grade utility — single source of truth for all grading logic
export const getGradePoint = (marks: number): number => {
  if (marks >= 85) return 4.0;
  if (marks >= 80) return 3.8;
  if (marks >= 75) return 3.4;
  if (marks >= 71) return 3.0;
  if (marks >= 68) return 2.8;
  if (marks >= 64) return 2.4;
  if (marks >= 61) return 2.0;
  if (marks >= 57) return 1.8;
  if (marks === 56) return 1.4;
  if (marks === 55) return 1.3;
  if (marks === 54) return 1.2;
  if (marks === 53) return 1.1;
  if (marks >= 50) return 1.0; // 50–52
  return 0.0;
};

export const getLetterGrade = (marks: number): string => {
  if (marks >= 85) return 'A+';
  if (marks >= 80) return 'A-';
  if (marks >= 75) return 'B+';
  if (marks >= 71) return 'B';
  if (marks >= 68) return 'B-';
  if (marks >= 64) return 'C+';
  if (marks >= 61) return 'C';
  if (marks >= 57) return 'D+';
  if (marks >= 50) return 'D';
  return 'F';
};

/**
 * Dynamic mark styling:
 * - 85+: High achiever (bold emerald with soft glow)
 * - 80-84: Solid A- (vibrant green)
 * - 70-79: Strong pass (blue)
 * - 50-69: Pass (amber/orange)
 * - Below 50: Transitions from deep burgundy (45-49) down to glowing/pulsing neon crimson red (0-15)
 */
export function getMarkColor(m: number): string {
  if (m >= 85) return 'text-emerald-600 font-black drop-shadow-[0_0_6px_rgba(16,185,129,0.35)]';
  if (m >= 80) return 'text-green-600 font-bold';
  if (m >= 75) return 'text-teal-700 font-bold';
  if (m >= 71) return 'text-blue-700 font-semibold';
  if (m >= 60) return 'text-sky-700 font-medium';
  if (m >= 50) return 'text-amber-600 font-semibold';
  
  // Dynamic Red Gradient for Fails (< 50)
  if (m >= 45) return 'text-[#881337] font-bold'; // Deep Rose/Burgundy (near pass)
  if (m >= 35) return 'text-[#991b1b] font-extrabold'; // Deep Crimson
  if (m >= 25) return 'text-[#dc2626] font-black'; // Bright Red
  if (m >= 15) return 'text-[#ef4444] font-black drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]'; // Hot Red with Glow
  return 'text-[#ff0033] font-black drop-shadow-[0_0_12px_rgba(255,0,51,0.9)] animate-pulse'; // Ultra Glowing Neon Red (0-14)
}

/**
 * RGB tuple helper for PDF generation (jsPDF)
 */
export function getMarkPdfColor(m: number): [number, number, number] {
  if (m >= 85) return [16, 185, 129]; // Emerald
  if (m >= 80) return [22, 163, 74];  // Green
  if (m >= 71) return [2, 132, 199];  // Sky Blue
  if (m >= 50) return [217, 119, 6];  // Amber
  
  // Failing gradient in PDF
  if (m >= 45) return [136, 19, 55];  // Deep Burgundy
  if (m >= 35) return [153, 27, 27];  // Crimson
  if (m >= 25) return [220, 38, 38];  // Bright Red
  if (m >= 15) return [239, 68, 68];  // Hot Red
  return [255, 0, 51];                // Glowing Neon Red
}

export const SEM1_COURSES = [
  { code: "CS-351", id: "cs351", name: "Programming Fundamentals", credits: 4, type: "Programming", instructor: "Mr. Badr Sami" },
  { code: "CS-353", id: "cs353", name: "Intro to Information & Comm. Technologies", credits: 3, type: "Programming", instructor: "Mr. Zaeem Tariq" },
  { code: "CS-355", id: "cs355", name: "Calculus & Analytical Geometry", credits: 3, type: "Math", instructor: "Mr. M. Aslam" },
  { code: "CS-357", id: "cs357", name: "Applied Physics", credits: 3, type: "Math", instructor: "Ms. Farheen Shafiq" },
  { code: "CS-359", id: "cs359", name: "Functional English", credits: 3, type: "Soft Skills", instructor: "Ms. Ayesha Khwaja & Muhammad Qasim" },
  { code: "CS-361", id: "cs361", name: "Islamic Studies / Ethics", credits: 2, type: "Soft Skills", instructor: "Dr. Waqar Hussain" }
];

export const SEM2_COURSES = [
  { code: "CS-352", id: "cs352", name: "Object Oriented Concepts & Programming", credits: 4, type: "Programming", instructor: "Dr. Humera Tariq" },
  { code: "CS-354", id: "cs354", name: "Digital Logic Design", credits: 3, type: "Programming", instructor: "Mr. Bari Ahmed" },
  { code: "CS-356", id: "cs356", name: "Linear Algebra", credits: 3, type: "Math", instructor: "Mr. Muhammad Huzaifa" },
  { code: "CS-358", id: "cs358", name: "Discrete Structures", credits: 3, type: "Math", instructor: "Ms. Maryam Feroze" },
  { code: "CS-360", id: "cs360", name: "Communication & Presentation Skills", credits: 3, type: "Soft Skills", instructor: "Mr. Sami-ul-Huda" },
  { code: "CS-362", id: "cs362", name: "Ideology & Constitution of Pakistan", credits: 2, type: "Soft Skills", instructor: "Dr. Mehrunnissa" }
];

export const SEM3_COURSES = [
  { code: "CS-451", id: "cs451", name: "Data Structures & Applications", credits: 4, type: "Programming", instructor: "Ms. Maryam Feroze" },
  { code: "CS-453", id: "cs453", name: "Software Engineering Fundamentals", credits: 3, type: "Programming", instructor: "Dr. Shaista Raees" },
  { code: "CS-455", id: "cs455", name: "Computer Organization & Assembly Language", credits: 3, type: "Programming", instructor: "Mr. Taha Bin Niaz (Late)" },
  { code: "CS-457", id: "cs457", name: "Multivariable Calculus", credits: 3, type: "Math", instructor: "Mr. Muhammad Aslam" },
  { code: "CS-459", id: "cs459", name: "Probability & Statistics", credits: 3, type: "Math", instructor: "Dr. Humera Bashir" },
  { code: "CS-461", id: "cs461", name: "Urdu", credits: 2, type: "Soft Skills", instructor: "Mr. M. Salman" }
];
