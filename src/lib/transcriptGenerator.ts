import { getGradePoint } from './utils';

const SUBJECTS = [
  { id: 'cs351', code: 'CS-351', name: 'Programming Fundamentals', credits: 4, sem: 1 },
  { id: 'cs353', code: 'CS-353', name: 'Intro to ICT', credits: 3, sem: 1 },
  { id: 'cs355', code: 'CS-355', name: 'Calculus & Analytical Geo', credits: 3, sem: 1 },
  { id: 'cs357', code: 'CS-357', name: 'Applied Physics', credits: 3, sem: 1 },
  { id: 'cs359', code: 'CS-359', name: 'Functional English', credits: 3, sem: 1 },
  { id: 'cs361', code: 'CS-361', name: 'Islamic Studies / Ethics', credits: 2, sem: 1 },
  { id: 'cs352', code: 'CS-352', name: 'Object Oriented Concepts', credits: 4, sem: 2 },
  { id: 'cs354', code: 'CS-354', name: 'Digital Logic Design', credits: 3, sem: 2 },
  { id: 'cs356', code: 'CS-356', name: 'Linear Algebra', credits: 3, sem: 2 },
  { id: 'cs358', code: 'CS-358', name: 'Discrete Structures', credits: 3, sem: 2 },
  { id: 'cs360', code: 'CS-360', name: 'Communication Skills', credits: 3, sem: 2 },
  { id: 'cs362', code: 'CS-362', name: 'Ideology of Pakistan', credits: 2, sem: 2 },
];

function getLetterGrade(marks: number): string {
  if (marks >= 85) return 'A';
  if (marks >= 80) return 'A-';
  if (marks >= 75) return 'B+';
  if (marks >= 71) return 'B';
  if (marks >= 68) return 'B-';
  if (marks >= 64) return 'C+';
  if (marks >= 61) return 'C';
  if (marks >= 57) return 'D+';
  if (marks >= 50) return 'D';
  return 'F';
}

