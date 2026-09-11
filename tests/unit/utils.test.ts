import { describe, it, expect } from 'vitest';
import { 
  getGradePoint, 
  getLetterGrade, 
  getMarkColor, 
  getMarkPdfColor, 
  SEM1_COURSES, 
  SEM2_COURSES, 
  SEM3_COURSES 
} from '../../src/lib/utils';

describe('UBIT Official Grading Scale (getGradePoint)', () => {
  it('should return 4.0 for marks >= 85 (Grade A+)', () => {
    expect(getGradePoint(100)).toBe(4.0);
    expect(getGradePoint(92)).toBe(4.0);
    expect(getGradePoint(85)).toBe(4.0);
  });

  it('should return 3.8 for marks 80 to 84 (Grade A-)', () => {
    expect(getGradePoint(84)).toBe(3.8);
    expect(getGradePoint(82)).toBe(3.8);
    expect(getGradePoint(80)).toBe(3.8);
  });

  it('should return 3.4 for marks 75 to 79 (Grade B+)', () => {
    expect(getGradePoint(79)).toBe(3.4);
    expect(getGradePoint(77)).toBe(3.4);
    expect(getGradePoint(75)).toBe(3.4);
  });

  it('should return 3.0 for marks 71 to 74 (Grade B)', () => {
    expect(getGradePoint(74)).toBe(3.0);
    expect(getGradePoint(72)).toBe(3.0);
    expect(getGradePoint(71)).toBe(3.0);
  });

  it('should return 2.8 for marks 68 to 70 (Grade B-)', () => {
    expect(getGradePoint(70)).toBe(2.8);
    expect(getGradePoint(69)).toBe(2.8);
    expect(getGradePoint(68)).toBe(2.8);
  });

  it('should return 2.4 for marks 64 to 67 (Grade C+)', () => {
    expect(getGradePoint(67)).toBe(2.4);
    expect(getGradePoint(65)).toBe(2.4);
    expect(getGradePoint(64)).toBe(2.4);
  });

  it('should return 2.0 for marks 61 to 63 (Grade C)', () => {
    expect(getGradePoint(63)).toBe(2.0);
    expect(getGradePoint(62)).toBe(2.0);
    expect(getGradePoint(61)).toBe(2.0);
  });

  it('should return 1.8 for marks 57 to 60 (Grade D+)', () => {
    expect(getGradePoint(60)).toBe(1.8);
    expect(getGradePoint(58)).toBe(1.8);
    expect(getGradePoint(57)).toBe(1.8);
  });

  it('should return exact decimal steps for marks 50 to 56 (Grade D range)', () => {
    expect(getGradePoint(56)).toBe(1.4);
    expect(getGradePoint(55)).toBe(1.3);
    expect(getGradePoint(54)).toBe(1.2);
    expect(getGradePoint(53)).toBe(1.1);
    expect(getGradePoint(52)).toBe(1.0);
    expect(getGradePoint(51)).toBe(1.0);
    expect(getGradePoint(50)).toBe(1.0);
  });

  it('should return 0.0 for failing marks (< 50)', () => {
    expect(getGradePoint(49)).toBe(0.0);
    expect(getGradePoint(35)).toBe(0.0);
    expect(getGradePoint(10)).toBe(0.0);
    expect(getGradePoint(0)).toBe(0.0);
    expect(getGradePoint(-5)).toBe(0.0);
  });
});

