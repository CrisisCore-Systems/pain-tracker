import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SCHEDULE_PATH = path.join(ROOT, 'scripts', 'devto', 'schedule.json');

function loadSchedule() {
  return JSON.parse(fs.readFileSync(SCHEDULE_PATH, 'utf8'));
}

// PHASE 0 - Global Link Graph Analysis
function analyzeLinkGraph(schedule) {
  const linkRegex = /\bhttps?:\/\/[^\s<>"')]+/gi;
  const paintrackerLinks = new Map();
  const blogtrackerLinks = new Map();
  const allLinks = [];
  
  const publishedPosts = schedule.posts.filter(p => p.published && p.sourceFile);
  
  for (const post of publishedPosts) {
    const source = fs.readFileSync(path.join(ROOT, post.sourceFile), 'utf8');
    const matches = [...source.matchAll(linkRegex)];
    
    for (const match of matches) {
      const url = match[0].replace(/[),.;:!?]+$/g, '');
      allLinks.push({ postKey: post.key, url });
      
      try {
        const parsed = new URL(url);
        const host = parsed.hostname.toLowerCase();
        const pathname = parsed.pathname.replace(/\/+$/, '') || '/';
        
        if (host === 'paintracker.ca' || host === 'www.paintracker.ca') {
          paintrackerLinks.set(pathname, (paintrackerLinks.get(pathname) || 0) + 1);
        } else if (host === 'blog.paintracker.ca' || host === 'paintracker.ca') {
          if (pathname.startsWith('/blog/')) {
            blogtrackerLinks.set(pathname, (blogtrackerLinks.get(pathname) || 0) + 1);
          }
        }
      } catch {}
    }
  }
  
  return {
    totalLinks: allLinks.length,
    paintrackerLinks: Object.fromEntries(paintrackerLinks),
    paintrackerTotal: [...paintrackerLinks.values()].reduce((a,b) => a+b, 0),
    blogtrackerLinks: Object.fromEntries(blogtrackerLinks),
    blogtrackerTotal: [...blogtrackerLinks.values()].reduce((a,b) => a+b, 0),
  };
}

// PHASE 1 - Cluster Mapping
function assignClusters(schedule) {
  const clusters = {
    'Privacy Architecture': [],
    'Offline-First Engineering': [],
    'Encryption': [],
    'Trauma-Informed UX': [],
    'WorkSafeBC Documentation': [],
    'Pain Journaling': [],
    'Doctor Appointment Preparation': [],
    'Protective Computing': [],
    'Founder / Build Log': [],
    'Product Discovery': []
  };
  
  const clusterRules = [
    { keywords: ['privacy', 'data', 'tracking', 'surveillance', 'telemetry'], cluster: 'Privacy Architecture' },
    { keywords: ['offline', 'service worker', 'indexeddb', 'cache', 'rollback', 'sync conflict', 'queue'], cluster: 'Offline-First Engineering' },
    { keywords: ['encryption', 'aes', 'pbkdf2', 'crypto', 'key', 'zero-knowledge', 'subpoena', 'court'], cluster: 'Encryption' },
    { keywords: ['trauma', 'ux', 'accessibility', 'coercion', 'crisis', 'fog', 'distress'], cluster: 'Trauma-Informed UX' },
    { keywords: ['worksafebc', 'worksafe', 'forms', 'claim', 'bureaucratic'], cluster: 'WorkSafeBC Documentation' },
    { keywords: ['journal', 'pain diary', 'tracking', 'log', 'symptom'], cluster: 'Pain Journaling' },
    { keywords: ['doctor', 'clinician', 'visit', 'appointment', 'summary', 'report'], cluster: 'Doctor Appointment Preparation' },
  ];
  
  for (const post of schedule.posts.filter(p => p.published)) {
    const titleLower = (post.title || '').toLowerCase();
    const tagsLower = (post.tags || []).join(' ').toLowerCase();
    const combined = titleLower + ' ' + tagsLower;
    
    let assigned = false;
    for (const rule of clusterRules) {
      if (rule.keywords.some(k => combined.includes(k))) {
        clusters[rule.cluster].push(post.key);
        assigned = true;
        break;
      }
    }
    
    if (!assigned) {
      if (post.key.includes('architecting') || post.key.includes('protective-computing')) {
        clusters['Protective Computing'].push(post.key);
      } else if (post.key.includes('two-people') || post.key.includes('learned') || post.key.includes('building')) {
        clusters['Founder / Build Log'].push(post.key);
      } else {
        clusters['Product Discovery'].push(post.key);
      }
    }
  }
  
  return clusters;
}

