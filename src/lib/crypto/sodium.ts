/* eslint-disable @typescript-eslint/no-explicit-any */
let sodiumInstance: any = null;
let sodiumPromise: Promise<any> | null = null;

export async function getSodium(): Promise<any> {
  // Validate cached instance has required functions
  if (sodiumInstance && typeof sodiumInstance.crypto_pwhash === 'function') {
    return sodiumInstance;
  }
  
  // Clear invalid cache
  if (sodiumInstance) {
    console.warn('[sodium] Clearing invalid cached instance');
    sodiumInstance = null;
    sodiumPromise = null;
  }
  
  if (!sodiumPromise) {
    sodiumPromise = (async () => {
      console.log('[sodium] Starting initialization (SUMO version)...');
      const sodiumModule = await import('libsodium-wrappers-sumo');
      console.log('[sodium] Module type:', typeof sodiumModule);
      console.log('[sodium] Module.default type:', typeof sodiumModule.default);
      
      // Get the default export from the module
      const sodium = sodiumModule.default || sodiumModule;
      
      console.log('[sodium] Waiting for ready...');
      await sodium.ready;
      
      console.log('[sodium] Library initialized successfully');
      console.log('[sodium] crypto_pwhash type:', typeof sodium.crypto_pwhash);
      console.log('[sodium] crypto_pwhash_str type:', typeof sodium.crypto_pwhash_str);
      console.log('[sodium] crypto_pwhash_SALTBYTES:', sodium.crypto_pwhash_SALTBYTES);
      
      // Validate we have the required functions
      if (typeof sodium.crypto_pwhash !== 'function') {
        throw new Error('[sodium] crypto_pwhash function not available even in SUMO version!');
      }
      
      sodiumInstance = sodium;
      return sodium;
    })();
  }
  return sodiumPromise;
}

export function getSodiumSync(): any {
  return sodiumInstance;
}
