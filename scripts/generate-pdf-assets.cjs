/**
 * Generate Styled PDF Assets for Pain Tracker Pro
 * 
 * Creates all 26 downloadable PDF templates referenced by SEO resource pages.
 * Each PDF is print-ready (US Letter), branded, and contains real tracking tables/content.
 * 
 * Usage: node scripts/generate-pdf-assets.cjs
 * Output: public/assets/*.pdf
 */

const { jsPDF } = require('jspdf');
const { applyPlugin } = require('jspdf-autotable');
applyPlugin(jsPDF);
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets');

// ─── Brand Colors ──────────────────────────────────────────────────────────────
const COLORS = {
  primary: [59, 130, 246],      // #3B82F6 blue
  primaryDark: [37, 99, 235],   // #2563EB
  dark: [15, 23, 42],           // #0F172A slate-900
  medium: [71, 85, 105],        // #475569 slate-600
  light: [148, 163, 184],       // #94A3B8 slate-400
  veryLight: [226, 232, 240],   // #E2E8F0 slate-200
  white: [255, 255, 255],
  accent: [16, 185, 129],       // #10B981 emerald
  warning: [245, 158, 11],      // #F59E0B amber
  bg: [248, 250, 252],          // #F8FAFC slate-50
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Create a new styled PDF document
 */
function createDoc() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  doc.setFont('helvetica');
  return doc;
}

/**
 * Draw the branded header bar + title block
 */
function drawHeader(doc, title, subtitle, badge) {
  const pw = doc.internal.pageSize.getWidth();

  // Top bar
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pw, 64, 'F');

  // Accent stripe
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 64, pw, 4, 'F');

  // Brand name
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Pain Tracker Pro', 36, 28);

  // Website
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('paintracker.ca', 36, 44);

  // Badge
  if (badge) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const bw = doc.getTextWidth(badge) + 16;
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(pw - 36 - bw, 20, bw, 22, 4, 4, 'F');
    doc.setTextColor(...COLORS.white);
    doc.text(badge, pw - 36 - bw + 8, 35);
  }

  // Free template text
  doc.setTextColor(...COLORS.light);
  doc.setFontSize(8);
  doc.text('FREE TEMPLATE', pw - 36 - doc.getTextWidth('FREE TEMPLATE'), 55);

  // Title block
  let y = 88;
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(title, pw - 72);
  doc.text(titleLines, 36, y);
  y += titleLines.length * 26;

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.medium);
    const subLines = doc.splitTextToSize(subtitle, pw - 72);
    doc.text(subLines, 36, y + 4);
    y += subLines.length * 14 + 8;
  }

  // Divider
  y += 8;
  doc.setDrawColor(...COLORS.veryLight);
  doc.setLineWidth(1);
  doc.line(36, y, pw - 36, y);

  return y + 16;
}

/**
 * Draw the footer on every page
 */
function drawFooter(doc) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const pages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(...COLORS.veryLight);
    doc.setLineWidth(0.5);
    doc.line(36, ph - 48, pw - 36, ph - 48);

    // Footer text
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.light);
    doc.setFont('helvetica', 'normal');
    doc.text('Pain Tracker Pro  •  paintracker.ca  •  Privacy-First Pain Tracking', 36, ph - 34);
    doc.text(`Page ${i} of ${pages}`, pw - 36, ph - 34, { align: 'right' });
    doc.text('This template is free to use, print, and share. Not medical advice.', 36, ph - 22);
  }
}

/**
 * Draw a section heading
 */
function drawSectionHeading(doc, y, text) {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFillColor(...COLORS.bg);
  doc.rect(36, y - 4, pw - 72, 22, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primaryDark);
  doc.text(text, 44, y + 12);
  return y + 30;
}

/**
 * Draw instruction text
 */
function drawInstruction(doc, y, text) {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.medium);
  const lines = doc.splitTextToSize(text, pw - 88);
  doc.text(lines, 44, y);
  return y + lines.length * 13 + 6;
}

/**
 * Draw a blank line for user input
 */
function drawInputLine(doc, y, label, width) {
  const pw = doc.internal.pageSize.getWidth();
  const w = width || (pw - 72 - doc.getTextWidth(label + '  '));
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.dark);
  doc.text(label, 44, y);
  const lx = 44 + doc.getTextWidth(label + ' ');
  doc.setDrawColor(...COLORS.light);
  doc.setLineWidth(0.5);
  doc.line(lx, y + 2, lx + w, y + 2);
  return y + 20;
}

/**
 * Check if we need a new page
 */
function checkPage(doc, y, needed) {
  const ph = doc.internal.pageSize.getHeight();
  if (y + needed > ph - 60) {
    doc.addPage();
    return 40;
  }
  return y;
}

/**
 * Draw a pain scale reference strip
 */
function drawPainScale(doc, y) {
  const pw = doc.internal.pageSize.getWidth();
  const scaleW = pw - 72;
  const segW = scaleW / 10;

  y = checkPage(doc, y, 50);
  y = drawSectionHeading(doc, y, 'Pain Scale Reference (0–10 NRS)');

  for (let i = 0; i <= 10; i++) {
    const x = 36 + i * segW;
    // Gradient: green → yellow → orange → red
    const r = i <= 3 ? 34 + i * 30 : i <= 6 ? 200 + (i - 3) * 15 : 220 + (i - 6) * 8;
    const g = i <= 3 ? 197 - i * 20 : i <= 6 ? 180 - (i - 3) * 40 : 60 - (i - 6) * 15;
    const b = i <= 3 ? 94 - i * 10 : 40;
    doc.setFillColor(Math.min(r, 255), Math.max(g, 0), Math.max(b, 0));
    doc.roundedRect(x, y, segW - 2, 20, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.white);
    doc.text(String(i), x + segW / 2 - 3, y + 14);
  }

  y += 26;
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.medium);
  doc.setFont('helvetica', 'normal');
  doc.text('0 = No Pain', 36, y);
  doc.text('5 = Moderate', 36 + scaleW / 2 - 20, y);
  doc.text('10 = Worst Possible', pw - 36 - doc.getTextWidth('10 = Worst Possible'), y);

  return y + 16;
}

/**
 * Draw a date/name header block
 */
function drawDateNameBlock(doc, y) {
  y = checkPage(doc, y, 40);
  y = drawInputLine(doc, y, 'Name:', 220);
  y = drawInputLine(doc, y, 'Date Range:', 200);
  return y + 4;
}

// ─── Tracking table builders ───────────────────────────────────────────────────

function dailyTrackingTable(doc, y, columns, rows) {
  y = checkPage(doc, y, 60);
  doc.autoTable({
    startY: y,
    margin: { left: 36, right: 36 },
    head: [columns],
    body: rows || Array.from({ length: 7 }, () => columns.map(() => '')),
    styles: {
      fontSize: 8,
      cellPadding: 6,
      lineColor: COLORS.veryLight,
      lineWidth: 0.5,
      textColor: COLORS.dark,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: COLORS.dark,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: COLORS.bg,
    },
    columnStyles: {
      0: { cellWidth: 64 },
    },
    theme: 'grid',
  });
  return doc.lastAutoTable.finalY + 12;
}

