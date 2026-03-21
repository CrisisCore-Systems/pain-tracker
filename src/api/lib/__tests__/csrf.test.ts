import { describe, it, expect } from 'vitest';
import { validateCsrfForMutation } from '../../../../api-lib/csrf';
import type { VercelRequest } from '../../../types/vercel';

type MinimalHeaders = Record<string, string | undefined>;

function makeReq(headers: MinimalHeaders): VercelRequest {
  return {
    method: 'POST',
    headers,
  } as unknown as VercelRequest;
}

describe('validateCsrfForMutation', () => {
  it('accepts same-origin request when header token matches cookie token', () => {
    const req = makeReq({
      host: 'example.test',
      'x-forwarded-proto': 'https',
      origin: 'https://example.test',
      cookie: 'csrfToken=abc123',
      'x-csrf-token': 'abc123',
    });

    const result = validateCsrfForMutation(req);
    expect(result).toEqual({ ok: true });
  });

  it('rejects requests without trusted origin/referer', () => {
    const req = makeReq({
      host: 'example.test',
      'x-forwarded-proto': 'https',
      cookie: 'csrfToken=abc123',
      'x-csrf-token': 'abc123',
    });

    const result = validateCsrfForMutation(req);
    expect(result).toEqual({
      ok: false,
      status: 403,
      error: 'Invalid request origin',
    });
  });

  it('rejects token mismatch even with same-origin request', () => {
    const req = makeReq({
      host: 'example.test',
      'x-forwarded-proto': 'https',
      origin: 'https://example.test',
      cookie: 'csrfToken=abc123',
      'x-csrf-token': 'wrong-token',
    });

    const result = validateCsrfForMutation(req);
    expect(result).toEqual({
      ok: false,
      status: 403,
      error: 'Invalid CSRF token',
    });
  });
});
