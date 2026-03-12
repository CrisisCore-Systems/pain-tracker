/**
 * Week 1 P0 Hashnode API Checklist Runner
 *
 * Purpose:
 * - Validates Hashnode API credentials are present
 * - Verifies target slugs exist on blog.paintracker.ca
 * - Prints a deterministic publish/update checklist for Week 1 P0
 *
 * This script is intentionally read-only. It does not mutate posts.
 * Use it as a preflight gate before running update scripts.
 *
 * Usage:
 *   node scripts/publishing/hashnode/week1-p0-api-checklist.cjs
 */

const https = require('https');

const TOKEN = process.env.HASHNODE_TOKEN || '';
const HOST = 'blog.paintracker.ca';

const WEEK1_TARGETS = [
  {
    url: 'https://blog.paintracker.ca/',
    slug: null,
    label: 'Homepage',
    publishType: 'publication-settings',
  },
  {
    url: 'https://blog.paintracker.ca/paintracker-privacy-first-trauma-informed-pain-app',
    slug: 'paintracker-privacy-first-trauma-informed-pain-app',
    label: 'Privacy Explainer',
    publishType: 'post-update',
  },
  {
    url: 'https://blog.paintracker.ca/stop-filling-worksafebc-forms-manually-this-auto-generates-them-for-free',
    slug: 'stop-filling-worksafebc-forms-manually-this-auto-generates-them-for-free',
    label: 'WorkSafeBC Documentation',
    publishType: 'post-update',
  },
  {
    url: 'https://blog.paintracker.ca/archive',
    slug: null,
    label: 'Archive',
    publishType: 'publication-settings',
  },
  {
    url: 'https://blog.paintracker.ca/page/start-here',
    slug: 'start-here',
    label: 'Start Here',
    publishType: 'post-update',
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
          title
          slug
          url
        }
      }
    }
  `;

  const variables = { host: HOST, slug };
  const response = await gqlRequest(query, variables);

  if (response.errors) {
    return { ok: false, errors: response.errors };
  }

  const post = response?.data?.publication?.post;
  if (!post) {
    return { ok: false, errors: [{ message: 'Post not found' }] };
  }

  return { ok: true, post };
}

async function main() {
  console.log('Week 1 P0 API preflight');
  console.log('----------------------');

  if (!TOKEN) {
    console.error('ERROR: HASHNODE_TOKEN is missing.');
    console.error('Set it in PowerShell before running API publish steps:');
    console.error('  $env:HASHNODE_TOKEN="<your-token>"');
    process.exit(1);
  }

  console.log('HASHNODE_TOKEN: SET');
  console.log(`Publication host: ${HOST}`);
  console.log('');

  for (const target of WEEK1_TARGETS) {
    if (!target.slug) {
      console.log(`[INFO] ${target.label}`);
      console.log(`  URL: ${target.url}`);
      console.log(`  Type: ${target.publishType}`);
      console.log('  Note: This is publication-level content/settings and may require UI update.');
      console.log('');
      continue;
    }

    const result = await getPostBySlug(target.slug);
    if (result.ok) {
      console.log(`[OK] ${target.label}`);
      console.log(`  slug: ${result.post.slug}`);
      console.log(`  id: ${result.post.id}`);
      console.log(`  url: ${result.post.url}`);
    } else {
      console.log(`[WARN] ${target.label}`);
      console.log(`  slug: ${target.slug}`);
      console.log(`  error: ${result.errors?.[0]?.message || 'Unknown error'}`);
    }
    console.log('');
  }

  console.log('Next step: use docs/seo/WEEK1_P0_CMS_STAGING_BLOCKS.md as single source for publish copy.');
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
