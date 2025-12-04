/**
 * Hashnode GraphQL API Client
 * Fetches blog posts from Hashnode's headless CMS
 */

import { GraphQLClient, gql } from 'graphql-request';

const HASHNODE_API = 'https://gql.hashnode.com';

const client = new GraphQLClient(HASHNODE_API, {
  headers: process.env.HASHNODE_TOKEN
    ? { Authorization: process.env.HASHNODE_TOKEN }
    : {},
});

// ============================================================================
// Types
// ============================================================================

export interface Author {
  name: string;
  username: string;
  profilePicture: string;
  bio?: {
    text: string;
  };
}

export interface Tag {
  name: string;
  slug: string;
}

export interface CoverImage {
  url: string;
}

export interface PostContent {
  html: string;
  markdown: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  brief: string;
  content: PostContent;
  coverImage?: CoverImage;
  publishedAt: string;
  updatedAt?: string;
  readTimeInMinutes: number;
  tags: Tag[];
  author: Author;
  seo?: {
    title?: string;
    description?: string;
  };
  ogMetaData?: {
    image?: string;
  };
}

export interface PostEdge {
  node: Post;
  cursor: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor?: string;
}

export interface Publication {
  id: string;
  title: string;
  displayTitle?: string;
  descriptionSEO?: string;
  about?: {
    html: string;
  };
  author: Author;
  posts: {
    edges: PostEdge[];
    pageInfo: PageInfo;
    totalDocuments: number;
  };
}

// ============================================================================
// GraphQL Queries
// ============================================================================

const GET_PUBLICATION = gql`
  query GetPublication($host: String!) {
    publication(host: $host) {
      id
      title
      displayTitle
      descriptionSEO
      about {
        html
      }
      author {
        name
        username
        profilePicture
        bio {
          text
        }
      }
    }
  }
`;

const GET_POSTS = gql`
  query GetPosts($host: String!, $first: Int!, $after: String) {
    publication(host: $host) {
      id
      posts(first: $first, after: $after) {
        edges {
          node {
            id
            title
            slug
            brief
            publishedAt
            updatedAt
            readTimeInMinutes
            coverImage {
              url
            }
            tags {
              name
              slug
            }
            author {
              name
              username
              profilePicture
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        totalDocuments
      }
    }
  }
`;

const GET_POST_BY_SLUG = gql`
  query GetPostBySlug($host: String!, $slug: String!) {
    publication(host: $host) {
      id
      post(slug: $slug) {
        id
        title
        slug
        brief
        publishedAt
        updatedAt
        readTimeInMinutes
        content {
          html
          markdown
        }
        coverImage {
          url
        }
        tags {
          name
          slug
        }
        author {
          name
          username
          profilePicture
          bio {
            text
          }
        }
        seo {
          title
          description
        }
        ogMetaData {
          image
        }
      }
    }
  }
`;

const GET_POSTS_BY_TAG = gql`
  query GetPostsByTag($host: String!, $tagSlug: String!, $first: Int!) {
    publication(host: $host) {
      id
      posts(first: $first, filter: { tagSlugs: [$tagSlug] }) {
        edges {
          node {
            id
            title
            slug
            brief
            publishedAt
            readTimeInMinutes
            coverImage {
              url
            }
            tags {
              name
              slug
            }
            author {
              name
              username
              profilePicture
            }
          }
        }
        totalDocuments
      }
    }
  }
`;

const GET_ALL_SLUGS = gql`
  query GetAllSlugs($host: String!, $first: Int!) {
    publication(host: $host) {
      posts(first: $first) {
        edges {
          node {
            slug
          }
        }
      }
    }
  }
`;

// ============================================================================
// API Functions
// ============================================================================

const host = process.env.NEXT_PUBLIC_HASHNODE_HOST || '';

/**
 * Get publication info
 */
export async function getPublication(): Promise<Publication | null> {
  try {
    const data = await client.request<{ publication: Publication }>(
      GET_PUBLICATION,
      { host }
    );
    return data.publication;
  } catch (error) {
    console.error('Failed to fetch publication:', error);
    return null;
  }
}

/**
 * Get paginated posts
 */
