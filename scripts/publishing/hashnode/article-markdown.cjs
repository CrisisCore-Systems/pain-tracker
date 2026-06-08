const ROOT_SITE_URL = 'https://www.paintracker.ca';
const DEVTO_SCHEDULE = require('../../devto/schedule.json');

function buildScheduleTargetLinks() {
  const mappings = DEVTO_SCHEDULE?.defaults?.target_link_map || {};
  const byPath = new Map();

  for (const value of Object.values(mappings)) {
    if (!value?.path || !value?.anchorText) continue;
    if (byPath.has(value.path)) continue;
    byPath.set(value.path, {
      path: value.path,
      href: `${ROOT_SITE_URL}${value.path}`,
      label: value.anchorText,
      cue: value.cue || '',
    });
  }

  return byPath;
}

const scheduleTargetLinks = buildScheduleTargetLinks();

function scheduleResourceLink(path, description) {
  const target = scheduleTargetLinks.get(path);

  if (!target) {
    throw new Error(`Missing DEV.to target_link_map entry for Hashnode resource path: ${path}`);
  }

  return {
    href: target.href,
    label: target.label,
    description: description || target.cue,
  };
}

const topicLinks = {
  general: [
    scheduleResourceLink(
      '/resources',
      'Start from the central hub for printables, journal guides, app paths, and privacy details.',
    ),
    scheduleResourceLink(
      '/resources/daily-pain-tracker-printable',
      'Use a one-page tracker for pain level, medication, triggers, function, and notes.',
    ),
    scheduleResourceLink(
      '/resources/chronic-pain-diary-template',
      'Track longer-term baseline, flare, medication, sleep, and function patterns.',
    ),
    scheduleResourceLink(
      '/tracking-data-policy',
      'Review what PainTracker stores locally, what it avoids collecting, and how exports work.',
    ),
  ],
  printable: [
    scheduleResourceLink(
      '/resources/daily-pain-tracker-printable',
      'Start with a short printable record when a full journal would be too much.',
    ),
    scheduleResourceLink(
      '/resources/pain-scale-chart-printable',
      'Use a 0-10 reference beside paper or digital entries so scores are easier to compare.',
    ),
    scheduleResourceLink(
      '/resources/what-to-include-in-pain-journal',
      'Keep entries focused on appointment-useful details without overloading every day.',
    ),
    scheduleResourceLink(
      '/download',
      'Install or open the app when paper becomes hard to carry, review, or summarize.',
    ),
  ],
  chronic: [
    scheduleResourceLink(
      '/resources/chronic-pain-diary-template',
      'Use the long-term diary for baseline pain, flares, function, and treatment response.',
    ),
    scheduleResourceLink(
      '/resources/what-to-include-in-pain-journal',
      'Keep chronic pain records focused on high-signal details instead of capturing everything.',
    ),
    scheduleResourceLink(
      '/resources/daily-pain-tracker-printable',
      'Use a single-day printable when a longer diary is too much on a bad day.',
    ),
    scheduleResourceLink(
      '/resources/pain-scale-chart-printable',
      'Pair chronic pain notes with consistent 0-10 ratings so changes are easier to review.',
    ),
  ],
  journal: [
    scheduleResourceLink(
      '/resources/what-to-include-in-pain-journal',
      'Use the checklist before appointments so journal entries stay useful and maintainable.',
    ),
    scheduleResourceLink(
      '/resources/daily-pain-tracker-printable',
      'Start with a short printable entry when a full journal would be too much.',
    ),
    scheduleResourceLink(
      '/resources/chronic-pain-diary-template',
      'Use a longer diary when baseline pain, flares, and treatment response need more structure.',
    ),
    scheduleResourceLink(
      '/download',
      'Move the same habit into an offline-capable app when digital entries are easier to keep up with.',
    ),
  ],
  privacy: [
    scheduleResourceLink(
      '/tracking-data-policy',
      'See what is stored locally, what is not collected by default, and how exports are handled.',
    ),
    scheduleResourceLink(
      '/resources',
      'Use printables and guides that do not require a cloud account before they help.',
    ),
    scheduleResourceLink(
      '/download',
      'Install the app when you need offline-capable tracking under your own device control.',
    ),
    {
      href: `${ROOT_SITE_URL}/`,
      label: 'free private offline pain tracker',
      description: 'Open the app path when you want local records without creating an account first.',
    },
  ],
  workplace: [
    scheduleResourceLink(
      '/download',
      'Use the app when you need cleaner pain and function records for appointments or claims.',
    ),
    scheduleResourceLink(
      '/resources/daily-pain-tracker-printable',
      'Capture daily pain, medication response, and functional limits without waiting on a digital workflow.',
    ),
    scheduleResourceLink(
      '/resources/chronic-pain-diary-template',
      'Track longer recovery patterns when injury, flares, and function need more than one-day notes.',
    ),
    scheduleResourceLink(
      '/resources/what-to-include-in-pain-journal',
      'Keep claim-facing notes factual and focused on pain, function, timing, and treatment response.',
    ),
  ],
};

