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

  y = checkPage(doc, y, 120);
  y = drawSectionHeading(doc, y, 'Pain Scale Reference (0–10 NRS)');

  for (let i = 0; i <= 10; i++) {
    const x = 36 + i * segW;
    // Gradient: green > yellow > orange > red
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
  const actualRows = rows || Array.from({ length: 7 }, () => columns.map(() => ''));
  const numCols = columns.length;
  const usableW = doc.internal.pageSize.getWidth() - 72; // 36 margin each side

  // ── Adaptive sizing based on table complexity ──

  // Measure the longest text in column 0 (single-line length)
  const maxCol0Len = Math.max(
    ...columns.slice(0, 1).map(c => String(c).split('\n').reduce((m, l) => Math.max(m, l.length), 0)),
    ...actualRows.map(r => String(r[0] || '').length)
  );

  // Scale col0 width proportionally but leave room for other columns
  const minOtherColW = 48; // minimum usable width per remaining column
  const maxCol0 = usableW - (numCols - 1) * minOtherColW;
  let col0Width;
  if (maxCol0Len <= 6) col0Width = 50;
  else if (maxCol0Len <= 10) col0Width = 64;
  else col0Width = Math.min(Math.max(maxCol0Len * 5.2, 80), maxCol0, 130);

  // Compact padding for dense tables, comfortable for simple ones
  const cellPad = numCols >= 8 ? 4 : numCols >= 6 ? 5 : 6;
  const bodyFontSize = numCols >= 9 ? 7 : 7.5;
  const headFontSize = numCols >= 9 ? 7 : 7.5;

  // Estimate total table height for page-break decision
  const maxHeaderLines = Math.max(...columns.map(c => String(c).split('\n').length));
  const headerH = maxHeaderLines * (headFontSize + 2) + cellPad * 2;
  const rowH = bodyFontSize + cellPad * 2;
  const estHeight = headerH + actualRows.length * rowH + 4;
  y = checkPage(doc, y, Math.min(estHeight, 500));

  doc.autoTable({
    startY: y,
    margin: { left: 36, right: 36, bottom: 60 },
    head: [columns],
    body: actualRows,
    styles: {
      fontSize: bodyFontSize,
      cellPadding: cellPad,
      lineColor: COLORS.veryLight,
      lineWidth: 0.5,
      textColor: COLORS.dark,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: COLORS.dark,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: headFontSize,
    },
    alternateRowStyles: {
      fillColor: COLORS.bg,
    },
    columnStyles: {
      0: { cellWidth: col0Width },
    },
    theme: 'grid',
  });
  return doc.lastAutoTable.finalY + 14;
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
  return y + lines * 18 + 16;
}

// ─── Shared 6-Page Helpers (used by condition-specific & template PDFs) ─────────

/**
 * Standard Medication & Treatment Page (Page 4 for most PDFs)
 * @param {object} [opts] - Condition-specific customization
 * @param {string} [opts.medInstruction] - Custom instruction for medication table
 * @param {string} [opts.nonMedInstruction] - Custom instruction for non-med treatments
 * @param {string[][]} [opts.prefillMeds] - Pre-filled medication rows (e.g. common meds for condition)
 * @param {string[]} [opts.nonMedColumns] - Custom columns for non-med treatment table
 * @param {string[][]} [opts.prefillNonMed] - Pre-filled non-med treatment rows
 * @param {string} [opts.summaryInstruction] - Custom instruction for summary table
 */
