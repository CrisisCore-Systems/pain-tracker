import 'dotenv/config';
import https from 'node:https';

const API_KEY = process.env.HASHNODE_API_KEY;
const PUBLICATION_ID = process.env.HASHNODE_PUBLICATION_ID;
const PUBLICATION_HOST = process.env.HASHNODE_HOST || 'blog.paintracker.ca';

if (!API_KEY || !PUBLICATION_ID) {
  console.error('❌ Error: HASHNODE_API_KEY or HASHNODE_PUBLICATION_ID is missing in .env');
  process.exit(1);
}

const TOP_CTA = `> **Try Pain Tracker →** [Start Tracking (Free & Private)](https://paintracker.ca)\n\n`;

const BOTTOM_CTA = `

---

### 💬 Discussion
**What health app has failed you in crisis? Share below.**

### 🛠️ Contribute
See something to improve? [Open an issue →](https://github.com/CrisisCore-Systems/pain-tracker/issues)

### 📬 Stay Updated
[Get notified when I publish technical deep-dives](https://blog.paintracker.ca/newsletter)
`;

async function gqlRequest(query, variables) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      query,
      variables
    });

    const options = {
      hostname: 'gql.hashnode.com',
      path: '/',
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(responseBody);
          if (json.errors) {
            reject(new Error(JSON.stringify(json.errors, null, 2)));
          } else {
            resolve(json.data);
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function getAllPosts() {
  console.log(`🔍 Fetching posts from ${PUBLICATION_HOST}...`);
  const query = `
    query GetPosts($host: String!) {
      publication(host: $host) {
        posts(first: 20) {
          edges {
            node {
              id
              title
              slug
              content {
                markdown
              }
            }
          }
        }
      }
    }
  `;
  
  const data = await gqlRequest(query, { host: PUBLICATION_HOST });
  return data?.publication?.posts?.edges?.map(edge => edge.node) || [];
}

async function updatePost(post) {
  console.log(`📝 Processing "${post.title}"...`);
  
  let content = post.content.markdown;

  // 1. Remove Old CTA if present
  // The old CTA had this unique header
  if (content.includes('### 🚀 Take Control of Your Pain Management')) {
      console.log('   - Removing old CTA...');
      const parts = content.split('### 🚀 Take Control of Your Pain Management');
      // Keep everything before the old CTA
      content = parts[0].trim();
      
      // Clean up any trailing separator lines
      if (content.endsWith('---')) {
          content = content.slice(0, -3).trim();
      }
  }

  // 2. Add Top CTA
  if (!content.includes('> **Try Pain Tracker →**')) {
      console.log('   - Adding Top CTA...');
      content = TOP_CTA + content;
  } else {
      console.log('   - Top CTA already present.');
  }

  // 3. Add Bottom CTA
  if (!content.includes('What health app has failed you in crisis?')) {
      console.log('   - Adding Bottom CTA...');
      content = content + BOTTOM_CTA;
  } else {
      console.log('   - Bottom CTA already present.');
  }

  if (content === post.content.markdown) {
      console.log('   - No changes needed.');
      return;
  }

  const mutation = `
    mutation UpdatePost($input: UpdatePostInput!) {
      updatePost(input: $input) {
        post {
          id
          url
          title
        }
      }
    }
  `;

  const variables = {
    input: {
      id: post.id,
      contentMarkdown: content
    }
  };

  try {
    const data = await gqlRequest(mutation, variables);
    console.log(`✅ Updated: ${data.updatePost.post.url}`);
  } catch (error) {
    console.error(`❌ Failed to update "${post.title}":`, error.message);
  }
}

async function main() {
  try {
    const posts = await getAllPosts();
    console.log(`Found ${posts.length} posts.`);

    for (const post of posts) {
      await updatePost(post);
      // Add a small delay to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('🎉 All done!');

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

main();
