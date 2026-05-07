import type { UserSubscription } from '../types/subscription';
import { buildApiUrl, getApiRequestCredentials } from '../lib/api-url';

const SUBSCRIPTION_OWNER_COOKIE = 'pt_subscription_owner';

interface AuthoritativeSubscriptionResponse {
  subscription: UserSubscription | null;
}

export function hasSubscriptionOwnerCookie(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  return document.cookie
    .split(';')
    .some(cookie => cookie.trim().startsWith(`${SUBSCRIPTION_OWNER_COOKIE}=`));
}

export async function fetchAuthoritativeSubscription(
  userId: string
): Promise<UserSubscription | null> {
  if (!hasSubscriptionOwnerCookie()) {
    return null;
  }

  const response = await fetch(buildApiUrl('/stripe/subscription-status'), {
    method: 'POST',
    credentials: getApiRequestCredentials(),
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