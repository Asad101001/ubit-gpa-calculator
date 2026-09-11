import { describe, it, expect } from 'vitest';
import { getGradePoint, SEM1_COURSES, SEM2_COURSES } from '../../src/lib/utils';

// Helper matching computeSemStats in transcriptGenerator.ts
function computeSemStats(courses: typeof SEM1_COURSES, student: Record<string, any>) {
  let totalQP = 0, totalCr = 0, hasAny = false, hasAll = true;
  const rows = courses.map(sub => {
    const raw = student[sub.id];
    const marks = raw !== undefined && raw !== null && raw !== '' && !isNaN(Number(raw)) ? Number(raw) : null;
    const gp = marks !== null ? getGradePoint(marks) : null;
    const qp = marks !== null && gp !== null ? gp * sub.credits : null;
    if (marks !== null && gp !== null && qp !== null) {
      totalQP += qp;
      totalCr += sub.credits;
      hasAny = true;
    } else {
      hasAll = false;
    }
    return { sub, marks, gp, qp };
  });
  const gpa = totalCr > 0 ? totalQP / totalCr : null;
  return { rows, totalQP, totalCr, gpa, hasAny, hasAll };
}

describe('Academic Transcript Statistics (computeSemStats)', () => {
  it('should compute exact 4.00 GPA when all marks are 85+', () => {
    const perfectStudent = {
      cs351: 90, // 4 cr * 4.0 = 16
      cs353: 88, // 3 cr * 4.0 = 12
      cs355: 86, // 3 cr * 4.0 = 12
      cs357: 92, // 3 cr * 4.0 = 12
      cs359: 85, // 3 cr * 4.0 = 12
      cs361: 89, // 2 cr * 4.0 = 8
    };
    const stats = computeSemStats(SEM1_COURSES, perfectStudent);
    expect(stats.totalCr).toBe(18);
    expect(stats.totalQP).toBe(72); // 16 + 12 + 12 + 12 + 12 + 8
    expect(stats.gpa).toBe(4.0);
    expect(stats.hasAll).toBe(true);
    expect(stats.hasAny).toBe(true);
  });

  it('should compute correct weighted GPA for mixed marks', () => {
    const student = {
      cs351: 85, // 4 cr * 4.0 = 16.0
      cs353: 80, // 3 cr * 3.8 = 11.4
      cs355: 75, // 3 cr * 3.4 = 10.2
      cs357: 71, // 3 cr * 3.0 = 9.0
      cs359: 68, // 3 cr * 2.8 = 8.4
      cs361: 64, // 2 cr * 2.4 = 4.8
    };
    // Expected QP = 16.0 + 11.4 + 10.2 + 9.0 + 8.4 + 4.8 = 59.8
    // Expected GPA = 59.8 / 18 = 3.3222...
    const stats = computeSemStats(SEM1_COURSES, student);
    expect(stats.totalCr).toBe(18);
    expect(stats.totalQP).toBeCloseTo(59.8, 4);
    expect(stats.gpa).toBeCloseTo(3.322, 2);
    expect(stats.hasAll).toBe(true);
  });

  it('should handle unannounced or missing subjects without failing', () => {
    const studentWithMissing = {
      cs352: 85, // 4 cr * 4.0 = 16.0
      cs354: 'Results Unannounced',
      cs356: null,
      cs358: 80, // 3 cr * 3.8 = 11.4
      cs360: '',
      cs362: 75, // 2 cr * 3.4 = 6.8
    };
    const stats = computeSemStats(SEM2_COURSES, studentWithMissing);
    expect(stats.totalCr).toBe(9); // 4 + 3 + 2
    expect(stats.totalQP).toBeCloseTo(34.2, 4);
    expect(stats.gpa).toBeCloseTo(3.8, 1);
    expect(stats.hasAll).toBe(false);
    expect(stats.hasAny).toBe(true);
  });

  it('should return null GPA when student has no completed marks', () => {
    const emptyStudent = {};
    const stats = computeSemStats(SEM1_COURSES, emptyStudent);
    expect(stats.totalCr).toBe(0);
    expect(stats.totalQP).toBe(0);
    expect(stats.gpa).toBeNull();
    expect(stats.hasAll).toBe(false);
    expect(stats.hasAny).toBe(false);
  });
});
