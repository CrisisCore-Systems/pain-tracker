/**
 * Week 1 P0 rendered metadata fixer (post-level)
 *
 * Purpose:
 * - Update post meta tags (<title>/<meta description>) using updatePost.metaTags
 * - Address rendered metadata drift discovered after content-only updates
 *
 * Targets:
 * - paintracker-privacy-first-trauma-informed-pain-app
 * - stop-filling-worksafebc-forms-manually-this-auto-generates-them-for-free
 *
 * Usage:
 *   $env:HASHNODE_TOKEN="<token>"; node scripts/publishing/hashnode/week1-p0-fix-rendered-metadata.cjs
 *   $env:HASHNODE_TOKEN="<token>"; node scripts/publishing/hashnode/week1-p0-fix-rendered-metadata.cjs --dry-run
 */

const https = require('https');

const TOKEN = process.env.HASHNODE_TOKEN || '';
const HOST = 'blog.paintracker.ca';
const DRY_RUN = process.argv.includes('--dry-run');

const TARGETS = [
  {
    slug: 'paintracker-privacy-first-trauma-informed-pain-app',
    title: 'Pain Tracker: Privacy-First, Trauma-Informed Pain App',
    description:
      'Track flares, spot patterns, prepare for appointments, and keep records private. Pain Tracker works offline with no account required.',
  },
  {
    slug: 'stop-filling-worksafebc-forms-manually-this-auto-generates-them-for-free',
    title: 'Generate WorkSafeBC-Ready Documentation with Pain Tracker',
    description:
      'Generate WorkSafeBC-ready documentation faster with structured pain logs, export-ready records, and privacy-first local data handling.',
  },
];

function gqlRequest(query, variables) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const req = https.request(
      {
        hostname: 'gql.hashnode.com',
        port: 443,
        path: '/',
        method: 'POST',
        headers: {
          Authorization: TOKEN,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(new Error(`Failed to parse GraphQL response: ${err.message}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function getPostBySlug(slug) {
  const query = `
    query GetPost($host: String!, $slug: String!) {
      publication(host: $host) {
        post(slug: $slug) {
          id
          slug
          title
          url
        }
      }
    }
  `;

  const response = await gqlRequest(query, { host: HOST, slug });
  if (response.errors) {
    return { ok: false, errors: response.errors };
  }

  const post = response?.data?.publication?.post;
  if (!post) {
    return { ok: false, errors: [{ message: 'Post not found' }] };
  }

  return { ok: true, post };
}

async function updatePostMetaTags(input) {
  const mutation = `
    mutation UpdatePost($input: UpdatePostInput!) {
      updatePost(input: $input) {
        post {
          id
          slug
          title
          url
        }
      }
    }
  `;

  const response = await gqlRequest(mutation, { input });
  if (response.errors) {
    return { ok: false, errors: response.errors };
  }

  const post = response?.data?.updatePost?.post;
  if (!post) {
    return { ok: false, errors: [{ message: 'Unexpected update response' }] };
  }

  return { ok: true, post };
}

async function main() {
  console.log('Week 1 P0 rendered metadata fixer');
  console.log('----------------------------------');

  if (!DRY_RUN && !TOKEN) {
    console.error('ERROR: HASHNODE_TOKEN is required.');
    process.exit(1);
  }

  for (const target of TARGETS) {
    const lookup = await getPostBySlug(target.slug);
    if (!lookup.ok) {
      console.error(`[ERROR] ${target.slug}: ${lookup.errors?.[0]?.message || 'lookup failed'}`);
      continue;
    }

    const input = {
      id: lookup.post.id,
      title: target.title,
      slug: target.slug,
      metaTags: {
        title: target.title,
        description: target.description,
      },
    };

    if (DRY_RUN) {
      console.log(`[DRY-RUN] ${target.slug}`);
      console.log(`  id: ${lookup.post.id}`);
      console.log(`  metaTags.title: ${target.title}`);
      console.log(`  metaTags.description: ${target.description}`);
      continue;
    }

    const result = await updatePostMetaTags(input);
    if (!result.ok) {
      console.error(`[ERROR] ${target.slug}: ${JSON.stringify(result.errors)}`);
      continue;
    }

    console.log(`[OK] Updated metadata for ${target.slug}`);
    console.log(`  url: ${result.post.url}`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
