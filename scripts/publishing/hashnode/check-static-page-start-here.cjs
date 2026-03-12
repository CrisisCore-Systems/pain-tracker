/**
 * Verify Hashnode static page content for /page/start-here
 *
 * Usage:
 *   node scripts/publishing/hashnode/check-static-page-start-here.cjs
 */

const https = require('https');

function gqlRequest(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const req = https.request(
      {
        hostname: 'gql.hashnode.com',
        port: 443,
        path: '/',
        method: 'POST',
        headers: {
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
            reject(new Error(`Failed to parse response: ${err.message}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function firstNonEmptyLine(text) {
  return (
    (text || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0) || '(none)'
  );
}

async function main() {
  const query = `
    query StaticPage($host: String!, $slug: String!) {
      publication(host: $host) {
        staticPage(slug: $slug) {
          id
          title
          slug
          hidden
          seo {
            title
            description
          }
          content {
            markdown
          }
        }
      }
    }
  `;

  const variables = {
    host: 'blog.paintracker.ca',
    slug: 'start-here',
  };

  const res = await gqlRequest(query, variables);

  if (res.errors) {
    console.error('GraphQL errors:', JSON.stringify(res.errors, null, 2));
    process.exit(1);
  }

  const page = res?.data?.publication?.staticPage;
  if (!page) {
    console.log('No static page found for slug start-here');
    process.exit(2);
  }

  console.log('Static page found:');
  console.log(`- id: ${page.id}`);
  console.log(`- title: ${page.title}`);
  console.log(`- slug: ${page.slug}`);
  console.log(`- hidden: ${page.hidden}`);
  console.log(`- seo.title: ${page?.seo?.title || '(empty)'}`);
  console.log(`- seo.description: ${page?.seo?.description || '(empty)'}`);
  console.log(`- first markdown line: ${firstNonEmptyLine(page?.content?.markdown)}`);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
