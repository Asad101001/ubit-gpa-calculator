import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getGradePoint, getLetterGrade, getMarkPdfColor, SEM1_COURSES, SEM2_COURSES, SEM3_COURSES } from './utils';

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
  // A4 portrait dimensions: 210mm x 297mm
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 12;
  const contentW = pageW - margin * 2; // 186mm

  // ── 1. HEADER BAR (Ultra sleek, compact 22mm height) ─────────────────
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageW, 22, 'F');

  // Gold accent bottom line
  doc.setFillColor(230, 180, 0);
  doc.rect(0, 22, pageW, 1.5, 'F');

  // Left gold accent strip
  doc.setFillColor(230, 180, 0);
  doc.rect(0, 0, 3.5, 297, 'F');

  // Institution title (Gold)
  doc.setTextColor(230, 180, 0);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('UNIVERSITY OF KARACHI  •  UMAER BASHA INSTITUTE OF INFORMATION TECHNOLOGY (UBIT)', margin + 2, 7);

  // Document Heading (White)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('BSCS ACADEMIC TRANSCRIPT', margin + 2, 14);

  // Subtitle / Program
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(190, 190, 190);
  doc.text('Batch 2024–28  •  Unofficial Academic Record  •  Department of Computer Science', margin + 2, 19);

  // ── 2. STUDENT INFO BAR (12mm height) ─────────────────────────────────
  let y = 26;
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, y, contentW, 12, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentW, 12, 'S');

  // Student Name
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  const nameStr = student['Name'] || 'Student';
  doc.text(nameStr.length > 38 ? nameStr.slice(0, 36) + '…' : nameStr, margin + 3, y + 5);

  // Seat No
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text(`Seat No: ${student['Seat No'] || '—'}`, margin + 3, y + 9.5);

  // Right Side Info
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}`, pageW - margin - 50, y + 5);
  doc.text(`Program: BS Computer Science`, pageW - margin - 50, y + 9.5);

  y += 14;

  // ── 3. SEMESTER TABLES HELPER ─────────────────────────────────────────
  const drawSemester = (
    label: string,
    courses: CourseEntry[],
    badgeColor: [number, number, number],
    isTentative: boolean
  ) => {
    const { rows, gpa, hasAny } = computeSemStats(courses, student);
    const gpaDisplay = isTentative && !hasAny ? 'Pending' : gpa !== null ? gpa.toFixed(2) : 'Tentative';

    // Semester Header Strip (Height 5.5mm)
    doc.setFillColor(15, 15, 15);
    doc.rect(margin, y, contentW, 5.5, 'F');

    // Left accent indicator
    doc.setFillColor(...badgeColor);
    doc.rect(margin, y, 2.5, 5.5, 'F');

    // Semester Title
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    const tentNote = isTentative ? ' (In Progress — Tentative)' : '';
    doc.text(`${label}${tentNote}`, margin + 5, y + 3.8);

    // Right: Semester GPA badge (The primary key detail requested)
    doc.setFillColor(...badgeColor);
    doc.roundedRect(pageW - margin - 36, y + 0.8, 33, 4, 0.8, 0.8, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`Semester GPA: ${gpaDisplay}`, pageW - margin - 34.5, y + 3.6);

    y += 5.5;

    // Table Data: ONLY Code, Title, Cr, Marks, Grade, Instructor (NO GP/QP as requested)
    const tableBody = rows.map(({ sub, marks }) => {
      const hasMarks = marks !== null;
      return [
        sub.code,
        sub.name,
        String(sub.credits),
        hasMarks ? String(marks) : '—',
        hasMarks ? getLetterGrade(marks!) : '—',
        sub.instructor,
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [['Code', 'Course Title', 'Cr', 'Marks', 'Grade', 'Instructor']],
      body: tableBody,
      margin: { left: margin, right: margin },
      tableWidth: contentW,
      theme: 'grid',
      styles: {
        fontSize: 6.8,
        cellPadding: 1.1,
        font: 'helvetica',
        textColor: [20, 20, 20],
        lineColor: [220, 220, 220],
        lineWidth: 0.15,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 6.8,
        lineColor: [200, 200, 200],
        lineWidth: 0.2,
      },
      alternateRowStyles: { fillColor: [253, 253, 253] },
      columnStyles: {
        0: { cellWidth: 18, fontStyle: 'bold' },
        1: { cellWidth: 78 },
        2: { cellWidth: 12, halign: 'center' },
        3: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
        4: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 46, fontSize: 6.2, textColor: [100, 100, 100] },
      },
      didParseCell(data) {
        if (data.section === 'body') {
          // Marks column color with dynamic fail gradient
          if (data.column.index === 3) {
            const rawVal = data.cell.raw;
            const val = Number(rawVal);
            if (!isNaN(val) && rawVal !== '—') {
              data.cell.styles.textColor = getMarkPdfColor(val);
            } else {
              data.cell.styles.textColor = isTentative ? [180, 120, 0] : [140, 140, 140];
              data.cell.styles.fontStyle = 'italic';
            }
          }
          // Grade column styling
          if (data.column.index === 4) {
            if (data.cell.raw === 'A+') {
              data.cell.styles.textColor = [16, 185, 129];
            } else if (data.cell.raw === 'F') {
              data.cell.styles.textColor = [220, 38, 38];
            }
          }
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 3;
  };

  // Draw 3 semesters
  drawSemester('SEMESTER 1', SEM1_COURSES, [2, 132, 199], false); // Blue
  drawSemester('SEMESTER 2', SEM2_COURSES, [22, 163, 74], false);  // Green
  drawSemester('SEMESTER 3', SEM3_COURSES, [217, 119, 6], true);   // Amber

  // ── 4. CUMULATIVE CGPA BANNER (Primary Summary) ───────────────────────
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

  doc.setFillColor(230, 180, 0); // Bold UBIT Gold
  doc.rect(margin, y, contentW, 8.5, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(margin, y, contentW, 8.5, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`CUMULATIVE CGPA: ${cgpa}`, margin + 4, y + 5.8);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Credits Completed: ${allCr} Cr  •  Semester 1 & 2 Official  •  Semester 3 In-Progress`, pageW - margin - 88, y + 5.5);

  // ── 5. SINGLE-PAGE FOOTER (Positioned firmly at bottom y=283) ─────────
  const footerY = 283;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY, pageW - margin, footerY);

  doc.setFontSize(6.2);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text(
    '⚠ This is an UNOFFICIAL academic transcript generated by UBIT Results & GPA Hub. Please verify with official university records.',
    margin, footerY + 3.5
  );
  doc.text(
    `${SITE_URL}  •  DCS Umaer Basha Institute of Information Technology  •  University of Karachi`,
    margin, footerY + 7
  );

  // ── 6. ENSURE STRICT SINGLE PAGE (Prune any extra pages if spawned) ───
  while (doc.getNumberOfPages() > 1) {
    doc.deletePage(doc.getNumberOfPages());
  }

  // Download PDF
  const safeName = (student['Name'] || 'Student').replace(/\s+/g, '_');
  const safeSeat = (student['Seat No'] || 'Record').replace(/\s+/g, '_');
  doc.save(`Transcript_${safeName}_${safeSeat}.pdf`);
}