export async function getPosts(
  first: number = 10,
  after?: string
): Promise<{
  posts: Post[];
  pageInfo: PageInfo;
  total: number;
}> {
  try {
    const data = await client.request<{ publication: Publication }>(GET_POSTS, {
      host,
      first,
      after,
    });

    return {
      posts: data.publication.posts.edges.map((edge) => edge.node),
      pageInfo: data.publication.posts.pageInfo,
      total: data.publication.posts.totalDocuments,
    };
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return { posts: [], pageInfo: { hasNextPage: false }, total: 0 };
  }
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const data = await client.request<{ publication: { post: Post } }>(
      GET_POST_BY_SLUG,
      { host, slug }
    );
    return data.publication.post;
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return null;
  }
}

/**
 * Get posts by tag
 */
export async function getPostsByTag(
  tagSlug: string,
  first: number = 10
): Promise<Post[]> {
  try {
    const data = await client.request<{ publication: Publication }>(
      GET_POSTS_BY_TAG,
      { host, tagSlug, first }
    );
    return data.publication.posts.edges.map((edge) => edge.node);
  } catch (error) {
    console.error('Failed to fetch posts by tag:', error);
    return [];
  }
}

/**
 * Get all post slugs (for static generation)
 * Note: Hashnode API limits first to max 50
 */
export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const data = await client.request<{ publication: Publication }>(
      GET_ALL_SLUGS,
      { host, first: 50 }
    );
    return data.publication.posts.edges.map((edge) => edge.node.slug);
  } catch (error) {
    console.error('Failed to fetch slugs:', error);
    return [];
  }
}

/**
 * Get related posts (same tags)
 */
export async function getRelatedPosts(
  currentSlug: string,
  tags: Tag[],
  limit: number = 3
): Promise<Post[]> {
  if (tags.length === 0) return [];

  try {
    // Get posts from the first tag
    const posts = await getPostsByTag(tags[0].slug, limit + 1);
    // Filter out current post
    return posts.filter((p) => p.slug !== currentSlug).slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch related posts:', error);
    return [];
  }
}

// ============================================================================
// Newsletter Subscription
// ============================================================================

const SUBSCRIBE_TO_NEWSLETTER = gql`
  mutation SubscribeToNewsletter($input: SubscribeToNewsletterInput!) {
    subscribeToNewsletter(input: $input) {
      status
    }
  }
`;

const GET_PUBLICATION_ID = gql`
  query GetPublicationId($host: String!) {
    publication(host: $host) {
      id
    }
  }
`;

export type NewsletterSubscribeStatus = 'PENDING' | 'CONFIRMED';

export interface SubscribeResult {
  success: boolean;
  status?: NewsletterSubscribeStatus;
  error?: string;
}

/**
 * Get publication ID (needed for newsletter subscription)
 */
export async function getPublicationId(): Promise<string | null> {
  try {
    const data = await client.request<{ publication: { id: string } }>(
      GET_PUBLICATION_ID,
      { host }
    );
    return data.publication.id;
  } catch (error) {
    console.error('Failed to fetch publication ID:', error);
    return null;
  }
}

/**
 * Subscribe email to newsletter
 */
export async function subscribeToNewsletter(
  email: string
): Promise<SubscribeResult> {
  try {
    const publicationId = await getPublicationId();
    
    if (!publicationId) {
      return { 
        success: false, 
        error: 'Could not find publication. Please try again later.' 
      };
    }

    const data = await client.request<{
      subscribeToNewsletter: { status: NewsletterSubscribeStatus };
    }>(SUBSCRIBE_TO_NEWSLETTER, {
      input: {
        publicationId,
        email,
      },
    });

    return {
      success: true,
      status: data.subscribeToNewsletter.status,
    };
  } catch (error: unknown) {
    console.error('Failed to subscribe to newsletter:', error);
    
    // Handle specific GraphQL errors
    if (error instanceof Error) {
      if (error.message.includes('already subscribed')) {
        return { 
          success: false, 
          error: "You're already subscribed! Check your inbox." 
        };
      }
      if (error.message.includes('invalid email')) {
        return { 
          success: false, 
          error: 'Please enter a valid email address.' 
        };
      }
    }
    
    return { 
      success: false, 
      error: 'Something went wrong. Please try again.' 
    };
  }
}
