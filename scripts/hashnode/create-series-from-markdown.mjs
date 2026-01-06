import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';

const endpoint = 'https://gql.hashnode.com/';

function parseArgs(argv) {
  const args = {
    execute: false,
    publicationId: undefined,
    seriesName: 'From Idea to Accessible Health PWA',
    seriesSlug: 'from-idea-to-accessible-health-pwa',
    seriesDescription:
      'A 12-part series on building a privacy-first, accessibility-first, offline-first health PWA.',
    partsDir: 'docs/blog/series-from-idea-to-accessible-health-pwa',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === '--execute') {
      args.execute = true;
      continue;
    }

    if (token === '--dry-run') {
      args.execute = false;
      continue;
    }

    if (token === '--publication-id') {
      args.publicationId = argv[i + 1];
      i += 1;
      continue;
    }

    if (token === '--series-name') {
      args.seriesName = argv[i + 1];
      i += 1;
      continue;
    }

    if (token === '--series-slug') {
      args.seriesSlug = argv[i + 1];
      i += 1;
      continue;
    }

    if (token === '--series-description') {
      args.seriesDescription = argv[i + 1];
      i += 1;
      continue;
    }

    if (token === '--parts-dir') {
      args.partsDir = argv[i + 1];
      i += 1;
      continue;
    }

    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
  }

  return args;
}

function usage() {
  return [
    'Usage:',
    '  node scripts/hashnode/create-series-from-markdown.mjs [options]',
    '',
    'Options:',
    '  --dry-run              Default. Prints actions without creating anything on Hashnode.',
    '  --execute              Performs network writes (creates series + drafts).',
    '  --publication-id <id>  Skip interactive selection; use this publication ID.',
    '  --series-name <name>   Series title (default: From Idea to Accessible Health PWA).',
    '  --series-slug <slug>   Series slug (default: from-idea-to-accessible-health-pwa).',
    '  --series-description <markdown>  Series descriptionMarkdown.',
    '  --parts-dir <path>     Directory containing part-01..part-12 markdown files.',
    '',
    'Auth:',
    '  Dry-run does not require auth. For --execute, set $env:HASHNODE_TOKEN (or $env:HASHNODE_API_KEY) in PowerShell.',
    '  Optional: set $env:HASHNODE_PUBLICATION_ID to skip interactive publication selection.',
  ].join('\n');
}

async function gql({ token, query, variables }) {
  const trimmedToken = token?.trim();
  // This repo's existing Hashnode scripts send the token directly as Authorization.
  // Keep that behavior (also works if the value is already "Bearer ...").

  async function doRequest(authorizationValue) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: authorizationValue,
        'x-hashnode-access-token': trimmedToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const payload = await response.json();
    return { response, payload };
  }

  const first = await doRequest(trimmedToken);

  const firstUnauth = first.payload?.errors?.some((e) => e?.extensions?.code === 'UNAUTHENTICATED');
  if (firstUnauth) {
    const second = await doRequest(`Bearer ${trimmedToken}`);
    const secondUnauth = second.payload?.errors?.some((e) => e?.extensions?.code === 'UNAUTHENTICATED');
    if (!secondUnauth && second.response.ok && !second.payload.errors) {
      return second.payload.data;
    }

    const message = second.payload?.errors?.[0]?.message ?? 'You must be authenticated.';
    const error = new Error(message);
    error.details = second.payload;
    throw error;
  }

  if (!first.response.ok || first.payload.errors) {
    const firstError = first.payload?.errors?.[0];
    const message = firstError?.message ?? `HTTP ${first.response.status}`;
    const error = new Error(message);
    error.details = first.payload;
    throw error;
  }

  return first.payload.data;
}

function pickPublicationHost(publication) {
  return (
    publication?.domainInfo?.domain?.host ??
    publication?.domainInfo?.wwwPrefixedDomain?.host ??
    publication?.domainInfo?.hashnodeSubdomain ??
    publication?.url
  );
}

async function choosePublication({ token }) {
  const data = await gql({
    token,
    query: `query {
      me {
        publications(first: 50) {
          edges {
            node {
              id
              title
              url
              domainInfo {
                hashnodeSubdomain
                domain { host ready }
                wwwPrefixedDomain { host ready }
              }
            }
          }
        }
      }
    }`,
  });

  const pubs = (data.me?.publications?.edges ?? []).map((e) => e.node);

  if (pubs.length === 0) {
    throw new Error('No publications found for this account.');
  }

  if (pubs.length === 1) {
    return pubs[0];
  }

  // Interactive selection.
  console.log('Select a publication:');
  pubs.forEach((p, idx) => {
    console.log(`  [${idx + 1}] ${p.title} — ${pickPublicationHost(p)}`);
  });

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(`Enter 1-${pubs.length}: `);
    const picked = Number.parseInt(answer, 10);
    if (!Number.isFinite(picked) || picked < 1 || picked > pubs.length) {
      throw new Error('Invalid selection.');
    }
    return pubs[picked - 1];
  } finally {
    rl.close();
  }
}

