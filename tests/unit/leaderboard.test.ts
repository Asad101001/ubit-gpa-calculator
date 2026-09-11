import { describe, it, expect } from 'vitest';

// Function under test
const rankData = (rawList: Array<{ name: string; cgpa: number; [key: string]: any }>) => {
  const sorted = [...rawList].sort((a, b) => b.cgpa - a.cgpa);
  let currentRank = 1;
  let prevCgpa = -1;
  
  return sorted.map((student, i) => {
    if (student.cgpa !== prevCgpa && i !== 0) currentRank++;
    prevCgpa = student.cgpa;
    return { ...student, rank: currentRank };
  });
};

describe('Leaderboard Ranking Algorithm (rankData)', () => {
  it('should sort students by CGPA descending', () => {
    const students = [
      { name: 'Charlie', cgpa: 3.2 },
      { name: 'Alice', cgpa: 3.9 },
      { name: 'Bob', cgpa: 3.6 },
    ];
    const ranked = rankData(students);
    expect(ranked[0].name).toBe('Alice');
    expect(ranked[1].name).toBe('Bob');
    expect(ranked[2].name).toBe('Charlie');
  });

  it('should assign identical ranks to students with identical CGPAs', () => {
    const students = [
      { name: 'Alice', cgpa: 3.8 },
      { name: 'Bob', cgpa: 3.8 },
      { name: 'Charlie', cgpa: 3.5 },
    ];
    const ranked = rankData(students);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(1);
    expect(ranked[2].rank).toBe(2);
  });

  it('should handle single student lists', () => {
    const ranked = rankData([{ name: 'Solo', cgpa: 3.75 }]);
    expect(ranked).toHaveLength(1);
    expect(ranked[0].rank).toBe(1);
  });

  it('should handle empty lists gracefully', () => {
    expect(rankData([])).toEqual([]);
  });

  it('should structure podium data correctly (Center = 1st, Left = 2nd, Right = 3rd)', () => {
    const students = [
      { name: 'Third', cgpa: 3.5 },
      { name: 'First', cgpa: 4.0 },
      { name: 'Second', cgpa: 3.8 },
      { name: 'Fourth', cgpa: 3.2 },
    ];
    const ranked = rankData(students);
    const top3 = ranked.filter(s => s.rank <= 3).slice(0, 3);

    const podiumData = [top3[1], top3[0], top3[2]];
    expect(podiumData[0].name).toBe('Second');
    expect(podiumData[1].name).toBe('First');
    expect(podiumData[2].name).toBe('Third');
  });
});