function standardMedicationPage(doc, y, opts) {
  const o = opts || {};
  doc.addPage();
  y = 40;

  y = drawSectionHeading(doc, y, 'Medication & Treatment Log');
  y = drawInstruction(doc, y, o.medInstruction || 'Record all medications (prescribed, OTC, supplements) and non-medication treatments. Track effectiveness and side effects for your doctor.');
  y = dailyTrackingTable(doc, y,
    ['Date', 'Medication /\nTreatment', 'Dose', 'Time\nTaken', 'Relief\n(0-10)', 'Duration\nof Relief', 'Side\nEffects'],
    o.prefillMeds || Array.from({ length: 8 }, () => Array(7).fill('')));

  y = checkPage(doc, y, 80);
  y = drawSectionHeading(doc, y, 'Non-Medication Treatments');
  y = drawInstruction(doc, y, o.nonMedInstruction || 'Track physical therapy, heat/cold, TENS, acupuncture, massage, exercise, and other interventions.');
  y = dailyTrackingTable(doc, y,
    o.nonMedColumns || ['Date', 'Treatment\nType', 'Duration\n(min)', 'Pain Before\n(0-10)', 'Pain After\n(0-10)', 'Helpful?\n(Y/N)', 'Notes'],
    o.prefillNonMed || Array.from({ length: 7 }, () => Array(7).fill('')));

  y = checkPage(doc, y, 80);
  y = drawSectionHeading(doc, y, 'Treatment Effectiveness Summary');
  y = drawInstruction(doc, y, o.summaryInstruction || 'At week end, rate each treatment: 1 = No help, 2 = Slight, 3 = Moderate, 4 = Good, 5 = Excellent.');
  y = dailyTrackingTable(doc, y,
    ['Treatment', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Continue?\n(Y/N)', 'Notes'],
    Array.from({ length: 6 }, () => Array(7).fill('')));
  return y;
}

/**
 * Standard Functional Assessment Page (Page 5 for most PDFs)
 * @param {string[]} activities - Condition-specific activity list (max 10)
 * @param {object} [opts] - Condition-specific customization
 * @param {string} [opts.instruction] - Custom instruction for activities table
 * @param {string[][]} [opts.selfCareItems] - Custom self-care items (replaces default 7)
 * @param {string} [opts.selfCareInstruction] - Custom instruction for self-care table
 * @param {string} [opts.notesPrompt] - Custom notes box prompt
 */
function standardFunctionalPage(doc, y, activities, opts) {
  const o = opts || {};
  doc.addPage();
  y = 40;

  y = drawSectionHeading(doc, y, 'Functional Impact Assessment');
  y = drawInstruction(doc, y, o.instruction || 'Rate each activity: 0 = Unable, 5 = Significant difficulty, 10 = Full capacity. Track daily or on representative days.');
  y = dailyTrackingTable(doc, y,
    ['Activity', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    activities.map(a => [a, '', '', '', '', '', '', '']));

  y = checkPage(doc, y, 80);
  y = drawSectionHeading(doc, y, 'Self-Care & Daily Living');
  y = drawInstruction(doc, y, o.selfCareInstruction || 'Mark: Y = Independent  ~ = Modified / used aids  X = Unable  H = Needed help from another person.');

  const selfCare = o.selfCareItems || [
    ['Bathing / showering', '', '', '', '', '', '', ''],
    ['Dressing', '', '', '', '', '', '', ''],
    ['Preparing meals', '', '', '', '', '', '', ''],
    ['Housework / cleaning', '', '', '', '', '', '', ''],
    ['Grocery shopping', '', '', '', '', '', '', ''],
    ['Driving', '', '', '', '', '', '', ''],
    ['Sleep quality (1-5)', '', '', '', '', '', '', ''],
  ];
  y = dailyTrackingTable(doc, y,
    ['Activity', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    selfCare);

  y = checkPage(doc, y, 100);
  y = notesBox(doc, y, o.notesPrompt || 'Functional Limitations & Accommodations Used', 4);
  return y;
}

/**
 * Standard Weekly Summary & Doctor Prep Page (Page 6 for most PDFs)
 * @param {string} conditionName - E.g. 'Fibromyalgia', 'Arthritis'
 * @param {{label:string, width?:number}[]} [extraFields] - Additional condition-specific fields
 * @param {object} [opts] - Condition-specific customization
 * @param {string} [opts.instruction] - Custom instruction text
 * @param {{label:string}[]} [opts.patternPrompts] - Custom pattern observation prompts (replaces defaults)
 * @param {string} [opts.notesPrompt] - Custom notes box prompt
 */
function standardSummaryPage(doc, y, conditionName, extraFields, opts) {
  const o = opts || {};
  doc.addPage();
  y = 40;
  const pw = doc.internal.pageSize.getWidth();

  y = drawSectionHeading(doc, y, 'Weekly Summary \u2014 ' + conditionName);
  y = drawInstruction(doc, y, o.instruction || 'Complete at end of each week. Bring to appointments. This page tells your doctor how the week went.');
  y += 4;
  y = drawInputLine(doc, y, 'Week of:', 180);
  y = drawInputLine(doc, y, 'Average Pain Level (0-10):', 100);
  y = drawInputLine(doc, y, 'Worst Day (date + level):', 200);
  y = drawInputLine(doc, y, 'Best Day (date + level):', 200);
  y = drawInputLine(doc, y, 'Flare Days This Week:', 80);
  y = drawInputLine(doc, y, 'Sleep Quality Average (1-5):', 100);

  if (extraFields) {
    for (const f of extraFields) {
      y = drawInputLine(doc, y, f.label, f.width || 200);
    }
  }
  y += 4;

  y = checkPage(doc, y, 160);
  y = drawSectionHeading(doc, y, 'Pattern Observations');
  const prompts = o.patternPrompts || [
    { label: 'Triggers identified this week:' },
    { label: 'What helped most:' },
    { label: 'What made it worse:' },
    { label: 'Treatment changes or effects noticed:' },
  ];
  for (const p of prompts) {
    y = drawInputLine(doc, y, p.label, pw - 120);
  }
  y += 6;

  y = checkPage(doc, y, 150);
  y = drawSectionHeading(doc, y, 'Questions for Next Appointment');
  for (let i = 1; i <= 5; i++) {
    y = drawInputLine(doc, y, i + '.', pw - 120);
  }

  y = checkPage(doc, y, 100);
  y = notesBox(doc, y, o.notesPrompt || 'Additional Notes', 4);
  return y;
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
      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Pain Quality Descriptors');
      y = drawInstruction(doc, y,
        'Use these terms when describing your pain type: Aching • Burning • Stabbing • Throbbing • Shooting • Tingling • Cramping • Pressing • Sharp • Dull • Radiating • Pulsing • Electric • Stinging • Gnawing');
      y += 2;

      // ── Daily Log Table (Main) ──
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Daily Pain Log — Week of: _______________');
      y = drawInstruction(doc, y,
        'Fill in one row per day. Rate pain on the 0–10 NRS. Use the quality descriptors above. Mark the primary location (e.g. lower back, R knee, neck).');
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      y = dailyTrackingTable(doc, y,
        ['Day', 'Date', 'AM Pain', 'PM Pain', 'Eve Pain', 'Worst', 'Location(s)', 'Quality'],
        days.map(d => [d, '', '', '', '', '', '', '']));

      // ── Medications & Treatments ──
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Medications & Treatments');
      y = drawInstruction(doc, y,
        'Record everything you take or do for pain: prescriptions, OTC meds, topicals, heat/ice, physio exercises, etc. Rate relief 0–10.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Medication / Treatment', 'Dose / Duration', 'Time Taken', 'Relief (0-10)', 'Side Effects?'],
        days.map(d => [d, '', '', '', '', '']));

      // ── Triggers & Activities ──
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Triggers & Activities');
      y = drawInstruction(doc, y,
        'Check any triggers or factors present each day. Add your own in the blank columns. This helps identify patterns over time.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Weather', 'Stress', 'Poor Sleep', 'Physical Activity', 'Sitting/Posture', 'Food/Drink', '_______'],
        days.map(d => [d, '', '', '', '', '', '', '']));

      // ── Sleep & Energy ──
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Sleep & Energy');
      y = drawInstruction(doc, y,
        'Rate sleep quality 1–5 (1 = terrible, 5 = excellent). Rate morning energy 0–10. Note anything that disturbed sleep.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Bedtime', 'Wake Time', 'Hours Slept', 'Sleep Quality (1-5)', 'Morning Energy (0-10)', 'Disturbances'],
        days.map(d => [d, '', '', '', '', '', '']));

      // ── Mood & Functional Impact ──
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Mood & Functional Impact');
      y = drawInstruction(doc, y,
        'Rate mood and each functional area: 0 = unable, 5 = managed with difficulty, 10 = normal. This documents how pain affects daily life.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Mood (0-10)', 'Self-Care', 'Housework', 'Walking', 'Work / School', 'Social / Family'],
        days.map(d => [d, '', '', '', '', '', '']));

      // ── Notes for Healthcare Provider ──
      y = checkPage(doc, y, 150);
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
      y = checkPage(doc, y, 120);
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
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Medications & Treatments');
      y = drawInstruction(doc, y, 'Record everything taken or applied today. Include over-the-counter meds, exercises, heat/ice, etc.');
      y = dailyTrackingTable(doc, y,
        ['Time', 'Medication / Treatment', 'Dose / Duration', 'Relief\n(0-10)', 'Side Effects'],
        Array.from({ length: 5 }, () => ['', '', '', '', '']));

      // ── Activity & Function ──
      y = checkPage(doc, y, 80);
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
      y = checkPage(doc, y, 120);
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
      y = checkPage(doc, y, 100);
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
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, '1. Daily Pain Overview');
      y = drawInstruction(doc, y, 'Rate pain at each time point using the 0-10 NRS. Record worst pain and the primary location for each day.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'AM Pain', 'Midday', 'PM Pain', 'Eve Pain', 'Worst', 'Primary Location(s)'],
        days.map(d => [d, '', '', '', '', '', '']));

      // ── Section 2: Sleep & Energy ──
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, '2. Sleep & Energy');
      y = drawInstruction(doc, y, 'Rate sleep quality 1-5 (1=terrible, 5=excellent). Rate morning energy 0-10. Note disturbances (pain woke me, restless, etc.).');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Bedtime', 'Wake Time', 'Hours', 'Quality (1-5)', 'Energy (0-10)', 'Disturbances'],
        days.map(d => [d, '', '', '', '', '', '']));

      // ── Section 3: Medications & Treatments ──
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, '3. Medications & Treatments');
      y = drawInstruction(doc, y, 'Record all pain interventions: prescriptions, OTC, topicals, heat/ice, physio, TENS, etc. Rate relief 0-10.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Medication / Treatment', 'Dose / Duration', 'Time(s)', 'Relief (0-10)', 'Side Effects?'],
        days.map(d => [d, '', '', '', '', '']));

      // ── Section 4: Activity & Function Impact ──
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, '4. Activity & Function Impact');
      y = drawInstruction(doc, y, 'Rate each area 0-5 (0 = no difficulty, 3 = significant difficulty, 5 = unable). Leave blank if not applicable that day.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Self-Care', 'Housework', 'Walking', 'Work/School', 'Social', 'Exercise'],
        days.map(d => [d, '', '', '', '', '', '']));

      // ── Section 5: Triggers & Contributing Factors ──
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, '5. Triggers & Contributing Factors');
      y = drawInstruction(doc, y, 'Check (X) any factors present each day. Add your own in the blank column. Tracking triggers reveals hidden patterns.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Weather', 'Stress', 'Poor Sleep', 'Activity', 'Posture', 'Food/Drink', '______'],
        days.map(d => [d, '', '', '', '', '', '', '']));

      // ── Section 6: Mood & Wellbeing ──
      y = checkPage(doc, y, 120);
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
      y = checkPage(doc, y, 150);
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
      y = checkPage(doc, y, 80);
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
      y = checkPage(doc, y, 80);
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
      y = checkPage(doc, y, 80);
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
      y = checkPage(doc, y, 80);
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
      y = checkPage(doc, y, 80);
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
      y = checkPage(doc, y, 120);
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
      y = checkPage(doc, y, 150);
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
      y = checkPage(doc, y, 120);
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
      y = checkPage(doc, y, 120);
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
      y = checkPage(doc, y, 120);
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
      y = checkPage(doc, y, 120);
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
      y = checkPage(doc, y, 120);
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
      y = checkPage(doc, y, 120);
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
      y = checkPage(doc, y, 120);
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
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, '2. Daily Symptom Log — Core Symptoms');
      y = drawInstruction(doc, y, 'Rate each symptom at the same time daily (evening recommended). Use the 0-10 scales above.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Pain (0-10)', 'Fatigue (0-10)', 'Sleep Hrs', 'Sleep Qual (0-10)', 'Brain Fog (0-10)', 'Mood (0-10)', 'Energy (0-10)'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      // ── Section 3: Additional Physical Symptoms ──
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, '3. Additional Physical Symptoms');
      y = drawInstruction(doc, y, 'Track symptoms specific to your condition. Rate 0-10 or use checkboxes. Add your own in the blank rows.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Stiffness', 'Numbness / Tingling', 'Dizziness', 'Nausea / GI', 'Headache', '________', '________'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      // ── Section 4: Functional Impact ──
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, '4. Functional Impact — Rate Difficulty (0-5)');
      y = drawInstruction(doc, y, '0 = No problem  |  1 = Mild difficulty  |  2 = Moderate  |  3 = Significant  |  4 = Very difficult  |  5 = Could not do');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Self-Care', 'Housework', 'Walking', 'Work / Tasks', 'Social', 'Exercise'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      // ── Section 5: Medication & Treatment Log ──
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, '5. Medication & Treatment Log');
      y = drawInstruction(doc, y, 'Track medications, therapies, and interventions. Note which symptoms they helped or worsened.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Medication / Treatment', 'Dose', 'Symptom Targeted', 'Relief (0-10)', 'Side Effects'],
        Array.from({ length: 6 }, () => Array(6).fill('')));

      // ── Section 6: Trigger Tracking ──
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, '6. Trigger & Correlation Tracker');
      y = drawInstruction(doc, y, 'Check potential triggers present each day. Review weekly to spot patterns.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Poor Sleep', 'High Stress', 'Weather Change', 'Overexertion', 'Hormonal', 'Food Trigger', 'Other'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      // ── Section 7: Symptom Cluster Patterns ──
      y = checkPage(doc, y, 120);
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
      y = checkPage(doc, y, 160);
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

      y = checkPage(doc, y, 80);
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

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Aura Tracking');
      y = drawInstruction(doc, y, 'If aura occurs, log the type, onset time, duration, and description. Most auras last 5–60 minutes and precede the headache.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Type\n(Visual/Sensory\n/Speech)', 'Start Time', 'Duration\n(min)', 'Description\n(zigzags, spots, tingling, etc.)'],
        Array.from({ length: 6 }, () => Array(5).fill('')));

      y = checkPage(doc, y, 80);
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

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Daily Trigger Diary — Environmental & Lifestyle');
      y = drawInstruction(doc, y, 'Check any factors present each day. Add your own triggers in the blank columns. Look for combinations — most attacks need 2+ triggers.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Bright\nLights', 'Strong\nSmells', 'Weather\nChange', 'Stress\n(0-10)', 'Screen\nTime (hrs)', 'Exercise', '_______', '_______'],
        Array.from({ length: 7 }, () => Array(9).fill('')));

      y = checkPage(doc, y, 80);
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

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Preventive Medication Tracking');
      y = drawInstruction(doc, y, 'Track daily adherence to preventive medications (beta-blockers, anticonvulsants, antidepressants, CGRP inhibitors, etc.).');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Med 1: ________', 'Med 2: ________', 'Med 3: ________', 'Taken\nOn Time?', 'Side Effects\nToday'],
        Array.from({ length: 7 }, () => Array(6).fill('')));

      y = checkPage(doc, y, 80);
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

      y = checkPage(doc, y, 100);
      y = notesBox(doc, y, 'Questions for My Neurologist', 4);

      y = checkPage(doc, y, 150);
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

      y = checkPage(doc, y, 120);
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

  // ── Tier 2: Medical & Appointment (Enhanced 6-Page PDFs) ───────────────────

  {
    filename: 'how-to-track-pain-for-doctors-guide.pdf',
    title: 'How to Track Pain for Doctors',
    subtitle: 'Complete guide to what doctors need to see in your pain records — with tracking templates, appointment prep worksheets, and a doctor-ready summary page.',
    badge: 'Guide',
    generate: (doc, y) => {
      const pw = doc.internal.pageSize.getWidth();

      // ────── PAGE 1: What Doctors Need ──────
      y = drawSectionHeading(doc, y, 'What Doctors Need to See');
      const needs = [
        ['1. Pain Pattern Over Time', 'Track at least 7 days before your appointment. Show trends, not just today\'s pain. Doctors want to see the full picture — good days and bad.'],
        ['2. Specific Descriptions', 'Where exactly? What type? (sharp, burning, aching, throbbing). When does it start and stop? What makes it better or worse?'],
        ['3. Functional Impact', '"I couldn\'t cook dinner 4 days this week" is more useful than "my pain was 8/10." Describe what pain prevents you from doing.'],
        ['4. Medication Response', 'What you took, when, how much it helped (percentage or time), and any side effects. This guides treatment decisions.'],
        ['5. Sleep & Mood Connection', 'Pain affects sleep and mood. Tracking these helps doctors understand the full burden and consider comprehensive treatment.'],
        ['6. Trigger Identification', 'Activities, foods, weather, stress, or sleep that precede pain changes. Patterns emerge after 7+ days of consistent tracking.'],
        ['7. Treatment History', 'What you\'ve already tried and how well it worked. This prevents repeating failed treatments and guides next steps.'],
      ];
      for (const [heading, text] of needs) {
        y = checkPage(doc, y, 70);
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLORS.dark);
        doc.text(heading, 44, y); y += 16;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLORS.medium);
        const lines = doc.splitTextToSize(text, pw - 96);
        doc.text(lines, 52, y); y += lines.length * 13 + 12;
      }

      // ────── PAGE 2: Translation Guide ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Doctor vs. Patient Language — Translation Guide');
      y = drawInstruction(doc, y, 'Your doctor thinks in clinical terms. This table shows how to translate your experience into language that drives clinical decisions.');
      y = dailyTrackingTable(doc, y,
        ['What You Say', 'What the Doctor Needs to Hear', 'Why It Matters'],
        [
          ['"It hurts all the time"', '"My baseline is 4/10 with flares to 7-8/10"', 'Quantifies baseline vs acute'],
          ['"Nothing helps"', '"Ibuprofen reduces pain 20% for 3 hours"', 'Shows partial response data'],
          ['"I can\'t do anything"', '"I couldn\'t cook 4 of 7 days this week"', 'Specific functional impact'],
          ['"It\'s getting worse"', '"Average pain increased from 4 to 6 over 3 weeks"', 'Documented trend with timeline'],
          ['"The medication doesn\'t work"', '"After 2 weeks on [med], pain unchanged at 5/10"', 'Treatment trial with duration'],
          ['"I\'m always tired"', '"Sleep quality 2/5; woke 4 times from pain"', 'Sleep-pain connection data'],
        ]);

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, '7-Day Pre-Appointment Tracking Log');
      y = drawInstruction(doc, y, 'Complete this for the 7 days before your appointment. Brings structured data your doctor can review in under 2 minutes.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Date', 'AM Pain\n(0-10)', 'PM Pain\n(0-10)', 'Worst\nMoment', 'Function\n(what you\ncouldn\'t do)', 'Meds\nTaken', 'Sleep\n(1-5)'],
        ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => [d, '', '', '', '', '', '', '']));

      // ────── PAGE 3: Appointment Prep ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Pre-Appointment Checklist');
      y = drawInstruction(doc, y, 'Complete 1-2 days before your appointment. Bring this page with your 7-day tracking log.');
      const checkItems = [
        '7-day pain log completed (above)',
        'Current medication list with doses and timing',
        'List of treatments already tried and results',
        'Imaging / test results to bring or reference',
        'Insurance / referral paperwork if needed',
        'Questions written down (below)',
        'Appointment goals identified',
      ];
      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLORS.dark);
      for (const item of checkItems) {
        y = checkPage(doc, y, 120);
        doc.setDrawColor(...COLORS.light); doc.setLineWidth(0.5);
        doc.rect(52, y - 8, 10, 10);
        doc.text(item, 70, y); y += 16;
      }
      y += 8;

      y = drawSectionHeading(doc, y, 'Appointment Information');
      y = drawInputLine(doc, y, 'Appointment date & time:', 200);
      y = drawInputLine(doc, y, 'Doctor / Specialist:', 200);
      y = drawInputLine(doc, y, 'Referred by:', 200);
      y = drawInputLine(doc, y, 'Primary concern for this visit:', pw - 120);
      y = drawInputLine(doc, y, 'Changes since last visit:', pw - 120);
      y += 6;
      y = notesBox(doc, y, 'Questions to Ask (prepare 3-5)', 5);

      // ────── PAGE 4: During & After ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'During the Appointment — Notes');
      y = drawInstruction(doc, y, 'Write notes during or immediately after. Memory fades fast — capture key decisions, next steps, and new prescriptions.');
      y = drawInputLine(doc, y, 'Diagnosis discussed:', pw - 120);
      y = drawInputLine(doc, y, 'New medications prescribed:', pw - 120);
      y = drawInputLine(doc, y, 'Dosage changes:', pw - 120);
      y = drawInputLine(doc, y, 'Tests ordered:', pw - 120);
      y = drawInputLine(doc, y, 'Referrals made:', pw - 120);
      y = drawInputLine(doc, y, 'Next appointment:', 200);
      y += 4;
      y = notesBox(doc, y, 'Doctor\'s Recommendations', 4);
      y = notesBox(doc, y, 'Questions I Still Have', 3);

      y = checkPage(doc, y, 160);
      y = drawSectionHeading(doc, y, 'Post-Appointment Action Items');
      for (let i = 1; i <= 6; i++) {
        y = checkPage(doc, y, 16);
        doc.setDrawColor(...COLORS.light); doc.setLineWidth(0.5);
        doc.rect(52, y - 8, 10, 10);
        y = drawInputLine(doc, y, '', pw - 80);
      }

      // ────── PAGE 5: Medication & Treatment Log ──────
      y = standardMedicationPage(doc, y, {
        medInstruction: 'Doctors need to see what you take, when, and whether it works. Include OTC meds and supplements — these affect prescribing decisions.',
        nonMedInstruction: 'Track non-drug interventions: physio, heat/cold, TENS, stretching. Doctors use this to judge what to try next.',
      });

      // ────── PAGE 6: Summary ──────
      y = standardSummaryPage(doc, y, 'Pain Tracking for Doctors', [
        { label: 'Appointments this month:', width: 120 },
        { label: 'Communication quality (1-5):', width: 100 },
      ], {
        patternPrompts: [
          { label: 'What I want the doctor to focus on:' },
          { label: 'Changes since last visit:' },
          { label: 'What helped/did not help:' },
          { label: 'New symptoms to report:' },
        ],
        notesPrompt: 'Pre-Appointment Notes & Priority Concerns',
      });
    },
  },

  {
    filename: 'pain-journal-checklist.pdf',
    title: 'What to Include in a Pain Journal',
    subtitle: 'Complete prioritized checklist with tracking templates for each category — from essential daily entries to appointment-ready weekly summaries.',
    badge: 'Checklist',
    generate: (doc, y) => {
      const pw = doc.internal.pageSize.getWidth();

      // ────── PAGE 1: Prioritized Checklist ──────
      const categories = [
        ['Essential — Track Every Day (2 minutes)', [
          'Pain intensity (0-10 scale) — morning and evening',
          'Pain location (be specific — "left lower back" not "back")',
          'Pain type (sharp, dull, burning, throbbing, aching, stabbing)',
          'Time of day pain is worst / best',
          'Duration of each pain episode or flare',
          'Medications taken (name, dose, time)',
        ]],
        ['Important — Track Daily If Possible (adds 2 minutes)', [
          'Medication effectiveness (% relief and duration)',
          'Sleep quality (1-5) and hours slept',
          'Activities completed and activities skipped or modified',
          'What made pain better and what made it worse',
          'Energy level (1-5)',
        ]],
        ['Valuable — Track When Relevant (adds 1-2 minutes)', [
          'Mood and emotional state',
          'Stress level (0-10)',
          'Weather / barometric pressure changes',
          'Menstrual cycle day (if applicable)',
          'Food, hydration, and caffeine intake',
          'Exercise or physical therapy completed',
        ]],
        ['For Appointments — Weekly Summary (5 minutes/week)', [
          'Average pain level this week',
          'Best day and worst day (with possible reasons)',
          'Functional limitations this week',
          'Treatment response observations',
          'Questions for your doctor',
        ]],
      ];
      for (const [heading, items] of categories) {
        y = checkPage(doc, y, 30 + items.length * 16);
        y = drawSectionHeading(doc, y, heading);
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLORS.dark);
        for (const item of items) {
          y = checkPage(doc, y, 16);
          doc.setDrawColor(...COLORS.light); doc.setLineWidth(0.5);
          doc.rect(52, y - 8, 10, 10);
          doc.text(item, 70, y); y += 16;
        }
        y += 6;
      }

      // ────── PAGE 2: Time Commitment Guide ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Time Commitment Guide — Pick Your Level');
      y = drawInstruction(doc, y, 'Choose the level that fits your energy. Some tracking is always better than no tracking. You can switch levels day by day.');
      y = dailyTrackingTable(doc, y,
        ['Level', 'Time', 'What You Track', 'Best For'],
        [
          ['Quick', '1 min', 'Pain level + 1 word for function', 'Bad days, low energy'],
          ['Standard', '2-3 min', 'Pain, meds, sleep, function', 'Most days'],
          ['Detailed', '5 min', 'All categories above', 'Pre-appointment weeks'],
          ['Comprehensive', '10 min', 'Everything + journal notes', 'New diagnosis, treatment changes'],
        ]);

      y = checkPage(doc, y, 130);
      y = drawSectionHeading(doc, y, 'Sample Daily Entry — Standard Level');
      y = drawInstruction(doc, y, 'This is what a completed "Standard" entry looks like. Use this as a template for your own entries.');

      doc.setFillColor(...COLORS.bg);
      doc.roundedRect(36, y, pw - 72, 130, 4, 4, 'F');
      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLORS.dark);
      const sample = [
        'Date: Tuesday, Jan 14   |   Pain: 5/10 (AM: 6, PM: 4)',
        'Location: Lower back, radiating to left leg',
        'Type: Aching with occasional sharp when bending',
        'Meds: Ibuprofen 400mg at 8am (30% relief, lasted 4 hrs)',
        'Sleep: 3/5 — woke twice from pain, 6 hrs total',
        'Function: Could not do dishes or vacuum. Managed desk work with breaks.',
        'Triggers: Increased after sitting > 30 min',
        'What helped: Walking 15 min, heating pad on lower back',
      ];
      sample.forEach((line, i) => { doc.text(line, 48, y + 14 + i * 14); });
      y += 140;

      // ────── PAGE 3: Daily Tracking Template ──────
      doc.addPage(); y = 40;
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);
      y = drawSectionHeading(doc, y, 'Daily Pain Journal — Use This Template');
      y = dailyTrackingTable(doc, y,
        ['Time', 'Pain\n(0-10)', 'Location', 'Type /\nQuality', 'Medication\nTaken', 'Activity /\nFunction', 'What Helped /\nMade Worse'],
        ['Morning', 'Midday', 'Evening', 'Bedtime'].map(t => [t, '', '', '', '', '', '']));

      y = checkPage(doc, y, 160);
      y = drawSectionHeading(doc, y, 'Sleep & Energy');
      y = drawInputLine(doc, y, 'Hours slept:', 80);
      y = drawInputLine(doc, y, 'Sleep quality (1-5):', 80);
      y = drawInputLine(doc, y, 'Times woken by pain:', 80);
      y = drawInputLine(doc, y, 'Energy level (1-5):', 80);

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Today\'s Observations', 4);

      // ────── PAGE 4: Trigger & Pattern Tracking ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Trigger Identification Log');
      y = drawInstruction(doc, y, 'Check potential triggers present each day. After 2+ weeks, compare trigger days vs. pain-free days to find your patterns.');
      y = dailyTrackingTable(doc, y,
        ['Trigger', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [
          ['Poor sleep', '', '', '', '', '', '', ''],
          ['High stress', '', '', '', '', '', '', ''],
          ['Weather change', '', '', '', '', '', '', ''],
          ['Over-exertion', '', '', '', '', '', '', ''],
          ['Skipped meal', '', '', '', '', '', '', ''],
          ['Alcohol', '', '', '', '', '', '', ''],
          ['Prolonged sitting', '', '', '', '', '', '', ''],
          ['Emotional distress', '', '', '', '', '', '', ''],
          ['_____________', '', '', '', '', '', '', ''],
          ['_____________', '', '', '', '', '', '', ''],
        ]);

      y = checkPage(doc, y, 160);
      y = drawSectionHeading(doc, y, 'Pattern Notes');
      y = drawInputLine(doc, y, 'Patterns I\'m noticing:', pw - 120);
      y = drawInputLine(doc, y, '', pw - 80);
      y = drawInputLine(doc, y, 'Possible connections:', pw - 120);
      y = drawInputLine(doc, y, '', pw - 80);

      // ────── PAGE 5: Medication & Treatment ──────
      y = standardMedicationPage(doc, y, {
        medInstruction: 'Start with your Essential checklist items before expanding. Even a simple medication log adds enormous value to your journal.',
        nonMedInstruction: 'If tracking "Valuable" tier items: record non-drug treatments like heat/cold, exercises, and rest. Note what works best for you.',
      });

      // ────── PAGE 6: Weekly Summary ──────
      y = standardSummaryPage(doc, y, 'Pain Journal', undefined, {
        patternPrompts: [
          { label: 'Patterns I noticed this week:' },
          { label: 'Tracking level I maintained (Quick/Standard/Detailed):' },
          { label: 'What was easy to track vs. what I skipped:' },
          { label: 'Next week I want to add:' },
        ],
        notesPrompt: 'Reflections on Building My Tracking Habit',
      });
    },
  },

  // ── Tier 3: Disability / Legal (Enhanced 6-Page PDFs) ────────────────────

  {
    filename: 'disability-documentation-guide.pdf',
    title: 'Documenting Pain for Disability Claims',
    subtitle: 'Complete 6-page guide to creating documentation that supports WorkSafeBC, SSDI, insurance, and government benefit claims — with evidence strength rankings and common denial mistakes.',
    badge: 'Essential Guide',
    generate: (doc, y) => {
      const pw = doc.internal.pageSize.getWidth();

      // ────── PAGE 1: Documentation Strategy ──────
      const strategies = [
        ['Start Before You File', 'Begin tracking immediately. Records that predate your claim are more credible. Even if you\'re months from filing, daily entries starting now build a stronger case.'],
        ['Document Functional Impact', 'Adjusters care most about what pain prevents you from doing. "Couldn\'t lift laundry basket" is more powerful than "pain was 8/10." Be specific about limitations.'],
        ['Be Consistent, Not Perfect', 'Daily brief entries beat weekly detailed ones. If you miss a day, don\'t backfill — it looks fabricated. Gaps are normal; consistency matters.'],
        ['Include Good Days', 'Documenting better days shows honesty. Constant 10/10 ratings destroy credibility. A pattern of mostly difficult days with occasional better ones is believable.'],
        ['Connect to Work/Function', 'For WorkSafeBC: connect symptoms to work duties. For disability: describe daily living impact. Every entry should reference real tasks.'],
        ['Align with Medical Records', 'Your diary should complement, not contradict, your medical records. Note appointment dates, treatments, and outcomes. Bring diary summaries to appointments.'],
      ];
      for (const [heading, text] of strategies) {
        y = checkPage(doc, y, 70);
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLORS.dark);
        doc.text(heading, 44, y); y += 16;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLORS.medium);
        const lines = doc.splitTextToSize(text, pw - 96);
        doc.text(lines, 52, y); y += lines.length * 13 + 12;
      }

      // ────── PAGE 2: Evidence Strength & Common Mistakes ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Evidence Strength Ranking');
      y = drawInstruction(doc, y, 'Disability evaluators weigh evidence differently. Build the strongest possible case by including items from the top tiers.');
      y = dailyTrackingTable(doc, y,
        ['Strength', 'Evidence Type', 'Examples', 'Your Status'],
        [
          ['Strongest', 'Objective medical tests', 'MRI, X-ray, EMG, bloodwork', ''],
          ['Strong', 'Specialist medical opinions', 'Rheumatologist, neurologist letters', ''],
          ['Good', 'Treatment records + response', 'Med logs, physio notes, surgery records', ''],
          ['Supporting', 'Daily pain diary with functional detail', 'This diary — showing daily limitations', ''],
          ['Helpful', 'Third-party statements', 'Employer, family, caregiver letters', ''],
        ]);

      y = checkPage(doc, y, 130);
      y = drawSectionHeading(doc, y, 'Common Documentation Mistakes That Cause Denials');
      const mistakes = [
        ['Only tracking on bad days', 'Looks like you\'re fine the rest of the time. Track every day.'],
        ['Constant 10/10 pain ratings', 'Appears exaggerated. Show genuine variation — 3 to 8 is more credible than 8 to 10.'],
        ['Starting documentation only after filing', 'Pre-filing records are far more credible. Start NOW.'],
        ['Contradicting medical records', 'If your doctor says "improving" but your diary says "getting worse," evaluators notice.'],
        ['Vague descriptions without examples', '"Pain was bad" loses to "Could not carry groceries from car — had to ask neighbor for help."'],
        ['Ignoring treatment compliance', 'Skipping appointments or not taking prescribed meds weakens any claim.'],
      ];
      for (const [mistake, fix] of mistakes) {
        y = checkPage(doc, y, 30);
        doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLORS.dark);
        doc.text('X ' + mistake, 44, y); y += 12;
        doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLORS.medium);
        doc.text('  Fix: ' + fix, 48, y); y += 16;
      }

      // ────── PAGE 3: Daily Documentation Template ──────
      doc.addPage(); y = 40;
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);
      y = drawSectionHeading(doc, y, 'Daily Disability Documentation');
      y = drawInstruction(doc, y, 'Complete daily. Use specific functional language. This page is your primary disability evidence.');
      y = drawInputLine(doc, y, 'Pain level (0-10):', 80);
      y = drawInputLine(doc, y, 'Activities I could NOT do today:', pw - 120);
      y = drawInputLine(doc, y, '', pw - 80);
      y = drawInputLine(doc, y, 'Activities I completed with difficulty:', pw - 120);
      y = drawInputLine(doc, y, '', pw - 80);
      y = drawInputLine(doc, y, 'Assistance needed from others:', pw - 120);
      y = drawInputLine(doc, y, 'Self-care limitations:', pw - 120);
      y = drawInputLine(doc, y, 'Medications & treatments today:', pw - 120);
      y = drawInputLine(doc, y, 'Hours spent lying down/resting:', 120);
      y += 4;
      y = notesBox(doc, y, 'How pain affected my day (use specific, measurable terms)', 5);

      // ────── PAGE 4: Functional Assessment ──────
      y = standardFunctionalPage(doc, y, [
        'Walking (distance before stopping)',
        'Standing tolerance (minutes)',
        'Sitting tolerance (minutes)',
        'Lifting capacity (lbs)',
        'Bending / stooping',
        'Reaching / overhead work',
        'Gripping / fine motor',
        'Stair climbing',
        'Concentration / focus',
        'Driving',
      ], {
        instruction: 'Rate each activity: 0 = Unable, 5 = Significant difficulty, 10 = Full capacity. Use exact numbers — disability evaluators rely on measurable data.',
        selfCareItems: [
          ['Bathing (with/without aids)', '', '', '', '', '', '', ''],
          ['Dressing upper + lower body', '', '', '', '', '', '', ''],
          ['Preparing a meal', '', '', '', '', '', '', ''],
          ['Housework (duration)', '', '', '', '', '', '', ''],
          ['Shopping (distance walked)', '', '', '', '', '', '', ''],
          ['Driving (continuous min)', '', '', '', '', '', '', ''],
          ['Hours resting/lying down', '', '', '', '', '', '', ''],
        ],
        notesPrompt: 'Evidence of Functional Decline (specific examples for claims)',
      });

      // ────── PAGE 5: Documentation Checklist ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Disability Documentation Checklist');
      y = drawInstruction(doc, y, 'Check off each item as you complete it. A fully checked list means your claim has strong documentation.');
      const checkItems = [
        'Consistent daily pain diary (30+ days minimum)',
        'Functional impact documented for each day',
        'Both good AND bad days recorded',
        'Medication log with response tracking',
        'Treatment compliance documented (appointments attended)',
        'Medical appointment dates and outcomes noted',
        'Specific activities affected (not just pain ratings)',
        'Third-party statements requested (family, employer)',
        'Imaging and test results organized',
        'Weekly summary prepared for adjudicator review',
        'Timeline from injury/onset to present documented',
        'Work impact (hours missed, duties impossible) logged',
      ];
      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLORS.dark);
      for (const item of checkItems) {
        y = checkPage(doc, y, 120);
        doc.setDrawColor(...COLORS.light); doc.setLineWidth(0.5);
        doc.rect(52, y - 8, 10, 10);
        doc.text(item, 70, y); y += 16;
      }

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Documentation Timeline');
      y = dailyTrackingTable(doc, y,
        ['Phase', 'When', 'Action', 'Status'],
        [
          ['NOW', 'Today', 'Start daily pain diary', ''],
          ['Week 1-2', 'First 2 weeks', 'Establish baseline data', ''],
          ['Week 3-4', 'Month 1', 'Request medical records + specialist letters', ''],
          ['Month 2', 'Before filing', 'Compile evidence package + weekly summaries', ''],
          ['Filing', 'Day of', 'Submit copies only — keep originals safe', ''],
          ['Ongoing', 'After filing', 'Continue tracking; attend all appointments', ''],
        ]);

      // ────── PAGE 6: Monthly Summary for Claims ──────
      y = standardSummaryPage(doc, y, 'Disability Documentation', [
        { label: 'Days unable to work this week:', width: 120 },
        { label: 'Medical appointments attended:', width: 120 },
        { label: 'Treatment compliance (%):', width: 100 },
      ], {
        instruction: 'Complete weekly. Disability adjudicators prioritize consistency. A 30-day diary with weekly summaries is the minimum evidence standard.',
        patternPrompts: [
          { label: 'Functional decline compared to last week:' },
          { label: 'Medical evidence gathered this week:' },
          { label: 'Third-party observations (family, coworkers):' },
          { label: 'Activities that prove functional limitation:' },
        ],
        notesPrompt: 'Claim-Specific Documentation Gaps to Address',
      });
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

      y = drawPainScale(doc, y);

      y = checkPage(doc, y, 60);
      doc.setFillColor(...COLORS.bg);
      doc.roundedRect(36, y, pw - 72, 52, 4, 4, 'F');
      doc.setDrawColor(...COLORS.warning); doc.setLineWidth(1.5);
      doc.line(36, y, 36, y + 52);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLORS.dark); doc.setFontSize(9);
      doc.text('Important: Connect Every Entry to Your Work Injury', 48, y + 14);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLORS.medium); doc.setFontSize(7.5);
      doc.text('Every entry should link symptoms to your workplace injury and job duties. Be specific about what work tasks are affected.', 48, y + 28);
      doc.text('Example: "L4-L5 pain increased to 7/10 after 90 min at workstation — could not complete afternoon data entry tasks."', 48, y + 40);

      // ────────────────────────────── PAGE 2: Daily Work-Related Pain Log ──────────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Daily Work-Related Pain Log — Week of: _______________');
      y = drawInstruction(doc, y, 'Complete one row per day. Connect all symptoms to your workplace injury and job duties. Note work status: F = Full duties, M = Modified, O = Off work.');
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      y = dailyTrackingTable(doc, y,
        ['Day', 'Date', 'AM\nPain', 'PM\nPain', 'Eve\nPain', 'Work\nStatus\n(F/M/O)', 'Specific Duties\nAffected', 'Aggravating\nActivities'],
        days.map(d => [d, '', '', '', '', '', '', '']));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Daily Functional Limitations (Work-Related)');
      y = drawInstruction(doc, y, 'Be specific and measurable. E.g., "Sat for 20 min before L4 pain reached 6/10 — position requires 4 hrs."');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Sitting\n(min before\npain)', 'Standing\n(min before\npain)', 'Lifting\nCapacity\n(lbs)', 'Walking\n(min before\npain)', 'Driving\n(min)', 'Job Tasks\nUnable to\nComplete'],
        days.map(d => [d, '', '', '', '', '', '']));

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Work Connection Notes', 5);

      // ────────────────────────────── PAGE 3: Functional Capacity Detail ──────────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Detailed Functional Capacity Assessment');
      y = drawInstruction(doc, y, 'Rate each area: 0 = Unable, 5 = Significant difficulty, 10 = Normal/pre-injury. Track changes weekly.');
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

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Daily Living & Self-Care Impact');
      y = drawInstruction(doc, y, 'Mark: Y = Independent, ~ = Needed help/modified, X = Unable.');
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
      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Mobility Aids / Assistive Devices Used', 3);

      // ────────────────────────────── PAGE 4: Treatment & Rehab ────────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Medical Appointments & Treatment');
      y = drawInstruction(doc, y, 'WCB evaluates treatment compliance heavily. Record every appointment and outcome.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Provider /\nClinic', 'Type\n(MD/Physio/\nSpecialist)', 'Treatment\nProvided', 'Pain Before\n(0-10)', 'Pain After\n(0-10)', 'Next Steps /\nPrescribed'],
        Array.from({ length: 8 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Medication Log');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Medication\nName', 'Dose', 'Time\nTaken', 'Relief %\n(0-100)', 'Duration\nof Relief', 'Side\nEffects'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Home Exercise / Rehabilitation Compliance');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Exercise 1:\n________', 'Exercise 2:\n________', 'Exercise 3:\n________', 'Duration\n(min)', 'Pain During\n(0-10)', 'Completed\nAll? (Y/N)'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      // ────────────────────────────── PAGE 5: Weekly Work Impact ────────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Weekly Work Impact Summary');
      y = drawInstruction(doc, y, 'Complete at end of each week. This documents the gap between capacity and job requirements.');
      y += 4;
      y = drawInputLine(doc, y, 'Week of:', 180);
      y = drawInputLine(doc, y, 'Work Days Attended (full duties):', 100);
      y = drawInputLine(doc, y, 'Work Days Attended (modified duties):', 100);
      y = drawInputLine(doc, y, 'Work Days Missed (injury-related):', 100);
      y = drawInputLine(doc, y, 'Hours Worked This Week:', 100);
      y = drawInputLine(doc, y, 'Normal Hours for This Position:', 100);
      y += 8;

      y = checkPage(doc, y, 60);
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLORS.dark);
      doc.text('Modified Duties Required:', 44, y); y += 16;
      for (let i = 1; i <= 4; i++) { y = drawInputLine(doc, y, i + '.', pw - 120); }
      y += 6;
      y = checkPage(doc, y, 60);
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLORS.dark);
      doc.text('Accommodations Provided by Employer:', 44, y); y += 16;
      for (let i = 1; i <= 3; i++) { y = drawInputLine(doc, y, i + '.', pw - 120); }
      y += 6;
      y = checkPage(doc, y, 150);
      y = notesBox(doc, y, 'Specific Work Tasks I Could Not Complete This Week', 4);
      y = checkPage(doc, y, 150);
      y = notesBox(doc, y, 'Return-to-Work Progress / Barriers', 4);

      // ────────────────────────────── PAGE 6: Monthly Summary ────────────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Monthly Summary — For WCB Case Manager Review');
      y = drawInstruction(doc, y, 'Complete at month-end. Bring to all WCB appointments and IMEs.');
      y += 4;
      y = drawInputLine(doc, y, 'Month / Year:', 200);
      y = drawInputLine(doc, y, 'WCB Claim Number:', 180);
      y += 6;

      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLORS.primaryDark);
      doc.text('Work Impact This Month', 44, y); y += 16;
      y = drawInputLine(doc, y, 'Total Work Days Missed:', 120);
      y = drawInputLine(doc, y, 'Days on Modified Duties:', 120);
      y = drawInputLine(doc, y, 'Days at Full Duties:', 120);
      y += 6;

      y = checkPage(doc, y, 80);
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLORS.primaryDark);
      doc.text('Pain Summary', 44, y); y += 16;
      y = drawInputLine(doc, y, 'Average Pain Level (0-10):', 100);
      y = drawInputLine(doc, y, 'Worst Pain Level This Month:', 100);
      y = drawInputLine(doc, y, 'Best Pain Level This Month:', 100);
      y = drawInputLine(doc, y, 'Pain Trend (improving / stable / worsening):', 140);
      y += 6;

      y = checkPage(doc, y, 80);
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLORS.primaryDark);
      doc.text('Treatment Compliance', 44, y); y += 16;
      y = drawInputLine(doc, y, 'MD Appointments Attended / Scheduled:', 160);
      y = drawInputLine(doc, y, 'Physio Sessions Attended / Scheduled:', 160);
      y = drawInputLine(doc, y, 'Home Exercise Compliance (%):', 120);
      y += 6;

      y = checkPage(doc, y, 70);
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLORS.primaryDark);
      doc.text('Functional Capacity Changes', 44, y); y += 16;
      y = drawInputLine(doc, y, 'Improved:', pw - 120);
      y = drawInputLine(doc, y, 'Unchanged:', pw - 120);
      y = drawInputLine(doc, y, 'Worsened:', pw - 120);
      y += 6;
      y = checkPage(doc, y, 100);
      y = notesBox(doc, y, 'Questions for Case Manager / Next Steps', 3);

      y = checkPage(doc, y, 70);
      doc.setFillColor(...COLORS.bg);
      doc.roundedRect(36, y, pw - 72, 36, 4, 4, 'F');
      doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLORS.light);
      doc.text('Disclaimer: Pain Tracker Pro is not affiliated with, endorsed by, or connected to WorkSafeBC. This template provides a documentation', 44, y + 12);
      doc.text('framework based on publicly available WCB evaluation criteria. It is not legal advice. Consult a workers\' compensation lawyer for claim-specific guidance.', 44, y + 24);
    },
  },

  {
    filename: 'disability-pain-journal-guide.pdf',
    title: 'Pain Journal for Disability Benefits',
    subtitle: 'Complete 6-page guide to building a pain journal that strengthens disability benefit applications — with program comparisons, entry structure, power phrases, and documentation templates.',
    badge: 'Benefits Guide',
    generate: (doc, y) => {
      const pw = doc.internal.pageSize.getWidth();

      // ────── PAGE 1: Strategy Guide ──────
      const sections = [
        ['Why Documentation Matters', 'Disability evaluators review hundreds of claims. Yours needs to stand out as credible and thorough. A systematic pain journal with daily entries demonstrates the persistent nature of your condition far better than medical records alone.'],
        ['What Evaluators Look For', '1) Consistency of reporting over weeks/months. 2) Specific functional limitations, not just pain numbers. 3) Evidence of treatment compliance. 4) Honest variability — good days and bad. 5) Impact on daily activities, self-care, and social function.'],
        ['Building Your Evidence Timeline', 'Start now. Track daily for minimum 30 days before filing. Continue throughout the process. Bring summaries to every medical appointment. Keep originals safe — submit copies only.'],
      ];
      for (const [heading, text] of sections) {
        y = checkPage(doc, y, 60);
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLORS.dark);
        doc.text(heading, 44, y); y += 16;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLORS.medium);
        const lines = doc.splitTextToSize(text, pw - 96);
        doc.text(lines, 52, y); y += lines.length * 13 + 14;
      }

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Benefits Program Comparison');
      y = dailyTrackingTable(doc, y,
        ['Program', 'Focus', 'Key Evidence Needed', 'Timeline'],
        [
          ['SSDI', 'Work history + medical', 'Treatment records, function limits', '5+ months wait'],
          ['SSI', 'Financial need + medical', 'Income proof, medical evidence', '3-5 months'],
          ['WorkSafeBC', 'Work injury connection', 'Injury-to-duty link, compliance', 'Varies by claim'],
          ['LTD Insurance', 'Policy definition', 'Own-occupation vs any-occupation proof', 'Per policy terms'],
        ]);

      // ────── PAGE 2: Power Phrases & Entry Structure ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Power Phrases — Weak vs. Strong Language');
      y = drawInstruction(doc, y, 'Disability evaluators respond to specific, functional, measurable language. Replace vague descriptions with these patterns.');
      y = dailyTrackingTable(doc, y,
        ['Weak (Avoid)', 'Strong (Use Instead)', 'Why It\'s Better'],
        [
          ['"Pain was bad today"', '"Pain 7/10 — unable to stand > 10 min"', 'Specific + measurable + functional'],
          ['"I couldn\'t do much"', '"Could not prepare meals, do laundry, or drive"', 'Names exact activities lost'],
          ['"Medication didn\'t help"', '"Gabapentin 300mg: pain reduced 5>4 for 3 hrs"', 'Shows partial response + duration'],
          ['"I was tired all day"', '"Rested 4 hours; still unable to walk to mailbox"', 'Quantifies rest + remaining limitation'],
          ['"My back hurt"', '"L4-L5 burning pain radiating to left calf"', 'Clinical language, specific location'],
        ]);

      y = checkPage(doc, y, 140);
      y = drawSectionHeading(doc, y, 'Daily Journal Entry Structure');
      y = drawInstruction(doc, y, 'Use this structure for every entry. Consistency in format demonstrates reliability.');
      const structure = [
        'MORNING: Pain level upon waking, stiffness duration, sleep quality, self-care status',
        'MIDDAY: Current pain, activities attempted, activities impossible, energy level',
        'EVENING: Peak pain today, total medications, function summary, what you needed help with',
        'WEEKLY: Average pain, worst/best days, treatment compliance, appointment outcomes',
      ];
      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLORS.dark);
      for (const item of structure) {
        y = checkPage(doc, y, 22);
        doc.setDrawColor(...COLORS.primary); doc.setLineWidth(0.5);
        doc.rect(52, y - 8, 10, 10);
        const lines = doc.splitTextToSize(item, pw - 120);
        doc.text(lines, 70, y); y += lines.length * 13 + 6;
      }

      // ────── PAGE 3: Daily Documentation Template ──────
      doc.addPage(); y = 40;
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);
      y = drawSectionHeading(doc, y, 'Daily Disability Journal Entry');
      y = drawInputLine(doc, y, 'Pain level (0-10):', 80);
      y = drawInputLine(doc, y, 'Activities I could NOT do today:', pw - 120);
      y = drawInputLine(doc, y, '', pw - 80);
      y = drawInputLine(doc, y, 'Activities I completed with difficulty:', pw - 120);
      y = drawInputLine(doc, y, '', pw - 80);
      y = drawInputLine(doc, y, 'Assistance needed from others:', pw - 120);
      y = drawInputLine(doc, y, 'Self-care limitations:', pw - 120);
      y = drawInputLine(doc, y, 'Medications & treatments today:', pw - 120);
      y = drawInputLine(doc, y, 'Hours spent resting/lying down:', 120);
      y = notesBox(doc, y, 'How pain affected my day (use measurable, specific terms)', 5);

      // ────── PAGE 4: Functional Assessment ──────
      y = standardFunctionalPage(doc, y, [
        'Walking (distance/time)',
        'Standing (minutes)',
        'Sitting (minutes)',
        'Lifting (lbs)',
        'Bending / stooping',
        'Reaching / overhead',
        'Gripping / fine motor',
        'Stairs',
        'Concentration / focus',
        'Driving (minutes)',
      ], {
        instruction: 'Rate each: 0 = Unable, 5 = Significant difficulty, 10 = Full capacity. Use strong language: "Unable to stand > 10 min" not "standing is hard."',
        selfCareItems: [
          ['Bathing (time needed)', '', '', '', '', '', '', ''],
          ['Dressing (with/without help)', '', '', '', '', '', '', ''],
          ['Meal preparation', '', '', '', '', '', '', ''],
          ['Cleaning (light vs. heavy)', '', '', '', '', '', '', ''],
          ['Errands (distance from home)', '', '', '', '', '', '', ''],
          ['Transportation (independent?)', '', '', '', '', '', '', ''],
          ['Hours of rest required', '', '', '', '', '', '', ''],
        ],
        notesPrompt: 'Comparison: What I Could Do Before vs. Now',
      });

      // ────── PAGE 5: Medication & Treatment ──────
      y = standardMedicationPage(doc, y, {
        medInstruction: 'Track every medication. Benefits programs verify treatment compliance. Include medications that failed or caused side effects — this strengthens your claim.',
        nonMedInstruction: 'Track every appointment, therapy session, and intervention. Document attendance and outcome. Show you are actively pursuing treatment.',
        summaryInstruction: 'Rate each treatment weekly. Benefits evaluators look for consistent, documented effort and treatment compliance over time.',
      });

      // ────── PAGE 6: Weekly Summary ──────
      y = standardSummaryPage(doc, y, 'Disability Benefits', [
        { label: 'Days unable to leave home:', width: 120 },
        { label: 'Help received from others (hours):', width: 120 },
      ], {
        instruction: 'Complete weekly. Use specific, measurable language. Compare to pre-condition capacity. This is what evaluators read.',
        patternPrompts: [
          { label: 'Functional limitations (specific examples):' },
          { label: 'Help required from others (who, what, how long):' },
          { label: 'Activities I can no longer do:' },
          { label: 'Treatment compliance this week:' },
        ],
        notesPrompt: 'Before vs. After Comparison for Evaluator Review',
      });
    },
  },

  {
    filename: 'daily-functioning-log.pdf',
    title: 'Daily Functioning Log for Disability',
    subtitle: 'Comprehensive 6-page functional capacity log designed for disability evaluators — with capacity scales, daily timelines, and self-care impact tracking.',
    badge: 'Disability',
    generate: (doc, y) => {
      const pw = doc.internal.pageSize.getWidth();

      // ────── PAGE 1: Functioning Assessment ──────
      y = drawDateNameBlock(doc, y);
      y = drawSectionHeading(doc, y, 'Daily Functioning Assessment');
      y = drawInstruction(doc, y, 'Rate each area: Y = No difficulty | ~ = Some difficulty | X = Unable | N/A = Not attempted. Complete every day.');
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

      y = checkPage(doc, y, 150);
      y = drawSectionHeading(doc, y, 'Assistance Required');
      y = drawInputLine(doc, y, 'Help received from:', 200);
      y = drawInputLine(doc, y, 'Tasks they helped with:', pw - 120);
      y = notesBox(doc, y, 'Additional Limitations & Notes', 4);

      // ────── PAGE 2: Capacity Scale Detail ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Functional Capacity Rating Scale (0-5)');
      y = drawInstruction(doc, y, 'Use this scale for the detailed assessment on the next page. Evaluators need to see the range of your limitations.');
      y = dailyTrackingTable(doc, y,
        ['Rating', 'Meaning', 'Example'],
        [
          ['0', 'Unable — cannot perform at all', 'Cannot walk to bathroom without assistance'],
          ['1', 'Severe difficulty — needs help', 'Can dress upper body only; needs help with lower'],
          ['2', 'Significant difficulty — very limited', 'Can stand for 5 minutes; must sit after'],
          ['3', 'Moderate difficulty — restricted', 'Can prepare simple meals; cannot cook full meal'],
          ['4', 'Mild difficulty — mostly capable', 'Can walk 15 min with one rest break'],
          ['5', 'No difficulty — full capacity', 'Can perform activity without limitation'],
        ]);

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Detailed Capacity Assessment (Rate 0-5)');
      y = dailyTrackingTable(doc, y,
        ['Domain', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [
          ['Self-care (bathing, dressing)', '', '', '', '', '', '', ''],
          ['Meal preparation', '', '', '', '', '', '', ''],
          ['Household tasks', '', '', '', '', '', '', ''],
          ['Walking / mobility', '', '', '', '', '', '', ''],
          ['Physical tasks (lifting, carrying)', '', '', '', '', '', '', ''],
          ['Driving / transportation', '', '', '', '', '', '', ''],
          ['Cognitive (focus, memory)', '', '', '', '', '', '', ''],
          ['Social (leaving house, interacting)', '', '', '', '', '', '', ''],
        ]);

      // ────── PAGE 3: Daily Timeline ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Daily Activity Timeline');
      y = drawInstruction(doc, y, 'Document what you did at each time period. Include rest periods — evaluators need to see total functional hours vs rest hours.');
      y = dailyTrackingTable(doc, y,
        ['Time', 'Activity / Status', 'Pain\n(0-10)', 'Capacity\n(0-5)', 'Help\nNeeded?'],
        [
          ['7-8 AM', '', '', '', ''],
          ['8-9 AM', '', '', '', ''],
          ['9-10 AM', '', '', '', ''],
          ['10-11 AM', '', '', '', ''],
          ['11-12 PM', '', '', '', ''],
          ['12-1 PM', '', '', '', ''],
          ['1-2 PM', '', '', '', ''],
          ['2-3 PM', '', '', '', ''],
          ['3-4 PM', '', '', '', ''],
          ['4-5 PM', '', '', '', ''],
          ['5-6 PM', '', '', '', ''],
          ['6-8 PM', '', '', '', ''],
          ['8-10 PM', '', '', '', ''],
        ]);

      y = checkPage(doc, y, 60);
      y = drawInputLine(doc, y, 'Total active hours today:', 100);
      y = drawInputLine(doc, y, 'Total resting/lying down hours:', 100);

      // ────── PAGE 4: Medication & Treatment ──────
      y = standardMedicationPage(doc, y, {
        medInstruction: 'Track all medications including timing relative to activities. Evaluators need to see that medication enables (or fails to enable) daily functioning.',
        nonMedInstruction: 'Track every intervention: physio, OT, assistive devices, home modifications. Document what you tried, how long, and the functional result.',
        summaryInstruction: 'Rate each treatment: 1 = No functional improvement, 3 = Moderate, 5 = Significant. Focus on what treatments let you DO, not just pain reduction.',
      });

      // ────── PAGE 5: Functional Impact ──────
      y = standardFunctionalPage(doc, y, [
        'Walking (distance before stopping)',
        'Standing (minutes)',
        'Sitting (minutes)',
        'Lifting (max lbs)',
        'Bending / stooping',
        'Reaching / overhead',
        'Fine motor / gripping',
        'Stair climbing',
        'Concentration (minutes)',
        'Driving (minutes)',
      ], {
        instruction: 'Rate 0 = Unable to 10 = Full capacity. Evaluators compare this to your 0-5 capacity scale on Page 2. Be consistent with both.',
        selfCareItems: [
          ['Bathing (time + aids)', '', '', '', '', '', '', ''],
          ['Dressing independently', '', '', '', '', '', '', ''],
          ['Cooking a full meal', '', '', '', '', '', '', ''],
          ['Cleaning (type + duration)', '', '', '', '', '', '', ''],
          ['Shopping (walking + carrying)', '', '', '', '', '', '', ''],
          ['Using public transit', '', '', '', '', '', '', ''],
          ['Total active vs. resting hours', '', '', '', '', '', '', ''],
        ],
        notesPrompt: 'Assistive Devices Used & Environmental Modifications Needed',
      });

      // ────── PAGE 6: Weekly Summary ──────
      y = standardSummaryPage(doc, y, 'Functioning Log', [
        { label: 'Days housebound this week:', width: 120 },
        { label: 'Help received from others (hours):', width: 140 },
        { label: 'Average capacity rating (0-5):', width: 120 },
      ], {
        instruction: 'This summary page cross-references your hourly timeline and capacity scores. Evaluators will compare week-over-week trends.',
        patternPrompts: [
          { label: 'Most difficult times of day:' },
          { label: 'Activities requiring assistance:' },
          { label: 'Capacity score trend (improving/declining/stable):' },
          { label: 'Barriers to independence this week:' },
        ],
        notesPrompt: 'Week-Over-Week Functional Changes for Evaluator',
      });
    },
  },

  // ── Tier 4: Condition-Specific (Enhanced 6-Page PDFs) ──────────────────────

  {
    filename: 'fibromyalgia-pain-diary.pdf',
    title: 'Fibromyalgia Pain Diary',
    subtitle: 'Comprehensive 6-page fibromyalgia tracking template — pain, fatigue, brain fog, sleep, stiffness, flare triggers, medication response, and weekly summaries for rheumatology review.',
    badge: 'Fibromyalgia',
    generate: (doc, y) => {
      // ────── PAGE 1: Core Symptoms ──────
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Core Fibromyalgia Symptom Log');
      y = drawInstruction(doc, y, 'Track the cardinal fibro symptoms daily. Rate each 0-10. These 7 symptoms are what rheumatologists evaluate for diagnosis and treatment response.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Pain\n(0-10)', 'Fatigue\n(0-10)', 'Brain Fog\n(0-10)', 'Sleep\nQuality\n(1-5)', 'Stiffness\n(0-10)', 'Headache\n(0-10)', 'Mood\n(1-5)'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Pain Location Map');
      y = drawInstruction(doc, y, 'Rate pain 0-10 for each area. Widespread pain (4+ quadrants) is key to fibro diagnosis (ACR criteria).');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Neck\n/Jaw', 'Shoulders', 'Upper\nBack', 'Lower\nBack', 'Hips', 'Arms\n/Hands', 'Legs\n/Feet'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      // ────── PAGE 2: Flare & Trigger Tracking ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Fibromyalgia Flare Tracker');
      y = drawInstruction(doc, y, 'When pain exceeds your baseline by 2+ points, document the flare. Tracking onset, duration, and suspected triggers reveals your personal flare pattern.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Flare\nStart', 'Peak\nPain', 'Duration', 'Suspected\nTrigger', 'Treatment\nUsed', 'Recovery\nTime'],
        Array.from({ length: 6 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Trigger Identification Matrix');
      y = drawInstruction(doc, y, 'Check triggers present each day. After 2+ weeks, compare trigger days vs. stable days to find your patterns.');
      y = dailyTrackingTable(doc, y,
        ['Trigger', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [
          ['Over-exertion / boom-bust', '', '', '', '', '', '', ''],
          ['Poor sleep (< 5 hrs)', '', '', '', '', '', '', ''],
          ['High stress / emotional', '', '', '', '', '', '', ''],
          ['Weather / barometric change', '', '', '', '', '', '', ''],
          ['Illness / infection', '', '', '', '', '', '', ''],
          ['Hormonal (cycle day: ___)', '', '', '', '', '', '', ''],
          ['Diet (item: _________)', '', '', '', '', '', '', ''],
          ['Temperature extreme', '', '', '', '', '', '', ''],
          ['_________________', '', '', '', '', '', '', ''],
        ]);

      // ────── PAGE 3: Cognitive & Sleep ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Fibro Fog — Cognitive Symptom Tracker');
      y = drawInstruction(doc, y, 'Cognitive dysfunction is a core fibro symptom. Track daily to show your doctor the pattern.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Word\nFinding', 'Short-term\nMemory', 'Concentration\n(min before\nloss)', 'Confusion\nEpisodes', 'Multi-\ntasking\nAbility', 'Overall\nFog (0-10)'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Sleep Quality Tracker');
      y = drawInstruction(doc, y, 'Non-restorative sleep is central to fibromyalgia. Your doctor needs this data for medication decisions.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Bedtime', 'Wake\nTime', 'Hours\nSlept', 'Times\nWoken', 'Refreshed?\n(1-5)', 'AM\nStiffness\n(min)', 'Sleep\nMeds?'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      // ────── PAGE 4: Medication & Treatment ──────
      y = standardMedicationPage(doc, y, {
        medInstruction: 'Fibromyalgia often requires multiple medication classes (pain modulators, sleep aids, SNRIs). Track each separately — dose timing and combinations matter.',
        nonMedInstruction: 'Track hydrotherapy, gentle yoga, CBT, graded exercise therapy, and pacing strategies. These are first-line fibro treatments per ACR guidelines.',
        summaryInstruction: 'Rate each treatment weekly. Fibromyalgia responds slowly — track 4-8 weeks before judging effectiveness. Note energy and fog impact, not just pain.',
      });

      // ────── PAGE 5: Functional Assessment ──────
      y = standardFunctionalPage(doc, y, [
        'Walking (blocks/minutes)',
        'Standing (minutes)',
        'Sitting tolerance',
        'Lifting (lbs)',
        'Housework tolerance',
        'Cognitive work (minutes)',
        'Exercise tolerance',
        'Social energy',
        'Driving',
        'Self-care (bathing, dressing)',
      ], {
        selfCareItems: [
          ['Bathing (hot/cold tolerance)', '', '', '', '', '', '', ''],
          ['Dressing (buttons, zippers)', '', '', '', '', '', '', ''],
          ['Meal prep (standing tolerance)', '', '', '', '', '', '', ''],
          ['Light housework (pacing)', '', '', '', '', '', '', ''],
          ['Grocery shopping (walking + carrying)', '', '', '', '', '', '', ''],
          ['Driving (concentration + vibration)', '', '', '', '', '', '', ''],
          ['Sleep quality (1-5)', '', '', '', '', '', '', ''],
        ],
        notesPrompt: 'Flare Triggers, Energy Crashes & Pacing Strategies That Helped',
      });

      // ────── PAGE 6: Weekly Summary ──────
      y = standardSummaryPage(doc, y, 'Fibromyalgia', [
        { label: 'Flare count this week:', width: 100 },
        { label: 'Average fatigue (0-10):', width: 100 },
        { label: 'Average brain fog (0-10):', width: 100 },
        { label: 'Morning stiffness avg (min):', width: 100 },
      ], {
        patternPrompts: [
          { label: 'Flare triggers identified:' },
          { label: 'Best time of day for activity:' },
          { label: 'Activities that caused post-exertional flares:' },
          { label: 'Sleep interventions tried + result:' },
        ],
        notesPrompt: 'Patterns in Fatigue, Fog & Pain Cycles',
      });
    },
  },

  {
    filename: 'chronic-back-pain-diary.pdf',
    title: 'Chronic Back Pain Diary',
    subtitle: 'Comprehensive 6-page back pain tracking template with spine region mapping, posture/activity impact, red flag monitoring, treatment response, and spine-specialist-ready summaries.',
    badge: 'Back Pain',
    generate: (doc, y) => {
      // ────── PAGE 1: Spine Pain Log ──────
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Daily Back Pain Log');
      y = drawInstruction(doc, y, 'Location: C=Cervical (neck), T=Thoracic (mid), L=Lumbar (low), S=Sacral. Radiation: note if pain travels to arm/leg.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Pain\n(0-10)', 'Location\n(C/T/L/S)', 'Radiation?\n(arm/leg)', 'Stiffness\n(0-10)', 'Quality\n(ache/sharp/\nburning)', 'Worse\nTime', 'AM Stiff\n(min)'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Activity & Position Impact');
      y = drawInstruction(doc, y, 'Rate tolerance: minutes before pain increases OR impact rating (0=fine, 5=unbearable). Patterns here guide physical therapy.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Sitting\n(min)', 'Standing\n(min)', 'Walking\n(min)', 'Bending', 'Lifting\n(max lbs)', 'Lying\nDown', 'Driving\n(min)'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      // ────── PAGE 2: Red Flags & Nerve Symptoms ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Red Flag Symptom Monitor');
      y = drawInstruction(doc, y, 'If ANY of these appear or worsen suddenly, contact your doctor immediately. Mark Y/N daily.');
      y = dailyTrackingTable(doc, y,
        ['Red Flag', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [
          ['Numbness in legs/feet', '', '', '', '', '', '', ''],
          ['Weakness in legs', '', '', '', '', '', '', ''],
          ['Bladder changes', '', '', '', '', '', '', ''],
          ['Bowel changes', '', '', '', '', '', '', ''],
          ['Saddle area numbness', '', '', '', '', '', '', ''],
          ['Progressive weakness', '', '', '', '', '', '', ''],
          ['Fever with back pain', '', '', '', '', '', '', ''],
          ['Unexplained weight loss', '', '', '', '', '', '', ''],
        ]);

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Nerve Symptom Tracking (Sciatica/Radiculopathy)');
      y = drawInstruction(doc, y, 'If pain radiates to arm or leg, track these symptoms. They help differentiate mechanical vs. nerve involvement.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Leg/Arm\nAffected', 'Numbness\n(0-10)', 'Tingling\n(0-10)', 'Weakness\n(0-10)', 'How Far\nIt Travels', 'Worse\nWith'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      // ────── PAGE 3: Exercise & Posture ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Exercise & Movement Log');
      y = drawInstruction(doc, y, 'Track prescribed exercises and general activity. Movement patterns directly affect back pain — your physio needs this.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Exercise /\nActivity', 'Duration\n(min)', 'Pain Before\n(0-10)', 'Pain After\n(0-10)', 'Pain Next\nDay', 'Physio\nExercises\nDone?'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 130);
      y = drawSectionHeading(doc, y, 'Posture & Ergonomics Checklist');
      y = drawInstruction(doc, y, 'Check items you maintained today. Good posture habits reduce flare frequency — track to build awareness.');
      const postureItems = [
        'Desk/chair ergonomics maintained', 'Regular position changes (every 30 min)',
        'Proper lifting technique used', 'Supportive footwear worn',
        'Core engagement exercises done', 'Sleeping position supported (pillow between knees etc.)',
        'Stretching breaks taken', 'Heat/cold applied proactively',
      ];
      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLORS.dark);
      for (const item of postureItems) {
        y = checkPage(doc, y, 16);
        doc.setDrawColor(...COLORS.light); doc.setLineWidth(0.5);
        doc.rect(52, y - 8, 10, 10);
        doc.text(item, 70, y); y += 16;
      }

      // ────── PAGE 4: Medication & Treatment ──────
      y = standardMedicationPage(doc, y, {
        medInstruction: 'Track all spine-related medications including NSAIDs, muscle relaxants, nerve pain meds, and injections. Note posture or position when taking medication.',
        nonMedInstruction: 'Track physiotherapy exercises, heat/ice, TENS, traction, inversion, core strengthening, and ergonomic changes. Spine specialists prioritize these.',
        summaryInstruction: 'Rate each treatment weekly. Note which positions or activities each treatment helps. Spine-specific relief patterns guide surgical vs. conservative decisions.',
      });

      // ────── PAGE 5: Functional Assessment ──────
      y = standardFunctionalPage(doc, y, [
        'Sitting tolerance (min)',
        'Standing tolerance (min)',
        'Walking distance',
        'Bending / stooping',
        'Lifting capacity (lbs)',
        'Stair climbing',
        'Driving tolerance (min)',
        'Desk work / computer',
        'Household chores',
        'Exercise / activity',
      ], {
        selfCareItems: [
          ['Getting out of bed', '', '', '', '', '', '', ''],
          ['Bending to dress lower body', '', '', '', '', '', '', ''],
          ['Toilet use (sitting/standing)', '', '', '', '', '', '', ''],
          ['Meal prep (standing at counter)', '', '', '', '', '', '', ''],
          ['Vacuuming / mopping', '', '', '', '', '', '', ''],
          ['Driving (vibration + posture)', '', '', '', '', '', '', ''],
          ['Sleep position comfort (1-5)', '', '', '', '', '', '', ''],
        ],
        notesPrompt: 'Position Changes, Ergonomic Aids & Movement Strategies',
      });

      // ────── PAGE 6: Weekly Summary ──────
      y = standardSummaryPage(doc, y, 'Back Pain', [
        { label: 'Nerve symptoms present?:', width: 120 },
        { label: 'Physio exercises completed (out of 7 days):', width: 120 },
        { label: 'Red flag symptoms noted?:', width: 120 },
      ], {
        patternPrompts: [
          { label: 'Positions/activities that made pain worse:' },
          { label: 'Positions/activities that gave relief:' },
          { label: 'Nerve symptoms pattern (worse when?):' },
          { label: 'Exercise/PT compliance and effect:' },
        ],
        notesPrompt: 'Posture Observations & Spine-Specific Concerns',
      });
    },
  },

  {
    filename: 'arthritis-pain-tracker.pdf',
    title: 'Arthritis Pain Tracker',
    subtitle: 'Comprehensive 6-page arthritis tracking template — joint pain, morning stiffness, swelling, mobility, disease activity, medication response, and rheumatology-ready summaries.',
    badge: 'Arthritis',
    generate: (doc, y) => {
      // ────── PAGE 1: Joint Pain & Stiffness ──────
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Pain & Morning Stiffness Log');
      y = drawInstruction(doc, y, 'AM stiffness > 30 min suggests inflammatory arthritis (RA). Track exact duration every morning — this is a key diagnostic indicator.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'AM Stiffness\n(min)', 'Overall\nPain (0-10)', 'Joints\nAffected\n(count)', 'Swelling?\n(Y/N)', 'Warmth?\n(Y/N)', 'Function\n(0-10)'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Joint-by-Joint Tracking');
      y = drawInstruction(doc, y, 'Rate pain 0-10 for each affected joint. Mark S for swelling, W for warmth. Leave blank if not affected.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Hands /\nFingers', 'Wrists', 'Elbows', 'Shoulders', 'Knees', 'Ankles', 'Feet /\nToes'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      // ────── PAGE 2: Disease Activity & Flares ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Disease Activity Assessment');
      y = drawInstruction(doc, y, 'Track these weekly — they mirror the components rheumatologists use to calculate disease activity scores (DAS28).');
      y = dailyTrackingTable(doc, y,
        ['Week', 'Tender\nJoint\nCount', 'Swollen\nJoint\nCount', 'Patient\nGlobal\n(0-10)', 'AM Stiff\nAvg (min)', 'Fatigue\n(0-10)', 'CRP/ESR\n(if known)'],
        Array.from({ length: 5 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Flare Documentation');
      y = drawInstruction(doc, y, 'Document each flare episode. Flare patterns help your rheumatologist adjust treatment.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Flare\nStart', 'Peak\nPain', 'Duration', 'Joints\nInvolved', 'Trigger?', 'Treatment\nUsed'],
        Array.from({ length: 6 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Functional Impact');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Grip\nStrength', 'Stairs', 'Buttons /\nZippers', 'Jar\nOpening', 'Walking', 'Writing /\nTyping'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      // ────── PAGE 3: Triggers & Environmental ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Trigger & Environmental Tracking');
      y = drawInstruction(doc, y, 'Check factors present each day. Weather, activity, and stress are common arthritis triggers.');
      y = dailyTrackingTable(doc, y,
        ['Factor', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [
          ['Cold / damp weather', '', '', '', '', '', '', ''],
          ['Barometric pressure drop', '', '', '', '', '', '', ''],
          ['Over-use of joints', '', '', '', '', '', '', ''],
          ['Under-activity / stiffness', '', '', '', '', '', '', ''],
          ['High stress', '', '', '', '', '', '', ''],
          ['Poor sleep', '', '', '', '', '', '', ''],
          ['Illness / infection', '', '', '', '', '', '', ''],
          ['Dietary factor: ______', '', '', '', '', '', '', ''],
        ]);

      y = checkPage(doc, y, 100);
      y = notesBox(doc, y, 'Observations & Patterns', 4);

      // ────── PAGE 4: Medication & Treatment ──────
      y = standardMedicationPage(doc, y, {
        medInstruction: 'Track DMARDs, biologics, NSAIDs, and corticosteroids separately. Note injection dates for biologics. Rheumatologists need precise dosing timelines.',
        nonMedInstruction: 'Track joint protection techniques, paraffin wax baths, compression gloves, splints, OT exercises, and cold/heat therapy for specific joints.',
        summaryInstruction: 'Rate each treatment weekly. For DMARDs/biologics, track over 8-12 weeks. Note which joints respond and which do not.',
      });

      // ────── PAGE 5: Functional Assessment ──────
      y = standardFunctionalPage(doc, y, [
        'Hand grip / fine motor',
        'Walking distance',
        'Stair climbing',
        'Reaching / overhead',
        'Dressing (buttons, zippers)',
        'Opening jars / containers',
        'Writing / typing',
        'Standing from chair',
        'Carrying objects',
        'Exercise tolerance',
      ], {
        selfCareItems: [
          ['Turning door handles/taps', '', '', '', '', '', '', ''],
          ['Buttoning/zipping clothes', '', '', '', '', '', '', ''],
          ['Cutting food / cooking', '', '', '', '', '', '', ''],
          ['Wringing cloths / cleaning', '', '', '', '', '', '', ''],
          ['Carrying shopping bags', '', '', '', '', '', '', ''],
          ['Turning steering wheel', '', '', '', '', '', '', ''],
          ['Sleep (joint positioning)', '', '', '', '', '', '', ''],
        ],
        notesPrompt: 'Joint Protection Strategies & Adaptive Equipment Used',
      });

      // ────── PAGE 6: Weekly Summary ──────
      y = standardSummaryPage(doc, y, 'Arthritis', [
        { label: 'Avg morning stiffness (min):', width: 120 },
        { label: 'Tender joint count:', width: 100 },
        { label: 'Swollen joint count:', width: 100 },
      ], {
        patternPrompts: [
          { label: 'Worst joints this week:' },
          { label: 'New joints affected or resolved:' },
          { label: 'Weather/barometric correlation noticed:' },
          { label: 'Stiffness pattern (morning vs. throughout day):' },
        ],
        notesPrompt: 'Joint-Specific Changes & Rheumatology Questions',
      });
    },
  },

  {
    filename: 'nerve-pain-symptom-log.pdf',
    title: 'Nerve Pain Symptom Log',
    subtitle: 'Comprehensive 6-page nerve pain tracking template — burning, tingling, numbness, shooting pain, sensation changes, progression mapping, and neurologist-ready summaries.',
    badge: 'Nerve Pain',
    generate: (doc, y) => {
      // ────── PAGE 1: Core Nerve Symptoms ──────
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Nerve Pain Symptom Log');
      y = drawInstruction(doc, y, 'Track specific nerve pain types: B=Burning, T=Tingling, N=Numbness, S=Shooting, E=Electric shock. Quality descriptors help neurologists localize the problem.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Pain\n(0-10)', 'Type\n(B/T/N/S/E)', 'Location', 'Duration', 'Trigger', 'Medication\nUsed', 'Relief\n(0-10)'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Sensation Changes');
      y = drawInstruction(doc, y, 'Rate each 0-10 or check when present. Progressive changes require urgent neurological attention.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Numbness\nAreas', 'Tingling\nAreas', 'Weakness', 'Balance\n(1-5)', 'Temp.\nSens.', 'Touch\nSens.'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      // ────── PAGE 2: Progression & Pattern ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Symptom Progression Map');
      y = drawInstruction(doc, y, 'Track which body areas are affected. Peripheral neuropathy typically progresses feet>legs>hands>arms (stocking-glove). Asymmetric patterns suggest different causes.');
      y = dailyTrackingTable(doc, y,
        ['Area', 'Week 1\n(0-10)', 'Week 2\n(0-10)', 'Week 3\n(0-10)', 'Week 4\n(0-10)', 'Trend\n(Up/Flat/Dn)', 'Symmetrical?'],
        [
          ['Toes / feet', '', '', '', '', '', ''],
          ['Ankles / lower legs', '', '', '', '', '', ''],
          ['Knees / upper legs', '', '', '', '', '', ''],
          ['Fingers / hands', '', '', '', '', '', ''],
          ['Wrists / forearms', '', '', '', '', '', ''],
          ['Face / scalp', '', '', '', '', '', ''],
          ['Trunk / torso', '', '', '', '', '', ''],
        ]);

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Daily Pattern Analysis');
      y = drawInstruction(doc, y, 'When is nerve pain worst? Time-of-day patterns help differentiate causes and optimize medication timing.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Morning\n(0-10)', 'Afternoon\n(0-10)', 'Evening\n(0-10)', 'Night\n(0-10)', 'Worst\nTime', 'Worst\nActivity'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      // ────── PAGE 3: Causes & Contributing Factors ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Contributing Factor Tracking');
      y = drawInstruction(doc, y, 'Many nerve pain conditions have modifiable factors. Track to help your neurologist advise lifestyle changes.');
      y = dailyTrackingTable(doc, y,
        ['Factor', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [
          ['Blood sugar (if diabetic)', '', '', '', '', '', '', ''],
          ['Alcohol consumption', '', '', '', '', '', '', ''],
          ['B12/vitamin intake', '', '', '', '', '', '', ''],
          ['Repetitive motion', '', '', '', '', '', '', ''],
          ['Prolonged pressure', '', '', '', '', '', '', ''],
          ['Cold exposure', '', '', '', '', '', '', ''],
          ['Stress level (0-10)', '', '', '', '', '', '', ''],
          ['Exercise done?', '', '', '', '', '', '', ''],
        ]);

      y = checkPage(doc, y, 100);
      y = notesBox(doc, y, 'Observations & Questions for Neurologist', 5);

      // ────── PAGE 4: Medication & Treatment ──────
      y = standardMedicationPage(doc, y, {
        medInstruction: 'Track nerve pain medications (gabapentin, pregabalin, duloxetine, amitriptyline) with precise dosing. Note titration schedule and breakthrough pain episodes.',
        nonMedInstruction: 'Track TENS placement and settings, nerve glides/flossing exercises, desensitization therapy, mirror therapy, and thermal contrast baths.',
        summaryInstruction: 'Rate each treatment weekly. Nerve pain medications often need 2-4 weeks at therapeutic dose. Track side effects separately from pain relief.',
      });

      // ────── PAGE 5: Functional Assessment ──────
      y = standardFunctionalPage(doc, y, [
        'Walking / balance',
        'Fine motor (buttons, writing)',
        'Gripping / holding objects',
        'Standing stability',
        'Driving (foot control)',
        'Keyboard / touchscreen use',
        'Temperature discrimination',
        'Sleep quality',
        'Exercise tolerance',
        'Stair climbing',
      ], {
        instruction: 'Rate each activity: 0 = Unable, 5 = Significant difficulty, 10 = Full capacity. Note which activities trigger nerve symptoms (burning, shooting, numbness).',
        selfCareItems: [
          ['Showering (water temp tolerance)', '', '', '', '', '', '', ''],
          ['Dressing (fastening, texture)', '', '', '', '', '', '', ''],
          ['Meal prep (gripping, cutting)', '', '', '', '', '', '', ''],
          ['Floor cleaning (balance)', '', '', '', '', '', '', ''],
          ['Walking on uneven surfaces', '', '', '', '', '', '', ''],
          ['Driving (pedal sensitivity)', '', '', '', '', '', '', ''],
          ['Sleep (position, nerve pain)', '', '', '', '', '', '', ''],
        ],
        notesPrompt: 'Nerve-Specific Triggers & Protective Strategies',
      });

      // ────── PAGE 6: Weekly Summary ──────
      y = standardSummaryPage(doc, y, 'Nerve Pain', [
        { label: 'Progression noted? (Y/N):', width: 120 },
        { label: 'New areas affected?:', width: 200 },
        { label: 'Balance problems (count):', width: 100 },
      ], {
        patternPrompts: [
          { label: 'Time-of-day pattern (when worst):' },
          { label: 'Positions/activities that provoke symptoms:' },
          { label: 'New or changed sensation areas:' },
          { label: 'Medication side effects vs. nerve symptoms:' },
        ],
        notesPrompt: 'Nerve Pain Progression & Neurologist Questions',
      });
    },
  },

  {
    filename: 'endometriosis-pain-log.pdf',
    title: 'Endometriosis Pain Log',
    subtitle: 'Comprehensive 6-page endo tracking template — cycle-mapped pain, GI symptoms, bladder issues, fatigue, medication response, and gynecologist-ready summaries.',
    badge: 'Endo Tracker',
    generate: (doc, y) => {
      // ────── PAGE 1: Cycle & Core Symptoms ──────
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Cycle & Pain Tracking');
      y = drawInstruction(doc, y, 'Cycle Day 1 = first day of period. Track pain and symptoms throughout your ENTIRE cycle — endo symptoms often occur outside menstruation.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Cycle\nDay', 'Pain\n(0-10)', 'Pelvic\nPain', 'Back\nPain', 'Bloating\n(0-10)', 'GI Issues\n(0-10)', 'Fatigue\n(0-10)'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Endo-Specific Symptom Tracking');
      y = drawInstruction(doc, y, 'Rate each 0-10 or mark present (Y). These symptoms distinguish endo from primary dysmenorrhea.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Pain w/\nPeriods', 'Pain w/\nSex', 'Pain w/\nBowel', 'Bladder\nPain', 'Heavy\nBleeding', 'Spotting', 'Mood\n(1-5)'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      // ────── PAGE 2: GI & Bladder Detail ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'GI Symptom Detail (Endo-Related)');
      y = drawInstruction(doc, y, 'Endometriosis commonly affects the bowel. Track GI symptoms with cycle day — patterns help differentiate endo from IBS.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Cycle\nDay', 'Bloating', 'Constipation', 'Diarrhea', 'Nausea', 'Pain w/\nBowel\nMovement', 'Rectal\nBleeding'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Bladder & Urinary Symptoms');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Cycle\nDay', 'Urgency', 'Frequency', 'Pain w/\nUrination', 'Burning', 'Blood in\nUrine'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Energy & Fatigue Tracking');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Cycle\nDay', 'Energy\n(0-10)', 'Hours\nResting', 'Could\nExercise?', 'Work/\nSchool\nAbsence?', 'Sleep\nQual (1-5)'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      // ────── PAGE 3: Cycle Phase Analysis ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Full Cycle Symptom Map');
      y = drawInstruction(doc, y, 'Track for 2-3 complete cycles. The pattern across all phases helps your gynecologist localize endo involvement.');
      y = dailyTrackingTable(doc, y,
        ['Phase', 'Cycle\nDays', 'Avg\nPain', 'Worst\nSymptom', 'GI\nIssues?', 'Bladder\nIssues?', 'Function\nImpact'],
        [
          ['Menstrual', '1-5', '', '', '', '', ''],
          ['Follicular', '6-13', '', '', '', '', ''],
          ['Ovulation', '14-16', '', '', '', '', ''],
          ['Luteal (early)', '17-21', '', '', '', '', ''],
          ['Luteal (late)', '22-28+', '', '', '', '', ''],
        ]);

      y = checkPage(doc, y, 100);
      y = notesBox(doc, y, 'Cycle Observations & Patterns', 4);

      // ────── PAGE 4: Medication & Treatment ──────
      y = standardMedicationPage(doc, y, {
        medInstruction: 'Track hormonal treatments (GnRH agonists, oral contraceptives, progestins), pain medications, and GI medications separately. Note cycle day for each entry.',
        nonMedInstruction: 'Track heat therapy, pelvic floor physio, TENS for pelvic pain, dietary changes (low-FODMAP, anti-inflammatory), and acupuncture.',
        summaryInstruction: 'Rate each treatment by cycle phase. Endo treatments often work differently in different phases. Track 2-3 complete cycles before judging hormonal treatments.',
      });

      // ────── PAGE 5: Functional Assessment ──────
      y = standardFunctionalPage(doc, y, [
        'Work / school attendance',
        'Standing tolerance',
        'Walking tolerance',
        'Exercise ability',
        'Sexual activity impact',
        'Social activities',
        'Household tasks',
        'Concentration / focus',
        'Driving',
        'Self-care',
      ], {
        instruction: 'Rate each activity: 0 = Unable, 5 = Significant difficulty, 10 = Full capacity. Note your cycle day — function often varies by cycle phase.',
        selfCareItems: [
          ['Showering / bathing', '', '', '', '', '', '', ''],
          ['Dressing (abdominal comfort)', '', '', '', '', '', '', ''],
          ['Meal prep (standing + GI tolerance)', '', '', '', '', '', '', ''],
          ['Housework (bending, lifting)', '', '', '', '', '', '', ''],
          ['Grocery shopping / errands', '', '', '', '', '', '', ''],
          ['Intimate relationships', '', '', '', '', '', '', ''],
          ['Sleep quality (1-5)', '', '', '', '', '', '', ''],
        ],
        notesPrompt: 'Cycle-Phase Patterns & Accommodations Needed',
      });

      // ────── PAGE 6: Weekly Summary ──────
      y = standardSummaryPage(doc, y, 'Endometriosis', [
        { label: 'Cycle day range this week:', width: 140 },
        { label: 'Period days this week:', width: 100 },
        { label: 'GI symptom days:', width: 100 },
        { label: 'Days missed work/school:', width: 120 },
      ], {
        patternPrompts: [
          { label: 'Worst cycle days and why:' },
          { label: 'GI symptoms correlation with cycle:' },
          { label: 'Hormonal treatment response this cycle:' },
          { label: 'Activities that worsened or helped pelvic pain:' },
        ],
        notesPrompt: 'Cycle Observations & Gynecologist Questions',
      });
    },
  },

  {
    filename: 'crps-pain-diary.pdf',
    title: 'CRPS Pain Diary Template',
    subtitle: 'Comprehensive 6-page CRPS tracking template — burning pain, sensory changes, autonomic symptoms, motor dysfunction, limb comparison, and pain-specialist-ready summaries.',
    badge: 'CRPS',
    generate: (doc, y) => {
      // ────── PAGE 1: Core CRPS Symptoms ──────
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'CRPS Symptom Log — Sensory & Pain');
      y = drawInstruction(doc, y, 'CRPS has 4 diagnostic categories (Budapest criteria): sensory, vasomotor, sudomotor/edema, motor/trophic. Track all daily.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Pain\n(0-10)', 'Burning\n(0-10)', 'Allodynia\n(light touch\npain)', 'Hyperalgesia\n(increased\npain)', 'Spontaneous\nPain?', 'Pain\nQuality'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Autonomic Symptoms (Vasomotor & Sudomotor)');
      y = drawInstruction(doc, y, 'These autonomic changes differentiate CRPS from other pain conditions. Document visible changes daily.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Color\nChange', 'Temp\nDifference', 'Swelling\n(0-10)', 'Sweating\nChange', 'Skin\nAppearance', 'Nail/Hair\nChanges'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      // ────── PAGE 2: Motor & Trophic ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Motor & Trophic Changes');
      y = drawInstruction(doc, y, 'Motor dysfunction (weakness, tremor, dystonia) and trophic changes (skin, nail, hair) are late-stage CRPS signs. Track progression.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Weakness\n(0-10)', 'Tremor?', 'Stiffness\n(0-10)', 'Range of\nMotion', 'Dystonia?', 'Grip\nStrength', 'Walking\nAbility'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Affected Limb Comparison');
      y = drawInstruction(doc, y, 'Compare affected vs. unaffected side. Side-to-side differences are key CRPS diagnostic criteria.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Side', 'Color', 'Temp\n(warm/cool)', 'Swelling', 'Hair/Nail\nChanges', 'Skin\nTexture', 'Notes'],
        [
          ['', 'Affected', '', '', '', '', '', ''],
          ['', 'Unaffected', '', '', '', '', '', ''],
          ['', 'Affected', '', '', '', '', '', ''],
          ['', 'Unaffected', '', '', '', '', '', ''],
          ['', 'Affected', '', '', '', '', '', ''],
          ['', 'Unaffected', '', '', '', '', '', ''],
        ]);

      // ────── PAGE 3: Triggers & Spreading ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Trigger & Aggravating Factor Log');
      y = drawInstruction(doc, y, 'CRPS pain can be triggered by light touch, temperature change, movement, and stress. Track to identify and avoid triggers.');
      y = dailyTrackingTable(doc, y,
        ['Trigger', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [
          ['Light touch / clothing', '', '', '', '', '', '', ''],
          ['Temperature change', '', '', '', '', '', '', ''],
          ['Movement / exercise', '', '', '', '', '', '', ''],
          ['Stress / emotional', '', '', '', '', '', '', ''],
          ['Vibration', '', '', '', '', '', '', ''],
          ['Weather / barometric', '', '', '', '', '', '', ''],
          ['Medical procedure', '', '', '', '', '', '', ''],
          ['_____________', '', '', '', '', '', '', ''],
        ]);

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Spreading Monitor');
      y = drawInstruction(doc, y, 'CRPS can spread beyond the original site. Track any new areas of symptoms weekly.');
      y = dailyTrackingTable(doc, y,
        ['Week', 'Original\nSite Status', 'New Areas\nAffected?', 'Contralateral\n(mirror) Symptoms?', 'Spreading\nDirection'],
        Array.from({ length: 5 }, () => Array(5).fill('')));

      // ────── PAGE 4: Medication & Treatment ──────
      y = standardMedicationPage(doc, y, {
        medInstruction: 'Track nerve blocks, ketamine infusions, bisphosphonates, and neuropathic pain meds separately. Note exact timing relative to CRPS symptoms.',
        nonMedInstruction: 'Track mirror therapy sessions, graded motor imagery, desensitization exercises, contrast baths, and occupational therapy. CRPS requires multimodal treatment.',
        summaryInstruction: 'Rate each treatment weekly. CRPS treatments often show gradual improvement. Track allodynia tolerance and use-of-limb separately from pain level.',
      });

      // ────── PAGE 5: Functional Assessment ──────
      y = standardFunctionalPage(doc, y, [
        'Use of affected limb',
        'Walking / mobility',
        'Grip / fine motor',
        'Weight bearing',
        'Tolerating clothing/touch',
        'Bathing affected area',
        'Sleep (pain disruption)',
        'Driving',
        'Exercise / PT tolerance',
        'Social participation',
      ], {
        instruction: 'Rate each activity: 0 = Unable, 5 = Significant difficulty, 10 = Full capacity. Note if allodynia (pain from light touch) limits the activity.',
        selfCareItems: [
          ['Tolerating clothing on limb', '', '', '', '', '', '', ''],
          ['Washing affected area', '', '', '', '', '', '', ''],
          ['Applying creams/bandages', '', '', '', '', '', '', ''],
          ['Bearing weight on limb', '', '', '', '', '', '', ''],
          ['Using affected hand/foot', '', '', '', '', '', '', ''],
          ['Temperature regulation', '', '', '', '', '', '', ''],
          ['Sleep (limb positioning)', '', '', '', '', '', '', ''],
        ],
        notesPrompt: 'Allodynia Triggers, Desensitization Progress & Limb Changes',
      });

      // ────── PAGE 6: Weekly Summary ──────
      y = standardSummaryPage(doc, y, 'CRPS', [
        { label: 'Budapest categories active (0-4):', width: 140 },
        { label: 'Spreading noted?:', width: 120 },
        { label: 'Color/temp changes present?:', width: 120 },
      ], {
        patternPrompts: [
          { label: 'Allodynia changes (better/worse/same):' },
          { label: 'Mirror therapy or GMI response:' },
          { label: 'New spreading areas or contralateral symptoms:' },
          { label: 'Environmental triggers (temperature, touch):' },
        ],
        notesPrompt: 'CRPS Progression, Spreading & Pain Specialist Questions',
      });
    },
  },

  {
    filename: 'neuropathy-symptom-tracker.pdf',
    title: 'Neuropathy Symptom Tracker',
    subtitle: 'Comprehensive 6-page peripheral neuropathy tracking template — numbness, tingling, progression mapping, contributing factors, medication response, and neurologist-ready summaries.',
    badge: 'Neuropathy',
    generate: (doc, y) => {
      // ────── PAGE 1: Core Symptoms ──────
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Daily Neuropathy Symptoms');
      y = drawInstruction(doc, y, 'Rate symptoms 0-10 or mark present (Y). Track daily to monitor progression and treatment response.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Numbness\n(0-10)', 'Tingling\n(0-10)', 'Burning\n(0-10)', 'Shooting\nPain', 'Weakness\n(0-10)', 'Balance\n(1-5)', 'Sleep\n(1-5)'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Affected Areas — Severity Tracking');
      y = drawInstruction(doc, y, 'Use: M=Mild, Mod=Moderate, S=Severe. Track which areas are affected to monitor stocking-glove progression.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Feet', 'Lower\nLegs', 'Hands', 'Forearms', 'Other\nAreas', 'Symmetrical?'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      // ────── PAGE 2: Progression & Type ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Monthly Progression Map');
      y = drawInstruction(doc, y, 'Track progression weekly / monthly. Peripheral neuropathy typically progresses distally to proximally. Rapid progression requires urgent evaluation.');
      y = dailyTrackingTable(doc, y,
        ['Area', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Trend', 'Notes'],
        [
          ['Toes', '', '', '', '', '', ''],
          ['Feet (soles)', '', '', '', '', '', ''],
          ['Ankles > calves', '', '', '', '', '', ''],
          ['Knees > thighs', '', '', '', '', '', ''],
          ['Fingertips', '', '', '', '', '', ''],
          ['Hands (palms)', '', '', '', '', '', ''],
          ['Wrists > forearms', '', '', '', '', '', ''],
        ]);

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Neuropathy Type Assessment');
      y = drawInstruction(doc, y, 'Different neuropathy types affect different fibers. Track which symptoms dominate — this guides diagnosis.');
      y = dailyTrackingTable(doc, y,
        ['Fiber Type', 'Symptoms', 'Present?\n(Y/N)', 'Severity\n(0-10)', 'Getting\nWorse?'],
        [
          ['Large fiber (sensory)', 'Numbness, position sense loss, vibration loss', '', '', ''],
          ['Small fiber', 'Burning, tingling, temperature sensitivity', '', '', ''],
          ['Motor', 'Weakness, muscle wasting, foot drop', '', '', ''],
          ['Autonomic', 'Sweating changes, BP changes, GI issues', '', '', ''],
        ]);

      // ────── PAGE 3: Contributing Factors ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Contributing Factor Log');
      y = drawInstruction(doc, y, 'Many neuropathy causes are modifiable. Track these factors to help your neurologist advise treatment.');
      y = dailyTrackingTable(doc, y,
        ['Factor', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [
          ['Blood sugar (fasting)', '', '', '', '', '', '', ''],
          ['A1C (if known): ____', '', '', '', '', '', '', ''],
          ['Alcohol (drinks)', '', '', '', '', '', '', ''],
          ['B12 supplement taken?', '', '', '', '', '', '', ''],
          ['Chemo cycle day', '', '', '', '', '', '', ''],
          ['Exercise (type/min)', '', '', '', '', '', '', ''],
          ['Foot care done?', '', '', '', '', '', '', ''],
          ['Compression use?', '', '', '', '', '', '', ''],
        ]);

      y = checkPage(doc, y, 100);
      y = notesBox(doc, y, 'Triggers, Observations & Questions for Neurologist', 5);

      // ────── PAGE 4: Medication & Treatment ──────
      y = standardMedicationPage(doc, y, {
        medInstruction: 'Track neuropathy-specific medications (gabapentin, pregabalin, duloxetine) and underlying cause treatments (diabetes meds, B12, chemo agents). Include topical capsaicin/lidocaine.',
        nonMedInstruction: 'Track balance training, foot care routines, compression stockings, TENS, contrast baths, and occupational therapy for hand function.',
        summaryInstruction: 'Rate each treatment weekly. Note which symptoms respond (numbness, tingling, pain, balance). Underlying cause treatment may take months to show neuropathy improvement.',
      });

      // ────── PAGE 5: Functional Assessment ──────
      y = standardFunctionalPage(doc, y, [
        'Walking / balance',
        'Fine motor (buttons, coins)',
        'Gripping objects',
        'Standing stability',
        'Foot control (driving)',
        'Temperature discrimination',
        'Pain-free sleep',
        'Exercise tolerance',
        'Stair climbing',
        'Typing / touchscreen',
      ], {
        instruction: 'Rate each activity: 0 = Unable, 5 = Significant difficulty, 10 = Full capacity. Focus on distal function (hands, feet) and balance-dependent tasks.',
        selfCareItems: [
          ['Foot care / inspection', '', '', '', '', '', '', ''],
          ['Walking barefoot safely', '', '', '', '', '', '', ''],
          ['Fastening buttons/zippers', '', '', '', '', '', '', ''],
          ['Handling coins/small objects', '', '', '', '', '', '', ''],
          ['Stepping in/out of shower', '', '', '', '', '', '', ''],
          ['Driving (pedal feedback)', '', '', '', '', '', '', ''],
          ['Sleep (numb/tingling limbs)', '', '', '', '', '', '', ''],
        ],
        notesPrompt: 'Fall Risk Factors, Balance Strategies & Foot Care Log',
      });

      // ────── PAGE 6: Weekly Summary ──────
      y = standardSummaryPage(doc, y, 'Neuropathy', [
        { label: 'Progression noted? (Y/N):', width: 120 },
        { label: 'New areas affected?:', width: 200 },
        { label: 'Falls or near-falls this week:', width: 120 },
        { label: 'Blood sugar avg (if applicable):', width: 120 },
      ], {
        patternPrompts: [
          { label: 'Stocking-glove progression (new areas):' },
          { label: 'Activities causing most difficulty:' },
          { label: 'Blood sugar or B12 correlations:' },
          { label: 'Balance or fall risk situations:' },
        ],
        notesPrompt: 'Neuropathy Progression, Contributing Factors & Neurologist Questions',
      });
    },
  },

  // ── Tier 5: Survival Templates (Enhanced 6-Page PDFs) ──────────────────────

  {
    filename: 'printable-pain-log-sheet.pdf',
    title: 'Printable Pain Log Sheet',
    subtitle: 'Complete 6-page printable pain tracking kit — daily log sheet, pain scale reference, symptom checklist, medication tracker, weekly summary table, and doctor prep notes.',
    badge: 'Simple',
    generate: (doc, y) => {
      // ────── PAGE 1: Daily Log Sheet ──────
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Daily Pain Log');
      y = drawInstruction(doc, y, 'Record each pain episode. One sheet per day. Morning/Midday/Evening entries capture how pain changes throughout your day.');
      y = dailyTrackingTable(doc, y,
        ['Time', 'Pain\n(0-10)', 'Location', 'Type\n(ache/sharp/\nburn)', 'Trigger /\nActivity', 'What\nHelped?'],
        [
          ['Morning', '', '', '', '', ''],
          ['Midday', '', '', '', '', ''],
          ['Afternoon', '', '', '', '', ''],
          ['Evening', '', '', '', '', ''],
          ['Bedtime', '', '', '', '', ''],
          ['Night (if woken)', '', '', '', '', ''],
        ]);

      y = checkPage(doc, y, 150);
      y = drawSectionHeading(doc, y, 'Quick Status');
      y = drawInputLine(doc, y, 'Sleep quality (1-5):', 80);
      y = drawInputLine(doc, y, 'Energy level (1-5):', 80);
      y = drawInputLine(doc, y, 'Mood (one word):', 120);
      y = drawInputLine(doc, y, 'Overall day rating (1-10):', 80);
      y += 4;
      y = notesBox(doc, y, 'Notes', 3);

      // ────── PAGE 2: Symptom Checklist ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Symptom Checklist');
      y = drawInstruction(doc, y, 'Check any symptoms present today alongside your pain. Circle or check each day of the week.');
      y = dailyTrackingTable(doc, y,
        ['Symptom', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [
          ['Fatigue', '', '', '', '', '', '', ''],
          ['Stiffness', '', '', '', '', '', '', ''],
          ['Headache', '', '', '', '', '', '', ''],
          ['Nausea', '', '', '', '', '', '', ''],
          ['Dizziness', '', '', '', '', '', '', ''],
          ['Numbness/tingling', '', '', '', '', '', '', ''],
          ['Weakness', '', '', '', '', '', '', ''],
          ['Brain fog', '', '', '', '', '', '', ''],
          ['Mood changes', '', '', '', '', '', '', ''],
          ['Appetite changes', '', '', '', '', '', '', ''],
          ['____________', '', '', '', '', '', '', ''],
          ['____________', '', '', '', '', '', '', ''],
        ]);

      y = checkPage(doc, y, 100);
      y = notesBox(doc, y, 'Symptom Notes', 4);

      // ────── PAGE 3 & 4: Medication & Treatment ──────
      y = standardMedicationPage(doc, y, {
        medInstruction: 'Keep it simple: name, dose, time taken. If it helped, note "Y". If not, note "N". That is enough to start.',
        nonMedInstruction: 'Track anything else you try: heating pad, ice, stretching, rest. One line per treatment is plenty.',
        summaryInstruction: 'A simple Y (helped) / N (did not help) / ? (not sure) is fine for effectiveness.',
      });

      // ────── PAGE 5: Weekly Summary ──────
      y = drawInstruction(doc, y, 'Fill this in at the end of each week. Stack these side by side and patterns become visible.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Date', 'Worst\nPain', 'Avg\nPain', 'Sleep\n(1-5)', 'Function\n(1-10)', 'Meds\nUsed', 'Notes'],
        ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => [d, '', '', '', '', '', '', '']));

      y = checkPage(doc, y, 80);
      y = drawInputLine(doc, y, 'Average pain this week:', 100);
      y = drawInputLine(doc, y, 'Best day:', 200);
      y = drawInputLine(doc, y, 'Worst day:', 200);
      y = drawInputLine(doc, y, 'Pattern or trigger noticed:', doc.internal.pageSize.getWidth() - 120);

      // ────── PAGE 6: Doctor Prep ──────
      y = standardSummaryPage(doc, y, 'Pain Tracking', undefined, {
        instruction: 'Keep this simple. A brief weekly summary is far more useful than no summary at all.',
        patternPrompts: [
          { label: 'What I noticed most this week:' },
          { label: 'What helped:' },
          { label: 'What made it worse:' },
        ],
        notesPrompt: 'Notes for My Doctor (keep it to 3 key points)',
      });
    },
  },

  {
    filename: 'chronic-pain-diary-template.pdf',
    title: 'Chronic Pain Diary Template',
    subtitle: 'Complete 6-page chronic pain diary — baseline/flare tracking, trigger identification, treatment response, functional impact, and monthly trend analysis for long-term pain management.',
    badge: 'Chronic Pain',
    generate: (doc, y) => {
      const pw = doc.internal.pageSize.getWidth();

      // ────── PAGE 1: Baseline & Flare ──────
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Baseline & Flare Tracking');
      y = drawInstruction(doc, y, 'Baseline = your typical daily pain. Flare = significant increase. Distinguishing these two is the key insight of chronic pain tracking.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Baseline\n(0-10)', 'Flare?\n(Y/N)', 'Peak\nPain', 'Flare\nDuration', 'Suspected\nTrigger', 'Treatment\nUsed'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Daily Impact & Coping');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Sleep\nHrs', 'Sleep\nQual (1-5)', 'Fatigue\n(0-10)', 'Mood\n(1-5)', 'Activities\nDone', 'Activities\nMissed'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      // ────── PAGE 2: Trigger Matrix ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Flare Trigger Identification');
      y = drawInstruction(doc, y, 'Check triggers present each day. Compare trigger days to flare days after 2+ weeks to identify your personal triggers.');
      y = dailyTrackingTable(doc, y,
        ['Trigger Category', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [
          ['Over-exertion (boom-bust)', '', '', '', '', '', '', ''],
          ['Weather / barometric change', '', '', '', '', '', '', ''],
          ['Poor sleep (< 5 hours)', '', '', '', '', '', '', ''],
          ['Prolonged sitting or standing', '', '', '', '', '', '', ''],
          ['High stress / emotional', '', '', '', '', '', '', ''],
          ['Illness / infection', '', '', '', '', '', '', ''],
          ['Missed medication dose', '', '', '', '', '', '', ''],
          ['Hormonal cycle change', '', '', '', '', '', '', ''],
          ['Dietary factor: ________', '', '', '', '', '', '', ''],
          ['_____________________', '', '', '', '', '', '', ''],
        ]);

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Flare Episode Detail');
      y = drawInstruction(doc, y, 'For each flare, capture the full picture: onset to resolution.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Onset\nTime', 'Peak\nPain', 'Duration\n(hrs/days)', 'Trigger(s)', 'Treatment\n& Response', 'Recovery\nTime'],
        Array.from({ length: 5 }, () => Array(7).fill('')));

      // ────── PAGE 3: Coping & Energy ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Energy & Pacing Log');
      y = drawInstruction(doc, y, 'Pacing is the #1 chronic pain management strategy. Track your energy budget to identify your sustainable activity level.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Morning\nEnergy\n(0-10)', 'Midday\nEnergy\n(0-10)', 'Evening\nEnergy\n(0-10)', 'Activities\nDone', 'Rest\nBreaks\n(count)', 'Over-\ndid it?\n(Y/N)'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Coping Strategy Effectiveness');
      y = drawInstruction(doc, y, 'Rate each strategy 0-10 for how much it helped this week. Helps identify your most effective tools.');
      y = dailyTrackingTable(doc, y,
        ['Strategy', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [
          ['Heat / warm bath', '', '', '', '', '', '', ''],
          ['Cold / ice pack', '', '', '', '', '', '', ''],
          ['Gentle movement / walking', '', '', '', '', '', '', ''],
          ['Stretching / yoga', '', '', '', '', '', '', ''],
          ['Distraction (book, TV)', '', '', '', '', '', '', ''],
          ['Breathing / meditation', '', '', '', '', '', '', ''],
          ['TENS unit', '', '', '', '', '', '', ''],
          ['______________', '', '', '', '', '', '', ''],
        ]);

      // ────── PAGE 4: Medication & Treatment ──────
      y = standardMedicationPage(doc, y, {
        medInstruction: 'Chronic pain often involves layered treatments. Track each separately: scheduled meds, PRN (as-needed) meds, and rescue medications during flares.',
        nonMedInstruction: 'Rate coping strategies this week (0-10). Over months, this reveals which strategies have real, repeatable benefit vs placebo.',
        summaryInstruction: 'For chronic conditions, track trends over weeks, not individual days. Does this treatment improve your baseline or just reduce flares?',
      });

      // ────── PAGE 5: Functional Assessment ──────
      y = standardFunctionalPage(doc, y, [
        'Walking (distance/time)',
        'Standing (minutes)',
        'Sitting (minutes)',
        'Lifting (max lbs)',
        'Household chores',
        'Exercise tolerance',
        'Social activities',
        'Concentration / work',
        'Driving',
        'Self-care',
      ]);

      // ────── PAGE 6: Monthly Summary ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Monthly Trend Review');
      y = drawInstruction(doc, y, 'Complete at month-end. This is the page your doctor needs to see — trends, not daily details.');
      y += 4;
      y = drawInputLine(doc, y, 'Month / Year:', 200);
      y = drawInputLine(doc, y, 'Average Pain Level (0-10):', 100);
      y = drawInputLine(doc, y, 'Worst Pain Level This Month:', 100);
      y = drawInputLine(doc, y, 'Best Pain Level This Month:', 100);
      y = drawInputLine(doc, y, 'Flare Count:', 80);
      y = drawInputLine(doc, y, 'Average Flare Duration:', 140);
      y = drawInputLine(doc, y, 'Pain Trend (improving / stable / worsening):', 140);
      y = drawInputLine(doc, y, 'Medication Changes This Month:', pw - 120);
      y = drawInputLine(doc, y, 'Triggers Confirmed:', pw - 120);
      y += 6;
      y = notesBox(doc, y, 'Questions for Next Appointment', 4);
      y = notesBox(doc, y, 'Goals for Next Month', 3);
    },
  },

  {
    filename: '7-day-pain-diary.pdf',
    title: '7-Day Pain Diary Template',
    subtitle: 'Complete 6-page one-week pain diary — daily AM/PM/Evening tracking, symptom log, medication tracker, triggers, weekly summary, and doctor appointment preparation page.',
    badge: '7-Day',
    generate: (doc, y) => {
      const pw = doc.internal.pageSize.getWidth();

      // ────── PAGE 1: Days 1-4 ──────
      y = drawDateNameBlock(doc, y);
      y = drawInputLine(doc, y, 'Appointment Date:', 140);
      y = drawInputLine(doc, y, 'Doctor / Specialist:', 200);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, '7-Day Pain & Function Log — Days 1-4');
      y = dailyTrackingTable(doc, y,
        ['', 'Date', 'AM\nPain', 'Midday\nPain', 'PM\nPain', 'Sleep\n(1-5)', 'Function\n(what you\ncouldn\'t do)', 'Meds\nTaken'],
        ['Day 1','Day 2','Day 3','Day 4'].map(d => [d, '', '', '', '', '', '', '']));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, '7-Day Pain & Function Log — Days 5-7');
      y = dailyTrackingTable(doc, y,
        ['', 'Date', 'AM\nPain', 'Midday\nPain', 'PM\nPain', 'Sleep\n(1-5)', 'Function\n(what you\ncouldn\'t do)', 'Meds\nTaken'],
        ['Day 5','Day 6','Day 7'].map(d => [d, '', '', '', '', '', '', '']));

      // ────── PAGE 2: Symptom & Trigger Log ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Daily Symptom Checklist');
      y = drawInstruction(doc, y, 'Check symptoms present each day in addition to pain.');
      y = dailyTrackingTable(doc, y,
        ['Symptom', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
        [
          ['Fatigue', '', '', '', '', '', '', ''],
          ['Stiffness', '', '', '', '', '', '', ''],
          ['Headache', '', '', '', '', '', '', ''],
          ['Nausea', '', '', '', '', '', '', ''],
          ['Numbness/tingling', '', '', '', '', '', '', ''],
          ['Weakness', '', '', '', '', '', '', ''],
          ['Mood changes', '', '', '', '', '', '', ''],
          ['________', '', '', '', '', '', '', ''],
        ]);

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Trigger Log');
      y = drawInstruction(doc, y, 'Check potential triggers present each day. After 7 days, look for which triggers preceded your worst pain days.');
      y = dailyTrackingTable(doc, y,
        ['Trigger', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
        [
          ['Poor sleep', '', '', '', '', '', '', ''],
          ['High stress', '', '', '', '', '', '', ''],
          ['Weather change', '', '', '', '', '', '', ''],
          ['Over-activity', '', '', '', '', '', '', ''],
          ['Skipped meal', '', '', '', '', '', '', ''],
          ['______', '', '', '', '', '', '', ''],
        ]);

      // ────── PAGE 3 & 4: Medication & Treatment ──────
      y = standardMedicationPage(doc, y, {
        medInstruction: 'For a 7-day snapshot, record every dose including OTC meds. Doctors assess adherence patterns even in short data sets.',
        nonMedInstruction: 'Track short-term interventions: what you tried each day and whether it reduced pain within 30-60 minutes.',
      });

      // ────── PAGE 5: Weekly Summary ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Week Summary');
      y += 4;
      y = drawInputLine(doc, y, 'Average pain this week:', 100);
      y = drawInputLine(doc, y, 'Worst day (date + level):', 200);
      y = drawInputLine(doc, y, 'Best day (date + level):', 200);
      y = drawInputLine(doc, y, 'Flare days (count):', 80);
      y = drawInputLine(doc, y, 'Sleep quality avg (1-5):', 100);
      y = drawInputLine(doc, y, 'Patterns noticed:', pw - 120);
      y = drawInputLine(doc, y, '', pw - 80);
      y = drawInputLine(doc, y, 'Triggers identified:', pw - 120);
      y = drawInputLine(doc, y, '', pw - 80);
      y += 6;
      y = notesBox(doc, y, 'What Helped Most This Week', 3);
      y = notesBox(doc, y, 'What Made Pain Worse', 3);

      // ────── PAGE 6: Doctor Appointment Prep ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Doctor Appointment Preparation');
      y = drawInstruction(doc, y, 'Complete this page before your appointment. Tear it off and bring it with your 7-day data.');
      y += 4;
      y = drawInputLine(doc, y, 'Appointment date & time:', 200);
      y = drawInputLine(doc, y, 'Doctor / Specialist:', 200);
      y += 4;
      y = drawInputLine(doc, y, 'Average pain this week:', 100);
      y = drawInputLine(doc, y, 'Worst day and why:', pw - 120);
      y = drawInputLine(doc, y, 'Best day and why:', pw - 120);
      y = drawInputLine(doc, y, 'What I want to discuss:', pw - 120);
      y = drawInputLine(doc, y, '', pw - 80);
      y = drawInputLine(doc, y, 'Medication concerns:', pw - 120);
      y = drawInputLine(doc, y, 'New symptoms:', pw - 120);
      y = drawInputLine(doc, y, 'Treatment changes request:', pw - 120);
      y += 6;
      y = notesBox(doc, y, 'Questions for My Doctor (prepare 3-5)', 5);
      y = checkPage(doc, y, 100);
      y = notesBox(doc, y, 'Doctor\'s Recommendations (fill during visit)', 5);
    },
  },

  {
    filename: 'clinical-pain-diary-guide.pdf',
    title: 'How Doctors Use Pain Diaries',
    subtitle: 'Complete 6-page clinical perspective guide — how doctors extract data from diaries, clinical decision-making timelines, research evidence, standardized measures comparison, and patient communication templates.',
    badge: 'Clinical Guide',
    generate: (doc, y) => {
      const pw = doc.internal.pageSize.getWidth();

      // ────── PAGE 1: Clinical Perspective ──────
      const sections = [
        ['Why Doctors Value Pain Diaries', 'Appointments capture a snapshot; diaries capture the movie. Clinicians use pain diaries to identify patterns, assess treatment response, plan interventions, and communicate with specialists.'],
        ['What Clinicians Extract From Diaries', '1) Pain trajectory: improving, stable, or worsening? 2) Treatment response: are medications working? 3) Functional capacity: what can the patient actually do? 4) Triggers: what makes pain better or worse? 5) Sleep-pain-mood cycle: how are these interconnected?'],
        ['What Makes a Diary Clinically Useful', 'Consistency (daily entries, at least one week). Specificity (exact locations, descriptions, timing). Functional focus (how pain affects real activities). Medication logging (name, dose, response). Honest variability (not all days are the same).'],
      ];
      for (const [heading, text] of sections) {
        y = checkPage(doc, y, 60);
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COLORS.dark);
        doc.text(heading, 44, y); y += 16;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLORS.medium);
        const lines = doc.splitTextToSize(text, pw - 96);
        doc.text(lines, 52, y); y += lines.length * 13 + 14;
      }

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'What Your Doctor Sees vs. What You See');
      y = dailyTrackingTable(doc, y,
        ['Your Data', 'Doctor\'s Clinical Use', 'Affects This Decision'],
        [
          ['Pain 0-10 over time', 'Pain trajectory', 'Treatment escalation or reduction'],
          ['Medication log', 'Treatment response', 'Med change, dose adjustment'],
          ['Sleep + pain correlation', 'Sleep-pain cycle', 'Sleep medication, CBT-I referral'],
          ['Activity + pain', 'Functional capacity', 'PT referral, work restrictions'],
          ['Trigger identification', 'Modifiable risk factors', 'Lifestyle recommendations'],
          ['Flare frequency', 'Disease activity', 'DMARD changes, specialist referral'],
        ]);

      // ────── PAGE 2: Decision Timeline ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Clinical Decision Timeline — How Data Accumulates');
      y = drawInstruction(doc, y, 'Each visit builds on the last. Your diary ensures nothing is lost between appointments.');
      y = dailyTrackingTable(doc, y,
        ['Visit', 'Data Available', 'Clinical Decision', 'Your Diary\'s Role'],
        [
          ['Visit 1', 'Symptom history only', 'Initial assessment, basic tests', 'Provides pre-visit baseline data'],
          ['Visit 2\n(4-6 wk)', '4-6 weeks of diary data', 'Treatment response evaluation', 'Shows med effectiveness + side effects'],
          ['Visit 3\n(3 mo)', '3 months of trends', 'Treatment adjustment', 'Reveals flare patterns, trigger data'],
          ['Visit 4+', '6+ months of data', 'Long-term plan optimization', 'Demonstrates trajectory, confirms diagnosis'],
        ]);

      y = checkPage(doc, y, 130);
      y = drawSectionHeading(doc, y, 'Research Evidence for Pain Diaries');
      y = drawInstruction(doc, y, 'Clinical studies support the value of patient-reported pain data.');
      const evidence = [
        'Pain diaries improve treatment adherence by 23% (Journal of Pain, 2019)',
        'Structured symptom tracking reduces diagnostic delay by 40% (BMJ, 2018)',
        'Patient-reported outcomes predict treatment response better than physician assessment alone (Arthritis & Rheumatology, 2020)',
        'Consistent diary use correlates with higher patient satisfaction and care quality (Pain Medicine, 2021)',
      ];
      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLORS.dark);
      for (const item of evidence) {
        y = checkPage(doc, y, 120);
        const lines = doc.splitTextToSize('• ' + item, pw - 96);
        doc.text(lines, 52, y); y += lines.length * 13 + 6;
      }

      // ────── PAGE 3: Standardized Measures ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Standardized Pain Assessment Tools');
      y = drawInstruction(doc, y, 'Doctors use validated tools alongside your diary. Understanding these helps you communicate more effectively.');
      y = dailyTrackingTable(doc, y,
        ['Tool', 'What It Measures', 'Format', 'When Used'],
        [
          ['NRS (0-10)', 'Pain intensity', 'Single number', 'Every visit'],
          ['Brief Pain Inventory', 'Intensity + interference', '15 questions', 'Initial + quarterly'],
          ['Oswestry (ODI)', 'Back-specific disability', '10 questions', 'Spine care'],
          ['PROMIS', 'Multiple domains', 'Variable', 'Research + clinical'],
          ['PainDETECT', 'Neuropathic component', '9 questions', 'Suspected nerve pain'],
          ['McGill Questionnaire', 'Pain quality', 'Word selection', 'Diagnostic evaluation'],
        ]);

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Your "1-Minute Report" for Doctors');
      y = drawInstruction(doc, y, 'Practice saying this at the start of every appointment. It gives your doctor immediate context.');
      doc.setFillColor(...COLORS.bg);
      doc.roundedRect(36, y, pw - 72, 100, 4, 4, 'F');
      doc.setFontSize(8.5); doc.setTextColor(...COLORS.dark);
      doc.setFont('helvetica', 'italic');
      const script = [
        '"Since my last visit, my average pain has been [X]/10.',
        'My worst day was [date] at [Y]/10, likely triggered by [trigger].',
        '[Medication] has been [helping/not helping] — relief is about [Z]%.',
        'Functionally, I\'m [able/unable] to [specific activity].',
        'My main concern today is [concern]."',
      ];
      script.forEach((line, i) => { doc.text(line, 48, y + 14 + i * 16); });
      y += 112;

      // ────── PAGE 4 & 5: Tracking Templates ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Clinically-Optimized Daily Tracking Template');
      y = drawInstruction(doc, y, 'This template captures exactly what your doctor needs. Fill daily; bring the week\'s sheets to appointments.');
      y = drawDateNameBlock(doc, y);
      y = dailyTrackingTable(doc, y,
        ['Time', 'Pain\n(0-10)', 'Location', 'Activity /\nFunction', 'Medication\n(name + dose)', 'Response\n(0-10 relief)', 'Notes'],
        ['Morning', 'Midday', 'Evening', 'Bedtime'].map(t => [t, '', '', '', '', '', '']));

      y = checkPage(doc, y, 80);
      y = drawInputLine(doc, y, 'Sleep quality (1-5) + hours:', 160);
      y = drawInputLine(doc, y, 'Energy level (1-5):', 80);
      y = drawInputLine(doc, y, 'Trigger identified:', 200);
      y = notesBox(doc, y, 'Key observation for my doctor', 3);

      // ────── PAGE 5 (contd): Medication Template ──────
      y = standardMedicationPage(doc, y, {
        medInstruction: 'Clinicians look at: (1) what you take, (2) whether dose is adequate, (3) adherence patterns. Include PRN (as-needed) medications with frequency.',
        nonMedInstruction: 'Evidence-based non-drug treatments (CBT, physical therapy, mindfulness) are increasingly prioritized. Document the type, frequency, and your response.',
        summaryInstruction: 'Rate each treatment using the same scale as standardized clinical tools (Brief Pain Inventory functional interference). This helps your doctor compare.',
      });

      // ────── PAGE 6: Summary ──────
      y = standardSummaryPage(doc, y, 'Clinical Pain Diary', [
        { label: 'Treatment response this week (improved/same/worse):', width: 200 },
      ], {
        instruction: 'This summary mirrors what clinicians extract from pain diaries in research settings. Complete weekly for maximum clinical utility.',
        patternPrompts: [
          { label: 'Functional interference pattern (BPI items):' },
          { label: 'Treatment response trend over past 4 weeks:' },
          { label: 'Clinically meaningful change noted (30% pain reduction)?:' },
          { label: 'Referral or imaging data to discuss:' },
        ],
        notesPrompt: 'Clinical Observations & Treatment Decision Points',
      });
    },
  },

  {
    filename: 'specialist-appointment-pain-diary.pdf',
    title: 'Pain Diary for Specialist Appointment',
    subtitle: 'Complete 6-page specialist preparation template — tailored tracking for rheumatology, neurology, pain medicine, and orthopedic specialists, with pre-visit data collection and in-visit note-taking.',
    badge: 'Specialist Prep',
    generate: (doc, y) => {
      const pw = doc.internal.pageSize.getWidth();

      // ────── PAGE 1: Specialist Info & 7-Day Log ──────
      y = drawInputLine(doc, y, 'Specialist:', 200);
      y = drawInputLine(doc, y, 'Specialty:', 200);
      y = drawInputLine(doc, y, 'Appointment Date:', 140);
      y = drawInputLine(doc, y, 'Referred by:', 200);

      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Pre-Appointment 7-Day Log');
      y = drawInstruction(doc, y, 'Complete for the 7 days before your specialist visit. Different specialists need different data — see specialty guide on page 2.');
      y = dailyTrackingTable(doc, y,
        ['Day', 'Pain\n(0-10)', 'Location\n(specific)', 'Type /\nQuality', 'Duration', 'Medications\nTaken', 'Function\nImpact'],
        Array.from({ length: 7 }, (_, i) => ['Day ' + (i + 1), '', '', '', '', '', '']));

      // ────── PAGE 2: Specialty-Specific Needs ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'What Each Specialist Needs');
      y = drawInstruction(doc, y, 'Focus your tracking on the data that matters most to your specialist type.');
      y = dailyTrackingTable(doc, y,
        ['Specialist', 'Key Data Needed', 'Focus Your\nTracking On', 'Bring These\nRecords'],
        [
          ['Pain Medicine', 'Pain patterns, med\nresponse, function', 'Medication effectiveness\n+ timing, triggers', 'Full med list,\nimaging, prior\ntreatment records'],
          ['Rheumatology', 'Joint symptoms,\nstiffness, labs', 'AM stiffness (min),\njoint count, swelling', 'Lab results (CRP,\nESR, RF), joint\nexam history'],
          ['Neurology', 'Nerve symptoms,\nprogression, quality', 'Numbness/tingling\npattern, spreading', 'EMG/NCS results,\nMRI, nerve\nconduction studies'],
          ['Orthopedics', 'Mechanical symptoms,\nActivity relationship', 'Position/activity\nthat worsens/helps', 'X-rays, MRI,\nphysio reports'],
        ]);

      y = checkPage(doc, y, 130);
      y = drawSectionHeading(doc, y, 'Pre-Appointment Checklist');
      y = drawInstruction(doc, y, 'Complete 1-2 days before. Check off each item.');
      const checks = [
        '7-day pain log completed with specialist-relevant data',
        'Current medication list (including OTC and supplements)',
        'Previous treatment history and results',
        'Imaging / test results copied or listed',
        'Referral letter / insurance paperwork',
        'Questions written down (see page 5)',
        'Medical history summary for new specialist',
      ];
      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLORS.dark);
      for (const item of checks) {
        y = checkPage(doc, y, 16);
        doc.setDrawColor(...COLORS.light); doc.setLineWidth(0.5);
        doc.rect(52, y - 8, 10, 10);
        doc.text(item, 70, y); y += 16;
      }

      // ────── PAGE 3: Consultation Prep ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Specialist Consultation Preparation');
      y = drawInputLine(doc, y, 'Primary concern for this visit:', pw - 120);
      y = drawInputLine(doc, y, '', pw - 80);
      y = drawInputLine(doc, y, 'Pain history (when started, how):', pw - 120);
      y = drawInputLine(doc, y, '', pw - 80);
      y = drawInputLine(doc, y, 'Previous treatments tried:', pw - 120);
      y = drawInputLine(doc, y, '', pw - 80);
      y = drawInputLine(doc, y, 'What worked / didn\'t work:', pw - 120);
      y = drawInputLine(doc, y, 'Current medications (all):', pw - 120);
      y = drawInputLine(doc, y, 'Other conditions:', pw - 120);
      y = drawInputLine(doc, y, 'Family history (relevant):', pw - 120);
      y = drawInputLine(doc, y, 'Allergies:', pw - 120);
      y += 6;
      y = drawSectionHeading(doc, y, 'One-Page Summary for the Specialist');
      y = drawInstruction(doc, y, 'Fill this out and hand it to the specialist at the start of your appointment.');
      y = drawInputLine(doc, y, 'In one sentence, why I\'m here:', pw - 120);
      y = drawInputLine(doc, y, '', pw - 80);
      y = drawInputLine(doc, y, 'How long this has been happening:', 200);
      y = drawInputLine(doc, y, 'What I\'ve already tried:', pw - 120);
      y = drawInputLine(doc, y, 'What I hope to learn today:', pw - 120);

      // ────── PAGE 4: During-Visit Notes ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'During the Specialist Visit — Notes');
      y = drawInstruction(doc, y, 'Write notes during or immediately after. Ask if you can record the conversation (many specialists allow this).');
      y = drawInputLine(doc, y, 'Diagnosis / assessment discussed:', pw - 120);
      y = drawInputLine(doc, y, '', pw - 80);
      y = drawInputLine(doc, y, 'Tests recommended:', pw - 120);
      y = drawInputLine(doc, y, 'New treatments prescribed:', pw - 120);
      y = drawInputLine(doc, y, 'Referrals to other specialists:', pw - 120);
      y = drawInputLine(doc, y, 'Follow-up appointment:', 200);
      y += 4;
      y = notesBox(doc, y, 'Specialist\'s Recommendations (detail)', 5);
      y = notesBox(doc, y, 'Questions I Still Have', 3);

      // ────── PAGE 5: Medication & Treatment ──────
      y = standardMedicationPage(doc, y, {
        medInstruction: 'Specialists review medication history for treatment decisions. Include failed medications with reasons -- this prevents re-trying what did not work.',
        nonMedInstruction: 'Different specialists prioritize different interventions. See the specialty guide on Page 2 to focus your tracking.',
      });

      // ────── PAGE 6: Summary ──────
      y = standardSummaryPage(doc, y, 'Specialist Preparation', [
        { label: 'Specialist type (Rheum/Neuro/Pain/Ortho):', width: 140 },
        { label: 'Follow-up scheduled?:', width: 120 },
        { label: 'New tests ordered?:', width: 120 },
      ], {
        patternPrompts: [
          { label: 'Key data points the specialist needs (from Page 2 guide):' },
          { label: 'Changes since referral:' },
          { label: 'Treatment trial results to report:' },
          { label: 'Follow-up tasks from this visit:' },
        ],
        notesPrompt: 'Specialist Recommendations & Follow-Up Actions',
      });
    },
  },

  {
    filename: 'pre-diagnosis-symptom-tracker.pdf',
    title: 'Symptom Tracking Before Diagnosis',
    subtitle: 'Complete 6-page pre-diagnosis tracking template — broad symptom capture, systemic symptom mapping, pattern recognition, test/appointment log, and doctor-ready summary for when you don\'t have a diagnosis yet.',
    badge: 'Pre-Diagnosis',
    generate: (doc, y) => {
      const pw = doc.internal.pageSize.getWidth();

      // ────── PAGE 1: Comprehensive Symptom Log ──────
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Comprehensive Symptom Log');
      y = drawInstruction(doc, y, 'When seeking a diagnosis, capture everything broadly. Patterns in diverse symptoms often point to the underlying condition.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Primary\nSymptom', 'Severity\n(0-10)', 'Secondary\nSymptoms', 'Timing\n(when)', 'Potential\nTrigger', 'Duration'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Systemic Symptom Check');
      y = drawInstruction(doc, y, 'Check weekly. Many conditions affect multiple systems. Tracking all symptoms helps differential diagnosis.');
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
          ['Other: __________', '', '', '', '', '', '', ''],
        ]);

      // ────── PAGE 2: Pattern Recognition ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Pattern Recognition Guide');
      y = drawInstruction(doc, y, 'After 2+ weeks of tracking, look for these diagnostically meaningful patterns in your data.');
      y = dailyTrackingTable(doc, y,
        ['Pattern', 'Suggests', 'Track This'],
        [
          ['AM stiffness > 30 min', 'Inflammatory (RA, AS, lupus)', 'Exact duration every AM'],
          ['Worse with activity', 'Mechanical / structural', 'Which activities, recovery time'],
          ['Burning / tingling', 'Nerve involvement', 'Exact location, spreading?'],
          ['Cycles with period', 'Hormonal / endometriosis', 'Cycle day + severity, 2-3 cycles'],
          ['Widespread + fatigue', 'Fibromyalgia / systemic', 'All symptom types together'],
          ['Post-illness onset', 'Post-infectious / CRPS', 'Timeline from event, all symptoms'],
          ['Symmetric joint pain', 'Rheumatoid arthritis', 'Which joints, bilateral?'],
          ['Night pain (wakes you)', 'Inflammatory or serious', 'Time, severity, what helps'],
        ]);

      y = checkPage(doc, y, 160);
      y = drawSectionHeading(doc, y, 'Your Pattern Observations');
      y = drawInputLine(doc, y, 'Pattern I\'m noticing:', pw - 120);
      y = drawInputLine(doc, y, '', pw - 80);
      y = drawInputLine(doc, y, 'Possible connection:', pw - 120);
      y = drawInputLine(doc, y, 'Question for doctor:', pw - 120);

      // ────── PAGE 3: Tests & Appointments ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Tests & Appointments Log');
      y = drawInstruction(doc, y, 'Track every test and appointment. This becomes your diagnostic timeline — invaluable when seeing multiple doctors.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Doctor /\nSpecialist', 'Type of Visit /\nTest', 'Results /\nFindings', 'Next\nSteps'],
        Array.from({ length: 8 }, () => Array(5).fill('')));

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Diagnostic Timeline');
      y = drawInstruction(doc, y, 'Build your complete timeline from symptom onset to present.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Event', 'Outcome / Finding'],
        [
          ['', 'Symptoms first appeared', ''],
          ['', 'First doctor visit', ''],
          ['', 'First tests ordered', ''],
          ['', 'Specialist referral', ''],
          ['', '', ''],
          ['', '', ''],
          ['', '', ''],
          ['', '', ''],
        ]);

      // ────── PAGE 4: Medication & Treatment ──────
      y = standardMedicationPage(doc, y, {
        medInstruction: 'Before diagnosis, track everything tried -- prescription, OTC, supplements. Note any allergies or adverse reactions. This history guides differential diagnosis.',
        nonMedInstruction: 'Document all self-management attempts. What you have already tried (and failed) is as diagnostically useful as what works.',
      });

      // ────── PAGE 5: Functional Assessment ──────
      y = standardFunctionalPage(doc, y, [
        'Walking / mobility',
        'Standing tolerance',
        'Sitting tolerance',
        'Fine motor / grip',
        'Lifting / carrying',
        'Concentration / focus',
        'Energy / stamina',
        'Sleep quality',
        'Exercise tolerance',
        'Social participation',
      ]);

      // ────── PAGE 6: Doctor-Ready Summary ──────
      doc.addPage(); y = 40;
      y = drawSectionHeading(doc, y, 'Pre-Diagnosis Summary for Your Doctor');
      y = drawInstruction(doc, y, 'Complete this before each appointment. Hand it to your doctor at the start of the visit.');
      y += 4;
      y = drawInputLine(doc, y, 'Symptoms started:', pw - 120);
      y = drawInputLine(doc, y, 'How it began:', pw - 120);
      y = drawInputLine(doc, y, 'Primary symptoms (with severity):', pw - 120);
      y = drawInputLine(doc, y, '', pw - 80);
      y = drawInputLine(doc, y, 'How symptoms have changed:', pw - 120);
      y = drawInputLine(doc, y, 'Pattern noticed:', pw - 120);
      y = drawInputLine(doc, y, 'Impact on daily life:', pw - 120);
      y = drawInputLine(doc, y, 'What helps:', pw - 120);
      y = drawInputLine(doc, y, 'What makes it worse:', pw - 120);
      y = drawInputLine(doc, y, 'Tests already done:', pw - 120);
      y = drawInputLine(doc, y, 'Doctors already seen:', pw - 120);
      y = drawInputLine(doc, y, 'Family history:', pw - 120);
      y += 6;
      y = notesBox(doc, y, 'What I want to find out at this appointment', 3);
      y = notesBox(doc, y, 'Questions for my doctor', 3);
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
