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
  title: "I Built an AI That Knows When You're Burning Out — 10 Sponsors Let It Speak",
  subtitle: "The Empathy Intelligence Engine inside PainTracker has been watching my collapse for months. It's ready to speak to you too — if 10 people say yes.",
  slug: "i-built-an-ai-that-knows-when-youre-burning-out",
  tags: [
    { slug: "chronic-pain", name: "Chronic Pain" },
    { slug: "ai", name: "AI" },
    { slug: "privacy", name: "Privacy" },
    { slug: "open-source", name: "Open Source" },
    { slug: "sponsorship", name: "Sponsorship" }
  ],
  contentMarkdown: `I've been running a hidden AI inside PainTracker for months.

It's called the **Empathy Intelligence Engine**.

Right now it only talks to me.

Every night it scans my entries — pain levels, sleep fragments, mood tags, the single-word notes I manage on the worst days — and quietly tells me things like:

> "Your sleep dropped 42% in the three days before last week's 9/10 flare."  
> "You used the word 'nothing' 14 times this week — 380% above baseline."  
> "Burnout risk: 89%. You haven't had a single recovery day in 19 days."

It doesn't phone home. It doesn't ask permission. It just watches, correlates, and translates collapse into sentences I can actually understand when my brain is soup.

I built it because no doctor ever connected those dots for me.  
I kept the dashboard hidden because surfacing it properly takes design time, testing time, and — honestly — rent money I don't have.

The engine already exists.  
The insights are already accurate.  
The code is open-source and runs **100% locally** — no servers, no tracking, no exceptions.

All that's missing is **10 monthly sponsors** to flip the switch.

---

## What Ships the Day We Hit 10

The **Personalized Insights Dashboard**:

- Daily insight cards in plain, trauma-aware language  
- Flare warnings & burnout risk scores  
- Pattern summaries with confidence levels  
- Wisdom Journal — automatic capture of your own growth moments  
- Zero new data collection — everything computed from entries you already log

No cloud. No corporate wellness bullshit.  
Just the AI I forged in survival mode, finally allowed to speak to everyone else who's been dismissed the same way.

---

If you've ever wanted a tool that sees the patterns doctors ignore — without selling your pain to do it — this is the moment.

**Be one of the 10:**

👉 [github.com/sponsors/CrisisCore-Systems](https://github.com/sponsors/CrisisCore-Systems)

Still here. Still shipping.  
Thank you for keeping the power on.

— Kay
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
      enableTableOfContent: true,
      isNewsletterActivated: true, // Send to newsletter subscribers
    },
    // If you have a cover image URL, add it here:
    // coverImageOptions: {
    //   coverImageURL: "https://example.com/cover.jpg"
    // }
  };

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
