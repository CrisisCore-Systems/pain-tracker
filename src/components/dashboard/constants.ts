// Re-export the real constants module implemented in constants.tsx
// This file ensures imports that resolve to `./constants` find the
// canonical implementation in `constants.tsx`.
export * from './constants.tsx';

