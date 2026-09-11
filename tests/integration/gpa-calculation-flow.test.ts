import { describe, it, expect } from 'vitest';
import { getGradePoint, SEM1_COURSES, SEM2_COURSES, SEM3_COURSES } from '../../src/lib/utils';

// Core calculation function simulating ProfilePage and Calculator calculations
function calculateAcademicStanding(
  sem1Marks: Record<string, number | null | string>,
  sem2Marks: Record<string, number | null | string>,
  sem3Marks: Record<string, number | null | string>
) {
  let totalQP = 0;
  let totalCredits = 0;

  const semesters = [
    { sem: 1, courses: SEM1_COURSES, marks: sem1Marks },
    { sem: 2, courses: SEM2_COURSES, marks: sem2Marks },
    { sem: 3, courses: SEM3_COURSES, marks: sem3Marks },
  ];

  const semStats: Record<number, { qp: number; credits: number; completedCount: number; gpa: string }> = {};

  semesters.forEach(({ sem, courses, marks }) => {
    let sQP = 0;
    let sCr = 0;
    let count = 0;

    courses.forEach(c => {
      const raw = marks[c.id];
      const m = raw !== undefined && raw !== null && raw !== '' && !isNaN(Number(raw)) ? Number(raw) : null;
      if (m !== null) {
        const gp = getGradePoint(m);
        sQP += gp * c.credits;
        sCr += c.credits;
        count++;
      }
    });

    totalQP += sQP;
    totalCredits += sCr;

    const gpa = sCr > 0 && count === courses.length 
      ? (sQP / sCr).toFixed(2) 
      : sCr > 0 
      ? (sQP / sCr).toFixed(2) + '*' 
      : '—';

    semStats[sem] = { qp: sQP, credits: sCr, completedCount: count, gpa };
  });

  const isConcrete = (semStats[1].completedCount === 6 && semStats[2].completedCount === 6 && semStats[3].completedCount === 0) ||
                     (semStats[1].completedCount === 6 && semStats[2].completedCount === 6 && semStats[3].completedCount === 6);

  const isPartialSem3 = semStats[1].completedCount === 6 && 
                        semStats[2].completedCount === 6 && 
                        semStats[3].completedCount > 0 && 
                        semStats[3].completedCount < 6;

  const cgpa = totalCredits > 0 ? (totalQP / totalCredits).toFixed(3) : '0.000';

  return {
    cgpa,
    totalCredits,
    totalQP,
    isConcrete,
    isPartialSem3,
    sem1: semStats[1],
    sem2: semStats[2],
    sem3: semStats[3],
  };
}

describe('GPA & CGPA End-to-End Academic Flow', () => {
  it('should calculate exact 4.000 for a student with straight A+ in Semesters 1 and 2', () => {
    const sem1 = { cs351: 90, cs353: 88, cs355: 92, cs357: 85, cs359: 89, cs361: 95 };
    const sem2 = { cs352: 87, cs354: 86, cs356: 91, cs358: 85, cs360: 93, cs362: 88 };
    const sem3 = {}; // Sem 3 not yet started

    const result = calculateAcademicStanding(sem1, sem2, sem3);

    expect(result.sem1.gpa).toBe('4.00');
    expect(result.sem2.gpa).toBe('4.00');
    expect(result.cgpa).toBe('4.000');
    expect(result.totalCredits).toBe(36);
    expect(result.isConcrete).toBe(true);
    expect(result.isPartialSem3).toBe(false);
  });

  it('should calculate tentative CGPA when Semester 3 is partially announced', () => {
    const sem1 = { cs351: 85, cs353: 80, cs355: 75, cs357: 71, cs359: 68, cs361: 64 };
    const sem2 = { cs352: 80, cs354: 75, cs356: 71, cs358: 68, cs360: 64, cs362: 61 };
    // Sem 3 has only 2 subjects announced so far (cs451 and cs453)
    const sem3 = { 
      cs451: 85, 
      cs453: 80, 
      cs455: 'Results Unannounced',
      cs457: null,
      cs459: '',
      cs461: null 
    };

    const result = calculateAcademicStanding(sem1, sem2, sem3);

    expect(result.isConcrete).toBe(false);
    expect(result.isPartialSem3).toBe(true);
    expect(result.sem3.gpa).toContain('*'); // Indicating partial/tentative
    expect(result.sem3.completedCount).toBe(2);
    expect(result.totalCredits).toBe(36 + 4 + 3); // 36 + 7 = 43 credits
    expect(parseFloat(result.cgpa)).toBeGreaterThan(0);
  });

  it('should calculate finalized 3-Semester CGPA across full 54 credit hours', () => {
    const sem1 = { cs351: 85, cs353: 85, cs355: 85, cs357: 85, cs359: 85, cs361: 85 }; // 4.00
    const sem2 = { cs352: 80, cs354: 80, cs356: 80, cs358: 80, cs360: 80, cs362: 80 }; // 3.80
    const sem3 = { cs451: 75, cs453: 75, cs455: 75, cs457: 75, cs459: 75, cs461: 75 }; // 3.40

    // Sem 1 QP: 18 * 4.0 = 72
    // Sem 2 QP: 18 * 3.8 = 68.4
    // Sem 3 QP: 18 * 3.4 = 61.2
    // Total QP = 201.6
    // Expected CGPA = 201.6 / 54 = 3.7333... -> '3.733'
    const result = calculateAcademicStanding(sem1, sem2, sem3);

    expect(result.totalCredits).toBe(54);
    expect(result.totalQP).toBeCloseTo(201.6, 4);
    expect(result.cgpa).toBe('3.733');
    expect(result.isConcrete).toBe(true);
    expect(result.isPartialSem3).toBe(false);
  });
});