// PHASE 9 - Missing Page Discovery
function discoverMissingPages(schedule, linkGraph) {
  // Analyze content for repeated topics without dedicated landing pages
  const resourcePages = [
    '/resources/how-to-start-a-pain-journal',
    '/resources/how-to-track-pain-for-doctors',
    '/resources/doctor-visit-pain-summary-template',
    '/resources/how-doctors-use-pain-diaries',
    '/privacy-architecture',
  ];
  
  const targetedPaths = new Set(Object.keys(linkGraph.paintrackerLinks));
  
  const missing = [];
  for (const page of resourcePages) {
    if (!targetedPaths.has(page)) {
      missing.push(page);
    }
  }
  
  return missing;
}

function main() {
  const schedule = loadSchedule();
  const linkGraph = analyzeLinkGraph(schedule);
  const clusters = assignClusters(schedule);
  const missingPages = discoverMissingPages(schedule, linkGraph);
  
  console.log('=== PHASE 0: GLOBAL LINK GRAPH ANALYSIS ===\n');
  console.log(`Total links analyzed: ${linkGraph.totalLinks}`);
  console.log(`PainTracker.ca links: ${linkGraph.paintrackerTotal}`);
  console.log(`Blog.paintracker.ca links: ${linkGraph.blogtrackerTotal}`);
  console.log(`Homepage share: ${((linkGraph.paintrackerLinks['/'] || 0) / linkGraph.paintrackerTotal * 100).toFixed(1)}%`);
  console.log(`Resources share: ${((linkGraph.paintrackerLinks['/resources'] || 0) / linkGraph.paintrackerTotal * 100).toFixed(1)}%`);
  console.log(`Download share: ${((linkGraph.paintrackerLinks['/download'] || 0) / linkGraph.paintrackerTotal * 100).toFixed(1)}%`);
  console.log(`Tracking-data-policy share: ${((linkGraph.paintrackerLinks['/tracking-data-policy'] || 0) / linkGraph.paintrackerTotal * 100).toFixed(1)}%`);
  
  console.log('\n=== LINK DISTRIBUTION BY TARGET ===\n');
  const sorted = Object.entries(linkGraph.paintrackerLinks)
    .sort((a,b) => b[1] - a[1]);
  for (const [path, count] of sorted) {
    const pct = (count / linkGraph.paintrackerTotal * 100).toFixed(1);
    console.log(`${path}: ${count} links (${pct}%)`);
  }
  
  console.log('\n=== PHASE 1: CLUSTER MAPPING ===\n');
  for (const [cluster, posts] of Object.entries(clusters)) {
    if (posts.length > 0) {
      console.log(`${cluster}: ${posts.length} posts`);
      console.log(`  Posts: ${posts.slice(0, 5).join(', ')}${posts.length > 5 ? '...' : ''}`);
    }
  }
  
  console.log('\n=== PHASE 9: MISSING PAGES ===\n');
  console.log('Pages mentioned in content but missing from link_map:');
  for (const page of missingPages) {
    console.log(`- ${page}`);
  }
  
  console.log('\n=== SUCCESS METRICS CHECK ===\n');
  const homepageShare = (linkGraph.paintrackerLinks['/'] || 0) / linkGraph.paintrackerTotal;
  const resourceShare = ((linkGraph.paintrackerLinks['/resources'] || 0) + sumResourceChildren(linkGraph.paintrackerLinks)) / linkGraph.paintrackerTotal;
  const downloadShare = (linkGraph.paintrackerLinks['/download'] || 0) / linkGraph.paintrackerTotal;
  
  console.log(`Homepage share: ${(homepageShare * 100).toFixed(1)}% (target: 5-10%)`);
  console.log(`Resource share: ${(resourceShare * 100).toFixed(1)}% (target: 25-40%)`);
  console.log(`Download share: ${(downloadShare * 100).toFixed(1)}% (target: 10-20%)`);
}

function sumResourceChildren(links) {
  return Object.keys(links)
    .filter(p => p.startsWith('/resources/'))
    .reduce((sum, p) => sum + links[p], 0);
}

main();