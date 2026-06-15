import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const publicAssetsDir = path.join(repoRoot, 'public', 'assets');
const scanRoots = [path.join(repoRoot, 'src', 'pages'), path.join(repoRoot, 'src', 'components')];
const scanFiles = [path.join(repoRoot, 'src', 'seo', 'publicRouteMetadata.js')];

function listFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      return listFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith('.tsx') ? [entryPath] : [];
  });
}

function stripUrlSuffix(value) {
  return value.split('#')[0].split('?')[0].trim();
}

function findAssetLinks(content) {
  const links = new Set();
  const patterns = [
    /["'`]\/assets\/([^"'`\s<>]+)/g,
    /href=["']\/assets\/([^"'\s<>]+)["']/g,
    /src=["']\/assets\/([^"'\s<>]+)["']/g,
  ];

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      links.add(stripUrlSuffix(`/assets/${match[1]}`));
    }
  }

  return [...links];
}

const files = [...scanRoots.flatMap(listFiles), ...scanFiles].filter(filePath =>
  fs.existsSync(filePath)
);
const missing = [];
const seen = new Set();

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf8');
  for (const assetPath of findAssetLinks(content)) {
    const key = `${filePath}:${assetPath}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    const assetFilePath = path.join(publicAssetsDir, assetPath.replace(/^\/assets\//, ''));
    if (!fs.existsSync(assetFilePath)) {
      missing.push({ assetPath, sourcePath: path.relative(repoRoot, filePath) });
    }
  }
}

if (missing.length > 0) {
  const details = missing
    .map(({ assetPath, sourcePath }) => `  - ${assetPath} linked from ${sourcePath}`)
    .join('\n');
  throw new Error(`Missing public assets:\n${details}`);
}

console.log(`Verified ${seen.size} /assets/ references under public/assets.`);
