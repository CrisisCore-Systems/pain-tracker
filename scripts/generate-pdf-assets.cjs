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
    subtitle: 'Comprehensive daily pain tracking template. Record pain levels, location, symptoms, medications, and triggers.',
    badge: 'Most Popular',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Daily Pain Log');
      y = drawInstruction(doc, y, 'Complete one row per day. Rate pain on the 0–10 scale. Note the primary location and any triggers.');
      y = dailyTrackingTable(doc, y, ['Date', 'Time', 'Pain (0-10)', 'Location', 'Duration', 'Triggers', 'Medications', 'Relief?']);

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Symptom Tracking');
      y = dailyTrackingTable(doc, y, ['Date', 'Sleep Quality', 'Fatigue (0-10)', 'Mood', 'Activity Level', 'Appetite', 'Other Symptoms']);

      y = checkPage(doc, y, 100);
      y = notesBox(doc, y, 'Additional Notes & Observations', 6);

      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Weekly Summary');
      y = drawInputLine(doc, y, 'Average pain level this week:', 120);
      y = drawInputLine(doc, y, 'Worst pain episode:', 200);
      y = drawInputLine(doc, y, 'Most effective relief:', 200);
      y = drawInputLine(doc, y, 'Questions for next appointment:', 200);
    },
  },

  {
    filename: 'daily-pain-tracker.pdf',
    title: 'Daily Pain Tracker',
    subtitle: 'Simple one-page daily tracking sheet. Quick, consistent entries with minimal writing required.',
    badge: 'Quick Entry',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Today\'s Pain Log');
      y = drawInstruction(doc, y, 'Record each significant pain episode. Use the 0–10 scale above.');
      y = dailyTrackingTable(doc, y, ['Time', 'Pain (0-10)', 'Location', 'What were you doing?', 'What helped?'],
        Array.from({ length: 8 }, () => ['', '', '', '', '']));

      y = checkPage(doc, y, 100);
      y = drawSectionHeading(doc, y, 'Daily Summary');
      y = drawInputLine(doc, y, 'Overall pain today (0-10):', 80);
      y = drawInputLine(doc, y, 'Sleep last night (hours):', 80);
      y = drawInputLine(doc, y, 'Mood today:', 140);
      y = drawInputLine(doc, y, 'Activity level:', 140);
      y = drawInputLine(doc, y, 'Medications taken:', 200);

      y = checkPage(doc, y, 100);
      y = notesBox(doc, y, 'Notes (triggers, observations, questions)', 5);
    },
  },

  {
    filename: 'weekly-pain-log.pdf',
    title: 'Weekly Pain Log',
    subtitle: '7-day spread format. See your pain patterns at a glance across an entire week.',
    badge: 'Weekly View',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Weekly Pain Overview');
      y = drawInstruction(doc, y, 'Record morning, afternoon, and evening pain levels. Track sleep and medication daily.');

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      y = dailyTrackingTable(doc, y, ['Day', 'AM Pain', 'PM Pain', 'Eve Pain', 'Sleep Hrs', 'Medications', 'Key Triggers'],
        days.map(d => [d, '', '', '', '', '', '']));

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Weekly Pattern Check');
      y = drawInputLine(doc, y, 'Best day this week:', 200);
      y = drawInputLine(doc, y, 'Worst day this week:', 200);
      y = drawInputLine(doc, y, 'Pattern noticed:', 200);
      y = drawInputLine(doc, y, 'Treatment changes needed?', 200);

      y = checkPage(doc, y, 100);
      y = notesBox(doc, y, 'Weekly Reflections', 5);
    },
  },

  {
    filename: 'monthly-pain-tracker.pdf',
    title: 'Monthly Pain Tracker',
    subtitle: 'Monthly overview for tracking long-term trends and treatment effectiveness.',
    badge: 'Monthly View',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);

      y = drawSectionHeading(doc, y, 'Monthly Pain Calendar');
      y = drawInstruction(doc, y, 'Write your average daily pain (0–10) in each cell. Circle days with flares. Mark medication changes with ★.');

      // Calendar grid: 5 weeks × 7 days
      y = dailyTrackingTable(doc, y,
        ['Week', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Avg'],
        [['1', '', '', '', '', '', '', '', ''],
         ['2', '', '', '', '', '', '', '', ''],
         ['3', '', '', '', '', '', '', '', ''],
         ['4', '', '', '', '', '', '', '', ''],
         ['5', '', '', '', '', '', '', '', '']]);

      y = checkPage(doc, y, 100);
      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Monthly Summary');
      y = drawInputLine(doc, y, 'Month/Year:', 140);
      y = drawInputLine(doc, y, 'Average pain this month:', 100);
      y = drawInputLine(doc, y, 'Number of flare days:', 100);
      y = drawInputLine(doc, y, 'Medications this month:', 200);
      y = drawInputLine(doc, y, 'Treatments tried:', 200);
      y = drawInputLine(doc, y, 'What improved?', 200);
      y = drawInputLine(doc, y, 'What worsened?', 200);

      y = checkPage(doc, y, 100);
      y = notesBox(doc, y, 'Goals for Next Month', 4);
    },
  },

  {
    filename: 'pain-scale-chart.pdf',
    title: 'Pain Scale Chart',
    subtitle: 'Visual pain scale reference (0–10 Numeric Rating Scale) for consistent self-assessment.',
    badge: 'Reference',
    generate: (doc, y) => {
      y = drawSectionHeading(doc, y, 'Numeric Rating Scale (NRS) 0–10');
      y = drawInstruction(doc, y, 'Use this chart to rate your pain consistently. Circle the number that best matches your current experience.');

      const pw = doc.internal.pageSize.getWidth();

      // Large scale
      const descriptions = [
        ['0', 'No Pain', 'No pain sensation at all'],
        ['1', 'Minimal', 'Barely noticeable, easily ignored'],
        ['2', 'Mild', 'Minor pain, noticeable but not distracting'],
        ['3', 'Uncomfortable', 'Noticeable and distracting, but adaptable'],
        ['4', 'Moderate', 'Can be ignored with effort, affects some activities'],
        ['5', 'Moderately Severe', 'Cannot be ignored for long, limits activities'],
        ['6', 'Severe', 'Dominates thinking, significantly limits function'],
        ['7', 'Very Severe', 'Hard to function, difficulty concentrating'],
        ['8', 'Intense', 'Physical activity very limited, difficulty speaking'],
        ['9', 'Excruciating', 'Unable to function, crying out or moaning'],
        ['10', 'Worst Possible', 'Worst pain imaginable, completely incapacitating'],
      ];

      for (const [num, label, desc] of descriptions) {
        y = checkPage(doc, y, 36);
        const n = parseInt(num);
        const r = n <= 3 ? 34 + n * 30 : n <= 6 ? 200 + (n - 3) * 15 : 220 + (n - 6) * 8;
        const g = n <= 3 ? 197 - n * 20 : n <= 6 ? 180 - (n - 3) * 40 : 60 - (n - 6) * 15;
        const b = n <= 3 ? 94 - n * 10 : 40;
        doc.setFillColor(Math.min(r, 255), Math.max(g, 0), Math.max(b, 0));
        doc.roundedRect(44, y, 32, 24, 3, 3, 'F');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.white);
        doc.text(num, 54, y + 17);
        doc.setTextColor(...COLORS.dark);
        doc.setFontSize(10);
        doc.text(label, 86, y + 10);
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.medium);
        doc.setFont('helvetica', 'normal');
        doc.text(desc, 86, y + 22);
        y += 32;
      }

      y += 8;
      y = checkPage(doc, y, 80);
      y = drawSectionHeading(doc, y, 'Tips for Accurate Rating');
      const tips = [
        '• Rate your pain right now, not your worst or your average.',
        '• Compare to your own experience, not to others.',
        '• Use the descriptions above—don\'t just pick a number.',
        '• It\'s normal for ratings to change through the day.',
        '• Good days count too. Record them for accurate patterns.',
      ];
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.medium);
      for (const tip of tips) {
        y = checkPage(doc, y, 14);
        doc.text(tip, 44, y);
        y += 14;
      }
    },
  },

  {
    filename: 'symptom-tracker.pdf',
    title: 'Symptom Tracker',
    subtitle: 'Track symptoms beyond pain: fatigue, sleep quality, mood, and daily functioning.',
    badge: 'Comprehensive',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);

      y = drawSectionHeading(doc, y, 'Daily Symptom Log');
      y = drawInstruction(doc, y, 'Rate each symptom 0–10 daily. Track patterns over time.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Pain (0-10)', 'Fatigue (0-10)', 'Sleep Hrs', 'Sleep Quality', 'Mood', 'Brain Fog', 'GI Issues'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Functional Impact');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Self-Care', 'Housework', 'Walking', 'Work/Activity', 'Social', 'Exercise'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Triggers, Observations & Questions for Doctor', 5);
    },
  },

  {
    filename: 'migraine-pain-diary.pdf',
    title: 'Migraine Pain Diary',
    subtitle: 'Specialized for migraines: track triggers, aura, duration, and response to treatment.',
    badge: 'Migraine-Specific',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);

      y = drawSectionHeading(doc, y, 'Migraine Episode Log');
      y = drawInstruction(doc, y, 'Record each migraine episode. Include onset, peak, and resolution details.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Start Time', 'End Time', 'Pain (0-10)', 'Location', 'Aura?', 'Nausea?', 'Medication Taken'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Trigger Checklist');
      y = drawInstruction(doc, y, 'Check any potential triggers present in the 24 hours before each episode.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Poor Sleep', 'Stress', 'Skipped Meal', 'Weather', 'Screen Time', 'Alcohol', 'Hormonal'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 100);
      y = drawSectionHeading(doc, y, 'Associated Symptoms');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Light Sens.', 'Sound Sens.', 'Nausea', 'Vomiting', 'Dizziness', 'Neck Pain', 'Vision Changes'],
        Array.from({ length: 7 }, () => Array(8).fill('')));

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Medication Response & Notes', 4);
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
    subtitle: 'Designed for BC workplace injury claims. Document pain in the format WCB case managers need.',
    badge: 'BC Workers',
    generate: (doc, y) => {
      y = drawDateNameBlock(doc, y);
      y = drawInputLine(doc, y, 'WCB Claim Number:', 180);
      y = drawInputLine(doc, y, 'Injury Date:', 140);
      y = drawInputLine(doc, y, 'Employer:', 200);

      y = drawPainScale(doc, y);

      y = drawSectionHeading(doc, y, 'Daily Work-Related Pain Log');
      y = drawInstruction(doc, y, 'Connect symptoms to work duties. Note functional limitations and treatment compliance.');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Pain (0-10)', 'Work Status', 'Duties Affected', 'Limitations', 'Treatment Today'],
        Array.from({ length: 7 }, () => Array(6).fill('')));

      y = checkPage(doc, y, 120);
      y = drawSectionHeading(doc, y, 'Functional Capacity');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Sitting', 'Standing', 'Lifting', 'Walking', 'Driving', 'Concentrating'],
        Array.from({ length: 7 }, () => Array(7).fill('')));

      y = checkPage(doc, y, 100);
      y = drawSectionHeading(doc, y, 'Treatment Compliance');
      y = dailyTrackingTable(doc, y,
        ['Date', 'Physio/Exercise', 'Medications', 'MD Appointments', 'Other Treatment', 'Notes'],
        Array.from({ length: 7 }, () => Array(6).fill('')));

      y = checkPage(doc, y, 80);
      y = notesBox(doc, y, 'Case Manager / Return-to-Work Notes', 4);
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
