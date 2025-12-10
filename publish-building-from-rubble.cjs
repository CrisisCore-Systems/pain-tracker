// Hashnode Publish Script - Building From Rubble
const fs = require('fs');
const https = require('https');

const token = '3bcede56-cf20-4ce5-885f-d7a3c4b599d0';
const publicationId = '6914f549d535ac1991dcb8b2';

// Read the markdown file
let content = fs.readFileSync('blog-building-from-rubble.md', 'utf8');

// Remove the first line if it's just intro text (not the title)
const lines = content.split('\n');
// Find where the actual content starts (after any intro text before the ---)
let startIndex = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '---') {
    startIndex = i;
    break;
  }
}

// Get content starting from first ---
content = lines.slice(startIndex).join('\n');

// Remove the H1 title from content body (find first # heading and remove it)
const contentLines = content.split('\n');
let titleRemoved = false;
const finalLines = contentLines.filter(line => {
  if (!titleRemoved && line.startsWith('# ') && !line.startsWith('## ')) {
    titleRemoved = true;
    return false;
  }
  return true;
});
const contentWithoutTitle = finalLines.join('\n').trim();

const title = 'Coding Through Collapse: Building Software From Motel Rooms and Concrete Nooks';
const slug = 'coding-through-collapse';

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
      { slug: 'mental-health', name: 'Mental Health' },
      { slug: 'open-source', name: 'Open Source' },
      { slug: 'personal-story', name: 'Personal Story' },
      { slug: 'privacy', name: 'Privacy' },
      { slug: 'healthcare', name: 'Healthcare' },
      { slug: 'developer-stories', name: 'Developer Stories' }
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
console.log('Content length:', contentWithoutTitle.length, 'characters');
console.log('---');

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
        console.log('✅ Success!');
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
