import type { UserSubscription } from '../types/subscription';

interface AuthoritativeSubscriptionResponse {
  subscription: UserSubscription | null;
}

export async function fetchAuthoritativeSubscription(
  userId: string
): Promise<UserSubscription | null> {
  const response = await fetch('/api/stripe/subscription-status', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error('Failed to load subscription status');
  }

  const payload = (await response.json()) as AuthoritativeSubscriptionResponse;
  return payload.subscription;
}