function extractTitle(markdown) {
  const lines = markdown.split(/\r?\n/);
  const h1 = lines.find((l) => l.startsWith('# '));
  if (!h1) return undefined;

  return h1
    .replace(/^#\s+/, '')
    .replace(/^Part\s+\d+\s+—\s+/i, '')
    .trim();
}

function normalizeContent(markdown) {
  const lines = markdown.split(/\r?\n/);

  // Drop markdownlint header comment if present.
  while (lines.length && /^<!--\s*markdownlint-disable\b/i.test(lines[0].trim())) {
    lines.shift();
    while (lines.length && lines[0].trim() === '') lines.shift();
  }

  // Drop back-to-hub link block if present.
  if (lines.length && /^\[Back to series hub\]\(/i.test(lines[0].trim())) {
    lines.shift();
    while (lines.length && lines[0].trim() === '') lines.shift();
  }

  // Drop the first H1 (title handled separately).
  const firstH1Index = lines.findIndex((l) => l.startsWith('# '));
  if (firstH1Index >= 0) {
    lines.splice(firstH1Index, 1);
    // Drop immediate blank lines after removing title.
    while (lines.length && lines[0].trim() === '') lines.shift();
  }

  return lines.join('\n').trim() + '\n';
}

async function getPartFiles(partsDir) {
  const absDir = path.resolve(process.cwd(), partsDir);
  const entries = await fs.readdir(absDir, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && /^part-\d{2}-.*\.md$/i.test(e.name))
    .map((e) => path.join(absDir, e.name))
    .sort((a, b) => a.localeCompare(b));

  return files;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage());
    process.exit(0);
  }

  const partFiles = await getPartFiles(args.partsDir);
  if (partFiles.length === 0) {
    throw new Error(`No part files found under: ${args.partsDir}`);
  }

  const envPublicationId = process.env.HASHNODE_PUBLICATION_ID?.trim();
  const publicationIdFromArgsOrEnv = args.publicationId ?? envPublicationId;

  const plan = {
    publicationId: publicationIdFromArgsOrEnv ?? null,
    series: {
      name: args.seriesName,
      slug: args.seriesSlug,
    },
    drafts: [],
  };

  for (const filePath of partFiles) {
    const raw = await fs.readFile(filePath, 'utf8');
    const title = extractTitle(raw) ?? path.basename(filePath);
    const contentMarkdown = normalizeContent(raw);

    plan.drafts.push({
      file: path.relative(process.cwd(), filePath).split(path.sep).join('/'),
      title,
      slug: path.basename(filePath, '.md'),
      contentChars: contentMarkdown.length,
    });
  }

  if (!args.execute) {
    console.log(JSON.stringify({ execute: false, ...plan }, null, 2));
    console.log('\nDry run only. Re-run with --execute to create on Hashnode.');
    return;
  }

  const token = (process.env.HASHNODE_TOKEN ?? process.env.HASHNODE_API_KEY)?.trim();
  if (!token) {
    console.error('Missing env var: HASHNODE_TOKEN (or HASHNODE_API_KEY) required for --execute');
    console.error('PowerShell example: $env:HASHNODE_TOKEN="<your token here>"');
    console.error('Note: terminal env vars override .env values; open a new terminal if needed.');
    process.exit(2);
  }

  const publication = publicationIdFromArgsOrEnv
    ? { id: publicationIdFromArgsOrEnv }
    : await choosePublication({ token });

  const publicationId = publication.id;

  const seriesData = await gql({
    token,
    query: `mutation($input: CreateSeriesInput!) {
      createSeries(input: $input) {
        series { id name slug cuid }
      }
    }`,
    variables: {
      input: {
        name: args.seriesName,
        slug: args.seriesSlug,
        publicationId,
        descriptionMarkdown: args.seriesDescription,
      },
    },
  });

  const series = seriesData.createSeries.series;
  const seriesIdCandidates = [series.cuid, series.id].filter(Boolean);

  console.log('Created series:', { id: series.id, cuid: series.cuid, name: series.name, slug: series.slug });

  for (const draftPlan of plan.drafts) {
    const absPath = path.resolve(process.cwd(), draftPlan.file);
    const raw = await fs.readFile(absPath, 'utf8');
    const title = extractTitle(raw) ?? draftPlan.slug;
    const contentMarkdown = normalizeContent(raw);

    let lastError;

    for (const seriesId of seriesIdCandidates) {
      try {
        const draftData = await gql({
          token,
          query: `mutation($input: CreateDraftInput!) {
            createDraft(input: $input) {
              draft {
                id
                slug
                title
                series { id name slug cuid }
              }
            }
          }`,
          variables: {
            input: {
              publicationId,
              title,
              slug: draftPlan.slug,
              contentMarkdown,
              seriesId,
            },
          },
        });

        console.log('Created draft:', {
          file: draftPlan.file,
          draftId: draftData.createDraft.draft?.id,
          slug: draftData.createDraft.draft?.slug,
          seriesIdUsed: seriesId,
        });

        lastError = undefined;
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (lastError) {
      console.error('Failed creating draft:', draftPlan.file);
      console.error(lastError.message);
      console.error(JSON.stringify(lastError.details ?? null, null, 2));
      throw lastError;
    }
  }
}

main().catch((err) => {
  const message = err?.message ?? String(err);
  const unauthenticated =
    message === 'You must be authenticated.' ||
    err?.details?.errors?.some((e) => e?.extensions?.code === 'UNAUTHENTICATED');

  if (unauthenticated) {
    console.error('Hashnode auth failed (UNAUTHENTICATED).');
    console.error('Fix: set a valid token in the SAME terminal session, then re-run.');
    console.error('$env:HASHNODE_TOKEN="<your token>"; node .\\scripts\\hashnode\\whoami.mjs');
    console.error('Then: node .\\scripts\\hashnode\\create-series-from-markdown.mjs --execute');
  } else {
    console.error(message);
  }

  process.exit(1);
});
