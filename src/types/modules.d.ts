// Asset module declarations for Vite/React projects
// This file provides type declarations for common asset imports

// CSS Module declarations
declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Image file declarations
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

// Video file declarations
declare module '*.mp4' {
  const content: string;
  export default content;
}

declare module '*.webm' {
  const content: string;
  export default content;
}

// Document file declarations
declare module '*.pdf' {
  const content: string;
  export default content;
}

// Browser API declarations - extend existing DOM types when needed
interface Window {
  gtag?: (...args: unknown[]) => void;
}

// Service Worker types for public/sw.js
declare const self: ServiceWorkerGlobalScope;
declare const caches: CacheStorage;

// Extend NodeJS timeout types
declare namespace NodeJS {
  interface Timeout {}
}