export const getGradePoint = (marks: number): number => {
  if (marks >= 85) return 4.0; // Covers 90+ and 85-89
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
  if (marks >= 50) return 1.0; // 50-52
  return 0.0;
};

export const SEM1_COURSES = [
  { code: "CS-351", name: "Programming Fundamentals", credits: 4, type: "Programming", instructor: "Mr. Badr Sami" },
  { code: "CS-353", name: "Intro to Information & Comm. Technologies", credits: 3, type: "Programming", instructor: "Mr. Zaeem Tariq" },
  { code: "CS-355", name: "Calculus & Analytical Geometry", credits: 3, type: "Math", instructor: "Mr. M. Aslam" },
  { code: "CS-357", name: "Applied Physics", credits: 3, type: "Math", instructor: "Ms. Farheen Shafiq" },
  { code: "CS-359", name: "Functional English", credits: 3, type: "Soft Skills", instructor: "Ms. Ayesha Khwaja & Muhammad Qasim" },
  { code: "CS-361", name: "Islamic Studies / Ethics", credits: 2, type: "Soft Skills", instructor: "Dr. Waqar Hussain" }
];

export const SEM2_COURSES = [
  { code: "CS-352", name: "Object Oriented Concepts & Programming", credits: 4, type: "Programming", instructor: "Dr. Humera Tariq" },
  { code: "CS-354", name: "Digital Logic Design", credits: 3, type: "Programming", instructor: "Mr. Bari Ahmed" },
  { code: "CS-356", name: "Linear Algebra", credits: 3, type: "Math", instructor: "Mr. Muhammad Huzaifa" },
  { code: "CS-358", name: "Discrete Structures", credits: 3, type: "Math", instructor: "Ms. Maryam Feroze" },
  { code: "CS-360", name: "Communication & Presentation Skills", credits: 3, type: "Soft Skills", instructor: "Mr. Sami-ul-Huda" },
  { code: "CS-362", name: "Ideology & Constitution of Pakistan", credits: 2, type: "Soft Skills", instructor: "Dr. Mehrunnissa" }
];

