#!/usr/bin/env node
/**
 * Publish a blog post to Hashnode via GraphQL API
 * 
 * Usage:
 *   Set environment variable: HASHNODE_TOKEN=your_personal_access_token
 *   Run: node scripts/publish-hashnode.mjs
 * 
 * Get your token at: https://hashnode.com/settings/developer
 */

const HASHNODE_API = 'https://gql.hashnode.com';
const PUBLICATION_HOST = 'paintracker.hashnode.dev'; // Your Hashnode publication

// Blog post content
const post = {
  title: "When I Was 33, Everything I'd Been Standing On Just... Disappeared",
  subtitle: "That was the year my wife left and took what I thought was home with her.",
  slug: "spire-0033",
  tags: [
    { slug: "chronic-pain", name: "chronic pain" },
    { slug: "housing-instability", name: "housing instability" },
    { slug: "privacy", name: "privacy" },
    { slug: "offline-first", name: "offline first" },
    { slug: "personal", name: "personal" },
    { slug: "trauma", name: "trauma" },
    { slug: "indie-dev", name: "indie dev" }
  ],
  coverImageURL: "https://blog.paintracker.ca/assets/spire-0033-cover.jpg",
  seo: {
    title: "When I Was 33, Everything I'd Been Standing On Just... Disappeared — PainTracker",
    description: "At 33 my marriage ended, my home vanished, and I learned the hard way that anything another person can take away was never safe. This is the story of how PainTracker — a fully offline, encrypted, eviction-proof pain journal — became the first foundation I ever truly owned."
  },
  contentMarkdown: `# When I Was 33, Everything I'd Been Standing On Just... Disappeared

That was the year my wife left and took what I thought was home with her.

One day I had keys to a place, mail with my name on it, a bedroom that felt like mine. The next? I'm stuffing my life into a duffel bag, bouncing between weekly motels and friends who'd let me crash for a few nights before the welcome wore thin.

The parole officer needed an address by Friday. The family court wanted proof of "stable housing" for custody visits. Meanwhile, I'm checking my phone at 2 AM to see if I've got enough for another night at the Sandman Inn.

Look, I'd been left before. Plenty of times. But this hit different because I was old enough to see the pattern clearly - thirty-three years of believing that if I just loved harder, tried better, stayed more useful, maybe someone would finally let me stay put.

That story died hard at 33.

What crawled out of the wreckage was uglier but honest: anything another person can take away with a single decision was never really yours to begin with.

If I wanted something that would survive breakups and evictions and caseworkers who lose your file, I'd have to build it myself. Out of code. Out of systems that lived in places no landlord could reach, no ex could delete, no bureaucrat could "accidentally" lose.

That's when PainTracker stopped being this little side thing I was tinkering with and became the first real foundation I'd ever poured with my own hands.

I'm 37 now. Still moving more than I'd like. Still writing code from whatever coffee shop has decent wifi and doesn't mind me camping out for hours.

The app exists because I needed something that couldn't get taken away when someone decided I wasn't worth keeping around. Something to track pain, sleep, meds, triggers - all the evidence you need when your body's betraying you and the people who should believe you... don't.

It sits on your phone. Encrypted. No cloud, no company reading your worst days, no servers that can get hacked or sold or subpoenaed. Export your data to whatever format you need. Take it with you when you have to leave.

Because we both know how fast "home" can become "former address."

You don't need my story to use it. You don't need to trust me or anyone else. Just download it, put your pain somewhere safe, and know that whatever happens next, at least that part stays yours.

https://paintracker.ca

No sales pitch. No inspirational garbage about turning pain into purpose.

Just a tool built by someone who learned the hard way that the ground can disappear overnight, and sometimes the only thing left to do is build something that floats.

— c.

---

*Published December 2025 • blog.paintracker.ca*
`,
  // Optional: set to true to publish as draft first
  publishAsDraft: false
};

// First, get publication ID
const getPublicationQuery = `
  query GetPublication($host: String!) {
    publication(host: $host) {
      id
      title
    }
  }
`;

// Mutation to publish post
const publishPostMutation = `
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

// Alternative: Create draft first
const createDraftMutation = `
  mutation CreateDraft($input: CreateDraftInput!) {
    createDraft(input: $input) {
      draft {
        id
        title
        slug
      }
    }
  }
`;

async function graphqlRequest(query, variables = {}) {
  const token = process.env.HASHNODE_TOKEN;
  
  if (!token) {
    throw new Error(
      'HASHNODE_TOKEN environment variable is required.\n' +
      'Get your token at: https://hashnode.com/settings/developer\n' +
      'Then run: HASHNODE_TOKEN=your_token node scripts/publish-hashnode.mjs'
    );
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

async function getPublicationId() {
  console.log(`\n📡 Fetching publication ID for ${PUBLICATION_HOST}...`);
  
  const data = await graphqlRequest(getPublicationQuery, {
    host: PUBLICATION_HOST
  });
  
  if (!data.publication) {
    throw new Error(`Publication not found: ${PUBLICATION_HOST}`);
  }
  
  console.log(`✅ Found publication: "${data.publication.title}" (${data.publication.id})`);
  return data.publication.id;
}

async function publishPost(publicationId) {
  console.log('\n📝 Publishing post...');
  
  const input = {
    publicationId,
    title: post.title,
    subtitle: post.subtitle,
    slug: post.slug,
    contentMarkdown: post.contentMarkdown,
    tags: post.tags,
    // Optional settings
    settings: {
      enableTableOfContent: false,
      isNewsletterActivated: true, // Send to newsletter subscribers
    },
  };

  // Add cover image if provided
  if (post.coverImageURL) {
    input.coverImageOptions = {
      coverImageURL: post.coverImageURL
    };
  }

  // Add SEO metadata if provided
  if (post.seo) {
    input.metaTags = {
      title: post.seo.title,
      description: post.seo.description
    };
  }

  const data = await graphqlRequest(publishPostMutation, { input });
  
  return data.publishPost.post;
}

async function createDraft(publicationId) {
  console.log('\n📝 Creating draft...');
  
  const input = {
    publicationId,
    title: post.title,
    subtitle: post.subtitle,
    slug: post.slug,
    contentMarkdown: post.contentMarkdown,
    tags: post.tags,
  };

  const data = await graphqlRequest(createDraftMutation, { input });
  
  return data.createDraft.draft;
}

async function main() {
  console.log('🚀 Hashnode Post Publisher');
  console.log('==========================');
  
  try {
    const publicationId = await getPublicationId();
    
    if (post.publishAsDraft) {
      const draft = await createDraft(publicationId);
      console.log('\n✅ Draft created successfully!');
      console.log(`   Title: ${draft.title}`);
      console.log(`   ID: ${draft.id}`);
      console.log(`\n   Edit at: https://hashnode.com/edit/${draft.id}`);
    } else {
      const published = await publishPost(publicationId);
      console.log('\n✅ Post published successfully!');
      console.log(`   Title: ${published.title}`);
      console.log(`   URL: ${published.url}`);
      console.log(`   Slug: ${published.slug}`);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
