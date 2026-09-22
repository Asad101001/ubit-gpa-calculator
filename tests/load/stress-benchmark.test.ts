/**
 * tests/load/stress-benchmark.ts
 *
 * High-performance load and stress benchmark suite for UBIT GPA Calculator.
 * Measures:
 * 1. Mathematical calculation throughput & memory delta across 20,000 iterations.
 * 2. Roster search & filtering throughput across 2,000 synthetic records with P50/P95/P99 latency.
 * 3. Concurrent simulated serverless edge request processing (200 concurrent requests).
 */

import { describe, it, expect } from 'vitest';
import { getGradePoint, SEM1_COURSES, SEM2_COURSES, SEM3_COURSES } from '../../src/lib/utils';
import resultsHandler from '../../api/results';
import submitHandler from '../../api/submit';

// Percentile calculator helper
function calculatePercentiles(latencies: number[]) {
  const sorted = [...latencies].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.50)];
  const p90 = sorted[Math.floor(sorted.length * 0.90)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  const mean = sorted.reduce((sum, val) => sum + val, 0) / sorted.length;
  return { p50, p90, p95, p99, mean, min: sorted[0], max: sorted[sorted.length - 1] };
}

describe('⚡ Load & Stress Testing Suite', () => {

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 1: Calculation Engine Throughput (20,000 iterations)
  // ───────────────────────────────────────────────────────────────────────────
  it('Benchmark 1: Grade calculation engine under high volume (20,000 calculations)', () => {
    const ITERATIONS = 20_000;
    const initialMemory = process.memoryUsage().heapUsed;

    const start = performance.now();

    for (let i = 0; i < ITERATIONS; i++) {
      let totalQp = 0;
      let totalCr = 0;

      // Semester 1
      for (const course of SEM1_COURSES) {
        const mark = (i + course.credits * 17) % 101;
        totalQp += getGradePoint(mark) * course.credits;
        totalCr += course.credits;
      }
      // Semester 2
      for (const course of SEM2_COURSES) {
        const mark = (i + course.credits * 19) % 101;
        totalQp += getGradePoint(mark) * course.credits;
        totalCr += course.credits;
      }
      // Semester 3
      for (const course of SEM3_COURSES) {
        const mark = (i + course.credits * 23) % 101;
        totalQp += getGradePoint(mark) * course.credits;
        totalCr += course.credits;
      }

      const cgpa = totalCr > 0 ? (totalQp / totalCr).toFixed(3) : '—';
      if (i === 0) expect(cgpa).toBeDefined();
    }

    const duration = performance.now() - start;
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryDeltaMb = (finalMemory - initialMemory) / (1024 * 1024);
    const opsPerSec = Math.round((ITERATIONS / duration) * 1000);
    const avgLatencyMs = (duration / ITERATIONS);

    console.log('\n📊 --- BENCHMARK 1: CALCULATION ENGINE ---');
    console.log(`• Total Calculations: ${ITERATIONS.toLocaleString()} complete student records`);
    console.log(`• Total Duration:     ${duration.toFixed(2)} ms`);
    console.log(`• Throughput:         ${opsPerSec.toLocaleString()} ops/sec`);
    console.log(`• Mean Per Student:   ${(avgLatencyMs * 1000).toFixed(2)} µs (microseconds)`);
    console.log(`• Heap Delta:         ${memoryDeltaMb.toFixed(2)} MB`);

    // Must calculate at least 50,000 records per second
    expect(opsPerSec).toBeGreaterThan(50_000);
    // Average calculation time per student must be well under 0.1ms
    expect(avgLatencyMs).toBeLessThan(0.1);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 2: Roster Search & Filter Stress Test (2,000 records × 500 queries)
  // ───────────────────────────────────────────────────────────────────────────
  it('Benchmark 2: Instant search filtering across 2,000 student records (500 queries)', () => {
    // Generate 2,000 realistic synthetic student records
    const syntheticRoster = Array.from({ length: 2000 }, (_, i) => {
      const seatSuffix = String(i + 1).padStart(4, '0');
      return {
        seat_no: `B2411000${seatSuffix}`,
        name: `Student Name ${i} Khan`,
        cgpa: (2.0 + (i % 200) / 100).toFixed(2),
        is_hidden: i % 10 === 0,
      };
    });

    const searchQueries = [
      'B24110006', 'Khan', '0042', 'Student 19', 'Ali', 'Ahmed', 'B24', '999', 'Muhammad', 'Z'
    ];

    const latencies: number[] = [];

    for (let q = 0; q < 500; q++) {
      const query = searchQueries[q % searchQueries.length].toLowerCase();
      const qStart = performance.now();

      // Mirror frontend search filter logic
      const filtered = syntheticRoster.filter(s =>
        s.name.toLowerCase().includes(query) || s.seat_no.toLowerCase().includes(query)
      );

      const qDuration = performance.now() - qStart;
      latencies.push(qDuration);
      expect(filtered).toBeDefined();
    }

    const { p50, p95, p99, mean, max } = calculatePercentiles(latencies);

    console.log('\n🔍 --- BENCHMARK 2: ROSTER SEARCH & FILTER ---');
    console.log(`• Dataset Size:       2,000 active student records`);
    console.log(`• Queries Executed:   500 queries`);
    console.log(`• Latency P50:        ${p50.toFixed(3)} ms`);
    console.log(`• Latency P95:        ${p95.toFixed(3)} ms`);
    console.log(`• Latency P99:        ${p99.toFixed(3)} ms`);
    console.log(`• Max Latency:        ${max.toFixed(3)} ms`);
    console.log(`• Mean Latency:       ${mean.toFixed(3)} ms`);

    // P95 latency must be under 5ms for 60fps / 120fps stutter-free typing
    expect(p95).toBeLessThan(5.0);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 3: High-Concurrency Edge API Simulation (200 concurrent requests)
  // ───────────────────────────────────────────────────────────────────────────
  it('Benchmark 3: 200 concurrent edge serverless requests simulation', async () => {
    const CONCURRENT_REQUESTS = 200;

    // Mock backend responses
    globalThis.fetch = () => Promise.resolve(new Response(JSON.stringify([
      { seat_no: 'B24110006001', name: 'Student 1', is_hidden: false }
    ]), { status: 200 }));

    const start = performance.now();

    const requestPromises = Array.from({ length: CONCURRENT_REQUESTS }, async (_, i) => {
      const reqStart = performance.now();
      const req = new Request('https://ubit-results-28.vercel.app/api/results', {
        method: 'GET',
        headers: { 'x-request-id': `bench-${i}` },
      });
      const res = await resultsHandler(req);
      const latency = performance.now() - reqStart;
      expect(res.status).toBe(200);
      return latency;
    });

    const latencies = await Promise.all(requestPromises);
    const totalDuration = performance.now() - start;
    const { p50, p95, p99, mean } = calculatePercentiles(latencies);
    const rps = Math.round((CONCURRENT_REQUESTS / totalDuration) * 1000);

    console.log('\n🚀 --- BENCHMARK 3: CONCURRENT SERVERLESS EDGE REQUESTS ---');
    console.log(`• Concurrency:        ${CONCURRENT_REQUESTS} parallel requests`);
    console.log(`• Total Time:         ${totalDuration.toFixed(2)} ms`);
    console.log(`• Effective RPS:      ${rps.toLocaleString()} req/sec`);
    console.log(`• Latency P50:        ${p50.toFixed(3)} ms`);
    console.log(`• Latency P95:        ${p95.toFixed(3)} ms`);
    console.log(`• Latency P99:        ${p99.toFixed(3)} ms`);
    console.log(`• Mean Latency:       ${mean.toFixed(3)} ms`);

    // All 200 requests must complete with low latency
    expect(latencies.length).toBe(CONCURRENT_REQUESTS);
    expect(p95).toBeLessThan(50);
  });
});
