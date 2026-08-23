import { Redis } from "@upstash/redis";
import { z } from "zod";
import {
  createInternalNotificationLeaseToken,
  INTERNAL_NOTIFICATION_LEASE_SECONDS,
} from "@/lib/internal-notifications/reservation";

const OUTBOX_PREFIX = "senda:internal-notification:v2";
const OUTBOX_QUEUE_KEY = `${OUTBOX_PREFIX}:pending`;
const OUTBOX_ITEM_TTL_SECONDS = 90 * 24 * 60 * 60;
const DELIVERED_MARKER_TTL_SECONDS = 90 * 24 * 60 * 60;

const ENQUEUE_SCRIPT = `
-- senda_internal_enqueue_v2
if redis.call('exists', KEYS[2]) == 1 then
  return 2
end
if redis.call('exists', KEYS[1]) == 1 then
  if not redis.call('zscore', KEYS[3], ARGV[1]) then
    redis.call('zadd', KEYS[3], ARGV[2], ARGV[1])
  end
  return 0
end
redis.call('set', KEYS[1], ARGV[3], 'EX', ARGV[4])
redis.call('zadd', KEYS[3], ARGV[2], ARGV[1])
return 1
`;

const CLAIM_SCRIPT = `
-- senda_internal_claim_v2
local score = redis.call('zscore', KEYS[1], ARGV[1])
if not score or tonumber(score) > tonumber(ARGV[2]) then
  return nil
end
if redis.call('exists', KEYS[3]) == 1 then
  redis.call('zrem', KEYS[1], ARGV[1])
  redis.call('del', KEYS[2])
  return nil
end
local lease = redis.call('set', KEYS[4], ARGV[3], 'NX', 'EX', ARGV[4])
if not lease then
  return nil
end
local payload = redis.call('get', KEYS[2])
if not payload then
  redis.call('zrem', KEYS[1], ARGV[1])
  redis.call('del', KEYS[4])
  return nil
end
return payload
`;

const MARK_DELIVERED_SCRIPT = `
-- senda_internal_mark_delivered_v2
if redis.call('get', KEYS[4]) ~= ARGV[2] then
  return 0
end
redis.call('set', KEYS[3], '1', 'EX', ARGV[3])
redis.call('del', KEYS[2])
redis.call('zrem', KEYS[1], ARGV[1])
redis.call('del', KEYS[4])
return 1
`;

const RESCHEDULE_SCRIPT = `
-- senda_internal_reschedule_v2
if redis.call('get', KEYS[3]) ~= ARGV[2] then
  return 0
end
redis.call('set', KEYS[2], ARGV[3], 'EX', ARGV[4])
redis.call('zadd', KEYS[1], ARGV[5], ARGV[1])
redis.call('del', KEYS[3])
return 1
`;

const storedItemSchema = z
  .object({
    version: z.literal(1),
    deliveryId: z.string().regex(/^[a-f0-9]{64}$/),
    type: z.enum(["login", "career_anchor_completed"]),
    occurredAtEpochMs: z.number().int().nonnegative(),
    audience: z.enum(["authenticated", "anonymous"]),
    recipientFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
    attemptCount: z.number().int().nonnegative(),
  })
  .strict();

export type InternalNotificationOutboxItem = z.infer<typeof storedItemSchema>;

export type InternalNotificationOutboxClaim = {
  item: InternalNotificationOutboxItem;
  leaseToken: string;
};

export type InternalNotificationEnqueueOutcome = "enqueued" | "pending" | "delivered";

function itemKey(deliveryId: string) {
  return `${OUTBOX_PREFIX}:item:${deliveryId}`;
}

function deliveredKey(deliveryId: string) {
  return `${OUTBOX_PREFIX}:delivered:${deliveryId}`;
}

function leaseKey(deliveryId: string) {
  return `${OUTBOX_PREFIX}:lease:${deliveryId}`;
}

