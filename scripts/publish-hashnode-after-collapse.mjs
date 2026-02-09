#!/usr/bin/env node
/**
 * Publish "After Collapse Compiles" to Hashnode
 *
 * Usage (PowerShell):
 *   $env:HASHNODE_TOKEN="your-token"; node scripts/publish-hashnode-after-collapse.mjs
 *   $env:HASHNODE_TOKEN="your-token"; node scripts/publish-hashnode-after-collapse.mjs --draft
 */

const HASHNODE_API = 'https://gql.hashnode.com';
const PUBLICATION_HOST = 'paintracker.hashnode.dev';

const post = {
  title: 'After Collapse Compiles',
  subtitle: 'Not a victory lap. Not a redemption arc. Just the honest truth about building something from survival — and what happens when other people might need it too.',
  slug: 'after-collapse-compiles',
  tags: [
    { slug: 'developer-stories', name: 'Developer Stories' },
    { slug: 'mental-health', name: 'Mental Health' },
    { slug: 'chronic-illness', name: 'Chronic Illness' },
    { slug: 'privacy', name: 'Privacy' },
    { slug: 'offline-first', name: 'Offline First' },
    { slug: 'open-source', name: 'Open Source' },
    { slug: 'trauma-informed', name: 'Trauma Informed' },
    { slug: 'healthcare', name: 'Healthcare' },
  ],
  seo: {
    title: 'After Collapse Compiles | The Quiet Story Behind Pain Tracker',
    description:
      'Not a victory lap. Not a redemption arc. Just the honest truth about building a privacy-first pain tracking app from survival, not ambition — and what happens when other people might need it too.',
  },
  contentMarkdown: `# After Collapse Compiles

The first post sounded clean.
Cleaner than real life ever is.

Real life looked more like this:

Half-charged phone.
Nowhere quiet.
Body hurting in ways that don't show on the outside.
Trying to remember dates and symptoms and conversations
while your brain is busy just keeping you upright.

That's where this thing actually came from.

Not vision.
Not ambition.
Just the slow realization that **if I didn't start writing things down, nobody would ever believe what was happening** —
and eventually I might not believe it either.

So I built something to remember for me.

Not in some company's cloud.
Not behind a login I could lose.
Just… here.
On the device in my hand.
Where nobody else gets to touch it unless I say so.

That decision wasn't technical.
It was emotional.
And honestly, a little paranoid.
But the kind of paranoid you earn.

---

## The part nobody puts in tech stories

Some of this code was written on days that had nothing to do with coding.

Days about court dates.
Money stress.
Places to sleep.
Trying to stay steady enough to show up for my kid
and not let him feel how close everything was to falling apart.

You don't think about **architecture patterns** in moments like that.
You think about survival.

And weirdly… writing code helped.
Because code is predictable.
It either works or it doesn't.
It doesn't gaslight you.
It doesn't forget what you told it yesterday.
It doesn't change the story halfway through.

Real life does.

So I kept coming back to the one place
where cause and effect still made sense.

---

## Why the privacy thing is so intense

People read "local-first" and think it's a design trend.
It's not.

It's what happens when you've seen information
move in directions you didn't choose
and suddenly your own story isn't yours anymore.

Health data is the worst version of that.
Because you can't change it.
You can't rotate it like a password.
Once it's out, it's out forever.

So yeah —
I'm stubborn about it staying on the device.

Not because it's elegant.
Because it feels **safe**.
And safe is rare enough that you protect it hard.

---

## The weird shift happening now

Something changed recently, and I don't totally know how to talk about it.

At first this was just… mine.
A survival tool.
Private.
Small.

Now there's this quiet question sitting in the background:

**What if other people actually need this?**

That's heavier than building for yourself.
Because if you screw up alone, it's just your problem.
If someone else relies on it… different story.

So everything slows down.
Decisions matter more.
Shortcuts feel dangerous.

It stops being therapy through code
and starts being responsibility.

I'm still getting used to that.

---

## The one thing underneath all of it

There's a lot of complicated context around this project.
Legal stuff.
Housing stuff.
Health stuff.
History that doesn't fit nicely into a blog post.

But if I strip it down to the real core, it's simpler:

I have a son.
He still looks at me like I'm supposed to be okay.
Like I'm someone solid.

And when everything else felt unstable,
building something real — something that worked —
was one of the only ways to stay that person.

Not perfect.
Just… still here.

---

## So what does "after collapse" mean?

Not victory.
Not some clean redemption arc.
Life isn't a movie.

It just means this:

Things didn't end where they could have.
Something useful came out of a period that mostly hurt.
And the story kept moving instead of stopping.

That's it.

Nothing inspirational.
Just true.

---

*[Pain Tracker](https://paintracker.ca) — Private pain tracking that stays on your device. No cloud. No company. Just yours.*
`,
  publishAsDraft: process.argv.includes('--draft'),
};

// ── GraphQL ───────────────────────────────────────────────────────────────────

const getPublicationQuery = `
  query GetPublication($host: String!) {
    publication(host: $host) { id title }
  }
`;

const publishPostMutation = `
  mutation PublishPost($input: PublishPostInput!) {
    publishPost(input: $input) {
      post { id title slug url }
    }
  }
`;

const createDraftMutation = `
  mutation CreateDraft($input: CreateDraftInput!) {
    createDraft(input: $input) {
      draft { id title slug }
    }
  }
`;

async function gql(query, variables = {}) {
  const token = process.env.HASHNODE_TOKEN;
  if (!token) {
    throw new Error(
      'HASHNODE_TOKEN environment variable is required.\n' +
        'Get your token at: https://hashnode.com/settings/developer\n' +
        'Then run: $env:HASHNODE_TOKEN="your-token"; node scripts/publish-hashnode-after-collapse.mjs'
    );
  }
  const res = await fetch(HASHNODE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: token },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    console.error('GraphQL Errors:', JSON.stringify(json.errors, null, 2));
    throw new Error(json.errors[0]?.message || 'GraphQL request failed');
  }
  return json.data;
}

async function main() {
  console.log('🚀 Hashnode — Publish "After Collapse Compiles"');
  console.log('================================================\n');

  const { publication } = await gql(getPublicationQuery, { host: PUBLICATION_HOST });
  if (!publication) throw new Error(`Publication not found: ${PUBLICATION_HOST}`);
  console.log(`📡 Publication: "${publication.title}" (${publication.id})`);

  const input = {
    publicationId: publication.id,
    title: post.title,
    subtitle: post.subtitle,
    slug: post.slug,
    contentMarkdown: post.contentMarkdown,
    tags: post.tags,
    settings: { enableTableOfContent: false, isNewsletterActivated: true },
  };
  if (post.seo) input.metaTags = { title: post.seo.title, description: post.seo.description };

  if (post.publishAsDraft) {
    const { createDraft: { draft } } = await gql(createDraftMutation, { input });
    console.log(`\n✅ Draft created: "${draft.title}"`);
    console.log(`   Edit: https://hashnode.com/edit/${draft.id}`);
  } else {
    const { publishPost: { post: published } } = await gql(publishPostMutation, { input });
    console.log(`\n✅ Published: "${published.title}"`);
    console.log(`   URL: ${published.url}`);
    console.log(`   Slug: ${published.slug}`);
  }
}

main().catch((err) => {
  console.error('\n❌', err.message);
  process.exit(1);
});
