import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPublication } from '@/lib/hashnode';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about Pain Tracker - a privacy-first, offline-capable chronic pain management app built with empathy.',
};

export default async function AboutPage() {
  const publication = await getPublication();

  return (
    <div className="container-blog py-12">
      {/* Hero */}
      <section className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          About <span className="gradient-text">Pain Tracker</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          We&apos;re building technology that respects the chronic pain experience — 
          prioritizing privacy, accessibility, and empathy in every decision.
        </p>
      </section>

      {/* Mission */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
            <p className="text-muted-foreground">
              Your health data stays on your device. We don&apos;t collect, store, or sell 
              your personal information. Local-first architecture means you&apos;re always in control.
            </p>
          </div>

          <div className="card p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Accessibility</h3>
            <p className="text-muted-foreground">
              Designed for all users, including those with visual, motor, or cognitive 
              challenges. WCAG 2.1 AA compliant with trauma-informed design patterns.
            </p>
          </div>

          <div className="card p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Empathy-Driven</h3>
            <p className="text-muted-foreground">
              Built with input from chronic pain patients and healthcare providers. 
              Every feature considers the emotional and physical challenges of living with pain.
            </p>
          </div>

          <div className="card p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Clinical Integration</h3>
            <p className="text-muted-foreground">
              Generate professional reports for healthcare providers. 
              WorkSafe BC compliant exports help bridge the gap between patient and clinician.
            </p>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="mb-16 border-l-4 border-primary pl-6">
        <h2 className="text-2xl font-bold mb-4">Why This Exists</h2>
        <blockquote className="text-lg text-muted-foreground mb-6 italic">
          &ldquo;Anything another person can take away with a single decision was never really yours to begin with.&rdquo;
        </blockquote>
        <p className="text-muted-foreground mb-6">
          Pain Tracker was born from necessity — built by someone who learned the hard way 
          that the ground can disappear overnight, and sometimes the only thing left to do 
          is build something that floats.
        </p>
        <Link
          href="/spire-0033"
          className="text-primary hover:underline inline-flex items-center gap-2 font-medium"
        >
          Read the full origin story
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </section>

      {/* Open Source */}
      <section className="mb-16 bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Open Source</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl">
          Pain Tracker is fully open source. We believe healthcare technology should be 
          transparent, auditable, and community-driven. View our code, report issues, 
          or contribute on GitHub.
        </p>
        <Link
          href={siteConfig.links.github}
          className="btn-primary inline-flex items-center gap-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          View on GitHub
        </Link>
      </section>

      {/* Author/Publication Info */}
      {publication?.author && (
        <section>
          <h2 className="text-2xl font-bold mb-6">The Team</h2>
          <div className="card p-6 flex items-start gap-6">
            {publication.author.profilePicture && (
              <Image
                src={publication.author.profilePicture}
                alt={publication.author.name}
                width={80}
                height={80}
                className="rounded-full"
              />
            )}
            <div>
              <h3 className="text-xl font-semibold mb-1">{publication.author.name}</h3>
              <p className="text-muted-foreground mb-4">
                {publication.author.bio?.text || 'Building empathetic health technology.'}
              </p>
              <Link
                href={`https://hashnode.com/@${publication.author.username}`}
                className="text-primary hover:underline inline-flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                View profile
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
