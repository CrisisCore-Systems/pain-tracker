import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('VaultService logging hygiene', () => {
  it('does not contain vault setup console diagnostics', () => {
    const vaultServicePath = path.resolve(process.cwd(), 'src/services/VaultService.ts');
    const source = fs.readFileSync(vaultServicePath, 'utf8');

    expect(source).not.toContain("console.log('[VaultService]");
    expect(source).not.toContain('passphraseLength');
    expect(source).not.toContain('Verification hash created');
  });
});