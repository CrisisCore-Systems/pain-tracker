import { z } from 'zod';
import { db } from '../../api-lib/database.js';
import type { SubscriptionRecord } from '../../api-lib/database.js';
import {
  isSubscriptionOwnershipConfigured,
  readSubscriptionOwner,
} from '../../api-lib/subscriptionOwnership.js';
import type { VercelRequest, VercelResponse } from '../../src/types/vercel';
import type { SubscriptionStatus, UserSubscription } from '../../src/types/subscription';

const SubscriptionStatusRequestSchema = z
  .object({
    userId: z.string().min(1).max(128),
  })
  .strict();

function toIsoString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function normalizeStatus(status: SubscriptionRecord['status'] | string | undefined): SubscriptionStatus {
  switch (status) {
    case 'active':
    case 'trialing':
    case 'past_due':
    case 'canceled':
    case 'incomplete':
    case 'incomplete_expired':
      return status;
    case 'unpaid':
      return 'past_due';
    default:
      return 'expired';
  }
}

function mapRecordToSubscription(record: SubscriptionRecord): UserSubscription {
  return {
    id: String(record.id),
    userId: record.userId,
    tier: record.tier,
    status: normalizeStatus(record.status),
    billingInterval: record.billingInterval || 'monthly',
    currentPeriodStart: toIsoString(record.currentPeriodStart) || record.createdAt.toISOString(),
    currentPeriodEnd: toIsoString(record.currentPeriodEnd) || record.updatedAt.toISOString(),
    cancelAtPeriodEnd: Boolean(record.cancelAtPeriodEnd),
    trialStart: toIsoString(record.trialStart),
    trialEnd: toIsoString(record.trialEnd),
    subscriptionId: record.subscriptionId,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    usage: {
      painEntries: 0,
      moodEntries: 0,
      activityLogs: 0,
      storageMB: 0,
      apiCalls: 0,
      exportCount: 0,
      sharedUsers: 0,
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const parsed = SubscriptionStatusRequestSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  if (!isSubscriptionOwnershipConfigured()) {
    res.status(503).json({ error: 'Subscription ownership is not configured' });
    return;
  }

  const ownerUserId = readSubscriptionOwner(req);
  if (!ownerUserId || ownerUserId !== parsed.data.userId) {
    res.status(401).json({ error: 'Unauthorized subscription lookup' });
    return;
  }

  try {
    const record = await db.getSubscriptionByUserId(parsed.data.userId);
    res.status(200).json({
      subscription: record ? mapRecordToSubscription(record) : null,
    });
  } catch {
    res.status(500).json({ error: 'Unable to load subscription status' });
  }
}