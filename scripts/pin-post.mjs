#!/usr/bin/env node
/**
 * Pin a post on Hashnode publication
 */

const HASHNODE_API = 'https://gql.hashnode.com';
const PUBLICATION_HOST = 'paintracker.hashnode.dev';
const POST_SLUG = 'spire-0033';

async function graphqlRequest(query, variables = {}) {
  const token = process.env.HASHNODE_TOKEN;
  
  if (!token) {
    throw new Error('HASHNODE_TOKEN environment variable is required.');
  }

  const response = await fetch(HASHNODE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();
  
  if (result.errors) {
    console.error('GraphQL Errors:', JSON.stringify(result.errors, null, 2));
    throw new Error(result.errors[0]?.message || 'GraphQL request failed');
  }

  return result.data;
}

async function getPostId() {
  const query = `
    query GetPost($host: String!, $slug: String!) {
      publication(host: $host) {
        id
        post(slug: $slug) {
          id
          title
        }
      }
    }
  `;

  const data = await graphqlRequest(query, {
    host: PUBLICATION_HOST,
    slug: POST_SLUG
  });

  return {
    postId: data.publication.post.id,
    publicationId: data.publication.id,
    title: data.publication.post.title
  };
}

async function pinPost(publicationId, postId) {
  // Hashnode uses updatePublication to set pinned post
  const mutation = `
    mutation UpdatePublication($input: UpdatePublicationInput!) {
      updatePublication(input: $input) {
        publication {
          id
          pinnedPost {
            id
            title
          }
        }
      }
    }
  `;

  const data = await graphqlRequest(mutation, {
    input: {
      publicationId: publicationId,
      pinnedPostId: postId
    }
  });

  return data.updatePublication.publication;
}

async function main() {
  console.log('📌 Pinning post on Hashnode...\n');

  try {
    const { postId, publicationId, title } = await getPostId();
    console.log(`Found post: "${title}"`);
    console.log(`Post ID: ${postId}`);
    console.log(`Publication ID: ${publicationId}\n`);

    const result = await pinPost(publicationId, postId);
    console.log('✅ Post pinned successfully!');
    console.log(`Pinned post: "${result.pinnedPost?.title}"`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
