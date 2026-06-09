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

export const exportToJson = (sem1Grades: any, sem2Grades: any, stats: any) => {
  const generateCourseData = (courses: any[], grades: any) => {
    let totalCredits = 0;
    let totalQP = 0;
    
    const courseList = courses.map(c => {
      const score = grades[c.code] === '' ? 0 : grades[c.code];
      const gp = getGradePoint(score);
      const qp = gp * c.credits;
      
      totalCredits += c.credits;
      totalQP += qp;
      
      let letter = "F";
      if (score >= 85) letter = "A+ / A";
      else if (score >= 80) letter = "A-";
      else if (score >= 75) letter = "B+";
      else if (score >= 71) letter = "B";
      else if (score >= 68) letter = "B-";
      else if (score >= 64) letter = "C+";
      else if (score >= 61) letter = "C";
      else if (score >= 57) letter = "D+";
      else if (score >= 50) letter = "D";

      return {
        course_code: c.code,
        course_title: c.name,
        credit_hours: c.credits,
        numeric_score: score,
        letter_grade: letter,
        grade_point: gp,
        quality_points: Number(qp.toFixed(2))
      };
    });

    return {
      courses: courseList,
      total_credit_hours: totalCredits,
      total_quality_points: Number(totalQP.toFixed(2)),
      semester_gpa: totalCredits > 0 ? Number((totalQP / totalCredits).toFixed(2)) : 0
    };
  };

  const sem1Data = generateCourseData(SEM1_COURSES, sem1Grades);
  const sem2Data = generateCourseData(SEM2_COURSES, sem2Grades);

  const data = {
    student_name: "Student", 
    academic_year: "BSCS First Year",
    institution: "Department of Computer Science (DCS UBIT), University of Karachi",
    grading_policy_source: "uok.edu.pk/sem_results",
    transcript: {
      semester_1: sem1Data,
      semester_2: sem2Data
    },
    cumulative_totals: {
      total_credit_hours_attempted: sem1Data.total_credit_hours + sem2Data.total_credit_hours,
      total_quality_points_earned: Number((sem1Data.total_quality_points + sem2Data.total_quality_points).toFixed(2)),
      final_cgpa: Number(stats.cgpa)
    }
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "UBIT_Transcript.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