describe('Letter Grade Mapping (getLetterGrade)', () => {
  it('should accurately return letter grades across all thresholds', () => {
    expect(getLetterGrade(95)).toBe('A+');
    expect(getLetterGrade(85)).toBe('A+');
    expect(getLetterGrade(84)).toBe('A-');
    expect(getLetterGrade(80)).toBe('A-');
    expect(getLetterGrade(79)).toBe('B+');
    expect(getLetterGrade(75)).toBe('B+');
    expect(getLetterGrade(74)).toBe('B');
    expect(getLetterGrade(71)).toBe('B');
    expect(getLetterGrade(70)).toBe('B-');
    expect(getLetterGrade(68)).toBe('B-');
    expect(getLetterGrade(67)).toBe('C+');
    expect(getLetterGrade(64)).toBe('C+');
    expect(getLetterGrade(63)).toBe('C');
    expect(getLetterGrade(61)).toBe('C');
    expect(getLetterGrade(60)).toBe('D+');
    expect(getLetterGrade(57)).toBe('D+');
    expect(getLetterGrade(56)).toBe('D');
    expect(getLetterGrade(50)).toBe('D');
    expect(getLetterGrade(49)).toBe('F');
    expect(getLetterGrade(0)).toBe('F');
  });
});

describe('Mark Visual Color Classes (getMarkColor)', () => {
  it('should return emerald classes for 85+', () => {
    const cls = getMarkColor(88);
    expect(cls).toContain('emerald');
  });

  it('should return green for 80-84', () => {
    expect(getMarkColor(82)).toContain('green');
  });

  it('should return blue for 70s', () => {
    expect(getMarkColor(75)).toContain('blue');
  });

  it('should return gray for 60s', () => {
    expect(getMarkColor(65)).toContain('gray');
  });

  it('should return amber/yellow for 50s', () => {
    expect(getMarkColor(55)).toContain('amber');
  });

  it('should return failing red gradients for < 50', () => {
    expect(getMarkColor(47)).toContain('#881337');
    expect(getMarkColor(38)).toContain('#991b1b');
    expect(getMarkColor(28)).toContain('#dc2626');
    expect(getMarkColor(18)).toContain('#ef4444');
    expect(getMarkColor(8)).toContain('animate-pulse');
  });
});

describe('PDF RGB Colors (getMarkPdfColor)', () => {
  it('should return valid RGB arrays for PDF generation', () => {
    expect(getMarkPdfColor(90)).toEqual([16, 185, 129]);
    expect(getMarkPdfColor(82)).toEqual([22, 163, 74]);
    expect(getMarkPdfColor(72)).toEqual([2, 132, 199]);
    expect(getMarkPdfColor(62)).toEqual([107, 114, 128]);
    expect(getMarkPdfColor(52)).toEqual([217, 119, 6]);
    expect(getMarkPdfColor(47)).toEqual([136, 19, 55]);
    expect(getMarkPdfColor(38)).toEqual([153, 27, 27]);
    expect(getMarkPdfColor(28)).toEqual([220, 38, 38]);
    expect(getMarkPdfColor(18)).toEqual([239, 68, 68]);
    expect(getMarkPdfColor(5)).toEqual([255, 0, 51]);
  });
});

describe('Course Catalogs Integrity', () => {
  it('Semester 1 courses should have exactly 18 credit hours and 6 courses', () => {
    expect(SEM1_COURSES).toHaveLength(6);
    const totalCredits = SEM1_COURSES.reduce((sum, c) => sum + c.credits, 0);
    expect(totalCredits).toBe(18);
  });

  it('Semester 2 courses should have exactly 18 credit hours and 6 courses', () => {
    expect(SEM2_COURSES).toHaveLength(6);
    const totalCredits = SEM2_COURSES.reduce((sum, c) => sum + c.credits, 0);
    expect(totalCredits).toBe(18);
  });

  it('Semester 3 courses should have exactly 18 credit hours and 6 courses', () => {
    expect(SEM3_COURSES).toHaveLength(6);
    const totalCredits = SEM3_COURSES.reduce((sum, c) => sum + c.credits, 0);
    expect(totalCredits).toBe(18);
  });

  it('Course codes and IDs must be completely unique across all semesters', () => {
    const allCourses = [...SEM1_COURSES, ...SEM2_COURSES, ...SEM3_COURSES];
    const codes = new Set(allCourses.map(c => c.code));
    const ids = new Set(allCourses.map(c => c.id));
    expect(codes.size).toBe(18);
    expect(ids.size).toBe(18);
  });
});