function notesBox(doc, y, title, lines) {
  const pw = doc.internal.pageSize.getWidth();
  y = checkPage(doc, y, 20 + lines * 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text(title || 'Notes', 44, y);
  y += 8;
  doc.setDrawColor(...COLORS.veryLight);
  doc.setFillColor(...COLORS.white);
  doc.setLineWidth(0.5);
  doc.roundedRect(36, y, pw - 72, lines * 18, 4, 4, 'FD');
  // Ruled lines
  for (let i = 1; i < lines; i++) {
    doc.setDrawColor(...COLORS.veryLight);
    doc.line(44, y + i * 18, pw - 44, y + i * 18);
  }
  return y + lines * 18 + 12;
}

// ─── PDF Definitions ───────────────────────────────────────────────────────────

const pdfDefinitions = [
  // ── Tier 1: Core Printable Templates ──────────────────────────────────────

  {
    filename: 'pain-diary-template.pdf',
    title: 'Pain Diary Template',
    subtitle: 'Clinician-designed daily pain diary. Tracks intensity, location, quality, medications, triggers, sleep, mood, and functional impact — the 8 data points providers need.',
    badge: 'Most Popular',
    generate: (doc, y) => {
      const pw = doc.internal.pageSize.getWidth();

      // ── Patient info block ──
      y = drawSectionHeading(doc, y, 'Patient Information');
      y = drawInputLine(doc, y, 'Name:', 250);
      y = drawInputLine(doc, y, 'Date Range:', 150);
      y = drawInputLine(doc, y, 'Condition(s):', 250);
      y = drawInputLine(doc, y, 'Current Medications:', 250);
      y += 4;

      // ── Pain Scale Reference ──
      y = drawPainScale(doc, y);

      // ── Pain Quality Reference ──
      y = checkPage(doc, y, 50);
      y = drawSectionHeading(doc, y, 'Pain Quality Descriptors');
      y = drawInstruction(doc, y,
        'Use these terms when describing your pain type: Aching • Burning • Stabbing • Throbbing • Shooting • Tingling • Cramping • Pressing • Sharp • Dull • Radiating • Pulsing • Electric • Stinging • Gnawing');
      y += 2;

      // ── Daily Log Table (Main) ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, 'Daily Pain Log — Week of: _______________');
      y = drawInstruction(doc, y,
        'Fill in one row per day. Rate pain on the 0–10 NRS. Use the quality descriptors above. Mark the primary location (e.g. lower back, R knee, neck).');
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      y = dailyTrackingTable(doc, y,
        ['Day', 'Date', 'AM Pain', 'PM Pain', 'Eve Pain', 'Worst', 'Location(s)', 'Quality'],
        days.map(d => [d, '', '', '', '', '', '', '']));

      // ── Medications & Treatments ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, 'Medications & Treatments');
      y = drawInstruction(doc, y,
        'Record everything you take or do for pain: prescriptions, OTC meds, topicals, heat/ice, physio exercises, etc. Rate relief 0–10.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Medication / Treatment', 'Dose / Duration', 'Time Taken', 'Relief (0-10)', 'Side Effects?'],
        days.map(d => [d, '', '', '', '', '']));

      // ── Triggers & Activities ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, 'Triggers & Activities');
      y = drawInstruction(doc, y,
        'Check any triggers or factors present each day. Add your own in the blank columns. This helps identify patterns over time.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Weather', 'Stress', 'Poor Sleep', 'Physical Activity', 'Sitting/Posture', 'Food/Drink', '_______'],
        days.map(d => [d, '', '', '', '', '', '', '']));

      // ── Sleep & Energy ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, 'Sleep & Energy');
      y = drawInstruction(doc, y,
        'Rate sleep quality 1–5 (1 = terrible, 5 = excellent). Rate morning energy 0–10. Note anything that disturbed sleep.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Bedtime', 'Wake Time', 'Hours Slept', 'Sleep Quality (1-5)', 'Morning Energy (0-10)', 'Disturbances'],
        days.map(d => [d, '', '', '', '', '', '']));

      // ── Mood & Functional Impact ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, 'Mood & Functional Impact');
      y = drawInstruction(doc, y,
        'Rate mood and each functional area: 0 = unable, 5 = managed with difficulty, 10 = normal. This documents how pain affects daily life.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Mood (0-10)', 'Self-Care', 'Housework', 'Walking', 'Work / School', 'Social / Family'],
        days.map(d => [d, '', '', '', '', '', '']));

      // ── Notes for Healthcare Provider ──
      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Notes for Your Healthcare Provider');
      y = drawInstruction(doc, y,
        'Use this space to record patterns you noticed, questions for your doctor, concerns about your treatment, or anything else you want to discuss at your next appointment.');
      y = notesBox(doc, y, 'Observations, Patterns, and Questions', 4);

      // ── Weekly Summary ──
      y = checkPage(doc, y, 160);
      y = drawSectionHeading(doc, y, 'Weekly Summary');
      y = drawInstruction(doc, y,
        'Complete this at the end of each week. Summarizing helps you and your provider spot trends faster.');
      y = drawInputLine(doc, y, 'Average pain this week (0–10):', 100);
      y = drawInputLine(doc, y, 'Highest / Lowest pain this week:', 100);
      y = drawInputLine(doc, y, 'Number of "bad" days (pain 6+):', 100);
      y = drawInputLine(doc, y, 'Most common trigger:', 250);
      y = drawInputLine(doc, y, 'Most effective relief:', 250);
      y = drawInputLine(doc, y, 'Functional impact (what couldn\'t you do?):', 250);
      y = drawInputLine(doc, y, 'Changes to discuss with provider:', 250);
      y = drawInputLine(doc, y, 'Goals for next week:', 250);

      // ── Tips Section ──
      y = checkPage(doc, y, 50);
      y = drawSectionHeading(doc, y, 'Tips for Effective Pain Tracking');
      const tips = [
        '• Fill this in at the same time each day (evening works best) — consistency matters more than perfection.',
        '• On high-pain days, just record your pain number and a few check marks. Partial data is better than no data.',
        '• Print multiple copies — two full weeks (14 days) is the minimum to spot meaningful patterns.',
        '• Bring completed sheets to every appointment. Most providers can scan this format in under 2 minutes.',
        '• Compare your best and worst days to identify triggers. Patterns often become clear after week two.',
        '• Rate pain in the moment, not from memory. Don\'t compare to others — use your own experience as the reference.',
        '• Keep this diary with your medications or by your bed so it becomes part of your daily routine.',
        '• For WorkSafeBC, ICBC, or disability claims: dated, consistent entries carry more weight than summaries.',
      ];
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.medium);
      for (const tip of tips) {
        y = checkPage(doc, y, 13);
        const tipLines = doc.splitTextToSize(tip, pw - 88);
        doc.text(tipLines, 44, y);
        y += tipLines.length * 12 + 2;
      }

      // ── Digital companion callout ──
      y = checkPage(doc, y, 60);
      doc.setFillColor(240, 249, 255); // sky-50
      doc.setDrawColor(...COLORS.primary);
      doc.setLineWidth(1);
      doc.roundedRect(36, y, pw - 72, 52, 6, 6, 'FD');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primaryDark);
      doc.text('Prefer digital? Try Pain Tracker Pro — paintracker.ca', 48, y + 18);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.medium);
      doc.text('Same data, less effort. Auto-generated reports, encrypted offline storage, trend analysis. Free, no sign-up.', 48, y + 34);
      doc.text('Works on any device. All data stays on your device — never sent to a server.', 48, y + 46);
    },
  },

  {
    filename: 'daily-pain-tracker.pdf',
    title: 'Daily Pain Tracker',
    subtitle: 'Comprehensive single-day pain log. Track episodes, medications, triggers, activity, mood, and sleep — everything your provider needs from one day.',
    badge: 'Quick Entry',
    generate: (doc, y) => {
      const pw = doc.internal.pageSize.getWidth();

      // ── Patient info ──
      y = checkPage(doc, y, 40);
      y = drawInputLine(doc, y, 'Name:', 200);
      // Date and Provider on the same row
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.dark);
      doc.text('Date:', 44, y);
      const dateLabelEnd = 44 + doc.getTextWidth('Date: ');
      doc.setDrawColor(...COLORS.light);
      doc.setLineWidth(0.5);
      doc.line(dateLabelEnd, y + 2, dateLabelEnd + 140, y + 2);
      doc.text('Provider / Clinic:', pw / 2, y);
      const provLabelEnd = pw / 2 + doc.getTextWidth('Provider / Clinic: ');
      doc.line(provLabelEnd, y + 2, pw - 36, y + 2);
      y += 24;

      // ── Pain Scale Reference ──
      y = drawPainScale(doc, y);

      // ── Morning Check-In ──
      y = drawSectionHeading(doc, y, 'Morning Check-In');
      y = drawInstruction(doc, y, 'Complete when you wake up. Establishing a baseline helps you and your provider spot trends.');

      // Two-column morning fields
      const col1x = 44;
      const col2x = pw / 2 + 10;
      const fieldW = 80;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.dark);

      // Row 1
      doc.text('Overnight pain (0-10):', col1x, y);
      doc.setDrawColor(...COLORS.light);
      doc.line(col1x + doc.getTextWidth('Overnight pain (0-10): '), y + 2, col1x + doc.getTextWidth('Overnight pain (0-10): ') + fieldW, y + 2);
      doc.text('Sleep hours:', col2x, y);
      doc.line(col2x + doc.getTextWidth('Sleep hours: '), y + 2, col2x + doc.getTextWidth('Sleep hours: ') + fieldW, y + 2);
      y += 20;

      // Row 2
      doc.text('Sleep quality (1-5):', col1x, y);
      doc.line(col1x + doc.getTextWidth('Sleep quality (1-5): '), y + 2, col1x + doc.getTextWidth('Sleep quality (1-5): ') + fieldW, y + 2);
      doc.text('Morning stiffness (mins):', col2x, y);
      doc.line(col2x + doc.getTextWidth('Morning stiffness (mins): '), y + 2, col2x + doc.getTextWidth('Morning stiffness (mins): ') + fieldW, y + 2);
      y += 20;

      // Row 3
      doc.text('Morning pain (0-10):', col1x, y);
      doc.line(col1x + doc.getTextWidth('Morning pain (0-10): '), y + 2, col1x + doc.getTextWidth('Morning pain (0-10): ') + fieldW, y + 2);
      doc.text('Energy level (1-5):', col2x, y);
      doc.line(col2x + doc.getTextWidth('Energy level (1-5): '), y + 2, col2x + doc.getTextWidth('Energy level (1-5): ') + fieldW, y + 2);
      y += 24;

      // ── Pain Episodes ──
      y = drawSectionHeading(doc, y, 'Pain Episodes');
      y = drawInstruction(doc, y, 'Log each notable pain episode. Quality examples: sharp, dull, burning, throbbing, aching, stabbing, tingling.');
      y = dailyTrackingTable(doc, y,
        ['Time', 'Pain\n(0-10)', 'Location', 'Quality / Type', 'Duration', 'Trigger / Activity'],
        Array.from({ length: 6 }, () => ['', '', '', '', '', '']));

      // ── Medications & Treatments ──
      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Medications & Treatments');
      y = drawInstruction(doc, y, 'Record everything taken or applied today. Include over-the-counter meds, exercises, heat/ice, etc.');
      y = dailyTrackingTable(doc, y,
        ['Time', 'Medication / Treatment', 'Dose / Duration', 'Relief\n(0-10)', 'Side Effects'],
        Array.from({ length: 5 }, () => ['', '', '', '', '']));

      // ── Activity & Function ──
      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Activity & Function Impact');
      y = drawInstruction(doc, y, 'Rate difficulty: 0 = no difficulty, 5 = could not do. Track how pain affects your daily life.');
      y = dailyTrackingTable(doc, y,
        ['Activity', 'Difficulty\n(0-5)', 'Pain Before\n(0-10)', 'Pain After\n(0-10)', 'Notes'],
        [
          ['Self-care (bathing, dressing)', '', '', '', ''],
          ['Housework / chores', '', '', '', ''],
          ['Walking / mobility', '', '', '', ''],
          ['Work / school', '', '', '', ''],
          ['Social / family', '', '', '', ''],
          ['Exercise / physical activity', '', '', '', ''],
        ]);

      // ── Mood & Energy ──
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Mood & Energy');

      // Mood scale inline
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.medium);
      doc.text('Circle one:', col1x, y);
      y += 4;

      const moods = ['Very Low', 'Low', 'Neutral', 'Good', 'Very Good'];
      const moodColors = [
        [220, 38, 38],   // red
        [245, 158, 11],  // amber
        [148, 163, 184], // slate
        [34, 197, 94],   // green
        [16, 185, 129],  // emerald
      ];
      const moodW = 90;
      const moodStartX = 44;
      for (let i = 0; i < moods.length; i++) {
        const mx = moodStartX + i * moodW;
        doc.setFillColor(...moodColors[i]);
        doc.roundedRect(mx, y, moodW - 6, 18, 3, 3, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.white);
        const tw = doc.getTextWidth(moods[i]);
        doc.text(moods[i], mx + (moodW - 6) / 2 - tw / 2, y + 12);
      }
      y += 28;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.dark);
      doc.text('Energy level (1-5):', col1x, y);
      doc.setDrawColor(...COLORS.light);
      doc.line(col1x + doc.getTextWidth('Energy level (1-5): '), y + 2, col1x + doc.getTextWidth('Energy level (1-5): ') + 60, y + 2);
      doc.text('Stress level (1-5):', col2x, y);
      doc.line(col2x + doc.getTextWidth('Stress level (1-5): '), y + 2, col2x + doc.getTextWidth('Stress level (1-5): ') + 60, y + 2);
      y += 24;

      // ── End-of-Day Summary ──
      y = checkPage(doc, y, 140);
      y = drawSectionHeading(doc, y, 'End-of-Day Summary');
      y = drawInstruction(doc, y, 'Complete before bed. This summary helps providers quickly review your day.');

      // Two-column summary
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.dark);

      doc.text('Worst pain today (0-10):', col1x, y);
      doc.setDrawColor(...COLORS.light);
      doc.line(col1x + doc.getTextWidth('Worst pain today (0-10): '), y + 2, col1x + doc.getTextWidth('Worst pain today (0-10): ') + 50, y + 2);
      doc.text('Average pain today (0-10):', col2x, y);
      doc.line(col2x + doc.getTextWidth('Average pain today (0-10): '), y + 2, col2x + doc.getTextWidth('Average pain today (0-10): ') + 50, y + 2);
      y += 20;

      doc.text('Worst time of day:', col1x, y);
      doc.line(col1x + doc.getTextWidth('Worst time of day: '), y + 2, col1x + doc.getTextWidth('Worst time of day: ') + 100, y + 2);
      doc.text('Best time of day:', col2x, y);
      doc.line(col2x + doc.getTextWidth('Best time of day: '), y + 2, col2x + doc.getTextWidth('Best time of day: ') + 100, y + 2);
      y += 20;

      y = drawInputLine(doc, y, 'Most effective treatment today:', 260);
      y = drawInputLine(doc, y, 'Biggest barrier / frustration:', 260);

      // ── Notes for Provider ──
      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Notes, Observations, and Questions for Provider', 4);

      // ── Tips callout ──
      y = checkPage(doc, y, 70);
      doc.setFillColor(240, 249, 255); // light blue bg
      doc.setDrawColor(...COLORS.primary);
      doc.setLineWidth(0.75);
      doc.roundedRect(36, y, pw - 72, 56, 4, 4, 'FD');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primaryDark);
      doc.text('Tips for Accurate Tracking', 48, y + 14);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.medium);
      doc.text('Rate pain at the moment it happens, not from memory.  |  Track good days too — they show what works.', 48, y + 28);
      doc.text('Bring this sheet to appointments.  |  Try the Pain Tracker Pro app for automatic charts and reports.', 48, y + 40);
    },
  },

  {
    filename: 'weekly-pain-log.pdf',
    title: 'Weekly Pain Log',
    subtitle: '7-day spread format with daily pain tracking, medications, sleep, activity, mood, triggers, and a weekly summary — everything your provider needs to see a full week at a glance.',
    badge: 'Weekly View',
    generate: (doc, y) => {
      const pw = doc.internal.pageSize.getWidth();
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      // ── Patient Info (compact single-line) ──
      y = checkPage(doc, y, 30);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.dark);
      doc.text('Name:', 44, y);
      doc.setDrawColor(...COLORS.light);
      doc.setLineWidth(0.5);
      doc.line(74, y + 2, 230, y + 2);
      doc.text('Week of:', 248, y);
      doc.line(288, y + 2, 420, y + 2);
      doc.text('Provider:', 435, y);
      doc.line(475, y + 2, pw - 44, y + 2);
      y += 20;

      // ── Pain Scale Reference ──
      y = drawPainScale(doc, y);

      // ── Section 1: Daily Pain Overview (7-day spread) ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, '1. Daily Pain Overview');
      y = drawInstruction(doc, y, 'Rate pain at each time point using the 0-10 NRS. Record worst pain and the primary location for each day.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'AM Pain', 'Midday', 'PM Pain', 'Eve Pain', 'Worst', 'Primary Location(s)'],
        days.map(d => [d, '', '', '', '', '', '']));

      // ── Section 2: Sleep & Energy ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, '2. Sleep & Energy');
      y = drawInstruction(doc, y, 'Rate sleep quality 1-5 (1=terrible, 5=excellent). Rate morning energy 0-10. Note disturbances (pain woke me, restless, etc.).');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Bedtime', 'Wake Time', 'Hours', 'Quality (1-5)', 'Energy (0-10)', 'Disturbances'],
        days.map(d => [d, '', '', '', '', '', '']));

      // ── Section 3: Medications & Treatments ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, '3. Medications & Treatments');
      y = drawInstruction(doc, y, 'Record all pain interventions: prescriptions, OTC, topicals, heat/ice, physio, TENS, etc. Rate relief 0-10.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Medication / Treatment', 'Dose / Duration', 'Time(s)', 'Relief (0-10)', 'Side Effects?'],
        days.map(d => [d, '', '', '', '', '']));

      // ── Section 4: Activity & Function Impact ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, '4. Activity & Function Impact');
      y = drawInstruction(doc, y, 'Rate each area 0-5 (0 = no difficulty, 3 = significant difficulty, 5 = unable). Leave blank if not applicable that day.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Self-Care', 'Housework', 'Walking', 'Work/School', 'Social', 'Exercise'],
        days.map(d => [d, '', '', '', '', '', '']));

      // ── Section 5: Triggers & Contributing Factors ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, '5. Triggers & Contributing Factors');
      y = drawInstruction(doc, y, 'Check (X) any factors present each day. Add your own in the blank column. Tracking triggers reveals hidden patterns.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Weather', 'Stress', 'Poor Sleep', 'Activity', 'Posture', 'Food/Drink', '______'],
        days.map(d => [d, '', '', '', '', '', '', '']));

      // ── Section 6: Mood & Wellbeing ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, '6. Mood & Wellbeing');
      y = drawInstruction(doc, y, 'Rate mood 0-10 (0=very low, 10=excellent). Note anxiety/stress level and any emotional observations.');

      // Color-coded mood strip
      const moodLabels = ['Very Low', 'Low', 'Fair', 'Good', 'Very Good'];
      const moodColors = [
        [239, 68, 68], [245, 158, 11], [100, 116, 139], [34, 197, 94], [16, 185, 129]
      ];
      const stripW = (pw - 72) / 5;
      for (let i = 0; i < 5; i++) {
        const x = 36 + i * stripW;
        doc.setFillColor(...moodColors[i]);
        doc.roundedRect(x, y, stripW - 2, 18, 2, 2, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.white);
        const lbl = moodLabels[i];
        const lblW = doc.getTextWidth(lbl);
        doc.text(lbl, x + (stripW - 2) / 2 - lblW / 2, y + 12);
      }
      y += 26;

      y = dailyTrackingTable(doc, y,
        ['Day', 'Mood (0-10)', 'Anxiety (0-10)', 'Stress Level', 'Notes'],
        days.map(d => [d, '', '', '', '']));

      // ── Section 7: Weekly Pattern Analysis ──
      y = checkPage(doc, y, 180);
      y = drawSectionHeading(doc, y, '7. Weekly Pattern Analysis');
      y = drawInstruction(doc, y, 'Complete at the end of the week. This summary helps you and your provider spot trends faster.');

      // Two-column summary layout
      const colW = (pw - 72 - 16) / 2;
      const leftX = 44;
      const rightX = 44 + colW + 16;

      // Left column
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primaryDark);
      doc.text('PAIN SUMMARY', leftX, y);
      y += 14;
      const summaryY = y;
      y = drawInputLine(doc, y, 'Average pain this week (0-10):', 80);
      y = drawInputLine(doc, y, 'Highest pain / day:', 120);
      y = drawInputLine(doc, y, 'Lowest pain / day:', 120);
      y = drawInputLine(doc, y, 'Number of flare days (6+):', 80);
      y = drawInputLine(doc, y, 'Most common location:', 120);

      // Right column (drawn at saved Y)
      let ry = summaryY;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primaryDark);
      doc.text('TREATMENT & TRIGGERS', rightX, ry - 14);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.dark);

      doc.text('Most effective treatment:', rightX, ry);
      doc.setDrawColor(...COLORS.light);
      doc.line(rightX + doc.getTextWidth('Most effective treatment: '), ry + 2, rightX + colW - 10, ry + 2);
      ry += 20;
      doc.text('Least effective treatment:', rightX, ry);
      doc.line(rightX + doc.getTextWidth('Least effective treatment: '), ry + 2, rightX + colW - 10, ry + 2);
      ry += 20;
      doc.text('Most common trigger:', rightX, ry);
      doc.line(rightX + doc.getTextWidth('Most common trigger: '), ry + 2, rightX + colW - 10, ry + 2);
      ry += 20;
      doc.text('Improvement vs last week?', rightX, ry);
      doc.line(rightX + doc.getTextWidth('Improvement vs last week? '), ry + 2, rightX + colW - 10, ry + 2);
      ry += 20;
      doc.text('Goal for next week:', rightX, ry);
      doc.line(rightX + doc.getTextWidth('Goal for next week: '), ry + 2, rightX + colW - 10, ry + 2);

      y = Math.max(y, ry + 20) + 4;

      // ── Section 8: Notes for Healthcare Provider ──
      y = checkPage(doc, y, 100);
      y = drawSectionHeading(doc, y, '8. Notes for Your Healthcare Provider');
      y = drawInstruction(doc, y, 'Patterns noticed, questions for your doctor, concerns, medication requests, or anything to discuss at your next appointment.');
      y = notesBox(doc, y, 'Observations, Patterns, and Questions', 4);

      // ── Tips Section ──
      y = checkPage(doc, y, 60);
      doc.setFillColor(240, 249, 255); // sky-50
      doc.setDrawColor(...COLORS.primary);
      doc.setLineWidth(1);
      const tipsH = 64;
      doc.roundedRect(36, y, pw - 72, tipsH, 6, 6, 'FD');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primaryDark);
      doc.text('Tips for Better Weekly Tracking', 48, y + 16);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.medium);
      doc.text('Fill in each evening -- 2 minutes keeps the data accurate.  |  Print 4 copies for a full month of weekly tracking.', 48, y + 30);
      doc.text('Lay weeks side by side to spot repeating patterns.  |  Bring completed sheets to every appointment.', 48, y + 42);
      doc.text('Rate pain in the moment, not from memory.  |  Try Pain Tracker Pro (paintracker.ca) for automatic charts and insights.', 48, y + 54);
    },
  },

  {
    filename: 'monthly-pain-tracker.pdf',
    title: 'Monthly Pain Tracker',
    subtitle: 'Comprehensive 30-day overview with daily pain calendar, sleep & energy, medication log, functional impact, trigger patterns, mood trends, and monthly summary — the long-term view your provider needs.',
    badge: 'Monthly View',
    generate: (doc, y) => {
      const pw = doc.internal.pageSize.getWidth();

      // ── Patient Info (compact single-line) ──
      y = checkPage(doc, y, 30);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.dark);
      doc.text('Name:', 44, y);
      doc.setDrawColor(...COLORS.light);
      doc.setLineWidth(0.5);
      doc.line(74, y + 2, 215, y + 2);
      doc.text('Month/Year:', 230, y);
      doc.line(288, y + 2, 400, y + 2);
      doc.text('Provider:', 415, y);
      doc.line(455, y + 2, pw - 44, y + 2);
      y += 20;

      // ── Pain Scale Reference ──
      y = drawPainScale(doc, y);

      // ── Section 1: Monthly Pain Calendar ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, '1. Monthly Pain Calendar');
      y = drawInstruction(doc, y, 'Write your average daily pain (0-10) in each cell. Circle days with flares (6+). Mark medication changes with a star. Calculate each week\'s average in the last column.');

      y = dailyTrackingTable(doc, y,
        ['Week', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Avg'],
        [['1', '', '', '', '', '', '', '', ''],
         ['2', '', '', '', '', '', '', '', ''],
         ['3', '', '', '', '', '', '', '', ''],
         ['4', '', '', '', '', '', '', '', ''],
         ['5', '', '', '', '', '', '', '', '']]);

      // ── Section 2: Sleep & Energy Log ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, '2. Weekly Sleep & Energy Summary');
      y = drawInstruction(doc, y, 'Summarize each week\'s sleep and energy. Hours = avg per night. Quality 1-5. Energy 0-10. This reveals sleep/pain correlations over the month.');

      y = dailyTrackingTable(doc, y,
        ['Week', 'Avg Hours', 'Avg Quality (1-5)', 'Avg Energy (0-10)', 'Sleep Issues This Week'],
        [['1', '', '', '', ''],
         ['2', '', '', '', ''],
         ['3', '', '', '', ''],
         ['4', '', '', '', ''],
         ['5', '', '', '', '']]);

      // ── Section 3: Medications & Treatments ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, '3. Medications & Treatments This Month');
      y = drawInstruction(doc, y, 'List every medication, therapy, or intervention used this month. Note start/stop dates, dosage changes, and overall effectiveness.');

      y = dailyTrackingTable(doc, y,
        ['Medication / Treatment', 'Dose', 'Frequency', 'Start/Stop', 'Relief (0-10)', 'Side Effects'],
        [['', '', '', '', '', ''],
         ['', '', '', '', '', ''],
         ['', '', '', '', '', ''],
         ['', '', '', '', '', ''],
         ['', '', '', '', '', ''],
         ['', '', '', '', '', ''],
         ['', '', '', '', '', '']]);

      // ── Section 4: Weekly Function Impact ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, '4. Weekly Functional Impact');
      y = drawInstruction(doc, y, 'Rate each area 0-5 per week (0 = no difficulty, 3 = significant difficulty, 5 = unable). Shows how pain affects daily life across the month.');

      y = dailyTrackingTable(doc, y,
        ['Week', 'Self-Care', 'Housework', 'Walking', 'Work/School', 'Social', 'Exercise', 'Overall'],
        [['1', '', '', '', '', '', '', ''],
         ['2', '', '', '', '', '', '', ''],
         ['3', '', '', '', '', '', '', ''],
         ['4', '', '', '', '', '', '', ''],
         ['5', '', '', '', '', '', '', '']]);

      // ── Section 5: Trigger Pattern Tracker ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, '5. Trigger Pattern Tracker');
      y = drawInstruction(doc, y, 'Tally how many days each trigger was present. Seeing monthly totals reveals which triggers appear most often alongside high-pain days.');

      y = dailyTrackingTable(doc, y,
        ['Trigger', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Monthly Total'],
        [['Weather changes', '', '', '', '', '', ''],
         ['High stress', '', '', '', '', '', ''],
         ['Poor sleep', '', '', '', '', '', ''],
         ['Physical overexertion', '', '', '', '', '', ''],
         ['Prolonged sitting/posture', '', '', '', '', '', ''],
         ['Food / alcohol', '', '', '', '', '', ''],
         ['Hormonal cycle', '', '', '', '', '', ''],
         ['_____________', '', '', '', '', '', '']]);

      // ── Section 6: Monthly Mood & Wellbeing Trend ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, '6. Monthly Mood & Wellbeing Trend');
      y = drawInstruction(doc, y, 'Rate weekly averages for mood, anxiety, and stress. Track the emotional dimension of chronic pain over the full month.');

      // Color-coded mood strip
      const moodLabels = ['Very Low', 'Low', 'Fair', 'Good', 'Very Good'];
      const moodColors = [
        [239, 68, 68], [245, 158, 11], [100, 116, 139], [34, 197, 94], [16, 185, 129]
      ];
      const stripW = (pw - 72) / 5;
      for (let i = 0; i < 5; i++) {
        const x = 36 + i * stripW;
        doc.setFillColor(...moodColors[i]);
        doc.roundedRect(x, y, stripW - 2, 18, 2, 2, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.white);
        const lbl = moodLabels[i];
        const lblW = doc.getTextWidth(lbl);
        doc.text(lbl, x + (stripW - 2) / 2 - lblW / 2, y + 12);
      }
      y += 26;

      y = dailyTrackingTable(doc, y,
        ['Week', 'Avg Mood (0-10)', 'Avg Anxiety (0-10)', 'Avg Stress Level', 'Notes / Patterns'],
        [['1', '', '', '', ''],
         ['2', '', '', '', ''],
         ['3', '', '', '', ''],
         ['4', '', '', '', ''],
         ['5', '', '', '', '']]);

      // ── Section 7: Monthly Summary & Analysis ──
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, '7. Monthly Summary & Analysis');
      y = drawInstruction(doc, y, 'Complete at month end. This summary is the most clinically valuable section — it\'s what your provider reads first.');

      // Two-column summary
      const colW = (pw - 72 - 16) / 2;
      const leftX = 44;
      const rightX = 44 + colW + 16;

      // Left column header
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primaryDark);
      doc.text('PAIN & FUNCTION', leftX, y);
      y += 14;
      const summaryY = y;

      y = drawInputLine(doc, y, 'Monthly average pain (0-10):', 80);
      y = drawInputLine(doc, y, 'Highest pain / week #:', 100);
      y = drawInputLine(doc, y, 'Lowest pain / week #:', 100);
      y = drawInputLine(doc, y, 'Number of flare days (6+):', 80);
      y = drawInputLine(doc, y, 'Trend vs last month:', 120);
      y = drawInputLine(doc, y, 'Biggest functional impact:', 100);

      // Right column
      let ry = summaryY;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primaryDark);
      doc.text('TREATMENT & GOALS', rightX, ry - 14);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.dark);

      const rightFields = [
        'Most effective treatment:',
        'Least effective treatment:',
        'Most common trigger:',
        'Medication changes made:',
        'Improvement vs last month?',
        'Goal for next month:',
      ];
      for (const field of rightFields) {
        doc.text(field, rightX, ry);
        doc.setDrawColor(...COLORS.light);
        doc.line(rightX + doc.getTextWidth(field + ' '), ry + 2, rightX + colW - 10, ry + 2);
        ry += 20;
      }

      y = Math.max(y, ry) + 4;

      // ── Section 8: Notes for Healthcare Provider ──
      y = checkPage(doc, y, 100);
      y = drawSectionHeading(doc, y, '8. Notes for Your Healthcare Provider');
      y = drawInstruction(doc, y, 'Monthly patterns, treatment concerns, medication requests, questions for your next appointment, and goals you want to discuss.');
      y = notesBox(doc, y, 'Monthly Observations, Patterns, and Questions', 5);

      // ── Tips callout ──
      y = checkPage(doc, y, 68);
      doc.setFillColor(240, 249, 255);
      doc.setDrawColor(...COLORS.primary);
      doc.setLineWidth(1);
      doc.roundedRect(36, y, pw - 72, 64, 6, 6, 'FD');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primaryDark);
      doc.text('Tips for Better Monthly Tracking', 48, y + 16);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.medium);
      doc.text('Record your daily pain number each evening -- 30 seconds keeps a full month of data accurate.', 48, y + 30);
      doc.text('Circle flare days on the calendar so patterns are visible at a glance when reviewing with your provider.', 48, y + 42);
      doc.text('Compare month-over-month to judge treatment effectiveness.  |  Try Pain Tracker Pro (paintracker.ca) for automatic analysis.', 48, y + 54);
    },
  },

  {
    filename: 'pain-scale-chart.pdf',
    title: 'Pain Scale Chart',
    subtitle: 'Comprehensive 0-10 Numeric Rating Scale (NRS) reference with functional descriptions, clinical categories, and self-assessment guidance.',
    badge: 'Reference Guide',
    generate: (doc, y) => {
      const pw = doc.internal.pageSize.getWidth();

      // ── Section 1: Full 0-10 NRS Reference ──
      y = drawSectionHeading(doc, y, '1. Numeric Rating Scale (NRS) 0-10');
      y = drawInstruction(doc, y, 'Use the functional descriptions below to rate your pain -- match your experience to the description, not just the number.');

      const descriptions = [
        ['0',  'No Pain',           'No pain sensation at all. Completely comfortable.',                                         'Normal'],
        ['1',  'Minimal',           'Barely noticeable. Easily ignored. Does not interfere with any activities.',                 'Normal'],
        ['2',  'Mild',              'Minor pain, noticeable but not distracting. Activities continue without effort.',            'Mild'],
        ['3',  'Uncomfortable',     'Noticeable and can be distracting. Manageable with effort. Able to adapt and work.',         'Mild'],
        ['4',  'Moderate',          'Noticeable most of the time. Can be ignored with effort. Some activities affected.',         'Moderate'],
        ['5',  'Moderately Severe', 'Cannot be ignored for more than a few minutes. Activity is limited.',                       'Moderate'],
        ['6',  'Severe',            'Pain dominates thinking. Concentration is difficult. Significantly limits function.',        'Moderate'],
        ['7',  'Very Severe',       'Hard to function normally. Interferes with sleep and conversation. Hard to concentrate.',    'Severe'],
        ['8',  'Intense',           'Physical activity severely limited. Difficulty speaking or moving. Overwhelming.',           'Severe'],
        ['9',  'Excruciating',      'Unable to function. Crying, moaning, or unable to speak. Near worst imaginable.',           'Severe'],
        ['10', 'Worst Possible',    'Worst pain imaginable. Completely incapacitating. Emergency level.',                         'Emergency'],
      ];

      for (const [num, label, desc, category] of descriptions) {
        y = checkPage(doc, y, 40);
        const n = parseInt(num);
        // Color gradient: green -> yellow -> orange -> red
        const r = n <= 3 ? 34 + n * 30 : n <= 6 ? 200 + (n - 3) * 15 : 220 + (n - 6) * 8;
        const g = n <= 3 ? 197 - n * 20 : n <= 6 ? 180 - (n - 3) * 40 : 60 - (n - 6) * 15;
        const b = n <= 3 ? 94 - n * 10 : 40;
        doc.setFillColor(Math.min(r, 255), Math.max(g, 0), Math.max(b, 0));
        doc.roundedRect(44, y, 34, 26, 3, 3, 'F');
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.white);
        const numW = doc.getTextWidth(num);
        doc.text(num, 44 + 17 - numW / 2, y + 18);
        doc.setTextColor(...COLORS.dark);
        doc.setFontSize(10);
        doc.text(label, 88, y + 11);
        // Category tag
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        const catColor = category === 'Normal' ? COLORS.accent : category === 'Mild' ? [34, 197, 94] : category === 'Moderate' ? COLORS.warning : category === 'Emergency' ? [220, 38, 38] : [220, 60, 40];
        doc.setTextColor(...catColor);
        doc.text(category.toUpperCase(), pw - 44 - doc.getTextWidth(category.toUpperCase()), y + 11);
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.medium);
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(desc, pw - 136);
        doc.text(descLines, 88, y + 23);
        y += Math.max(34, 18 + descLines.length * 10);
      }

      // ── Section 2: Quick-Reference Strip ──
      y += 6;
      y = checkPage(doc, y, 70);
      y = drawSectionHeading(doc, y, '2. Quick-Reference Color Strip');
      y = drawInstruction(doc, y, 'Cut out or photocopy this strip. Keep it with your pain diary for fast, consistent rating.');

      const stripW = pw - 72;
      const segW = stripW / 11;
      // Strip background
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(36, y - 4, stripW, 44, 4, 4, 'F');
      for (let i = 0; i <= 10; i++) {
        const x = 36 + i * segW;
        const r = i <= 3 ? 34 + i * 30 : i <= 6 ? 200 + (i - 3) * 15 : 220 + (i - 6) * 8;
        const g = i <= 3 ? 197 - i * 20 : i <= 6 ? 180 - (i - 3) * 40 : 60 - (i - 6) * 15;
        const b = i <= 3 ? 94 - i * 10 : 40;
        doc.setFillColor(Math.min(r, 255), Math.max(g, 0), Math.max(b, 0));
        doc.roundedRect(x + 1, y, segW - 2, 24, 2, 2, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.white);
        const nw = doc.getTextWidth(String(i));
        doc.text(String(i), x + segW / 2 - nw / 2, y + 16);
      }
      y += 28;
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.medium);
      doc.setFont('helvetica', 'normal');
      doc.text('No Pain', 38, y);
      doc.text('Mild', 36 + stripW * 0.18, y);
      doc.text('Moderate', 36 + stripW * 0.41, y);
      doc.text('Severe', 36 + stripW * 0.68, y);
      doc.text('Worst Possible', pw - 36 - doc.getTextWidth('Worst Possible'), y);
      y += 20;

      // ── Section 3: Functional Impact by Category ──
      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, '3. Functional Impact by Category');
      y = drawInstruction(doc, y, 'Pain affects function differently at each level. Use this table to rate based on what you CAN and CANNOT do.');

      doc.autoTable({
        startY: y,
        margin: { left: 36, right: 36 },
        head: [['Category', 'Range', 'Activity', 'Sleep', 'Work', 'Mood']],
        body: [
          ['Normal',   '0-1', 'Fully active',                 'No impact',        'Full capacity',      'Unaffected'],
          ['Mild',     '2-3', 'Active with awareness',        'Falls asleep OK',  'Full with effort',   'Slight frustration'],
          ['Moderate', '4-6', 'Limited activities',           'Disturbed sleep',  'Reduced capacity',   'Anxious, irritable'],
          ['Severe',   '7-8', 'Basic self-care only',         'Poor or no sleep', 'Unable to work',     'Distressed'],
          ['Crisis',   '9-10','Cannot move or function',      'Cannot sleep',     'Incapacitated',      'Overwhelmed'],
        ],
        styles: {
          fontSize: 8,
          cellPadding: 5,
          lineColor: COLORS.veryLight,
          lineWidth: 0.5,
          textColor: COLORS.dark,
          font: 'helvetica',
        },
        headStyles: {
          fillColor: COLORS.dark,
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 8,
        },
        alternateRowStyles: { fillColor: COLORS.bg },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 42, halign: 'center' },
        },
        theme: 'grid',
      });
      y = doc.lastAutoTable.finalY + 14;

      // ── Section 4: Common Rating Mistakes ──
      y = checkPage(doc, y, 100);
      y = drawSectionHeading(doc, y, '4. Common Rating Mistakes');

      doc.autoTable({
        startY: y,
        margin: { left: 36, right: 36 },
        head: [['Mistake', 'Why It Matters', 'Instead, Do This']],
        body: [
          ['Comparing to worst-ever pain',    'Makes current pain seem less important',     'Rate based on today\'s function, not past extremes'],
          ['Comparing to other people',        'Everyone\'s scale is personal',              'Match YOUR experience to the descriptions above'],
          ['Rating from memory hours later',   'Memory exaggerates peaks, forgets averages', 'Rate in the moment or as soon as possible'],
          ['Always picking a round number',    'Misses gradual changes over time',           'Use odd numbers too -- 3 and 5 are different'],
          ['Minimizing to seem tough',          'Under-reporting delays treatment changes',   'Honest rating helps your provider help you'],
          ['Only rating bad days',              'Missing good days distorts averages',         'Track every day including low-pain days'],
        ],
        styles: {
          fontSize: 7.5,
          cellPadding: 5,
          lineColor: COLORS.veryLight,
          lineWidth: 0.5,
          textColor: COLORS.dark,
          font: 'helvetica',
        },
        headStyles: {
          fillColor: COLORS.dark,
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 8,
        },
        alternateRowStyles: { fillColor: COLORS.bg },
        theme: 'grid',
      });
      y = doc.lastAutoTable.finalY + 14;

      // ── Section 5: Pain Type Descriptors ──
      y = checkPage(doc, y, 100);
      y = drawSectionHeading(doc, y, '5. Pain Quality Descriptors');
      y = drawInstruction(doc, y, 'When describing pain to your doctor, the NUMBER tells them how much. These WORDS tell them what kind.');

      doc.autoTable({
        startY: y,
        margin: { left: 36, right: 36 },
        head: [['Type', 'Feels Like', 'Common In', 'Example']],
        body: [
          ['Sharp / Stabbing',  'Knife-like, sudden, piercing',           'Nerve injury, acute injury',       'Sciatica, herniated disc'],
          ['Dull / Aching',     'Deep, constant, heavy pressure',         'Muscle strain, arthritis',         'Low back pain, joint aches'],
          ['Burning',           'Hot, stinging, surface-level',           'Nerve damage, inflammation',       'Neuropathy, sunburn-like pain'],
          ['Throbbing',         'Pulsating, rhythmic, pounding',          'Vascular, infection, migraine',    'Headaches, dental pain'],
          ['Cramping',          'Squeezing, tightening, spasm',           'Muscle spasm, visceral',           'Menstrual cramps, GI pain'],
          ['Tingling / Numb',   'Pins and needles, loss of sensation',    'Nerve compression',                'Carpal tunnel, pinched nerve'],
          ['Radiating',         'Spreading outward from a point',         'Nerve root, referred pain',        'Sciatica down the leg'],
        ],
        styles: {
          fontSize: 7.5,
          cellPadding: 5,
          lineColor: COLORS.veryLight,
          lineWidth: 0.5,
          textColor: COLORS.dark,
          font: 'helvetica',
        },
        headStyles: {
          fillColor: COLORS.dark,
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 8,
        },
        alternateRowStyles: { fillColor: COLORS.bg },
        theme: 'grid',
      });
      y = doc.lastAutoTable.finalY + 14;

      // ── Section 6: When to Seek Help ──
      y = checkPage(doc, y, 100);
      y = drawSectionHeading(doc, y, '6. When to Seek Medical Attention');
      y = drawInstruction(doc, y, 'Use this guide alongside your pain rating. Some situations need prompt attention regardless of the number.');

      doc.autoTable({
        startY: y,
        margin: { left: 36, right: 36 },
        head: [['Situation', 'Action', 'Why']],
        body: [
          ['Pain 8-10 that does not improve',             'Seek urgent care or ER',         'Uncontrolled severe pain needs medical management'],
          ['Sudden new pain with numbness or weakness',   'Call 911 or go to ER',           'May indicate nerve damage or stroke'],
          ['Pain after injury with swelling or deformity', 'Go to ER or urgent care',       'Possible fracture or serious tissue damage'],
          ['Pain with fever and chills',                   'See doctor same day',            'May indicate infection needing antibiotics'],
          ['Pain steadily increasing over days/weeks',     'Schedule appointment this week', 'Progressive pain suggests worsening condition'],
          ['Pain unchanged despite treatment',             'Follow up with provider',        'Treatment plan may need adjustment'],
        ],
        styles: {
          fontSize: 7.5,
          cellPadding: 5,
          lineColor: COLORS.veryLight,
          lineWidth: 0.5,
          textColor: COLORS.dark,
          font: 'helvetica',
        },
        headStyles: {
          fillColor: [180, 40, 40],
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 8,
        },
        alternateRowStyles: { fillColor: [255, 245, 245] },
        theme: 'grid',
      });
      y = doc.lastAutoTable.finalY + 14;

      // ── Section 7: Talking to Your Doctor ──
      y = checkPage(doc, y, 100);
      y = drawSectionHeading(doc, y, '7. How to Describe Pain to Your Doctor');
      y = drawInstruction(doc, y, 'Use this framework at appointments. Providers need specific detail to diagnose and treat effectively.');

      const framework = [
        'LOCATION:    Where exactly does it hurt? Does it spread anywhere?',
        'ONSET:       When did it start? What were you doing?',
        'CHARACTER:   What does it feel like? (See Pain Quality Descriptors above)',
        'RATING:      Use 0-10. Give your current, average, and worst this week.',
        'TIMING:      Is it constant or intermittent? Worse at certain times?',
        'AGGRAVATING: What makes it worse? (movement, stress, weather, position)',
        'RELIEVING:   What helps? (rest, meds, heat/ice, position changes)',
        'SEVERITY:    How does it affect daily life? (sleep, work, mood, self-care)',
      ];
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.dark);
      for (const line of framework) {
        y = checkPage(doc, y, 16);
        // Bold the label part
        const colonIdx = line.indexOf(':');
        const lbl = line.substring(0, colonIdx + 1);
        const rest = line.substring(colonIdx + 1);
        doc.setFont('helvetica', 'bold');
        doc.text(lbl, 48, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.medium);
        doc.text(rest.trim(), 48 + doc.getTextWidth(lbl) + 4, y);
        doc.setTextColor(...COLORS.dark);
        y += 15;
      }

      // ── Section 8: Tips & Callout Box ──
      y += 6;
      y = checkPage(doc, y, 100);
      y = drawSectionHeading(doc, y, '8. Tips for Consistent Self-Assessment');

      const tips = [
        '1. Rate in the moment -- not from memory. Accuracy drops significantly after just one hour.',
        '2. Use the functional descriptions, not just the number. "6" means something specific.',
        '3. Track good days AND bad days. Good-day data is essential for accurate averages.',
        '4. Note what makes pain better or worse each time you rate.',
        '5. Bring this chart to appointments so you and your doctor use the same reference.',
        '6. It is normal for pain to fluctuate. Rate your AVERAGE for the period if tracking daily.',
        '7. Your scale is personal. A "5" for you is valid even if someone else calls it a "3".',
      ];
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.medium);
      doc.setFont('helvetica', 'normal');
      for (const tip of tips) {
        y = checkPage(doc, y, 14);
        doc.text(tip, 48, y);
        y += 14;
      }

      // Callout box
      y += 6;
      y = checkPage(doc, y, 50);
      doc.setFillColor(240, 249, 255);
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(1);
      doc.roundedRect(36, y, pw - 72, 42, 4, 4, 'FD');
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primaryDark);
      doc.text('Why consistency matters:', 48, y + 14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.medium);
      doc.text('Providers use your pain ratings to track treatment response over time. A 2-point change on the 0-10', 48, y + 26);
      doc.text('scale is clinically significant. Inconsistent rating hides real changes.  |  paintracker.ca', 48, y + 36);
    },
  },

  {
    filename: 'symptom-tracker.pdf',
    title: 'Comprehensive Symptom Tracker',
    subtitle: 'Track the complete picture of chronic illness: pain, fatigue, sleep, cognitive function, mood, physical symptoms, and functional impact — everything your provider needs beyond a pain diary.',
    badge: 'Multi-Symptom',
    generate: (doc, y) => {
      const pw = doc.internal.pageSize.getWidth();

      // ── Patient info ──
      y = drawSectionHeading(doc, y, 'Patient Information');
      y = drawInputLine(doc, y, 'Name:', 250);
      y = drawInputLine(doc, y, 'Date Range:', 200);
      y = drawInputLine(doc, y, 'Condition(s):', 250);
      y = drawInputLine(doc, y, 'Current Medications:', 250);
      y += 4;

      // ── Rating Guide ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, '1. Rating Guide — Use These Scales Consistently');
      y = drawInstruction(doc, y, 'Rate each symptom 0-10 daily. Anchor to function, not just feeling. Consistency matters more than precision.');

      doc.autoTable({
        startY: y,
        margin: { left: 36, right: 36 },
        head: [['Scale', '0', '2', '4', '6', '8', '10']],
        body: [
          ['Pain',       'None',       'Mild, ignorable',   'Distracting',       'Dominates thinking', 'Barely functional',  'Worst possible'],
          ['Fatigue',    'Energised',  'Slight tiredness',  'Need rest breaks',  'Activity very hard', 'Mostly in bed',      'Cannot move'],
          ['Sleep Qual', 'Refreshed',  'Mostly rested',     'Woke several times','Poor, unrefreshing', 'Barely slept',       'No sleep'],
          ['Brain Fog',  'Clear',      'Slightly slow',     'Can\'t concentrate','Frequent mistakes',  'Can\'t read/follow', 'Disoriented'],
          ['Mood',       'Great',      'Mostly okay',       'Noticeably low',    'Struggling',         'Very distressed',    'In crisis'],
        ],
        styles: { fontSize: 7, cellPadding: 4, lineColor: COLORS.veryLight, lineWidth: 0.5, textColor: COLORS.dark, font: 'helvetica' },
        headStyles: { fillColor: COLORS.dark, textColor: COLORS.white, fontStyle: 'bold', fontSize: 7.5 },
        alternateRowStyles: { fillColor: COLORS.bg },
        columnStyles: { 0: { cellWidth: 58, fontStyle: 'bold' } },
        theme: 'grid',
      });
      y = doc.lastAutoTable.finalY + 14;

      // ── Section 2: Core Symptom Log ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, '2. Daily Symptom Log — Core Symptoms');
      y = drawInstruction(doc, y, 'Rate each symptom at the same time daily (evening recommended). Use the 0-10 scales above.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Pain (0-10)', 'Fatigue (0-10)', 'Sleep Hrs', 'Sleep Qual (0-10)', 'Brain Fog (0-10)', 'Mood (0-10)', 'Energy (0-10)'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      // ── Section 3: Additional Physical Symptoms ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, '3. Additional Physical Symptoms');
      y = drawInstruction(doc, y, 'Track symptoms specific to your condition. Rate 0-10 or use checkboxes. Add your own in the blank rows.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Stiffness', 'Numbness / Tingling', 'Dizziness', 'Nausea / GI', 'Headache', '________', '________'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      // ── Section 4: Functional Impact ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, '4. Functional Impact — Rate Difficulty (0-5)');
      y = drawInstruction(doc, y, '0 = No problem  |  1 = Mild difficulty  |  2 = Moderate  |  3 = Significant  |  4 = Very difficult  |  5 = Could not do');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Self-Care', 'Housework', 'Walking', 'Work / Tasks', 'Social', 'Exercise'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      // ── Section 5: Medication & Treatment Log ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, '5. Medication & Treatment Log');
      y = drawInstruction(doc, y, 'Track medications, therapies, and interventions. Note which symptoms they helped or worsened.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Medication / Treatment', 'Dose', 'Symptom Targeted', 'Relief (0-10)', 'Side Effects'],
        Array.from({ length: 6 }, () => Array(6).fill('')));

      // ── Section 6: Trigger Tracking ──
      y = checkPage(doc, y, 60);
      y = drawSectionHeading(doc, y, '6. Trigger & Correlation Tracker');
      y = drawInstruction(doc, y, 'Check potential triggers present each day. Review weekly to spot patterns.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Poor Sleep', 'High Stress', 'Weather Change', 'Overexertion', 'Hormonal', 'Food Trigger', 'Other'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      // ── Section 7: Symptom Cluster Patterns ──
      y = checkPage(doc, y, 100);
      y = drawSectionHeading(doc, y, '7. Symptom Cluster Reference');
      y = drawInstruction(doc, y, 'Chronic illness symptoms cluster together. Use this guide to identify YOUR patterns.');

      doc.autoTable({
        startY: y,
        margin: { left: 36, right: 36 },
        head: [['Cluster', 'Core Symptoms', 'Common In', 'What to Watch For']],
        body: [
          ['Pain Cluster',    'Pain, stiffness, tension, swelling',       'Arthritis, fibro, CRPS',     'When pain rises, do stiffness and tension follow?'],
          ['Fatigue Cluster',  'Fatigue, crash, sleepiness, exercise intol.','ME/CFS, fibro, lupus',     'Post-exertional malaise the day after activity?'],
          ['Cognitive Cluster','Brain fog, concentration, memory, word-find','Fibro, ME/CFS, MS',        'Does brain fog correlate with poor sleep nights?'],
          ['Mood Cluster',     'Anxiety, depression, irritability',          'Any chronic condition',    'Bidirectional with pain -- each amplifies the other'],
          ['Autonomic Cluster','Dizziness, nausea, temperature dysreg.',     'POTS, EDS, dysautonomia',  'Postural triggers? Time-of-day patterns?'],
        ],
        styles: { fontSize: 7, cellPadding: 4, lineColor: COLORS.veryLight, lineWidth: 0.5, textColor: COLORS.dark, font: 'helvetica' },
        headStyles: { fillColor: COLORS.dark, textColor: COLORS.white, fontStyle: 'bold', fontSize: 7.5 },
        alternateRowStyles: { fillColor: COLORS.bg },
        columnStyles: { 0: { cellWidth: 70, fontStyle: 'bold' } },
        theme: 'grid',
      });
      y = doc.lastAutoTable.finalY + 14;

      // ── Section 8: Weekly Summary ──
      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, '8. Weekly Summary');
      y = drawInstruction(doc, y, 'Complete at the end of each week. This is what you bring to your doctor.');
      y = drawInputLine(doc, y, 'Week of:', 200);
      y = drawInputLine(doc, y, 'Average pain this week (0-10):', 120);
      y = drawInputLine(doc, y, 'Average fatigue this week (0-10):', 120);
      y = drawInputLine(doc, y, 'Average sleep quality (0-10):', 120);
      y = drawInputLine(doc, y, 'Worst symptom this week:', 200);
      y = drawInputLine(doc, y, 'Best day — what was different?', 200);
      y = drawInputLine(doc, y, 'Worst day — what triggered it?', 200);
      y = drawInputLine(doc, y, 'Symptom clusters noticed:', 200);
      y = drawInputLine(doc, y, 'Medication changes or effects:', 200);
      y += 4;

      // ── Notes ──
      y = checkPage(doc, y, 100);
      y = notesBox(doc, y, 'Questions for Doctor / Observations / Correlations Noticed', 6);

      // ── Tips Box ──
      y = checkPage(doc, y, 60);
      doc.setFillColor(240, 249, 255);
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(1);
      doc.roundedRect(36, y, pw - 72, 56, 4, 4, 'FD');
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primaryDark);
      doc.text('Tips for Better Symptom Tracking', 48, y + 14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.medium);
      doc.setFontSize(7.5);
      doc.text('Track at the same time daily (evening is best). On bad days, rate just pain and fatigue — partial data beats no data.', 48, y + 26);
      doc.text('Focus on 6-10 symptoms max. Review weekly for clusters. Create a one-page summary for appointments.', 48, y + 38);
      doc.text('Good days are as important as bad days — they show your baseline and what helps.  |  Try Pain Tracker Pro: paintracker.ca', 48, y + 50);
    },
  },

  {
    filename: 'migraine-pain-diary.pdf',
    title: 'Migraine Pain Diary',
    subtitle: 'Comprehensive migraine tracking: all 4 phases, triggers, aura, medications, and monthly summary. Structured for neurologist review.',
    badge: 'Migraine-Specific',
    generate: (doc, y) => {
      const pw = doc.internal.pageSize.getWidth();

      // ────────────────────────────── PAGE 1: Episode Log ──────────────────────────────
      y = drawDateNameBlock(doc, y);

      // Pain Scale Reference
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Migraine Episode Log');
      y = drawInstruction(doc, y, 'Record each migraine episode. Document onset, peak, resolution, and total duration. Mark location: L = Left, R = Right, B = Bilateral.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Start', 'Peak', 'End', 'Pain 0-10\n(onset)', 'Pain 0-10\n(peak)', 'Side\n(L/R/B)', 'Quality\n(throb/press/stab)'],
        Array.from({ length: 8 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 90);
      y = drawSectionHeading(doc, y, 'Headache Location Map');
      y = drawInstruction(doc, y, 'For each episode, mark the primary pain location(s): Frontal, Temple (L/R), Behind eye (L/R), Top of head, Occipital (back), Neck.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Frontal', 'L Temple', 'R Temple', 'L Eye', 'R Eye', 'Top', 'Occipital', 'Neck'],
        Array.from({ length: 8 }, () => Array(9).fill('')));

      // ────────────────────────────── PAGE 2: Aura & Associated Symptoms ──────────────
      doc.addPage();
      y = 40;

      y = drawSectionHeading(doc, y, 'Prodrome Symptoms (Before the Headache)');
      y = drawInstruction(doc, y, 'Check any symptoms noticed 1–48 hours before the headache started. These early warning signs help predict attacks.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Mood\nChange', 'Food\nCravings', 'Yawning', 'Neck\nStiffness', 'Fatigue', 'Irritability', 'Concentration\nDifficulty'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 130);
      y = drawSectionHeading(doc, y, 'Aura Tracking');
      y = drawInstruction(doc, y, 'If aura occurs, log the type, onset time, duration, and description. Most auras last 5–60 minutes and precede the headache.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Type\n(Visual/Sensory\n/Speech)', 'Start Time', 'Duration\n(min)', 'Description\n(zigzags, spots, tingling, etc.)'],
        Array.from({ length: 6 }, () => Array(5).fill('')));

      y = checkPage(doc, y, 130);
      y = drawSectionHeading(doc, y, 'Associated Symptoms During Attack');
      y = drawInstruction(doc, y, 'Rate severity: 0 = None, 1 = Mild, 2 = Moderate, 3 = Severe. These help classify migraine type.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Light\nSens.', 'Sound\nSens.', 'Smell\nSens.', 'Nausea', 'Vomiting', 'Dizziness', 'Vision\nChanges', 'Neck\nPain'],
        Array.from({ length: 7 }, () => Array(9).fill('')));

      // ────────────────────────────── PAGE 3: Trigger Diary ──────────────────────────
      doc.addPage();
      y = 40;

      y = drawSectionHeading(doc, y, 'Daily Trigger Diary — Dietary & Hydration');
      y = drawInstruction(doc, y, 'Track daily even on migraine-free days. Check if present. Most triggers have a 12–48 hour delay. Compare trigger days vs. non-trigger days.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Aged\nCheese', 'Alcohol\n(type)', 'Caffeine\n(cups)', 'Processed\nMeats', 'Chocolate', 'Artificial\nSweetener', 'Skipped\nMeal', 'Water\n(glasses)'],
        Array.from({ length: 7 }, () => Array(9).fill('')));

      y = checkPage(doc, y, 130);
      y = drawSectionHeading(doc, y, 'Daily Trigger Diary — Environmental & Lifestyle');
      y = drawInstruction(doc, y, 'Check any factors present each day. Add your own triggers in the blank columns. Look for combinations — most attacks need 2+ triggers.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Bright\nLights', 'Strong\nSmells', 'Weather\nChange', 'Stress\n(0-10)', 'Screen\nTime (hrs)', 'Exercise', '_______', '_______'],
        Array.from({ length: 7 }, () => Array(9).fill('')));

      y = checkPage(doc, y, 130);
      y = drawSectionHeading(doc, y, 'Sleep & Hormonal Tracking');
      y = drawInstruction(doc, y, 'Sleep disruption is the #1 modifiable migraine trigger. Track consistently. Hormonal cycle day is essential for menstrual migraine patterns.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Bedtime', 'Wake\nTime', 'Hours\nSlept', 'Sleep\nQuality\n(1-5)', 'Cycle\nDay', 'Hormone\nMeds?', 'Stress\nLevel\n(0-10)'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      // ────────────────────────────── PAGE 4: Medication & Treatment ─────────────────
      doc.addPage();
      y = 40;

      y = drawSectionHeading(doc, y, 'Acute Medication Log');
      y = drawInstruction(doc, y, 'Record every medication taken for an active migraine. Track time-to-relief precisely — this guides treatment optimization. Note: >10 triptan days/month or >15 NSAID days/month risks medication overuse headache (MOH).');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Medication\nName', 'Dose', 'Time\nTaken', 'Minutes\nto Relief', 'Relief %\n(0-100)', 'Side\nEffects', 'Notes'],
        Array.from({ length: 8 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 130);
      y = drawSectionHeading(doc, y, 'Preventive Medication Tracking');
      y = drawInstruction(doc, y, 'Track daily adherence to preventive medications (beta-blockers, anticonvulsants, antidepressants, CGRP inhibitors, etc.).');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Med 1: ________', 'Med 2: ________', 'Med 3: ________', 'Taken\nOn Time?', 'Side Effects\nToday'],
        Array.from({ length: 7 }, () => Array(6).fill('')));

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Non-Drug Treatments & Self-Care');
      y = drawInstruction(doc, y, 'Track non-medication interventions. Rate effectiveness 0–10. This helps identify what works best for you.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Dark Room\n/ Rest', 'Ice / Cold\nPack', 'Heat', 'Caffeine', 'Relaxation\n/ Breathing', 'Other:\n________', 'Effective?\n(0-10)'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      // ────────────────────────────── PAGE 5: Monthly Summary ─────────────────────────
      doc.addPage();
      y = 40;

      y = drawSectionHeading(doc, y, 'Monthly Summary — Bring This to Your Appointment');
      y = drawInstruction(doc, y, 'Complete at month-end. This single page gives your neurologist the complete clinical picture. Fill in totals and observations.');

      // Key metrics
      y += 4;
      y = drawInputLine(doc, y, 'Month / Year:', 200);
      y = drawInputLine(doc, y, 'Total Migraine Days This Month:', 120);
      y = drawInputLine(doc, y, 'Total Headache-Free Days:', 120);
      y = drawInputLine(doc, y, 'Average Pain Intensity (0–10):', 120);
      y = drawInputLine(doc, y, 'Worst Single Attack Intensity:', 120);
      y = drawInputLine(doc, y, 'Longest Attack Duration (hours):', 120);
      y = drawInputLine(doc, y, 'Acute Medication Days This Month:', 120);
      y += 8;

      y = checkPage(doc, y, 90);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.dark);
      doc.text('Top Triggers Identified This Month:', 44, y);
      y += 16;
      for (let i = 1; i <= 5; i++) {
        y = drawInputLine(doc, y, `${i}.`, pw - 120);
      }
      y += 8;

      y = checkPage(doc, y, 80);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.dark);
      doc.text('Most Effective Treatments:', 44, y);
      y += 16;
      for (let i = 1; i <= 3; i++) {
        y = drawInputLine(doc, y, `${i}.`, pw - 120);
      }
      y += 8;

      y = checkPage(doc, y, 80);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.dark);
      doc.text('Functional Impact:', 44, y);
      y += 16;
      y = drawInputLine(doc, y, 'Work/School Days Missed:', 180);
      y = drawInputLine(doc, y, 'Social Events Cancelled:', 180);
      y = drawInputLine(doc, y, 'Days with Reduced Function:', 180);
      y += 4;

      y = checkPage(doc, y, 60);
      y = notesBox(doc, y, 'Questions for My Neurologist', 4);

      y = checkPage(doc, y, 60);
      y = notesBox(doc, y, 'Doctor\'s Notes / Plan Changes', 4);

      // ────────────────────────────── PAGE 6: Quick Reference ─────────────────────────
      doc.addPage();
      y = 40;

      y = drawSectionHeading(doc, y, 'Quick Reference: Migraine Phases');
      const phaseData = [
        ['Phase', 'Timing', 'Common Symptoms', 'Track These'],
        ['Prodrome', '1–2 days before', 'Mood changes, cravings, yawning, neck stiffness, fatigue', 'Earliest warning signs — can predict attack'],
        ['Aura', '5–60 min before/during', 'Visual (zigzags, spots), tingling, numbness, speech difficulty', 'Type, duration, progression pattern'],
        ['Headache', '4–72 hours', 'Throbbing pain, photo/phonophobia, nausea, vomiting', 'Intensity, location, quality, timeline'],
        ['Postdrome', '24–48 hours after', 'Brain fog, fatigue, weakness, mood changes, residual sensitivity', 'Duration, severity — counts as disability time'],
      ];
      doc.autoTable({
        startY: y,
        margin: { left: 36, right: 36 },
        head: [phaseData[0]],
        body: phaseData.slice(1),
        styles: { fontSize: 7.5, cellPadding: 5, lineColor: COLORS.veryLight, lineWidth: 0.5, textColor: COLORS.dark, font: 'helvetica' },
        headStyles: { fillColor: COLORS.dark, textColor: COLORS.white, fontStyle: 'bold', fontSize: 8 },
        alternateRowStyles: { fillColor: COLORS.bg },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 }, 1: { cellWidth: 80 } },
        theme: 'grid',
      });
      y = doc.lastAutoTable.finalY + 16;

      y = checkPage(doc, y, 140);
      y = drawSectionHeading(doc, y, 'Common Trigger Categories');
      const triggerData = [
        ['Category', 'Top Triggers'],
        ['Dietary', 'Aged cheese, red wine, processed meats, chocolate, artificial sweeteners, MSG, caffeine withdrawal, citrus'],
        ['Environmental', 'Bright/flickering lights, strong smells, barometric pressure changes, high altitude, loud noise, screen glare'],
        ['Lifestyle', 'Sleep changes, skipped meals, dehydration, intense exercise, irregular schedule, travel, poor posture, teeth clenching'],
        ['Hormonal', 'Menstruation, perimenopause, oral contraceptives, hormone therapy, ovulation'],
        ['Emotional', 'Acute stress, stress letdown (weekend migraine), anxiety, emotional shock, post-event relaxation'],
      ];
      doc.autoTable({
        startY: y,
        margin: { left: 36, right: 36 },
        head: [triggerData[0]],
        body: triggerData.slice(1),
        styles: { fontSize: 7.5, cellPadding: 5, lineColor: COLORS.veryLight, lineWidth: 0.5, textColor: COLORS.dark, font: 'helvetica' },
        headStyles: { fillColor: COLORS.dark, textColor: COLORS.white, fontStyle: 'bold', fontSize: 8 },
        alternateRowStyles: { fillColor: COLORS.bg },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 75 } },
        theme: 'grid',
      });
      y = doc.lastAutoTable.finalY + 16;

      y = checkPage(doc, y, 100);
      y = drawSectionHeading(doc, y, 'When to Seek Emergency Care');
      const emergencyItems = [
        '"Worst headache of my life" — sudden, severe onset (thunderclap headache)',
        'Headache with fever, stiff neck, rash, confusion, or seizures',
        'Headache after head injury, especially with worsening symptoms',
        'New neurological symptoms: weakness, vision loss, difficulty speaking, or walking',
        'Migraine lasting >72 hours (status migrainosus) — call your neurologist',
        'Aura lasting >60 minutes or aura without headache for the first time',
      ];
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.dark);
      for (const item of emergencyItems) {
        y = checkPage(doc, y, 16);
        // Warning bullet
        doc.setFillColor(245, 158, 11);
        doc.circle(50, y - 2, 3, 'F');
        doc.setTextColor(...COLORS.dark);
        const lines = doc.splitTextToSize(item, pw - 110);
        doc.text(lines, 60, y);
        y += lines.length * 12 + 4;
      }
      y += 8;

      // Tip box
      y = checkPage(doc, y, 70);
      doc.setFillColor(...COLORS.bg);
      doc.roundedRect(36, y, pw - 72, 64, 4, 4, 'F');
      doc.setDrawColor(...COLORS.primary);
      doc.setLineWidth(1);
      doc.line(36, y, 36, y + 64);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primaryDark);
      doc.setFontSize(9);
      doc.text('Tips for Better Migraine Tracking', 48, y + 14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.medium);
      doc.setFontSize(7.5);
      doc.text('Track every day, not just migraine days — comparison data reveals triggers. Most triggers need 2+ factors to combine.', 48, y + 28);
      doc.text('Prodrome symptoms are your early warning system. Note them as soon as they appear — early treatment works best.', 48, y + 40);
      doc.text('Bring the Monthly Summary page (page 5) to every neurology appointment. It saves time and improves care.', 48, y + 52);
    },
  },

  // ── Tier 2: Medical & Appointment ─────────────────────────────────────────

  {
    filename: 'how-to-track-pain-for-doctors-guide.pdf',
    title: 'How to Track Pain for Doctors',
    subtitle: 'What doctors actually want to see in your pain records and how to present it effectively.',
    badge: 'Guide',
    generate: (doc, y) => {
      y = drawSectionHeading(doc, y, 'What Doctors Need to See');
      const sections = [
        ['1. Pain Pattern Over Time', 'Track at least 7 days before your appointment. Show trends, not just today\'s pain. Doctors want to see the full picture—good days and bad.'],
        ['2. Specific Descriptions', 'Where exactly? What type? (sharp, burning, aching, throbbing). When does it start and stop? What makes it better or worse?'],
        ['3. Functional Impact', '"I couldn\'t cook dinner 4 days this week" is more useful than "my pain was 8/10." Describe what pain prevents you from doing.'],
        ['4. Medication Response', 'What you took, when, how much it helped (percentage or time), and any side effects. This guides treatment decisions.'],
        ['5. Sleep & Mood Connection', 'Pain affects sleep and mood. Tracking these helps doctors understand the full burden and consider comprehensive treatment.'],
      ];
      for (const [heading, text] of sections) {
        y = checkPage(doc, y, 50);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.dark);
        doc.text(heading, 44, y);
        y += 16;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.medium);
        const pw = doc.internal.pageSize.getWidth();
        const lines = doc.splitTextToSize(text, pw - 96);
        doc.text(lines, 52, y);
        y += lines.length * 13 + 12;
      }

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Appointment Preparation Worksheet');
      y = drawInputLine(doc, y, 'Appointment date:', 140);
      y = drawInputLine(doc, y, 'Doctor/Specialist:', 200);
      y = drawInputLine(doc, y, 'Main concerns to discuss:', 200);
      y = drawInputLine(doc, y, 'Changes since last visit:', 200);
      y = drawInputLine(doc, y, 'Questions to ask:', 200);
      y = drawInputLine(doc, y, 'Current medications:', 200);

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Appointment Notes', 6);
    },
  },

  {
    filename: 'pain-journal-checklist.pdf',
    title: 'What to Include in a Pain Journal',
    subtitle: 'Complete checklist of information that makes pain tracking clinically useful.',
    badge: 'Checklist',
    generate: (doc, y) => {
      const categories = [
        ['Essential (Track Daily)', [
          'Pain intensity (0–10 scale)',
          'Pain location (be specific)',
          'Pain type (sharp, dull, burning, throbbing, etc.)',
          'Time of day pain occurs',
          'Duration of each episode',
        ]],
        ['Important (Track Daily)', [
          'Medications taken (name, dose, time)',
          'Medication effectiveness (% relief, duration)',
          'Sleep quality and hours',
          'Activities attempted and completed',
          'What made pain better or worse',
        ]],
        ['Valuable (Track When Relevant)', [
          'Mood and emotional state',
          'Stress level',
          'Weather/barometric pressure',
          'Menstrual cycle day (if applicable)',
          'Food and hydration',
          'Exercise or physical therapy',
        ]],
        ['For Appointments (Weekly Summary)', [
          'Average pain level this week',
          'Worst and best days',
          'Functional limitations',
          'Questions for your doctor',
          'Treatment changes to discuss',
        ]],
      ];

      for (const [heading, items] of categories) {
        y = checkPage(doc, y, 30 + items.length * 16);
        y = drawSectionHeading(doc, y, heading);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.dark);
        for (const item of items) {
          y = checkPage(doc, y, 16);
          // Checkbox
          doc.setDrawColor(...COLORS.light);
          doc.setLineWidth(0.5);
          doc.rect(52, y - 8, 10, 10);
          doc.text(item, 70, y);
          y += 16;
        }
        y += 6;
      }

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Your Tracking Priorities', 4);
    },
  },

  // ── Tier 3: Disability / Legal ────────────────────────────────────────────

  {
    filename: 'disability-documentation-guide.pdf',
    title: 'Documenting Pain for Disability Claims',
    subtitle: 'A guide to creating documentation that supports WorkSafeBC, insurance, and government benefit claims.',
    badge: 'Essential Guide',
    generate: (doc, y) => {
      const sections = [
        ['Start Before You File', 'Begin tracking immediately. Records that predate your claim are more credible. Even if you\'re months from filing, daily entries starting now build a stronger case.'],
        ['Document Functional Impact', 'Adjusters care most about what pain prevents you from doing. "Couldn\'t lift laundry basket" is more powerful than "pain was 8/10." Be specific about limitations.'],
        ['Be Consistent, Not Perfect', 'Daily brief entries beat weekly detailed ones. If you miss a day, don\'t backfill—it looks fabricated. Gaps are normal; consistency demonstrates persistence.'],
        ['Include Good Days', 'Documenting better days shows honesty. Constant 10/10 ratings destroy credibility. A pattern of mostly difficult days with occasional better ones is believable.'],
        ['Connect to Work/Function', 'Every entry should relate to ability or inability to perform tasks. For WorkSafeBC: connect symptoms to work duties. For disability: describe daily living impact.'],
        ['Align with Medical Records', 'Your diary should complement, not contradict, your medical records. Note appointment dates, treatments, and outcomes. Bring diary summaries to appointments.'],
      ];
      for (const [heading, text] of sections) {
        y = checkPage(doc, y, 50);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.dark);
        doc.text(heading, 44, y);
        y += 16;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.medium);
        const pw = doc.internal.pageSize.getWidth();
        const lines = doc.splitTextToSize(text, pw - 96);
        doc.text(lines, 52, y);
        y += lines.length * 13 + 14;
      }

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Disability Documentation Checklist');
      const items = [
        'Consistent daily pain diary (30+ days minimum)',
        'Functional impact documented for each day',
        'Medication log with response tracking',
        'Medical appointment dates and outcomes noted',
        'Good days AND bad days recorded',
        'Specific activities affected (not just pain ratings)',
        'Summary prepared for adjudicator review',
      ];
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.dark);
      for (const item of items) {
        y = checkPage(doc, y, 16);
        doc.setDrawColor(...COLORS.light);
        doc.rect(52, y - 8, 10, 10);
        doc.text(item, 70, y);
        y += 16;
      }
    },
  },

  {
    filename: 'worksafebc-pain-journal.pdf',
    title: 'WorkSafeBC Pain Journal Template',
    subtitle: 'Comprehensive workplace injury documentation for BC workers\' compensation claims. Tracks work-related pain, functional capacity, treatment compliance, and return-to-work readiness — aligned with Form 8 standards.',
    badge: 'BC Workers',
    generate: (doc, y) => {
      const pw = doc.internal.pageSize.getWidth();

      // ────────────────────────────── PAGE 1: Claim Info & Pain Scale ──────────────
      y = drawSectionHeading(doc, y, 'Claim Information');
      y = drawInputLine(doc, y, 'Worker Name:', 250);
      y = drawInputLine(doc, y, 'WCB Claim Number:', 180);
      y = drawInputLine(doc, y, 'Injury Date:', 140);
      y = drawInputLine(doc, y, 'Employer:', 250);
      y = drawInputLine(doc, y, 'Job Title:', 220);
      y = drawInputLine(doc, y, 'Primary Work Duties:', 250);
      y += 4;
      y = drawInputLine(doc, y, 'Injury Description:', 250);
      y = drawInputLine(doc, y, '', 250);
      y += 4;
      y = drawInputLine(doc, y, 'Affected Body Areas:', 250);
      y = drawInputLine(doc, y, 'Treating Physician:', 200);
      y = drawInputLine(doc, y, 'Physiotherapist:', 200);
      y = drawInputLine(doc, y, 'Case Manager Name:', 200);
      y += 6;

      // Pain Scale Reference
      y = drawPainScale(doc, y);

      // Important note
      y = checkPage(doc, y, 60);
      doc.setFillColor(...COLORS.bg);
      doc.roundedRect(36, y, pw - 72, 52, 4, 4, 'F');
      doc.setDrawColor(...COLORS.warning);
      doc.setLineWidth(1.5);
      doc.line(36, y, 36, y + 52);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.dark);
      doc.setFontSize(9);
      doc.text('Important: Connect Every Entry to Your Work Injury', 48, y + 14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.medium);
      doc.setFontSize(7.5);
      doc.text('Every entry should link symptoms to your workplace injury and job duties. Be specific about what work tasks are affected.', 48, y + 28);
      doc.text('Example: "L4-L5 pain increased to 7/10 after 90 min at workstation — could not complete afternoon data entry tasks."', 48, y + 40);

      // ────────────────────────────── PAGE 2: Daily Work-Related Pain Log ──────────
      doc.addPage();
      y = 40;

      y = drawSectionHeading(doc, y, 'Daily Work-Related Pain Log — Week of: _______________');
      y = drawInstruction(doc, y, 'Complete one row per day. Connect all symptoms to your workplace injury and job duties. Note work status: F = Full duties, M = Modified, O = Off work.');
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      y = dailyTrackingTable(doc, y,
        ['Day', 'Date', 'AM\nPain', 'PM\nPain', 'Eve\nPain', 'Work\nStatus\n(F/M/O)', 'Specific Duties\nAffected', 'Aggravating\nActivities'],
        days.map(d => [d, '', '', '', '', '', '', '']));

      y = checkPage(doc, y, 130);
      y = drawSectionHeading(doc, y, 'Daily Functional Limitations (Work-Related)');
      y = drawInstruction(doc, y, 'Be specific and measurable. E.g., "Sat for 20 min before L4 pain reached 6/10 — position requires 4 hrs." This supports modified duty requests.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Sitting\n(min before\npain)', 'Standing\n(min before\npain)', 'Lifting\nCapacity\n(lbs)', 'Walking\n(min before\npain)', 'Driving\n(min)', 'Job Tasks\nUnable to\nComplete'],
        days.map(d => [d, '', '', '', '', '', '']));

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Work Connection Notes (link symptoms to injury & job duties)', 5);

      // ────────────────────────────── PAGE 3: Functional Capacity Detail ──────────
      doc.addPage();
      y = 40;

      y = drawSectionHeading(doc, y, 'Detailed Functional Capacity Assessment');
      y = drawInstruction(doc, y, 'Rate each area: 0 = Unable, 5 = Significant difficulty, 10 = Normal/pre-injury. Track changes weekly — improvement or decline both matter.');
      y = dailyTrackingTable(doc, y,
        ['Function', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [
          ['Sitting tolerance', '', '', '', '', '', '', ''],
          ['Standing tolerance', '', '', '', '', '', '', ''],
          ['Walking distance', '', '', '', '', '', '', ''],
          ['Lifting capacity', '', '', '', '', '', '', ''],
          ['Bending/stooping', '', '', '', '', '', '', ''],
          ['Reaching/overhead', '', '', '', '', '', '', ''],
          ['Gripping/hand use', '', '', '', '', '', '', ''],
          ['Stair climbing', '', '', '', '', '', '', ''],
          ['Driving', '', '', '', '', '', '', ''],
          ['Concentration/focus', '', '', '', '', '', '', ''],
        ]);

      y = checkPage(doc, y, 130);
      y = drawSectionHeading(doc, y, 'Daily Living & Self-Care Impact');
      y = drawInstruction(doc, y, 'Check: ✓ = Independent, ~ = Needed help / modified, ✗ = Unable. These document total disability impact beyond work.');
      y = dailyTrackingTable(doc, y,
        ['Activity', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [
          ['Bathing / showering', '', '', '', '', '', '', ''],
          ['Dressing', '', '', '', '', '', '', ''],
          ['Preparing meals', '', '', '', '', '', '', ''],
          ['Housework / cleaning', '', '', '', '', '', '', ''],
          ['Grocery shopping', '', '', '', '', '', '', ''],
          ['Childcare duties', '', '', '', '', '', '', ''],
          ['Sleep quality (1-5)', '', '', '', '', '', '', ''],
        ]);

      y = checkPage(doc, y, 60);
      y = notesBox(doc, y, 'Mobility Aids / Assistive Devices Used', 3);

      // ────────────────────────────── PAGE 4: Treatment & Rehab Compliance ────────
      doc.addPage();
      y = 40;

      y = drawSectionHeading(doc, y, 'Medical Appointments & Treatment');
      y = drawInstruction(doc, y, 'WCB evaluates treatment compliance heavily. Record every appointment and outcome. Non-compliance can reduce or deny benefits.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Provider /\nClinic', 'Type\n(MD/Physio/\nSpecialist)', 'Treatment\nProvided', 'Pain Before\n(0-10)', 'Pain After\n(0-10)', 'Next Steps /\nPrescribed'],
        Array.from({ length: 8 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 130);
      y = drawSectionHeading(doc, y, 'Medication Log');
      y = drawInstruction(doc, y, 'Record all medications: prescribed, OTC, and topical. Track effectiveness and side effects for your doctor and WCB medical advisor.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Medication\nName', 'Dose', 'Time\nTaken', 'Relief %\n(0-100)', 'Duration\nof Relief', 'Side\nEffects'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Home Exercise / Rehabilitation Compliance');
      y = drawInstruction(doc, y, 'Track prescribed home exercises. Completion rate demonstrates active engagement in recovery.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Exercise 1:\n________', 'Exercise 2:\n________', 'Exercise 3:\n________', 'Duration\n(min)', 'Pain During\n(0-10)', 'Completed\nAll? (Y/N)'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      // ────────────────────────────── PAGE 5: Weekly Work Impact Summary ────────
      doc.addPage();
      y = 40;

      y = drawSectionHeading(doc, y, 'Weekly Work Impact Summary');
      y = drawInstruction(doc, y, 'Complete at end of each week. This page documents the gap between your capacity and your job requirements.');
      y += 4;
      y = drawInputLine(doc, y, 'Week of:', 180);
      y = drawInputLine(doc, y, 'Work Days Attended (full duties):', 100);
      y = drawInputLine(doc, y, 'Work Days Attended (modified duties):', 100);
      y = drawInputLine(doc, y, 'Work Days Missed (injury-related):', 100);
      y = drawInputLine(doc, y, 'Hours Worked This Week:', 100);
      y = drawInputLine(doc, y, 'Normal Hours for This Position:', 100);
      y += 8;

      y = checkPage(doc, y, 60);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.dark);
      doc.text('Modified Duties Required:', 44, y);
      y += 16;
      for (let i = 1; i <= 4; i++) {
        y = drawInputLine(doc, y, `${i}.`, pw - 120);
      }
      y += 6;

      y = checkPage(doc, y, 60);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.dark);
      doc.text('Accommodations Provided by Employer:', 44, y);
      y += 16;
      for (let i = 1; i <= 3; i++) {
        y = drawInputLine(doc, y, `${i}.`, pw - 120);
      }
      y += 6;

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Specific Work Tasks I Could Not Complete This Week', 4);

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Return-to-Work Progress / Barriers', 4);

      y = checkPage(doc, y, 60);
      y = notesBox(doc, y, 'Supervisor / Case Manager Notes', 3);

      // ────────────────────────────── PAGE 6: Monthly Summary for WCB ────────────
      doc.addPage();
      y = 40;

      y = drawSectionHeading(doc, y, 'Monthly Summary — For WCB Case Manager Review');
      y = drawInstruction(doc, y, 'Complete at month-end. This single page provides the case manager or medical advisor with a comprehensive monthly overview. Bring to all WCB appointments and Independent Medical Exams (IMEs).');

      y += 4;
      y = drawInputLine(doc, y, 'Month / Year:', 200);
      y = drawInputLine(doc, y, 'WCB Claim Number:', 180);
      y += 6;

      // Work Impact Summary
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primaryDark);
      doc.text('Work Impact This Month', 44, y);
      y += 16;
      y = drawInputLine(doc, y, 'Total Work Days Missed:', 120);
      y = drawInputLine(doc, y, 'Days on Modified Duties:', 120);
      y = drawInputLine(doc, y, 'Days at Full Duties:', 120);
      y += 6;

      y = checkPage(doc, y, 80);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primaryDark);
      doc.text('Pain Summary', 44, y);
      y += 16;
      y = drawInputLine(doc, y, 'Average Pain Level (0-10):', 100);
      y = drawInputLine(doc, y, 'Worst Pain Level This Month:', 100);
      y = drawInputLine(doc, y, 'Best Pain Level This Month:', 100);
      y = drawInputLine(doc, y, 'Pain Trend (improving / stable / worsening):', 140);
      y += 6;

      y = checkPage(doc, y, 80);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primaryDark);
      doc.text('Treatment Compliance', 44, y);
      y += 16;
      y = drawInputLine(doc, y, 'MD Appointments Attended / Scheduled:', 160);
      y = drawInputLine(doc, y, 'Physio Sessions Attended / Scheduled:', 160);
      y = drawInputLine(doc, y, 'Home Exercise Compliance (%):', 120);
      y += 6;

      y = checkPage(doc, y, 70);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primaryDark);
      doc.text('Functional Capacity Changes', 44, y);
      y += 16;
      y = drawInputLine(doc, y, 'Improved:', pw - 120);
      y = drawInputLine(doc, y, 'Unchanged:', pw - 120);
      y = drawInputLine(doc, y, 'Worsened:', pw - 120);
      y += 6;

      y = checkPage(doc, y, 60);
      y = notesBox(doc, y, 'Questions for Case Manager / Next Steps', 3);

      // Disclaimer
      y = checkPage(doc, y, 50);
      doc.setFillColor(...COLORS.bg);
      doc.roundedRect(36, y, pw - 72, 36, 4, 4, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.light);
      doc.text('Disclaimer: Pain Tracker Pro is not affiliated with, endorsed by, or connected to WorkSafeBC. This template provides a documentation', 44, y + 12);
      doc.text('framework based on publicly available WCB evaluation criteria. It is not legal advice. Consult a workers\' compensation lawyer for claim-specific guidance.', 44, y + 24);
    },
  },

  {
    filename: 'disability-pain-journal-guide.pdf',
    title: 'Pain Journal for Disability Benefits',
    subtitle: 'Documentation strategies for disability benefit applications.',
    badge: 'Benefits Guide',
    generate: (doc, y) => {
      const sections = [
        ['Why Documentation Matters', 'Disability evaluators review hundreds of claims. Yours needs to stand out as credible and thorough. A systematic pain journal with daily entries demonstrates the persistent nature of your condition far better than medical records alone.'],
        ['What Evaluators Look For', '1) Consistency of reporting over weeks/months. 2) Specific functional limitations, not just pain numbers. 3) Evidence of treatment compliance. 4) Honest variability—good days and bad. 5) Impact on daily activities, self-care, and social function.'],
        ['Common Mistakes That Hurt Claims', '• Only tracking on bad days (looks like you\'re fine otherwise). • Constant 10/10 ratings (appears exaggerated). • Starting documentation only after filing. • Contradicting medical records. • Vague descriptions without specific examples.'],
        ['Building Your Evidence Timeline', 'Start now. Track daily for minimum 30 days before filing. Continue throughout the process. Bring summaries to every medical appointment. Keep originals safe—submit copies only.'],
      ];
      for (const [heading, text] of sections) {
        y = checkPage(doc, y, 60);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.dark);
        doc.text(heading, 44, y);
        y += 16;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.medium);
        const pw = doc.internal.pageSize.getWidth();
        const lines = doc.splitTextToSize(text, pw - 96);
        doc.text(lines, 52, y);
        y += lines.length * 13 + 14;
      }

      y = checkPage(doc, y, 160);
      y = drawSectionHeading(doc, y, 'Daily Disability Documentation Template');
      y = drawInputLine(doc, y, 'Date:', 140);
      y = drawInputLine(doc, y, 'Pain level (0-10):', 80);
      y = drawInputLine(doc, y, 'Activities I could NOT do today:', 200);
      y = drawInputLine(doc, y, 'Activities I completed with difficulty:', 200);
      y = drawInputLine(doc, y, 'Assistance needed from others:', 200);
      y = drawInputLine(doc, y, 'Self-care limitations:', 200);
      y = drawInputLine(doc, y, 'Medications & treatments today:', 200);
      y = notesBox(doc, y, 'How pain affected my day (in your own words)', 5);
    },
  },

  {
    filename: 'daily-functioning-log.pdf',
    title: 'Daily Functioning Log for Disability',
    subtitle: 'Track functional limitations that disability evaluators need to see.',
    badge: 'Disability',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);

      y = drawSectionHeading(doc, y, 'Daily Functioning Assessment');
      y = drawInstruction(doc, y, 'Rate each area: ✓ = No difficulty | ~ = Some difficulty | ✗ = Unable | N/A = Not attempted');
      y = dailyTrackingTable(doc, y,
        ['Activity', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [
          ['Bathing/Showering', '', '', '', '', '', '', ''],
          ['Dressing', '', '', '', '', '', '', ''],
          ['Preparing meals', '', '', '', '', '', '', ''],
          ['Eating', '', '', '', '', '', '', ''],
          ['Housework/cleaning', '', '', '', '', '', '', ''],
          ['Walking (15 min)', '', '', '', '', '', '', ''],
          ['Stairs', '', '', '', '', '', '', ''],
          ['Driving', '', '', '', '', '', '', ''],
          ['Shopping/errands', '', '', '', '', '', '', ''],
          ['Sitting (30 min)', '', '', '', '', '', '', ''],
          ['Standing (15 min)', '', '', '', '', '', '', ''],
          ['Lifting (10 lbs)', '', '', '', '', '', '', ''],
          ['Concentrating (1 hr)', '', '', '', '', '', '', ''],
          ['Social interaction', '', '', '', '', '', '', ''],
        ]);

      y = checkPage(doc, y, 100);
      y = drawSectionHeading(doc, y, 'Assistance Required');
      y = drawInputLine(doc, y, 'Help received from:', 200);
      y = drawInputLine(doc, y, 'Tasks they helped with:', 200);
      y = notesBox(doc, y, 'Additional Limitations & Notes', 4);
    },
  },

  // ── Tier 4: Condition-Specific ────────────────────────────────────────────

  {
    filename: 'fibromyalgia-pain-diary.pdf',
    title: 'Fibromyalgia Pain Diary',
    subtitle: 'Track widespread pain, fatigue, cognitive issues, and flare patterns specific to fibromyalgia.',
    badge: 'Fibromyalgia',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Fibromyalgia Symptom Log');
      y = drawInstruction(doc, y, 'Track the key fibro symptoms daily. Rate each 0–10.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Pain (0-10)', 'Fatigue (0-10)', 'Brain Fog', 'Sleep Quality', 'Stiffness', 'Headache', 'Mood'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Pain Location Map');
      y = drawInstruction(doc, y, 'Mark affected areas: N=Neck, S=Shoulders, UB=Upper Back, LB=Lower Back, H=Hips, K=Knees, A=Arms, L=Legs');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Neck', 'Shoulders', 'Upper Back', 'Lower Back', 'Hips', 'Arms', 'Legs'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 100);
      y = drawSectionHeading(doc, y, 'Flare Triggers');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Overexertion', 'Poor Sleep', 'Stress', 'Weather', 'Illness', 'Other'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Notes & Observations', 4);
    },
  },

  {
    filename: 'chronic-back-pain-diary.pdf',
    title: 'Chronic Back Pain Diary',
    subtitle: 'Track back pain location, activities, posture, and treatments for spine specialists.',
    badge: 'Back Pain',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Back Pain Log');
      y = drawInstruction(doc, y, 'Location: C=Cervical (neck), T=Thoracic (mid), L=Lumbar (low), S=Sacral. Note radiation to legs/arms.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Pain (0-10)', 'Location', 'Radiating?', 'Stiffness', 'Activity', 'Posture Issues', 'Treatment'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Activity & Position Impact');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Sitting', 'Standing', 'Walking', 'Bending', 'Lifting', 'Lying Down', 'Driving'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Exercise / Physio / Notes', 5);
    },
  },

  {
    filename: 'arthritis-pain-tracker.pdf',
    title: 'Arthritis Pain Tracker',
    subtitle: 'Track joint pain, stiffness, swelling, and mobility. For RA, OA, and psoriatic arthritis.',
    badge: 'Arthritis',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Joint Pain & Stiffness Log');
      y = drawInstruction(doc, y, 'Track morning stiffness duration (minutes) and affected joints. Note swelling (S) and warmth (W).');
      y = dailyTrackingTable(doc, y,
        ['Date', 'AM Stiffness (min)', 'Pain (0-10)', 'Joints Affected', 'Swelling?', 'Warmth?', 'Function'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Joint-by-Joint Tracking');
      y = drawInstruction(doc, y, 'Rate pain 0–10 for each affected joint. Leave blank if not affected.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Hands', 'Wrists', 'Elbows', 'Shoulders', 'Knees', 'Ankles', 'Feet'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 100);
      y = drawSectionHeading(doc, y, 'Functional Impact');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Grip Strength', 'Stairs', 'Buttons/Zippers', 'Jar Opening', 'Walking', 'Writing'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Medication Response & Doctor Notes', 4);
    },
  },

  {
    filename: 'nerve-pain-symptom-log.pdf',
    title: 'Nerve Pain Symptom Log',
    subtitle: 'Track burning, tingling, numbness, and shooting pain for neuropathy conditions.',
    badge: 'Nerve Pain',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Nerve Pain Symptom Log');
      y = drawInstruction(doc, y, 'Track specific nerve pain types: B=Burning, T=Tingling, N=Numbness, S=Shooting, E=Electric shock.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Pain (0-10)', 'Type (B/T/N/S/E)', 'Location', 'Duration', 'Trigger', 'Medication', 'Relief'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Sensation Changes');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Numbness Areas', 'Tingling Areas', 'Weakness', 'Balance', 'Temperature Sens.', 'Touch Sens.'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Observations & Questions for Neurologist', 5);
    },
  },

  {
    filename: 'endometriosis-pain-log.pdf',
    title: 'Endometriosis Pain Log',
    subtitle: 'Track endo symptoms throughout your cycle: pelvic pain, GI issues, and more.',
    badge: 'Endo Tracker',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Cycle & Pain Tracking');
      y = drawInstruction(doc, y, 'Cycle Day 1 = first day of period. Track pain and symptoms throughout your cycle.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Cycle Day', 'Pain (0-10)', 'Pelvic Pain', 'Back Pain', 'Bloating', 'GI Issues', 'Fatigue'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Endo-Specific Symptoms');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Pain w/ Periods', 'Pain w/ Sex', 'Pain w/ Bowel', 'Bladder Pain', 'Heavy Bleeding', 'Spotting', 'Mood'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Treatment Response & Doctor Notes', 5);
    },
  },

  {
    filename: 'crps-pain-diary.pdf',
    title: 'CRPS Pain Diary Template',
    subtitle: 'Track Complex Regional Pain Syndrome symptoms: burning, swelling, color changes, temperature.',
    badge: 'CRPS',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'CRPS Symptom Log');
      y = drawInstruction(doc, y, 'CRPS symptoms are complex. Track pain, sensory, autonomic, and motor changes daily.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Pain (0-10)', 'Burning', 'Allodynia', 'Swelling', 'Color Changes', 'Temp Changes', 'Sweating'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Motor & Functional Changes');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Weakness', 'Tremor', 'Stiffness', 'Range of Motion', 'Dystonia', 'Grip', 'Walking'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 100);
      y = drawSectionHeading(doc, y, 'Affected Limb Comparison');
      y = drawInstruction(doc, y, 'Compare affected vs unaffected side for visible changes.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Side', 'Color', 'Temperature', 'Swelling', 'Hair/Nail Changes', 'Notes'],
        Array.from({ length: 4 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Treatment & Specialist Notes', 4);
    },
  },

  {
    filename: 'neuropathy-symptom-tracker.pdf',
    title: 'Neuropathy Symptom Tracker',
    subtitle: 'Monitor peripheral neuropathy: numbness, tingling, and progression over time.',
    badge: 'Neuropathy',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Daily Neuropathy Symptoms');
      y = drawInstruction(doc, y, 'Rate symptoms 0–10 or mark present (✓). Track progression over weeks.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Numbness (0-10)', 'Tingling (0-10)', 'Burning (0-10)', 'Shooting Pain', 'Weakness', 'Balance', 'Sleep'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Affected Areas Progression');
      y = drawInstruction(doc, y, 'Track which areas are affected to monitor progression. Use: M=Mild, Mod=Moderate, S=Severe.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Feet', 'Lower Legs', 'Hands', 'Forearms', 'Other', 'Symmetrical?'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Triggers, Blood Sugar, Medication Notes', 5);
    },
  },

  {
    filename: 'printable-pain-log-sheet.pdf',
    title: 'Printable Pain Log Sheet',
    subtitle: 'Simple, clean pain tracking sheet for quick daily documentation.',
    badge: 'Simple',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Pain Log');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Time', 'Pain (0-10)', 'Location', 'What helped?', 'Notes'],
        Array.from({ length: 14 }, () => Array(6).fill('')));

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Additional Notes', 6);
    },
  },

  {
    filename: 'chronic-pain-diary-template.pdf',
    title: 'Chronic Pain Diary Template',
    subtitle: 'Designed for long-term chronic pain tracking with baseline and flare documentation.',
    badge: 'Chronic Pain',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Baseline & Flare Tracking');
      y = drawInstruction(doc, y, 'Track your baseline (typical) pain and mark flare episodes separately. This helps distinguish patterns.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Baseline (0-10)', 'Flare? (Y/N)', 'Peak Pain', 'Flare Duration', 'Trigger', 'Treatment Used'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Daily Impact & Coping');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Sleep Hrs', 'Fatigue', 'Mood', 'Activities Done', 'Activities Missed', 'Coping Methods'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 100);
      y = drawSectionHeading(doc, y, 'Medication & Treatment Log');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Medication', 'Dose', 'Time', 'Relief (0-10)', 'Side Effects', 'Notes'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Weekly Summary & Doctor Questions', 4);
    },
  },

  {
    filename: '7-day-pain-diary.pdf',
    title: '7-Day Pain Diary Template',
    subtitle: 'One-week format perfect for preparing for doctor appointments.',
    badge: '7-Day',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);
      y = drawInputLine(doc, y, 'Appointment Date:', 140);
      y = drawInputLine(doc, y, 'Doctor/Specialist:', 200);
      y = drawPainScale(doc, y);

      const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
      y = drawSectionHeading(doc, y, '7-Day Pain & Function Log');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Date', 'Pain (0-10)', 'Location', 'Sleep', 'Mood', 'Activity', 'Medications'],
        days.map(d => [d, '', '', '', '', '', '', '']));

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Appointment Preparation');
      y = drawInputLine(doc, y, 'Average pain this week:', 100);
      y = drawInputLine(doc, y, 'Worst day and why:', 200);
      y = drawInputLine(doc, y, 'Best day and why:', 200);
      y = drawInputLine(doc, y, 'What I want to discuss:', 200);
      y = drawInputLine(doc, y, 'Medication concerns:', 200);
      y = drawInputLine(doc, y, 'New symptoms:', 200);

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Questions for My Doctor', 5);
    },
  },

  {
    filename: 'clinical-pain-diary-guide.pdf',
    title: 'How Doctors Use Pain Diaries',
    subtitle: 'Understanding the clinical perspective on pain tracking and what information matters most.',
    badge: 'Clinical Guide',
    generate: (doc, y) => {
      const sections = [
        ['Why Doctors Value Pain Diaries', 'Appointments capture a snapshot; diaries capture the movie. Clinicians use pain diaries to identify patterns, assess treatment response, plan interventions, and communicate with specialists. A good diary saves appointment time and improves care.'],
        ['What Clinicians Extract From Diaries', '1) Pain trajectory: Is it stable, worsening, or improving? 2) Treatment response: How well are medications working? 3) Functional capacity: What can/can\'t the patient do? 4) Triggers: What makes pain better or worse? 5) Sleep-pain-mood cycle: How are these interconnected?'],
        ['Standardized Measures Doctors Use', 'Doctors often use validated tools alongside diaries: Numeric Rating Scale (NRS 0-10), Brief Pain Inventory (BPI), Oswestry Disability Index (for back pain), PROMIS measures. Your diary complements these by adding daily context.'],
        ['What Makes a Diary Clinically Useful', '• Consistency: daily entries over at least one week. • Specificity: exact locations, descriptions, timing. • Functional focus: how pain affects real activities. • Medication logging: name, dose, time, and response. • Honest variability: not all days are the same.'],
        ['Common Diary Mistakes (From Doctors\' Perspective)', '• Vague descriptions ("pain everywhere"). • Only tracking bad days. • Ignoring triggers and relief factors. • Not recording medication timing. • Starting the diary the night before the appointment.'],
      ];
      for (const [heading, text] of sections) {
        y = checkPage(doc, y, 60);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.dark);
        doc.text(heading, 44, y);
        y += 16;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.medium);
        const pw = doc.internal.pageSize.getWidth();
        const lines = doc.splitTextToSize(text, pw - 96);
        doc.text(lines, 52, y);
        y += lines.length * 13 + 14;
      }
    },
  },

  {
    filename: 'specialist-appointment-pain-diary.pdf',
    title: 'Pain Diary for Specialist Appointment',
    subtitle: 'Prepare effectively for rheumatology, neurology, and pain specialist visits.',
    badge: 'Specialist Prep',
    generate: (doc, y) => {
      y = drawInputLine(doc, y, 'Specialist:', 200);
      y = drawInputLine(doc, y, 'Specialty:', 200);
      y = drawInputLine(doc, y, 'Appointment Date:', 140);
      y = drawInputLine(doc, y, 'Referred by:', 200);

      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Pre-Appointment 7-Day Log');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Pain (0-10)', 'Location', 'Type', 'Duration', 'Medications', 'Function Level'],
        Array.from({ length: 7 }, (_, i) => [`Day ${i + 1}`, '', '', '', '', '', '']));

      y = checkPage(doc, y, 160);
      y = drawSectionHeading(doc, y, 'Specialist Consultation Prep');
      y = drawInputLine(doc, y, 'Primary concern:', 200);
      y = drawInputLine(doc, y, 'Pain history (when started, how):', 200);
      y = drawInputLine(doc, y, 'Previous treatments tried:', 200);
      y = drawInputLine(doc, y, 'What worked / didn\'t:', 200);
      y = drawInputLine(doc, y, 'Current medications:', 200);
      y = drawInputLine(doc, y, 'Other conditions:', 200);
      y = drawInputLine(doc, y, 'Family history (relevant):', 200);

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Questions for the Specialist', 5);
      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Specialist\'s Recommendations (fill during visit)', 5);
    },
  },

  {
    filename: 'pre-diagnosis-symptom-tracker.pdf',
    title: 'Symptom Tracking Before Diagnosis',
    subtitle: 'Strategic tracking when seeking a diagnosis for unexplained symptoms.',
    badge: 'Pre-Diagnosis',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);

      y = drawSectionHeading(doc, y, 'Comprehensive Symptom Log');
      y = drawInstruction(doc, y, 'When seeking a diagnosis, capture everything. Patterns in diverse symptoms often point to the underlying condition.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Primary Symptom', 'Severity', 'Secondary Symptoms', 'Timing', 'Triggers', 'Duration'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Systemic Symptom Check');
      y = drawInstruction(doc, y, 'Check weekly. Many conditions affect multiple systems. Tracking all symptoms helps with differential diagnosis.');
      y = dailyTrackingTable(doc, y,
        ['System', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [
          ['Musculoskeletal', '', '', '', '', '', '', ''],
          ['Neurological', '', '', '', '', '', '', ''],
          ['GI / Digestive', '', '', '', '', '', '', ''],
          ['Fatigue / Energy', '', '', '', '', '', '', ''],
          ['Skin changes', '', '', '', '', '', '', ''],
          ['Fever / Chills', '', '', '', '', '', '', ''],
          ['Cognitive (brain fog)', '', '', '', '', '', '', ''],
          ['Mood / Emotional', '', '', '', '', '', '', ''],
          ['Sleep disruption', '', '', '', '', '', '', ''],
          ['Other', '', '', '', '', '', '', ''],
        ]);

      y = checkPage(doc, y, 100);
      y = drawSectionHeading(doc, y, 'Tests & Appointments');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Doctor / Specialist', 'Tests Ordered', 'Results', 'Next Steps'],
        Array.from({ length: 5 }, () => Array(5).fill('')));

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Observations & Patterns Noticed', 4);
    },
  },
];

// ─── Generate All PDFs ─────────────────────────────────────────────────────────

async function main() {
  ensureDir(OUTPUT_DIR);

  console.log(`\n  📄 Pain Tracker Pro — PDF Asset Generator`);
  console.log(`  ─────────────────────────────────────────`);
  console.log(`  Output: ${OUTPUT_DIR}\n`);

  let success = 0;
  let failed = 0;

  for (const def of pdfDefinitions) {
    try {
      const doc = createDoc();
      const y = drawHeader(doc, def.title, def.subtitle, def.badge);
      def.generate(doc, y);
      drawFooter(doc);

      const outPath = path.join(OUTPUT_DIR, def.filename);
      const buffer = Buffer.from(doc.output('arraybuffer'));
      fs.writeFileSync(outPath, buffer);

      const sizeKB = (buffer.length / 1024).toFixed(1);
      console.log(`  ✅ ${def.filename} (${sizeKB} KB)`);
      success++;
    } catch (err) {
      console.error(`  ❌ ${def.filename}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n  ─────────────────────────────────────────`);
  console.log(`  Generated: ${success}/${pdfDefinitions.length} PDFs`);
  if (failed > 0) console.log(`  Failed: ${failed}`);
  console.log();
}

main().catch(console.error);
