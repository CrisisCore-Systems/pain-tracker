'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { siteConfig } from '@/lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

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

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        isScrolled 
          ? 'glass border-b shadow-lg py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container-blog-wide flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group relative">
          <div className="relative">
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-primary/30 blur-xl transition-opacity duration-500 ${isScrolled ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`} />
            
            {/* Heart icon with pulse */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg
                className="h-5 w-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight leading-none">{siteConfig.name}</span>
            <span className="text-xs text-muted-foreground font-medium">Blog</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            href="/"
            className="px-5 py-2.5 text-sm font-medium text-muted-foreground rounded-xl transition-all duration-300 hover:text-foreground hover:bg-muted relative group"
          >
            <span className="relative z-10">Articles</span>
          </Link>
          <Link
            href="/about"
            className="px-5 py-2.5 text-sm font-medium text-muted-foreground rounded-xl transition-all duration-300 hover:text-foreground hover:bg-muted relative group"
          >
            <span className="relative z-10">About</span>
          </Link>
          
          <div className="w-px h-8 bg-border mx-3" />
          
          <Link
            href={siteConfig.links.app}
            className="btn-primary group/btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Try the App</span>
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
          className="md:hidden relative w-12 h-12 flex items-center justify-center rounded-xl text-foreground hover:bg-muted transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          <div className="relative w-6 h-6">
            <span
              className={`absolute left-0 w-6 h-0.5 bg-current rounded-full transform transition-all duration-300 ${
                isMenuOpen ? 'top-3 rotate-45' : 'top-1.5'
              }`}
            />
            <span
              className={`absolute left-0 top-3 w-6 h-0.5 bg-current rounded-full transition-all duration-300 ${
                isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`}
            />
            <span
              className={`absolute left-0 w-6 h-0.5 bg-current rounded-full transform transition-all duration-300 ${
                isMenuOpen ? 'top-3 -rotate-45' : 'top-[18px]'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Navigation - Full Screen Overlay */}
      <div
        className={`md:hidden fixed inset-0 top-0 z-40 transition-all duration-500 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-background/95 backdrop-blur-xl"
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu Content */}
        <nav className={`relative h-full flex flex-col items-center justify-center gap-8 transition-all duration-500 ${
          isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
        }`}>
          <Link
            href="/"
            className="text-4xl font-bold text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Articles
          </Link>
          <Link
            href="/about"
            className="text-4xl font-bold text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full my-4" />
          
          <Link
            href={siteConfig.links.app}
            className="btn-primary text-lg px-8 py-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            Try Pain Tracker
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
          <p className="absolute bottom-12 text-sm text-muted-foreground">
            Press <kbd className="px-2 py-1 rounded bg-muted font-mono text-xs">ESC</kbd> to close
          </p>
        </nav>
      </div>
    </header>
  );
}
