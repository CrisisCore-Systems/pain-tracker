import sodium from 'libsodium-wrappers';

let sodiumInstance: typeof sodium | null = null;
let sodiumPromise: Promise<typeof sodium> | null = null;

export async function getSodium(): Promise<typeof sodium> {
  if (sodiumInstance) {
    return sodiumInstance;
  }
  if (!sodiumPromise) {
    sodiumPromise = sodium.ready.then(() => {
      sodiumInstance = sodium;
      return sodiumInstance;
    });
  }
  return sodiumPromise;
}

export function getSodiumSync(): typeof sodium | null {
  return sodiumInstance;
}
