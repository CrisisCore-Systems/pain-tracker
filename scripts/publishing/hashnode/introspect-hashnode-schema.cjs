/**
 * Hashnode GraphQL schema introspection helper
 *
 * Usage:
 *   node scripts/publishing/hashnode/introspect-hashnode-schema.cjs
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
            reject(new Error(`JSON parse error: ${err.message}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function getType(name) {
  const query = `
    query TypeInfo($name: String!) {
      __type(name: $name) {
        name
        kind
        fields {
          name
          type {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
          args {
            name
            type {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
        inputFields {
          name
          type {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
        }
      }
    }
  `;

  return gqlRequest(query, { name });
}

function flattenType(typeNode) {
  if (!typeNode) return 'unknown';
  if (typeNode.kind === 'NON_NULL') return `${flattenType(typeNode.ofType)}!`;
  if (typeNode.kind === 'LIST') return `[${flattenType(typeNode.ofType)}]`;
  return typeNode.name || typeNode.kind;
}

function printSection(title) {
  console.log('');
  console.log(`=== ${title} ===`);
}

function filterRelevant(items) {
  const re = /(page|publication|post|seo|home|archive|settings|static|route|update|edit)/i;
  return items.filter((item) => re.test(item.name));
}

async function main() {
  const mutationInfo = await getType('Mutation');
  if (mutationInfo.errors) {
    console.error('Mutation introspection errors:', JSON.stringify(mutationInfo.errors, null, 2));
    process.exit(1);
  }

  const queryInfo = await getType('Query');
  if (queryInfo.errors) {
    console.error('Query introspection errors:', JSON.stringify(queryInfo.errors, null, 2));
    process.exit(1);
  }

  const publicationInfo = await getType('Publication');
  const staticPageInfo = await getType('StaticPage');
  const updatePostInputInfo = await getType('UpdatePostInput');
  const seoInputInfo = await getType('SEOInput');
  const seoInfo = await getType('SEO');
  const openGraphMetaDataInputInfo = await getType('OpenGraphMetaDataInput');
  const metaTagsInputInfo = await getType('MetaTagsInput');
  const updatePostSettingsInputInfo = await getType('UpdatePostSettingsInput');

  const mutationFields = mutationInfo?.data?.__type?.fields || [];
  const queryFields = queryInfo?.data?.__type?.fields || [];
  const publicationFields = publicationInfo?.data?.__type?.fields || [];
  const staticPageFields = staticPageInfo?.data?.__type?.fields || [];
  const updatePostInputFields = updatePostInputInfo?.data?.__type?.inputFields || [];
  const seoInputFields = seoInputInfo?.data?.__type?.inputFields || [];
  const seoFields = seoInfo?.data?.__type?.fields || [];
  const ogInputFields = openGraphMetaDataInputInfo?.data?.__type?.inputFields || [];
  const metaTagsInputFields = metaTagsInputInfo?.data?.__type?.inputFields || [];
  const updatePostSettingsInputFields = updatePostSettingsInputInfo?.data?.__type?.inputFields || [];

  printSection('Relevant Mutations');
  for (const field of filterRelevant(mutationFields)) {
    const argList = (field.args || [])
      .map((arg) => `${arg.name}: ${flattenType(arg.type)}`)
      .join(', ');
    console.log(`- ${field.name}(${argList})`);
  }

  printSection('Relevant Query Fields');
  for (const field of filterRelevant(queryFields)) {
    const argList = (field.args || [])
      .map((arg) => `${arg.name}: ${flattenType(arg.type)}`)
      .join(', ');
    console.log(`- ${field.name}(${argList}) -> ${flattenType(field.type)}`);
  }

  printSection('Publication Type Fields (relevant)');
  for (const field of filterRelevant(publicationFields)) {
    const argList = (field.args || [])
      .map((arg) => `${arg.name}: ${flattenType(arg.type)}`)
      .join(', ');
    console.log(`- ${field.name}(${argList}) -> ${flattenType(field.type)}`);
  }

  printSection('StaticPage Type Fields');
  for (const field of staticPageFields) {
    const argList = (field.args || [])
      .map((arg) => `${arg.name}: ${flattenType(arg.type)}`)
      .join(', ');
    console.log(`- ${field.name}(${argList}) -> ${flattenType(field.type)}`);
  }

  printSection('UpdatePostInput Fields');
  for (const field of updatePostInputFields) {
    console.log(`- ${field.name}: ${flattenType(field.type)}`);
  }

  printSection('SEOInput Fields');
  for (const field of seoInputFields) {
    console.log(`- ${field.name}: ${flattenType(field.type)}`);
  }

  printSection('SEO Type Fields');
  for (const field of seoFields) {
    const argList = (field.args || [])
      .map((arg) => `${arg.name}: ${flattenType(arg.type)}`)
      .join(', ');
    console.log(`- ${field.name}(${argList}) -> ${flattenType(field.type)}`);
  }

  printSection('OpenGraphMetaDataInput Fields');
  for (const field of ogInputFields) {
    console.log(`- ${field.name}: ${flattenType(field.type)}`);
  }

  printSection('MetaTagsInput Fields');
  for (const field of metaTagsInputFields) {
    console.log(`- ${field.name}: ${flattenType(field.type)}`);
  }

  printSection('UpdatePostSettingsInput Fields');
  for (const field of updatePostSettingsInputFields) {
    console.log(`- ${field.name}: ${flattenType(field.type)}`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
