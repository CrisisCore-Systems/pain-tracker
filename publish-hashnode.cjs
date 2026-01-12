// Hashnode Publish Script - Node.js version
const fs = require('fs');
const https = require('https');

const token = 'Ln5Dn15EREw4dqW47rHLY4H5';
const publicationId = '6914f549d535ac1991dcb8b2';

// Read the markdown file
const content = fs.readFileSync('docs/content/blog/blog-client-side-encryption-healthcare.md', 'utf8');

// Remove the H1 title from content (first line)
const contentLines = content.split('\n');
const contentWithoutTitle = contentLines.slice(1).join('\n').trim();

const title = 'Keeping Your Health Data Out of Court';
const slug = 'keeping-your-health-data-out-of-court';

const mutation = `
mutation PublishPost($input: PublishPostInput!) {
  publishPost(input: $input) {
    post {
      id
      title
      slug
      url
    }
  }
}
`;

const variables = {
  input: {
    title: title,
    slug: slug,
    contentMarkdown: contentWithoutTitle,
    publicationId: publicationId,
    tags: [
      { slug: 'encryption', name: 'Encryption' },
      { slug: 'healthcare', name: 'Healthcare' },
      { slug: 'privacy', name: 'Privacy' },
      { slug: 'security', name: 'Security' },
      { slug: 'typescript', name: 'TypeScript' },
      { slug: 'webcrypto', name: 'Web Crypto' }
    ]
  }
};

const data = JSON.stringify({
  query: mutation,
  variables: variables
});

const options = {
  hostname: 'gql.hashnode.com',
  port: 443,
  path: '/',
  method: 'POST',
  headers: {
    'Authorization': token,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('Publishing to Hashnode...');
console.log('Title:', title);
console.log('Slug:', slug);
console.log('Content length:', contentWithoutTitle.length);

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      
      if (response.errors) {
        console.error('Errors:', JSON.stringify(response.errors, null, 2));
      }
      
      if (response.data && response.data.publishPost && response.data.publishPost.post) {
        console.log('Success!');
        console.log('Post URL:', response.data.publishPost.post.url);
        console.log('Post details:', JSON.stringify(response.data.publishPost.post, null, 2));
      } else {
        console.log('Response:', JSON.stringify(response, null, 2));
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.write(data);
req.end();
