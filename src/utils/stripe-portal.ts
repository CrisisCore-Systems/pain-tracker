interface BillingPortalOptions {
  userId: string;
  returnUrl?: string;
}

interface BillingPortalResponse {
  url: string;
}

export async function openBillingPortal(options: BillingPortalOptions): Promise<void> {
  const response = await fetch('/api/stripe/create-portal-session', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: options.userId,
      returnUrl: options.returnUrl || globalThis.location.href,
    }),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(error?.error || 'Failed to open billing portal');
  }

  const payload = (await response.json()) as BillingPortalResponse;
  if (!payload.url) {
    throw new Error('No billing portal URL received');
  }

  globalThis.location.href = payload.url;
}