declare module 'fake-indexeddb/auto' {
  // The polyfill augments globalThis.indexedDB — no exports are needed.
  const x: any;
  export default x;
}

declare module 'fake-indexeddb' {
  const x: any;
  export default x;
}
