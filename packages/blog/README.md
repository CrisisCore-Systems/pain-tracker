# Pain Tracker Blog

A custom Next.js frontend for the Pain Tracker blog, using Hashnode as a headless CMS.

## Features

- ⚡ **Next.js 14** with App Router
- 🎨 **Tailwind CSS** with typography plugin
- 📝 **Hashnode GraphQL API** for content management
- 🖼️ **Image optimization** via Next.js Image component
- 🔍 **SEO optimized** with dynamic metadata
- 📱 **Responsive design** for all devices
- ♿ **Accessible** with WCAG 2.1 AA compliance
- 🌙 **Dark mode ready** with CSS variables

## Quick Start

```bash
# Navigate to blog package
cd packages/blog

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your Hashnode details
# NEXT_PUBLIC_HASHNODE_HOST=paintracker.hashnode.dev

# Start development server
npm run dev
```

The blog will be available at [http://localhost:3001](http://localhost:3001).

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_HASHNODE_HOST` | Your Hashnode blog host (e.g., `paintracker.hashnode.dev`) | Yes |
| `HASHNODE_TOKEN` | Hashnode Personal Access Token (for private content) | No |
| `NEXT_PUBLIC_SITE_URL` | Your production URL | No |
| `NEXT_PUBLIC_SITE_NAME` | Site name for SEO | No |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Site description for SEO | No |

## Project Structure

```
packages/blog/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with header/footer
│   │   ├── page.tsx            # Blog homepage
│   │   ├── not-found.tsx       # 404 page
│   │   ├── globals.css         # Global styles
│   │   ├── about/
│   │   │   └── page.tsx        # About page
│   │   ├── blog/
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Individual blog post
│   │   └── tag/
│   │       └── [slug]/
│   │           └── page.tsx    # Posts by tag
│   ├── components/             # React components
│   │   ├── Header.tsx          # Site header with navigation
│   │   ├── Footer.tsx          # Site footer
│   │   ├── PostCard.tsx        # Blog post card
│   │   └── MarkdownContent.tsx # Markdown renderer
│   └── lib/                    # Utilities and API
│       ├── hashnode.ts         # Hashnode GraphQL client
│       └── utils.ts            # Helper functions
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server on port 3001
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

## Customization

### Brand Colors

Edit `tailwind.config.ts` to change the primary and accent colors:

```ts
colors: {
  primary: {
    DEFAULT: '#3B82F6', // Blue
    // ...
  },
  accent: {
    DEFAULT: '#8B5CF6', // Purple
    // ...
  },
}
```

### Site Configuration

Update `src/lib/utils.ts` to change site metadata:

```ts
export const siteConfig = {
  name: 'Your Blog Name',
  description: 'Your blog description',
  url: 'https://yourdomain.com',
  // ...
};
```

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms

```bash
npm run build
npm run start
```

The app can be deployed to any Node.js hosting platform.

## Hashnode Integration

This frontend uses Hashnode's GraphQL API to fetch:

- **Posts**: List and individual post content
- **Tags**: Filter posts by tag
- **Publication**: Site/author information

All content is managed through your Hashnode dashboard - no code changes needed for new posts!

## License

MIT - See [LICENSE](../../LICENSE) for details.
