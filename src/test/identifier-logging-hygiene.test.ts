import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function getConsoleStatements(source: string): string {
  return source
    .split(/\r?\n/)
    .filter((line) => line.includes('console.'))
    .join('\n');
}

describe('Identifier logging hygiene', () => {
  it('does not include raw Stripe identifiers in webhook console logs', () => {
    const stripeServicePath = path.resolve(process.cwd(), 'src/services/StripeService.ts');
    const source = getConsoleStatements(fs.readFileSync(stripeServicePath, 'utf8'));

    expect(source).not.toContain('for user ${userId}');
    expect(source).not.toContain(': ${invoice.id}');
  });

  it('does not include raw audit identifiers in suspicious activity console logs', () => {
    const hipaaCompliancePath = path.resolve(process.cwd(), 'src/services/HIPAACompliance.ts');
    const source = getConsoleStatements(fs.readFileSync(hipaaCompliancePath, 'utf8'));

    expect(source).not.toContain('eventId: event.eventId');
    expect(source).not.toContain('userId: event.userId');
  });

  it('does not include raw URLs in background sync console logs', () => {
    const backgroundSyncPath = path.resolve(process.cwd(), 'src/lib/background-sync.ts');
    const source = getConsoleStatements(fs.readFileSync(backgroundSyncPath, 'utf8'));

    expect(source).not.toContain('${item.url}');
    expect(source).not.toContain('${url}');
  });

  it('does not include raw notification tags in console logs', () => {
    const notificationBrowserPath = path.resolve(process.cwd(), 'src/utils/notifications/browser.ts');
    const source = getConsoleStatements(fs.readFileSync(notificationBrowserPath, 'utf8'));

    expect(source).not.toContain('tag: ${tag}');
  });
});