import { jsPDF } from 'jspdf';

/**
 * Direct Vector PDF Exporter using jsPDF.
 * Features forced page break for Passed Checks table and "AI SEO Auditor by Mr. Zero" watermark.
 */
export const downloadPdfReport = async (auditData) => {
  if (!auditData || !auditData.audit) {
    throw new Error('No audit data provided for PDF export');
  }

  const { finalUrl, audit } = auditData;

  // Format clean filename based on target domain
  let domain = 'Website';
  try {
    domain = new URL(finalUrl).hostname.replace(/[^a-zA-Z0-9]/g, '_');
  } catch {}

  const filename = `${domain}_SEO_Audit_Report.pdf`;

  // Create new A4 PDF document (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = 15;

  // Helper to add new page if vertical cursor exceeds limit
  const checkPageBreak = (heightNeeded = 10) => {
    if (y + heightNeeded > pageHeight - margin - 10) {
      doc.addPage();
      y = 15;
      return true;
    }
    return false;
  };

  // --- HEADER SECTION ---
  doc.setFillColor(30, 58, 138); // Dark Navy Blue Header Bar
  doc.rect(margin, y, pageWidth - (margin * 2), 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AI SEO Auditor — Health Report', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  const truncatedUrl = finalUrl.length > 55 ? finalUrl.substring(0, 52) + '...' : finalUrl;
  doc.text(`Target URL: ${truncatedUrl}`, margin + 6, y + 16);

  // Score Circle Badge on Header Right
  const scoreColor = audit.score >= 75 ? [22, 163, 74] : audit.score >= 50 ? [217, 119, 6] : [220, 38, 38];
  doc.setFillColor(...scoreColor);
  doc.rect(pageWidth - margin - 25, y + 3, 20, 16, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${audit.score}/100`, pageWidth - margin - 15, y + 13, { align: 'center' });

  y += 28;

  // --- INTERPRETATION & STAT SUMMARY PILLS ---
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Status: ${audit.interpretation}`, margin, y);
  y += 7;

  // Stat summary pills (Passed / Warnings / Failed)
  const pillWidth = (pageWidth - (margin * 2) - 10) / 3;
  
  // Passed Pill
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, y, pillWidth, 12, 2, 2, 'FD');
  doc.setTextColor(21, 128, 61);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Passed: ${audit.summary.passed}`, margin + (pillWidth / 2), y + 7, { align: 'center' });

  // Warnings Pill
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(254, 243, 199);
  doc.roundedRect(margin + pillWidth + 5, y, pillWidth, 12, 2, 2, 'FD');
  doc.setTextColor(180, 83, 9);
  doc.text(`Warnings: ${audit.summary.warnings}`, margin + pillWidth + 5 + (pillWidth / 2), y + 7, { align: 'center' });

  // Failed Pill
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin + (pillWidth * 2) + 10, y, pillWidth, 12, 2, 2, 'FD');
  doc.setTextColor(185, 28, 28);
  doc.text(`Failed: ${audit.summary.failed}`, margin + (pillWidth * 2) + 10 + (pillWidth / 2), y + 7, { align: 'center' });

  y += 18;

  // --- CATEGORY BREAKDOWN TABLE ---
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Category Score Breakdown', margin, y);
  y += 5;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Category', margin + 4, y + 5);
  doc.text('Score', pageWidth - margin - 35, y + 5);
  doc.text('Max Score', pageWidth - margin - 15, y + 5);
  y += 7;

  const categoriesList = [
    { name: 'Technical SEO', ...audit.categories.technical },
    { name: 'On-Page SEO', ...audit.categories.onPage },
    { name: 'Content Structure', ...audit.categories.content },
    { name: 'Images & Links', ...audit.categories.mediaLinks },
    { name: 'Crawlability', ...audit.categories.crawlability },
    { name: 'Social Metadata', ...audit.categories.social },
  ];

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  categoriesList.forEach((cat, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - (margin * 2), 6, 'F');
    }
    doc.text(cat.name, margin + 4, y + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${cat.score}`, pageWidth - margin - 33, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${cat.maxScore}`, pageWidth - margin - 12, y + 4.5);
    y += 6;
  });

  y += 8;

  // --- ISSUES & ACTION PLAN ---
  checkPageBreak(20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Issues & Action Plan (${audit.issues.length})`, margin, y);
  y += 6;

  if (audit.issues.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(22, 163, 74);
    doc.setFont('helvetica', 'normal');
    doc.text('✓ Zero issues detected on this webpage.', margin, y);
    y += 8;
  } else {
    audit.issues.forEach((issue, idx) => {
      checkPageBreak(25);

      // Issue Title & Severity Badge
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${idx + 1}. ${issue.name}`, margin, y);

      const sevColor = issue.severity === 'critical' || issue.severity === 'high' ? [220, 38, 38] : [217, 119, 6];
      doc.setTextColor(...sevColor);
      doc.setFontSize(8);
      doc.text(`[${issue.severity.toUpperCase()}]`, pageWidth - margin - 20, y);

      y += 4.5;

      // Fact Message
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const messageLines = doc.splitTextToSize(`Fact: ${issue.message}`, pageWidth - (margin * 2));
      doc.text(messageLines, margin, y);
      y += (messageLines.length * 4);

      // Recommendation
      if (issue.recommendation) {
        doc.setTextColor(30, 58, 138);
        doc.setFont('helvetica', 'italic');
        const recLines = doc.splitTextToSize(`Recommendation: ${issue.recommendation}`, pageWidth - (margin * 2));
        doc.text(recLines, margin, y);
        y += (recLines.length * 4);
      }

      y += 3;
    });
  }

  // --- PASSED CHECKS TABULAR SECTION (FORCE NEW CLEAN PAGE) ---
  doc.addPage();
  y = 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Passed Checks (${audit.passedChecks.length})`, margin, y);
  y += 5;

  // Passed Table Header
  doc.setFillColor(240, 253, 244);
  doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text('Check Name', margin + 4, y + 5);
  doc.text('Status', margin + 65, y + 5);
  doc.text('Verified Details', margin + 90, y + 5);
  y += 7;

  audit.passedChecks.forEach((check, index) => {
    const detailWidth = pageWidth - margin - 92;
    const messageLines = doc.splitTextToSize(check.message, detailWidth);
    const rowHeight = Math.max(7, (messageLines.length * 4) + 3);

    checkPageBreak(rowHeight + 2);

    // Alternating Row Background
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - (margin * 2), rowHeight, 'F');
    }

    // Row bottom border line
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

    // Col 1: Check Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const nameLines = doc.splitTextToSize(check.name, 58);
    doc.text(nameLines, margin + 4, y + 4.5);

    // Col 2: PASS Badge Pill
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(margin + 65, y + 1.5, 16, 4.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(22, 101, 52);
    doc.text('PASS', margin + 73, y + 4.8, { align: 'center' });

    // Col 3: Verified Details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(messageLines, margin + 90, y + 4.5);

    y += rowHeight;
  });

  // --- WATERMARK & FOOTER ON ALL PDF PAGES ---
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Semi-transparent light watermark across the center of each page
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 228, 240); // Soft non-intrusive watermark color
    doc.text('AI SEO Auditor by Mr. Zero', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45
    });

    // Page footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(`AI SEO Auditor by Mr. Zero © 2026 — Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  }

  // Save the PDF
  doc.save(filename);
};
