import Link from 'next/link';
import { siteConfig } from '@/lib/utils';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/50 bg-gradient-to-b from-background via-background to-muted/20 overflow-hidden" role="contentinfo">
      {/* Background decoration */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      
      <div className="container-blog-wide relative py-16 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-5 lg:pr-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group" aria-label={`${siteConfig.name} - Go to homepage`}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300">
                <svg
                  className="h-6 w-6 text-white drop-shadow-sm"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {/* Inner shine */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/20 pointer-events-none" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight block">{siteConfig.name}</span>
                <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Blog</span>
              </div>
            </Link>
            <p className="text-muted-foreground max-w-md leading-relaxed mb-8">
              {siteConfig.description}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <Link
                href={siteConfig.links.github}
                className="w-11 h-11 rounded-xl bg-muted/80 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on GitHub"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </Link>
              <Link
                href={siteConfig.links.twitter}
                className="w-11 h-11 rounded-xl bg-muted/80 hover:bg-[#1DA1F2] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#1DA1F2]/20"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link
                href="https://hashnode.com/@paintracker"
                className="w-11 h-11 rounded-xl bg-muted/80 hover:bg-[#2962FF] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#2962FF]/20"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Hashnode"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 337 337" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M23.155 112.598c-30.873 30.874-30.873 80.93 0 111.804l89.443 89.443c30.874 30.873 80.93 30.873 111.804 0l89.443-89.443c30.873-30.874 30.873-80.93 0-111.804l-89.443-89.443c-30.874-30.873-80.93-30.873-111.804 0l-89.443 89.443zm184.476 95.033c21.612-21.611 21.612-56.651 0-78.262-21.611-21.612-56.651-21.612-78.262 0-21.612 21.611-21.612 56.651 0 78.262 21.611 21.612 56.651 21.612 78.262 0z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/70 mb-5">
              Navigation
            </h3>
            <ul className="space-y-4" role="list">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium inline-flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-primary mr-0 group-hover:mr-2 transition-all duration-200" />
                  Articles
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium inline-flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-primary mr-0 group-hover:mr-2 transition-all duration-200" />
                  About
                </Link>
              </li>
              <li>
                <Link
                  href={siteConfig.links.app}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium inline-flex items-center gap-2 group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-primary mr-0 group-hover:mr-0 transition-all duration-200" />
                  Pain Tracker App
                  <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Trust Signals */}
          <div className="lg:col-span-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/70 mb-5">
              Resources
            </h3>
            <ul className="space-y-4" role="list">
              <li>
                <Link
                  href={siteConfig.links.github}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium inline-flex items-center gap-2 group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-primary mr-0 group-hover:mr-0 transition-all duration-200" />
                  Open Source on GitHub
                  <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </li>
            </ul>
            
            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground">
                <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Privacy-first
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                Offline-capable
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Empathy-driven
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {siteConfig.author.name}. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            Built with
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 shadow-lg shadow-pink-500/20 animate-pulse" style={{ animationDuration: '2s' }}>
              <span className="text-white text-xs" aria-hidden="true">❤️</span>
            </span>
            <span className="sr-only">love</span>
            for the chronic pain community
          </p>
        </div>
      </div>
    </footer>
  );
}
