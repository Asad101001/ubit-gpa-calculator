// src/lib/resultsArchive.ts
// Metadata and helper utilities for official University of Karachi marksheets

export interface MarksheetDocument {
  id: string; // e.g., 'cs451'
  code: string; // e.g., 'CS-451'
  title: string;
  instructor: string;
  subInstructor?: string;
  semester: 1 | 2 | 3;
  filename: string;
  fileType: 'pdf' | 'excel';
  sizeKB: number;
  url: string;
}

export const OFFICIAL_MARKSHEETS: MarksheetDocument[] = [
  // ── Semester 1 ────────────────────────────────────────────────────────────
  {
    id: 'cs353',
    code: 'CS-353',
    title: 'Introduction to Information and Communication Technology',
    instructor: 'Mr. Zaeem Tariq',
    semester: 1,
    filename: 'CS-353 Introduction to Information and Communication Technology [Mr. Zaeem Tariq].pdf',
    fileType: 'pdf',
    sizeKB: 82,
    url: '/results/1st%20Semester/CS-353%20Introduction%20to%20Information%20and%20Communication%20Technology%20[Mr.%20Zaeem%20Tariq].pdf',
  },
  {
    id: 'cs355',
    code: 'CS-355',
    title: 'Calculus and Analytical Geometry',
    instructor: 'Mr. M. Aslam',
    semester: 1,
    filename: 'CS-355 Calculus and Analytical Geometry [Mr. M. Aslam].pdf',
    fileType: 'pdf',
    sizeKB: 113,
    url: '/results/1st%20Semester/CS-355%20Calculus%20and%20Analytical%20Geometry%20[Mr.%20M.%20Aslam].pdf',
  },
  {
    id: 'cs357',
    code: 'CS-357',
    title: 'Applied Physics',
    instructor: 'Ms. Farheen Shafiq',
    semester: 1,
    filename: 'CS-357 Applied Physics [Ms. Farheen Shafiq].xlsx',
    fileType: 'excel',
    sizeKB: 17,
    url: '/results/1st%20Semester/CS-357%20Applied%20Physics%20[Ms.%20Farheen%20Shafiq].xlsx',
  },
  {
    id: 'cs359',
    code: 'CS-359',
    title: 'Functional English',
    instructor: 'Ms. Ayesha Khwaja & Muhammad Qasim',
    semester: 1,
    filename: 'CS-359 Functional English [Ms. Ayesha Khwaja & Muhammad Qasim].pdf',
    fileType: 'pdf',
    sizeKB: 911,
    url: '/results/1st%20Semester/CS-359%20Functional%20English%20[Ms.%20Ayesha%20Khwaja%20&%20Muhammad%20Qasim].pdf',
  },
  {
    id: 'cs361',
    code: 'CS-361',
    title: 'Islamic Studies',
    instructor: 'Dr. Waqar Hussain',
    semester: 1,
    filename: 'CS-361 Islamic Studies [Dr. Waqar Hussain].pdf',
    fileType: 'pdf',
    sizeKB: 461,
    url: '/results/1st%20Semester/CS-361%20Islamic%20Studies%20[Dr.%20Waqar%20Hussain].pdf',
  },

  // ── Semester 2 ────────────────────────────────────────────────────────────
  {
    id: 'cs352',
    code: 'CS-352',
    title: 'Object Oriented Concepts and Programming',
    instructor: 'Dr. Humera Tariq',
    semester: 2,
    filename: 'CS-352 Object Oriented Concepts and Programming [Dr. Humera Tariq].pdf',
    fileType: 'pdf',
    sizeKB: 371,
    url: '/results/2nd%20Semester/CS-352%20Object%20Oriented%20Concepts%20and%20Programming%20[Dr.%20Humera%20Tariq].pdf',
  },
  {
    id: 'cs354',
    code: 'CS-354',
    title: 'Digital Logic Design',
    instructor: 'Mr. Bari Ahmed',
    semester: 2,
    filename: 'CS-354 Digital Logic Design [Mr. Bari Ahmed].xls',
    fileType: 'excel',
    sizeKB: 241,
    url: '/results/2nd%20Semester/CS-354%20Digital%20Logic%20Design%20[Mr.%20Bari%20Ahmed].xls',
  },
  {
    id: 'cs356',
    code: 'CS-356',
    title: 'Linear Algebra',
    instructor: 'Mr. Muhammad Huzaifa',
    semester: 2,
    filename: 'CS-356 Linear Algebra [Mr. Muhammad Huzaifa].pdf',
    fileType: 'pdf',
    sizeKB: 306,
    url: '/results/2nd%20Semester/CS-356%20Linear%20Algebra%20[Mr.%20Muhammad%20Huzaifa].pdf',
  },
  {
    id: 'cs358',
    code: 'CS-358',
    title: 'Discrete Structures',
    instructor: 'Ms. Maryam Feroze',
    semester: 2,
    filename: 'CS-358 Discrete Structures [Ms. Maryam Feroze].pdf',
    fileType: 'pdf',
    sizeKB: 129,
    url: '/results/2nd%20Semester/CS-358%20Discrete%20Structures%20[Ms.%20Maryam%20Feroze].pdf',
  },
  {
    id: 'cs360',
    code: 'CS-360',
    title: 'Communication and Presentation Skills',
    instructor: 'Mr. Sami-ul-Huda',
    semester: 2,
    filename: 'CS-360 Communication and Presentation Skills [Mr. Sami-ul-Huda].pdf',
    fileType: 'pdf',
    sizeKB: 140,
    url: '/results/2nd%20Semester/CS-360%20Communication%20and%20Presentation%20Skills%20[Mr.%20Sami-ul-Huda].pdf',
  },
  {
    id: 'cs362',
    code: 'CS-362',
    title: 'Ideology and Constitution of Pakistan',
    instructor: 'Dr. Mehrunnissa',
    semester: 2,
    filename: 'CS-362 Ideology and Constitution of Pakistan [Dr. Mehrunnissa].pdf',
    fileType: 'pdf',
    sizeKB: 323,
    url: '/results/2nd%20Semester/CS-362%20Ideology%20and%20Constitution%20of%20Pakistan%20[Dr.%20Mehrunnissa].pdf',
  },

  // ── Semester 3 ────────────────────────────────────────────────────────────
  {
    id: 'cs451',
    code: 'CS-451',
    title: 'Data Structures & Applications',
    instructor: 'Ms. Maryam Feroze',
    semester: 3,
    filename: 'CS-451 Data Structures & Appliactions [Ms. Maryam Feroze].pdf',
    fileType: 'pdf',
    sizeKB: 413,
    url: '/results/3rd%20Semester/CS-451%20Data%20Structures%20&%20Appliactions%20[Ms.%20Maryam%20Feroze].pdf',
  },
  {
    id: 'cs455',
    code: 'CS-455',
    title: 'Computer Organization & Assembly Language',
    instructor: 'Mr. Taha Bin Niaz (Late)',
    subInstructor: 'Mr. Mukesh Kumar Rathi',
    semester: 3,
    filename: 'CS-455 Computer Organization & Assembly Language [Mr. Taha Bin Niaz].pdf',
    fileType: 'pdf',
    sizeKB: 183,
    url: '/results/3rd%20Semester/CS-455%20Computer%20Organization%20&%20Assembly%20Language%20[Mr.%20Taha%20Bin%20Niaz].pdf',
  },
  {
    id: 'cs457',
    code: 'CS-457',
    title: 'Multivariable Calculus',
    instructor: 'Mr. Muhammad Aslam',
    semester: 3,
    filename: 'CS-457 Multivariable Calculus [Mr. Muhammad Aslam].pdf',
    fileType: 'pdf',
    sizeKB: 294,
    url: '/results/3rd%20Semester/CS-457%20Multivariable%20Calculus%20[Mr.%20Muhammad%20Aslam].pdf',
  },
  {
    id: 'cs459',
    code: 'CS-459',
    title: 'Probability & Statistics',
    instructor: 'Dr. Humera Bashir',
    semester: 3,
    filename: 'CS-459 Probability & Statistics [Dr. Humera Bashir].pdf',
    fileType: 'pdf',
    sizeKB: 498,
    url: '/results/3rd%20Semester/CS-459%20Probability%20&%20Statistics%20[Dr.%20Humera%20Bashir].pdf',
  },
  {
    id: 'cs461',
    code: 'CS-461',
    title: 'Urdu',
    instructor: 'Mr. M. Salman',
    semester: 3,
    filename: 'CS-461 Urdu [Mr. M. Salman].pdf',
    fileType: 'pdf',
    sizeKB: 1178,
    url: '/results/3rd%20Semester/CS-461%20Urdu%20[Mr.%20M.%20Salman].pdf',
  },
];

export function getMarksheetBySubject(subjectIdOrCode: string): MarksheetDocument | undefined {
  const clean = subjectIdOrCode.toLowerCase().replace(/[^a-z0-9]/g, '');
  return OFFICIAL_MARKSHEETS.find(
    (m) => m.id.toLowerCase() === clean || m.code.toLowerCase().replace(/[^a-z0-9]/g, '') === clean
  );
}
