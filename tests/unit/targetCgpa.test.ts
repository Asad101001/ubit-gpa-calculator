import { describe, it, expect } from 'vitest';

/**
 * Pure simulation function matching the math in TargetCGPA.tsx
 */
function calculateRequiredFutureGpa(
  currentCgpa: number,
  completedCredits: number,
  targetCgpa: number,
  futureCredits: number
): {
  requiredGpa: number;
  isPossible: boolean;
  isAlreadyAchieved: boolean;
} {
  if (futureCredits <= 0) {
    return {
      requiredGpa: currentCgpa,
      isPossible: currentCgpa >= targetCgpa,
      isAlreadyAchieved: currentCgpa >= targetCgpa,
    };
  }

  const currentQualityPoints = currentCgpa * completedCredits;
  const totalCredits = completedCredits + futureCredits;
  const targetQualityPoints = targetCgpa * totalCredits;
  const neededQualityPoints = targetQualityPoints - currentQualityPoints;

  const rawRequiredGpa = neededQualityPoints / futureCredits;
  const requiredGpa = Math.round(rawRequiredGpa * 1000) / 1000;

  return {
    requiredGpa,
    isPossible: requiredGpa <= 4.00,
    isAlreadyAchieved: targetCgpa <= currentCgpa,
  };
}

describe('Target CGPA Mathematical Engine Tests', () => {
  it('should accurately calculate required future GPA when target is achievable', () => {
    // 2 semesters completed (34 credits) at 3.0 CGPA (102 QP)
    // Target 3.5 CGPA across 4 semesters total (68 credits, 238 QP target)
    // Needed QP: 238 - 102 = 136 over 34 credits -> exactly 4.00 required GPA
    const res = calculateRequiredFutureGpa(3.0, 34, 3.5, 34);
    expect(res.requiredGpa).toBe(4.0);
    expect(res.isPossible).toBe(true);
    expect(res.isAlreadyAchieved).toBe(false);
  });

  it('should detect when target CGPA is mathematically impossible (> 4.00 GPA)', () => {
    // 3 semesters completed (51 credits) at 2.0 CGPA
    // Target 3.8 CGPA across 4 semesters (68 credits)
    // Target QP = 3.8 * 68 = 258.4; Current QP = 102. Needed QP = 156.4 over 17 credits -> 9.2 GPA!
    const res = calculateRequiredFutureGpa(2.0, 51, 3.8, 17);
    expect(res.requiredGpa).toBeGreaterThan(4.0);
    expect(res.isPossible).toBe(false);
  });

  it('should detect when target CGPA is already achieved or lower than current', () => {
    const res = calculateRequiredFutureGpa(3.8, 34, 3.5, 34);
    expect(res.isAlreadyAchieved).toBe(true);
    expect(res.isPossible).toBe(true);
    expect(res.requiredGpa).toBeLessThan(3.5);
  });

  it('should handle zero remaining credits (graduation reached)', () => {
    const res = calculateRequiredFutureGpa(3.65, 136, 3.5, 0);
    expect(res.isPossible).toBe(true);
    expect(res.isAlreadyAchieved).toBe(true);
    expect(res.requiredGpa).toBe(3.65);
  });

  it('should correctly handle boundary condition at exact 4.00 CGPA cap', () => {
    const res = calculateRequiredFutureGpa(4.0, 34, 4.0, 34);
    expect(res.requiredGpa).toBe(4.0);
    expect(res.isPossible).toBe(true);
    expect(res.isAlreadyAchieved).toBe(true);
  });

  it('should avoid NaN and Infinity when floating point edge cases occur', () => {
    const res = calculateRequiredFutureGpa(0, 0, 3.0, 34);
    expect(Number.isFinite(res.requiredGpa)).toBe(true);
    expect(Number.isNaN(res.requiredGpa)).toBe(false);
    expect(res.requiredGpa).toBe(3.0);
  });
});
