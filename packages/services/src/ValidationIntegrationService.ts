export type ValidationResponse = { valid: boolean };

export function validateInput() { return { valid: true } as ValidationResponse; }
