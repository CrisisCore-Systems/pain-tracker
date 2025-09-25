export const encryptionService = {
  encrypt: async (s:string) => s,
  decrypt: async (s:string) => s
};

export type EndToEndEncryptionService = typeof encryptionService;
