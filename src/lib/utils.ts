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
  if (marks >= 90) return 'A+';
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
