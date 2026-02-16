import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const roots = [
  'docs/content/blog',
  'docs/marketing',
  'docs/seo',
  'pages',
  'README.md',
  'CHANGELOG.md',
].map((p) => path.join(repoRoot, p));

const extensions = new Set(['.md', '.mdx', '.ts', '.tsx', '.js', '.jsx', '.json', '.html']);

function isFileOfInterest(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return extensions.has(ext);
}

function walk(currentPath, outFiles) {
  if (!fs.existsSync(currentPath)) return;
  const stat = fs.statSync(currentPath);
  if (stat.isFile()) {
    if (isFileOfInterest(currentPath)) outFiles.push(currentPath);
    return;
  }
  if (!stat.isDirectory()) return;

  for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
    // Skip huge / irrelevant folders
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'build', 'coverage', '.git', 'artifacts'].includes(entry.name)) continue;
    }
    walk(path.join(currentPath, entry.name), outFiles);
  }
}

const files = [];
for (const root of roots) walk(root, files);

const slugSet = new Set();

// Match /blog/<slug> where slug is kebab-case-ish
const relativeBlogSlugRe = /\/blog\/([a-z0-9][a-z0-9-]*)(?=\b|\/|\)|\"|\'|\s)/g;
const absoluteBlogSlugRe = /https?:\/\/(?:www\.)?paintracker\.ca\/blog\/([a-z0-9][a-z0-9-]*)(?=\b|\/|\)|\"|\'|\s)/g;

for (const filePath of files) {
  let text;
  try {
    text = fs.readFileSync(filePath, 'utf8');
  } catch {
    continue;
  }

  for (const re of [relativeBlogSlugRe, absoluteBlogSlugRe]) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(text)) !== null) {
      const slug = match[1];
      if (!slug) continue;
      // Avoid template placeholders
      if (slug.includes(':') || slug.includes('*')) continue;
      slugSet.add(slug);
    }
  }
}

const slugs = Array.from(slugSet).sort();

const outDir = path.join(repoRoot, 'artifacts');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const outPath = path.join(outDir, 'legacy-blog-slugs.json');
fs.writeFileSync(outPath, JSON.stringify({ count: slugs.length, slugs }, null, 2) + '\n', 'utf8');

console.log(`Found ${slugs.length} unique legacy /blog/<slug> values`);
console.log(`Wrote ${path.relative(repoRoot, outPath)}`);