function inferTopic(article) {
  const slug = String(article?.slug || '');
  const cluster = String(article?.cluster || '');
  const text = `${slug} ${cluster}`;

  if (/worksafe|wcb|claim|injury|compensation|disability|documentation|insurance/i.test(text)) {
    return 'workplace';
  }

  if (/privacy|security|encryption|offline|local|zero-cloud|zero-knowledge/i.test(text)) {
    return 'privacy';
  }

  if (/journal|diary|doctor|appointment|symptom|clinical|pdf|export/i.test(text)) {
    return 'journal';
  }

  if (/chronic|fibromyalgia|migraine|flare|arthritis|nerve|recovery/i.test(text)) {
    return 'chronic';
  }

  if (/printable|template|paper|download/i.test(text)) {
    return 'printable';
  }

  return 'general';
}

function getResourceLinks(article) {
  if (Array.isArray(article?.resourceLinks) && article.resourceLinks.length > 0) {
    return article.resourceLinks;
  }

  return topicLinks[inferTopic(article)] || topicLinks.general;
}

function appendResourceLinks(lines, article) {
  const links = getResourceLinks(article);
  if (!links.length) return;

  lines.push('## Related PainTracker resources');
  lines.push('');
  lines.push(
    'These links move from reading to a useful record without adding another cloud-dependent workflow.',
  );
  lines.push('');

  for (const link of links) {
    lines.push(`- [${link.label}](${link.href}) - ${link.description}`);
  }

  lines.push('');
}

function buildHashnodeMarkdown(article) {
  const lines = [];

  for (const section of article.sections || []) {
    lines.push(`## ${section.h2}`);
    lines.push('');
    for (const para of section.paragraphs || []) {
      lines.push(para);
      lines.push('');
    }
  }

  if (article.howToSteps && article.howToSteps.length > 0) {
    lines.push('## Steps');
    lines.push('');
    for (let i = 0; i < article.howToSteps.length; i += 1) {
      const step = article.howToSteps[i];
      lines.push(`**Step ${i + 1}: ${step.name}**`);
      lines.push('');
      lines.push(step.text);
      lines.push('');
    }
  }

  appendResourceLinks(lines, article);

  if (article.faqs && article.faqs.length > 0) {
    lines.push('## Frequently Asked Questions');
    lines.push('');
    for (const faq of article.faqs) {
      lines.push(`### ${faq.question}`);
      lines.push('');
      lines.push(faq.answer);
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('');
  lines.push('<p class="cta">');
  lines.push(`  <a href="${ROOT_SITE_URL}/download" target="_blank" rel="noopener noreferrer">`);
  lines.push('    Download PainTracker - private, offline-capable pain tracking.');
  lines.push('  </a>');
  lines.push('</p>');

  return lines.join('\n').trim();
}

module.exports = {
  buildHashnodeMarkdown,
  getResourceLinks,
  scheduleTargetLinks,
};
