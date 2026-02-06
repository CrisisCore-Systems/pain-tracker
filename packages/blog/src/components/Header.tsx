'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { siteConfig } from '@/lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Handle scroll effect with throttle
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsMenuOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Track active navigation based on URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/') setActiveSection('articles');
    else if (path.startsWith('/features')) setActiveSection('features');
    else if (path.startsWith('/use-cases')) setActiveSection('use-cases');
    else if (path === '/about') setActiveSection('about');
    else setActiveSection(null);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        isScrolled 
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/5 py-3' 
          : 'bg-transparent py-5'
      }`}
      role="banner"
    >
      <div className="container-blog-wide flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group relative"
          aria-label={`${siteConfig.name} - Go to homepage`}
        >
          <div className="relative">
            {/* Animated glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-r from-primary/40 to-accent/40 blur-xl transition-all duration-700 ${isScrolled ? 'opacity-0 scale-90' : 'opacity-0 group-hover:opacity-100 group-hover:scale-125'}`} />
            
            {/* Heart icon with enhanced pulse */}
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300">
              <svg
                className="h-5 w-5 text-white drop-shadow-sm"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {/* Subtle inner shine */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/20 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight leading-none bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{siteConfig.name}</span>
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Blog</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
          <Link
            href="/"
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 relative group ${
              activeSection === 'articles' 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span className="relative z-10">Articles</span>
            {activeSection === 'articles' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </Link>
          <Link
            href="/features"
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 relative group ${
              activeSection === 'features' 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span className="relative z-10">Features</span>
            {activeSection === 'features' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </Link>
          <Link
            href="/use-cases"
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 relative group ${
              activeSection === 'use-cases' 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span className="relative z-10">Use Cases</span>
            {activeSection === 'use-cases' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </Link>
          <Link
            href="/about"
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 relative group ${
              activeSection === 'about' 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span className="relative z-10">About</span>
            {activeSection === 'about' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </Link>
          
          <div className="w-px h-8 bg-border/60 mx-4" aria-hidden="true" />
          
          <Link
            href="/app"
            className="btn-primary group/btn relative overflow-hidden"
          >
            {/* Shimmer effect */}
            <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="relative">Try the App</span>
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden relative w-12 h-12 flex items-center justify-center rounded-xl text-foreground hover:bg-muted/80 active:scale-95 transition-all duration-200"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <div className="relative w-6 h-6">
            <span
              className={`absolute left-0 w-6 h-0.5 bg-current rounded-full transform transition-all duration-300 ease-out ${
                isMenuOpen ? 'top-3 rotate-45' : 'top-1.5'
              }`}
            />
            <span
              className={`absolute left-0 top-3 w-6 h-0.5 bg-current rounded-full transition-all duration-200 ${
                isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`}
            />
            <span
              className={`absolute left-0 w-6 h-0.5 bg-current rounded-full transform transition-all duration-300 ease-out ${
                isMenuOpen ? 'top-3 -rotate-45' : 'top-[18px]'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Navigation - Full Screen Overlay */}
      <div
        id="mobile-menu"
        className={`md:hidden fixed inset-0 top-0 z-40 transition-all duration-500 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Backdrop with blur */}
        <div 
          className={`absolute inset-0 bg-background/98 backdrop-blur-2xl transition-all duration-500 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
        
        {/* Menu Content */}
        <nav 
          className={`relative h-full flex flex-col items-center justify-center gap-6 transition-all duration-500 ${
            isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
          }`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          {/* Decorative gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" aria-hidden="true" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} aria-hidden="true" />
          
          <Link
            href="/"
            className={`text-4xl font-bold transition-all duration-300 hover:scale-105 ${
              activeSection === 'articles' ? 'text-primary' : 'text-foreground hover:text-primary'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Articles
          </Link>
          <Link
            href="/features"
            className={`text-4xl font-bold transition-all duration-300 hover:scale-105 ${
              activeSection === 'features' ? 'text-primary' : 'text-foreground hover:text-primary'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/use-cases"
            className={`text-4xl font-bold transition-all duration-300 hover:scale-105 ${
              activeSection === 'use-cases' ? 'text-primary' : 'text-foreground hover:text-primary'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Use Cases
          </Link>
          <Link
            href="/about"
            className={`text-4xl font-bold transition-all duration-300 hover:scale-105 ${
              activeSection === 'about' ? 'text-primary' : 'text-foreground hover:text-primary'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          
          <div className="w-32 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full my-6" aria-hidden="true" />
          
          <Link
            href="/app"
            className="btn-primary text-lg px-10 py-4 shadow-xl shadow-primary/20"
          >
            Try Pain Tracker
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </Link>

          {/* Close hint */}
          <p className="absolute bottom-16 text-sm text-muted-foreground flex items-center gap-2">
            Press <kbd className="px-2.5 py-1.5 rounded-lg bg-muted border border-border font-mono text-xs font-semibold shadow-sm">ESC</kbd> to close
          </p>
        </nav>
      </div>
    </header>
  );
}