function parseStoredItem(value: unknown) {
  if (typeof value !== "string") return null;

  try {
    const parsed = storedItemSchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export class InternalNotificationOutbox {
  readonly backend = "redis" as const;
  private readonly redis: Redis;

  constructor(config: { url: string; token: string }) {
    // Lua returns the JSON payload verbatim. Upstash's default response parser
    // would otherwise turn it into an object before our strict schema check.
    this.redis = new Redis({ ...config, automaticDeserialization: false });
  }

  async enqueue(
    item: InternalNotificationOutboxItem,
    nextAttemptAtEpochMs = Date.now(),
  ): Promise<InternalNotificationEnqueueOutcome> {
    const payload = JSON.stringify(storedItemSchema.parse(item));
    const result = await this.redis.eval<[string, string, string, string], number>(
      ENQUEUE_SCRIPT,
      [itemKey(item.deliveryId), deliveredKey(item.deliveryId), OUTBOX_QUEUE_KEY],
      [
        item.deliveryId,
        String(nextAttemptAtEpochMs),
        payload,
        String(OUTBOX_ITEM_TTL_SECONDS),
      ],
    );

    if (result === 2) return "delivered";
    if (result === 1) return "enqueued";
    return "pending";
  }

  async claimDue(options: {
    maxDeliveries: number;
    deliveryIds?: string[];
    nowEpochMs?: number;
  }): Promise<InternalNotificationOutboxClaim[]> {
    const nowEpochMs = options.nowEpochMs ?? Date.now();
    const deliveryIds = options.deliveryIds
      ? [...new Set(options.deliveryIds)].slice(0, options.maxDeliveries)
      : await this.redis.zrange<string[]>(OUTBOX_QUEUE_KEY, "-inf", nowEpochMs, {
          byScore: true,
          offset: 0,
          count: options.maxDeliveries,
        });
    const claims: InternalNotificationOutboxClaim[] = [];

    for (const deliveryId of deliveryIds) {
      const leaseToken = createInternalNotificationLeaseToken();
      const payload = await this.redis.eval<[string, string, string, string], string | null>(
        CLAIM_SCRIPT,
        [
          OUTBOX_QUEUE_KEY,
          itemKey(deliveryId),
          deliveredKey(deliveryId),
          leaseKey(deliveryId),
        ],
        [
          deliveryId,
          String(nowEpochMs),
          leaseToken,
          String(INTERNAL_NOTIFICATION_LEASE_SECONDS),
        ],
      );
      if (payload === null) continue;

      const item = parseStoredItem(payload);
      if (!item) {
        throw new Error("Internal notification outbox payload is invalid");
      }
      claims.push({ item, leaseToken });
    }

    return claims;
  }

  async markDelivered(claim: InternalNotificationOutboxClaim) {
    const result = await this.redis.eval<[string, string, string], number>(
      MARK_DELIVERED_SCRIPT,
      [
        OUTBOX_QUEUE_KEY,
        itemKey(claim.item.deliveryId),
        deliveredKey(claim.item.deliveryId),
        leaseKey(claim.item.deliveryId),
      ],
      [
        claim.item.deliveryId,
        claim.leaseToken,
        String(DELIVERED_MARKER_TTL_SECONDS),
      ],
    );
    return result === 1;
  }

  async reschedule(
    claim: InternalNotificationOutboxClaim,
    item: InternalNotificationOutboxItem,
    nextAttemptAtEpochMs: number,
  ) {
    const payload = JSON.stringify(storedItemSchema.parse(item));
    const result = await this.redis.eval<[string, string, string, string, string], number>(
      RESCHEDULE_SCRIPT,
      [
        OUTBOX_QUEUE_KEY,
        itemKey(claim.item.deliveryId),
        leaseKey(claim.item.deliveryId),
      ],
      [
        claim.item.deliveryId,
        claim.leaseToken,
        payload,
        String(OUTBOX_ITEM_TTL_SECONDS),
        String(nextAttemptAtEpochMs),
      ],
    );
    return result === 1;
  }
}
