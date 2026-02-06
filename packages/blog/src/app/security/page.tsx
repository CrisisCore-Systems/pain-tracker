import Link from 'next/link';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/utils';
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Security',
  description:
    'Pain Tracker security architecture: encryption at rest, Content Security Policy, defense-in-depth, threat model transparency, and responsible disclosure.',
  alternates: {
    canonical: `${siteConfig.url}/security`,
  },
};

export default function SecurityPage() {
  return (
    <div className="container-blog py-12">
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', url: siteConfig.url },
              { name: 'Security', url: `${siteConfig.url}/security` },
            ]),
          ),
        }}
      />

      {/* FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            faqPageJsonLd([
              {
                question: 'How is my data encrypted?',
                answer:
                  'Health data is encrypted at rest in IndexedDB using keys derived from a passphrase you set. Key derivation and encryption happen entirely in your browser.',
              },
              {
                question: 'Is Pain Tracker HIPAA compliant?',
                answer:
                  'Pain Tracker implements HIPAA-aligned controls (encryption at rest, audit logging, access controls), but as a local-first PWA with no cloud backend, traditional HIPAA compliance certification does not directly apply.',
              },
              {
                question: 'What happens if my device is lost or stolen?',
                answer:
                  'Data is encrypted at rest. Without your passphrase, encrypted data in IndexedDB is not readable. We recommend using device-level encryption (BitLocker, FileVault) as an additional layer.',
              },
            ]),
          ),
        }}
      />

      {/* Hero */}
      <section className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="gradient-text">Security</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Health data demands the strongest protections.
          Here&apos;s exactly how Pain Tracker defends yours.
        </p>
      </section>

      {/* Sections */}
      <section className="space-y-10 mb-16">
        <div>
          <h2 className="text-2xl font-semibold mb-3">Encryption at Rest</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            All Class A data (pain entries, symptoms, medications, notes) is encrypted before being
            written to IndexedDB. Keys are derived from your passphrase using industry-standard
            algorithms and never leave the browser.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">Content Security Policy</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            A strict CSP restricts which scripts, styles, and connections the app can make —
            reducing the impact of any potential XSS vulnerability.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">Defense in Depth</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            Multiple overlapping layers: CSP headers, X-Frame-Options (DENY),
            X-Content-Type-Options (nosniff), CORS isolation, and Permissions-Policy restrictions.
            No single failure compromises user data.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">Threat Model Transparency</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl mb-4">
            We&apos;re transparent about what we defend against — and what we don&apos;t claim to solve:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">We defend against</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                <li>Lost/stolen device (encryption at rest)</li>
                <li>XSS within our origin (CSP + safe coding)</li>
                <li>Malicious browser extensions (limited plaintext exposure)</li>
                <li>Shoulder-surfing (panic mode, minimal UI state)</li>
              </ul>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">Out of scope</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                <li>Compromised OS / root-level malware</li>
                <li>User-installed spyware</li>
                <li>Physical coercion beyond in-app safety controls</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">Audit Logging</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            Security-relevant events (login attempts, export generation, key operations) are logged
            locally with action type, outcome, and timestamp — but <strong>never</strong> with
            free-text content or raw health data.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">Responsible Disclosure</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            Found a vulnerability? Please report it responsibly via our{' '}
            <a
              href={`${siteConfig.links.github}/blob/main/SECURITY.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              SECURITY.md
            </a>{' '}
            on GitHub. We take every report seriously.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 border-t border-border">
        <h2 className="text-2xl font-bold mb-4">Security you can verify</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Every line is open source. Audit the code yourself.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/app" className="btn-primary">
            Open Pain Tracker
          </Link>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            View Source →
          </a>
        </div>
      </section>
    </div>
  );
}