export function generateTranscriptImage(student: Record<string, any>): void {
  const W = 900;
  const canvas = document.createElement('canvas');

  // Calculate rows
  const sem1 = SUBJECTS.filter(s => s.sem === 1);
  const sem2 = SUBJECTS.filter(s => s.sem === 2);

  // Heights
  const headerH = 180;
  const tableHeaderH = 36;
  const rowH = 34;
  const semLabelH = 40;
  const gpaRowH = 40;
  const footerH = 80;
  const sectionGap = 24;

  const totalH =
    headerH +
    semLabelH + tableHeaderH + sem1.length * rowH + gpaRowH +
    sectionGap +
    semLabelH + tableHeaderH + sem2.length * rowH + gpaRowH +
    sectionGap + gpaRowH + // CGPA row
    footerH + 40;

  canvas.width = W;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, totalH);

  // Gold sidebar
  ctx.fillStyle = '#E6B400';
  ctx.fillRect(0, 0, 8, totalH);

  // Header block
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, headerH);

  // Gold accent line in header
  ctx.fillStyle = '#E6B400';
  ctx.fillRect(8, headerH - 5, W - 8, 5);

  // Institution
  ctx.fillStyle = '#E6B400';
  ctx.font = 'bold 13px Inter, Arial, sans-serif';
  ctx.fillText('UNIVERSITY OF KARACHI', 40, 40);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Inter, Arial, sans-serif';
  ctx.fillText('Department of Computer Science', 40, 68);
  ctx.font = '13px Inter, Arial, sans-serif';
  ctx.fillStyle = '#cccccc';
  ctx.fillText('BSCS — Batch 2028  |  Unofficial Academic Transcript', 40, 92);

  // Divider
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, 108); ctx.lineTo(W - 40, 108); ctx.stroke();

  // Student info
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Inter, Arial, sans-serif';
  ctx.fillText(student['Name'] || 'Unknown Student', 40, 132);
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '12px Inter, Arial, sans-serif';
  ctx.fillText(`Seat No: ${student['Seat No'] || '—'}`, 40, 152);
  ctx.fillText(`Generated: ${new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}`, 40, 168);

  // Table columns: Code, Course Name, Credits, Marks, Grade, GPA, QP
  const cols = [40, 130, 490, 560, 630, 700, 770];
  const colHeaders = ['Code', 'Course Title', 'Cr', 'Marks', 'Grade', 'GP', 'QP'];

  let y = headerH;

  const drawSemester = (subs: typeof SUBJECTS, semNum: number) => {
    // Sem label
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(8, y, W - 8, semLabelH);
    ctx.fillStyle = '#E6B400';
    ctx.fillRect(8, y, 4, semLabelH);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 13px Inter, Arial, sans-serif';
    ctx.fillText(`SEMESTER ${semNum}`, 24, y + 25);
    y += semLabelH;

    // Table header
    ctx.fillStyle = '#111111';
    ctx.fillRect(8, y, W - 8, tableHeaderH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Inter, Arial, sans-serif';
    colHeaders.forEach((h, i) => ctx.fillText(h, cols[i], y + 22));
    y += tableHeaderH;

    let totalQP = 0, totalCr = 0;

    subs.forEach((sub, idx) => {
      const raw = student[sub.id];
      const marks = raw !== undefined && raw !== null && !isNaN(Number(raw)) ? Number(raw) : null;
      const gp = marks !== null ? getGradePoint(marks) : null;
      const qp = marks !== null && gp !== null ? gp * sub.credits : null;

      if (marks !== null && gp !== null && qp !== null) {
        totalQP += qp;
        totalCr += sub.credits;
      }

      ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#fafafa';
      ctx.fillRect(8, y, W - 8, rowH);

      ctx.fillStyle = idx % 2 === 0 ? '#eeeeee' : '#e8e8e8';
      ctx.fillRect(8, y + rowH - 1, W - 8, 1);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px Inter, Arial, sans-serif';
      ctx.fillText(sub.code, cols[0], y + 21);
      ctx.font = '11px Inter, Arial, sans-serif';
      ctx.fillText(sub.name.length > 38 ? sub.name.slice(0, 36) + '…' : sub.name, cols[1], y + 21);
      ctx.fillText(String(sub.credits), cols[2], y + 21);

      if (marks === null) {
        ctx.fillStyle = '#999999';
        ctx.font = 'italic 10px Inter, Arial, sans-serif';
        ctx.fillText('—', cols[3], y + 21);
        ctx.fillText('—', cols[4], y + 21);
        ctx.fillText('—', cols[5], y + 21);
        ctx.fillText('—', cols[6], y + 21);
      } else {
        // Highlight top marks
        if (marks >= 85) {
          ctx.fillStyle = '#E6B400';
          ctx.font = 'bold 11px Inter, Arial, sans-serif';
        } else {
          ctx.fillStyle = '#000000';
          ctx.font = '11px Inter, Arial, sans-serif';
        }
        ctx.fillText(String(marks), cols[3], y + 21);
        ctx.fillStyle = '#000000';
        ctx.fillText(getLetterGrade(marks), cols[4], y + 21);
        ctx.fillText(gp!.toFixed(1), cols[5], y + 21);
        ctx.fillText(qp!.toFixed(2), cols[6], y + 21);
      }

      y += rowH;
    });

    // GPA row
    const semGpa = totalCr > 0 ? (totalQP / totalCr).toFixed(2) : '—';
    ctx.fillStyle = '#111111';
    ctx.fillRect(8, y, W - 8, gpaRowH);
    ctx.fillStyle = '#E6B400';
    ctx.font = 'bold 12px Inter, Arial, sans-serif';
    ctx.fillText(`Semester ${semNum} GPA: ${semGpa}`, cols[0], y + 25);
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '11px Inter, Arial, sans-serif';
    ctx.fillText(`Total Quality Points: ${totalQP.toFixed(2)}   /   Credit Hours: ${totalCr}`, cols[3], y + 25);
    y += gpaRowH;
  };

  drawSemester(sem1, 1);
  y += sectionGap;
  drawSemester(sem2, 2);

  // CGPA
  y += sectionGap;
  ctx.fillStyle = '#E6B400';
  ctx.fillRect(8, y, W - 8, gpaRowH + 10);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 15px Inter, Arial, sans-serif';

  // Compute overall CGPA
  let allQP = 0, allCr = 0;
  SUBJECTS.forEach(sub => {
    const raw = student[sub.id];
    const marks = raw !== undefined && raw !== null && !isNaN(Number(raw)) ? Number(raw) : null;
    if (marks !== null) {
      const gp = getGradePoint(marks);
      allQP += gp * sub.credits;
      allCr += sub.credits;
    }
  });
  const cgpa = allCr > 0 ? (allQP / allCr).toFixed(3) : '—';

  ctx.fillText(`CUMULATIVE CGPA: ${cgpa}`, cols[0], y + 30);
  ctx.font = '11px Inter, Arial, sans-serif';
  ctx.fillText(`Total Credits: ${allCr} / 36`, 600, y + 30);
  y += gpaRowH + 10;

  // Footer
  y += 16;
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(W - 40, y); ctx.stroke();
  y += 18;
  ctx.fillStyle = '#999999';
  ctx.font = '10px Inter, Arial, sans-serif';
  ctx.fillText('⚠ This is an UNOFFICIAL transcript generated by the UBIT GPA Calculator. Always verify with official university records.', 40, y);
  ctx.fillText('ubit-gpa.vercel.app  |  DCS UBIT Batch 2028', 40, y + 16);

  // Download
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transcript_${(student['Name'] || 'Student').replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}
