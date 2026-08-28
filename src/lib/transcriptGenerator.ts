import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getGradePoint, getLetterGrade, SEM1_COURSES, SEM2_COURSES, SEM3_COURSES } from './utils';

const SITE_URL = 'ubit-results-28.vercel.app';

interface CourseEntry {
  code: string;
  id: string;
  name: string;
  credits: number;
  type: string;
  instructor: string;
}

function computeSemStats(courses: CourseEntry[], student: Record<string, any>) {
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

export function generateTranscriptPDF(student: Record<string, any>): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;

  // ── HEADER BLOCK ──────────────────────────────────────────
  // Black top bar
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageW, 42, 'F');

  // Gold accent line
  doc.setFillColor(230, 180, 0);
  doc.rect(0, 42, pageW, 2.5, 'F');

  // Left gold sidebar strip
  doc.setFillColor(230, 180, 0);
  doc.rect(0, 0, 4, pageH, 'F');

  // Institution name — gold
  doc.setTextColor(230, 180, 0);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('UNIVERSITY OF KARACHI  •  DEPARTMENT OF COMPUTER SCIENCE (UBIT)', margin + 2, 10);

  // Main title — white
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BSCS Academic Transcript', margin + 2, 22);

  // Sub label
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text('Batch 2024–28  •  Umaer Basha Institute of Information Technology  •  UNOFFICIAL', margin + 2, 30);

  // Try embed UBIT logo (small, top-right corner)
  try {
    const img = new Image();
    img.src = '/images/ubit_logo.jpg';
    doc.addImage(img, 'JPEG', pageW - 36, 3, 30, 30);
  } catch {
    // skip if image unavailable
  }

  // ── STUDENT INFO BLOCK ────────────────────────────────────
  let y = 52;
  doc.setFillColor(248, 248, 248);
  doc.rect(margin, y, pageW - margin * 2, 20, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(margin, y, pageW - margin * 2, 20, 'S');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(student['Name'] || 'Unknown Student', margin + 4, y + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Seat No: ${student['Seat No'] || '—'}`, margin + 4, y + 15);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageW - margin - 60, y + 8);
  doc.text(`Program: BSCS (4-Year Semester System)`, pageW - margin - 60, y + 15);

  y += 26;

  // ── SEMESTER TABLE HELPER ─────────────────────────────────
  const drawSemester = (
    label: string,
    courses: CourseEntry[],
    headerColor: [number, number, number],
    isTentative: boolean
  ) => {
    // Section label
    doc.setFillColor(...headerColor);
    doc.rect(margin, y, pageW - margin * 2, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    const tentLabel = isTentative ? '  ⚠ In Progress — Marks Tentative / Pending' : '';
    doc.text(`${label}${tentLabel}`, margin + 3, y + 5);
    y += 9;

    const { rows, totalCr, gpa, hasAny } = computeSemStats(courses, student);

    const tableBody = rows.map(({ sub, marks, gp, qp }) => {
      const hasMarks = marks !== null;
      return [
        sub.code,
        sub.name.length > 36 ? sub.name.slice(0, 34) + '…' : sub.name,
        String(sub.credits),
        hasMarks ? String(marks) : (isTentative ? '—' : '—'),
        hasMarks ? getLetterGrade(marks!) : '—',
        hasMarks ? gp!.toFixed(1) : '—',
        hasMarks ? qp!.toFixed(2) : '—',
        sub.instructor,
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [['Code', 'Course Title', 'Cr', 'Marks', 'Grade', 'GP', 'QP', 'Instructor']],
      body: tableBody,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        font: 'helvetica',
        textColor: [20, 20, 20],
        lineColor: [200, 200, 200],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [30, 30, 30],
        textColor: [230, 180, 0],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { cellWidth: 18, fontStyle: 'bold' },
        1: { cellWidth: 58 },
        2: { cellWidth: 10, halign: 'center' },
        3: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
        4: { cellWidth: 14, halign: 'center' },
        5: { cellWidth: 12, halign: 'center' },
        6: { cellWidth: 14, halign: 'center' },
        7: { cellWidth: 40, fontSize: 6.5, textColor: [100, 100, 100] },
      },
      didParseCell(data) {
        // Colour marks by performance
        if (data.column.index === 3 && data.section === 'body') {
          const val = Number(data.cell.raw);
          if (!isNaN(val)) {
            if (val >= 85) data.cell.styles.textColor = [0, 130, 60];
            else if (val >= 71) data.cell.styles.textColor = [0, 100, 200];
            else if (val < 50) data.cell.styles.textColor = [200, 0, 0];
          } else {
            // pending / dash
            data.cell.styles.textColor = isTentative ? [150, 100, 0] : [150, 150, 150];
            data.cell.styles.fontStyle = 'italic';
          }
        }
        // Highlight A+ grade
        if (data.column.index === 4 && data.section === 'body' && data.cell.raw === 'A+') {
          data.cell.styles.textColor = [0, 130, 60];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    // GPA summary row
    const gpaStr = gpa !== null ? gpa.toFixed(3) : (hasAny ? 'Partial' : 'Pending');
    doc.setFillColor(30, 30, 30);
    doc.rect(margin, y, pageW - margin * 2, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(230, 180, 0);
    const semGpaLabel = isTentative && !hasAny ? 'Semester GPA: Pending' : `Semester GPA: ${gpaStr}`;
    doc.text(semGpaLabel, margin + 3, y + 5);
    doc.setTextColor(180, 180, 180);
    doc.setFont('helvetica', 'normal');
    doc.text(`Quality Points: ${hasAny ? rows.reduce((a, r) => a + (r.qp ?? 0), 0).toFixed(2) : '—'}   Credits Earned: ${totalCr}`, pageW - margin - 75, y + 5);
    y += 10;
  };

  // Draw each semester
  drawSemester('SEMESTER 1', SEM1_COURSES, [0, 70, 160], false);
  y += 3;
  drawSemester('SEMESTER 2', SEM2_COURSES, [0, 120, 60], false);
  y += 3;
  drawSemester('SEMESTER 3  (In Progress)', SEM3_COURSES, [160, 100, 0], true);

  // ── CGPA SUMMARY ─────────────────────────────────────────
  y += 4;
  const allCourses = [...SEM1_COURSES, ...SEM2_COURSES, ...SEM3_COURSES];
  let allQP = 0, allCr = 0;
  allCourses.forEach(sub => {
    const raw = student[sub.id];
    const marks = raw !== undefined && raw !== null && raw !== '' && !isNaN(Number(raw)) ? Number(raw) : null;
    if (marks !== null) {
      allQP += getGradePoint(marks) * sub.credits;
      allCr += sub.credits;
    }
  });
  const cgpa = allCr > 0 ? (allQP / allCr).toFixed(3) : '—';

  doc.setFillColor(230, 180, 0);
  doc.rect(margin, y, pageW - margin * 2, 10, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`CUMULATIVE CGPA: ${cgpa}`, margin + 4, y + 7);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Credits Earned: ${allCr} / 54`, pageW - margin - 60, y + 7);
  y += 14;

  // ── DISCLAIMER FOOTER ────────────────────────────────────
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(130, 130, 130);
  doc.text(
    '⚠ This is an UNOFFICIAL transcript generated by the UBIT GPA Calculator. Always verify with official university records.',
    margin, y
  );
  y += 5;
  doc.text(
    `${SITE_URL}  •  Department of Computer Science (UBIT)  •  University of Karachi  •  BSCS Batch 2024–28`,
    margin, y
  );

  // ── DOWNLOAD ─────────────────────────────────────────────
  const safeName = (student['Name'] || 'Student').replace(/\s+/g, '_');
  const safeSeat = (student['Seat No'] || 'Unknown').replace(/\s+/g, '_');
  doc.save(`Transcript_${safeName}_${safeSeat}.pdf`);
}
