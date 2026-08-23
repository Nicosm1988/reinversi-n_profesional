import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Lease = { token: string; expiresAtEpochMs: number };

const mocks = vi.hoisted(() => ({
  createTransport: vi.fn(),
  sendMail: vi.fn(),
  state: {
    items: new Map<string, string>(),
    queue: new Map<string, number>(),
    delivered: new Set<string>(),
    leases: new Map<string, Lease>(),
    enqueuedPayloads: [] as string[],
    usedKeys: [] as string[],
    failOperation: null as null | "all" | "enqueue" | "claim" | "mark" | "reschedule",
    failNextMark: 0,
    constructorFails: false,
  },
}));

function shouldFail(operation: "enqueue" | "claim" | "mark" | "reschedule") {
  return mocks.state.failOperation === "all" || mocks.state.failOperation === operation;
}

vi.mock("next/dist/compiled/server-only", () => ({}));
vi.mock("nodemailer", () => ({
  default: { createTransport: mocks.createTransport },
}));
vi.mock("@upstash/redis", () => ({
  Redis: class RedisMock {
    constructor() {
      if (mocks.state.constructorFails) throw new Error("redis constructor unavailable");
    }

    async zrange(
      key: string,
      _minimum: string,
      maximum: number,
      options: { offset?: number; count?: number },
    ) {
      if (shouldFail("claim")) throw new Error("redis unavailable");
      mocks.state.usedKeys.push(key);
      const due = [...mocks.state.queue.entries()]
        .filter(([, score]) => score <= Number(maximum))
        .sort((left, right) => left[1] - right[1])
        .map(([deliveryId]) => deliveryId);
      const offset = options.offset ?? 0;
      return due.slice(offset, offset + (options.count ?? due.length));
    }

    async eval(script: string, keys: string[], args: string[]) {
      mocks.state.usedKeys.push(...keys);
      if (script.includes("senda_internal_enqueue_v2")) {
        if (shouldFail("enqueue")) throw new Error("redis unavailable");
        const [itemKey, deliveredKey] = keys;
        const [deliveryId, score, payload] = args;
        if (!itemKey || !deliveredKey || !deliveryId || !score || !payload) {
          throw new Error("invalid enqueue invocation");
        }
        if (mocks.state.delivered.has(deliveredKey)) return 2;
        if (mocks.state.items.has(itemKey)) {
          if (!mocks.state.queue.has(deliveryId)) {
            mocks.state.queue.set(deliveryId, Number(score));
          }
          return 0;
        }
        mocks.state.items.set(itemKey, payload);
        mocks.state.queue.set(deliveryId, Number(score));
        mocks.state.enqueuedPayloads.push(payload);
        return 1;
      }

      if (script.includes("senda_internal_claim_v2")) {
        if (shouldFail("claim")) throw new Error("redis unavailable");
        const [, itemKey, deliveredKey, leaseKey] = keys;
        const [deliveryId, now, leaseToken, leaseSeconds] = args;
        if (
          !itemKey || !deliveredKey || !leaseKey || !deliveryId || !now
          || !leaseToken || !leaseSeconds
        ) {
          throw new Error("invalid claim invocation");
        }

        const score = mocks.state.queue.get(deliveryId);
        if (score === undefined || score > Number(now)) return null;
        if (mocks.state.delivered.has(deliveredKey)) {
          mocks.state.queue.delete(deliveryId);
          mocks.state.items.delete(itemKey);
          return null;
        }

        const existingLease = mocks.state.leases.get(leaseKey);
        if (existingLease && existingLease.expiresAtEpochMs > Number(now)) return null;
        mocks.state.leases.set(leaseKey, {
          token: leaseToken,
          expiresAtEpochMs: Number(now) + Number(leaseSeconds) * 1_000,
        });

        const payload = mocks.state.items.get(itemKey);
        if (!payload) {
          mocks.state.queue.delete(deliveryId);
          mocks.state.leases.delete(leaseKey);
          return null;
        }
        return payload;
      }

      if (script.includes("senda_internal_mark_delivered_v2")) {
        if (mocks.state.failNextMark > 0) {
          mocks.state.failNextMark -= 1;
          throw new Error("redis completion unavailable");
        }
        if (shouldFail("mark")) throw new Error("redis unavailable");
        const [, itemKey, deliveredKey, leaseKey] = keys;
        const [deliveryId, leaseToken] = args;
        if (!itemKey || !deliveredKey || !leaseKey || !deliveryId || !leaseToken) {
          throw new Error("invalid completion invocation");
        }
        if (mocks.state.leases.get(leaseKey)?.token !== leaseToken) return 0;
        mocks.state.delivered.add(deliveredKey);
        mocks.state.items.delete(itemKey);
        mocks.state.queue.delete(deliveryId);
        mocks.state.leases.delete(leaseKey);
        return 1;
      }

      if (script.includes("senda_internal_reschedule_v2")) {
        if (shouldFail("reschedule")) throw new Error("redis unavailable");
        const [, itemKey, leaseKey] = keys;
        const [deliveryId, leaseToken, payload, , nextAttemptAt] = args;
        if (
          !itemKey || !leaseKey || !deliveryId || !leaseToken || !payload || !nextAttemptAt
        ) {
          throw new Error("invalid reschedule invocation");
        }
        if (mocks.state.leases.get(leaseKey)?.token !== leaseToken) return 0;
        mocks.state.items.set(itemKey, payload);
        mocks.state.queue.set(deliveryId, Number(nextAttemptAt));
        mocks.state.leases.delete(leaseKey);
        return 1;
      }

      throw new Error("unknown Redis script");
    }
  },
}));

import {
  notifyInternalActivity,
  processInternalNotificationOutbox,
} from "@/lib/internal-notifications/service";

function loginInput(eventId: string) {
  return {
    type: "login" as const,
    eventId,
    occurredAt: new Date("2026-08-23T14:30:45.000Z"),
    audience: "authenticated" as const,
  };
}

function accept(message: { to: string }) {
  return { accepted: [message.to], rejected: [] };
}

describe("durable internal notification outbox", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-23T14:31:00.000Z"));
    vi.stubEnv("SMTP_HOST", "mail.privateemail.com");
    vi.stubEnv("SMTP_PORT", "465");
    vi.stubEnv("SMTP_USER", "hola@universosenda.com");
    vi.stubEnv("SMTP_PASSWORD", "test-only-password");
    vi.stubEnv(
      "INTERNAL_NOTIFICATION_EMAILS",
      " HOLA@UNIVERSOSENDA.COM, tanisardella@gmail.com, hola@universosenda.com ",
    );
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.com");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "redis-test-token");

    mocks.state.items.clear();
    mocks.state.queue.clear();
    mocks.state.delivered.clear();
    mocks.state.leases.clear();
    mocks.state.enqueuedPayloads.length = 0;
    mocks.state.usedKeys.length = 0;
    mocks.state.failOperation = null;
    mocks.state.failNextMark = 0;
    mocks.state.constructorFails = false;
    mocks.createTransport.mockReset().mockReturnValue({ sendMail: mocks.sendMail });
    mocks.sendMail.mockReset().mockImplementation(async (message: { to: string }) => (
      accept(message)
    ));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("persists every recipient before SMTP and stores no event identifier or personal data", async () => {
    const rawEventId = "login-session-private-identifier";
    mocks.sendMail.mockImplementation(async (message: { to: string }) => {
      expect(mocks.state.items.size).toBe(2);
      expect(mocks.state.queue.size).toBe(2);
      return accept(message);
    });

    const result = await notifyInternalActivity(loginInput(rawEventId));

    expect(result).toMatchObject({
      sent: 2,
      duplicates: 0,
      failed: 0,
      unavailable: false,
    });
    expect(mocks.createTransport).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledTimes(2);
    expect(mocks.sendMail.mock.calls.map(([message]) => message.to)).toEqual([
      "hola@universosenda.com",
      "tanisardella@gmail.com",
    ]);

    const stored = mocks.state.enqueuedPayloads.join("\n");
    expect(stored).not.toContain(rawEventId);
    expect(stored).not.toContain("hola@universosenda.com");
    expect(stored).not.toContain("tanisardella@gmail.com");
    expect(stored).not.toMatch(
      /"(?:accountEmail|email|ip|answers|responses|scores|respuesta|puntaje)"/i,
    );
    const redisKeys = mocks.state.usedKeys.join("\n");
    expect(redisKeys).not.toContain(rawEventId);
    expect(redisKeys).not.toContain("hola@universosenda.com");
    expect(redisKeys).not.toContain("tanisardella@gmail.com");
    for (const payload of mocks.state.enqueuedPayloads) {
      expect(Object.keys(JSON.parse(payload)).sort()).toEqual([
        "attemptCount",
        "audience",
        "deliveryId",
        "occurredAtEpochMs",
        "recipientFingerprint",
        "type",
        "version",
      ]);
      expect(JSON.parse(payload).recipientFingerprint).toMatch(/^[a-f0-9]{64}$/);
    }

    for (const [message] of mocks.sendMail.mock.calls) {
      expect(message).toEqual(expect.objectContaining({
        from: { name: "Senda", address: "hola@universosenda.com" },
        replyTo: { name: "Equipo Senda", address: "hola@universosenda.com" },
        subject: "Nuevo inicio de sesión en Senda",
        text: expect.stringContaining("Cuenta: Cuenta autenticada"),
        messageId: expect.stringMatching(
          /^<senda-internal-[a-f0-9]{40}@universosenda\.com>$/,
        ),
      }));
      expect(message.text).not.toContain(rawEventId);
    }
  });

  it("keeps a partial SMTP failure queued and the worker retries only that recipient", async () => {
    mocks.sendMail.mockImplementation(async (message: { to: string }) => (
      message.to === "tanisardella@gmail.com"
        ? { accepted: [], rejected: [message.to] }
        : accept(message)
    ));

    const first = await notifyInternalActivity(loginInput("partial-delivery"));
    const firstTaniaMessageId = mocks.sendMail.mock.calls.find(
      ([message]) => message.to === "tanisardella@gmail.com",
    )?.[0].messageId;

    expect(first).toMatchObject({ sent: 1, duplicates: 0, failed: 1, unavailable: false });
    expect(first.deliveries).toEqual(expect.arrayContaining([
      expect.objectContaining({ status: "failed", errorCode: "smtp_rejected", queued: true }),
    ]));
    expect(mocks.state.queue.size).toBe(1);
    expect(mocks.state.items.size).toBe(1);

    vi.setSystemTime(new Date(Date.now() + 61_000));
    mocks.sendMail.mockImplementation(async (message: { to: string }) => accept(message));
    const retry = await processInternalNotificationOutbox({ maxDeliveries: 5 });

    expect(retry).toMatchObject({ sent: 1, duplicates: 0, failed: 0, unavailable: false });
    expect(mocks.sendMail).toHaveBeenCalledTimes(3);
    expect(mocks.sendMail.mock.calls.filter(
      ([message]) => message.to === "hola@universosenda.com",
    )).toHaveLength(1);
    const retriedTaniaCalls = mocks.sendMail.mock.calls.filter(
      ([message]) => message.to === "tanisardella@gmail.com",
    );
    expect(retriedTaniaCalls).toHaveLength(2);
    expect(retriedTaniaCalls[1]?.[0].messageId).toBe(firstTaniaMessageId);
    expect(mocks.state.queue.size).toBe(0);
    expect(mocks.state.delivered.size).toBe(2);

    const duplicate = await notifyInternalActivity(loginInput("partial-delivery"));
    expect(duplicate).toMatchObject({ sent: 0, duplicates: 2, failed: 0 });
    expect(mocks.sendMail).toHaveBeenCalledTimes(3);
  });

  it("resolves pending deliveries by stable recipient fingerprint after config changes", async () => {
    mocks.sendMail.mockImplementation(async (message: { to: string }) => (
      message.to === "tanisardella@gmail.com"
        ? { accepted: [], rejected: [message.to] }
        : accept(message)
    ));

    await notifyInternalActivity(loginInput("stable-recipient"));
    expect(mocks.state.queue.size).toBe(1);
    const [pendingPayload] = [...mocks.state.items.values()];
    expect(pendingPayload).toBeDefined();
    expect(JSON.parse(pendingPayload ?? "{}")).toEqual(expect.objectContaining({
      recipientFingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
    }));

    vi.stubEnv(
      "INTERNAL_NOTIFICATION_EMAILS",
      "admin@example.com,tanisardella@gmail.com,hola@universosenda.com",
    );
    vi.setSystemTime(new Date(Date.now() + 61_000));
    mocks.sendMail.mockClear().mockImplementation(
      async (message: { to: string }) => accept(message),
    );

    const retry = await processInternalNotificationOutbox({ maxDeliveries: 5 });

    expect(retry).toMatchObject({ sent: 1, failed: 0, unavailable: false });
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: "tanisardella@gmail.com",
    }));
  });

  it("never processes more than four SMTP deliveries concurrently", async () => {
    vi.stubEnv(
      "INTERNAL_NOTIFICATION_EMAILS",
      [
        "hola@universosenda.com",
        "tanisardella@gmail.com",
        "alerts-a@example.com",
        "alerts-b@example.com",
        "alerts-c@example.com",
      ].join(","),
    );

    const gates = Array.from({ length: 5 }, () => {
      let release = () => {};
      const promise = new Promise<void>((resolve) => {
        release = resolve;
      });
      return { promise, release };
    });
    let active = 0;
    let maximumActive = 0;
    let resolveFirstBatchStarted = () => {};
    const firstBatchStarted = new Promise<void>((resolve) => {
      resolveFirstBatchStarted = resolve;
    });
    let resolveFifthStarted = () => {};
    const fifthStarted = new Promise<void>((resolve) => {
      resolveFifthStarted = resolve;
    });

    mocks.sendMail.mockImplementation(async (message: { to: string }) => {
      const callIndex = mocks.sendMail.mock.calls.length - 1;
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      if (callIndex === 3) resolveFirstBatchStarted();
      if (callIndex === 4) resolveFifthStarted();
      await gates[callIndex]?.promise;
      active -= 1;
      return accept(message);
    });

    const notification = notifyInternalActivity(loginInput("bounded-concurrency"));
    await firstBatchStarted;

    expect(mocks.sendMail).toHaveBeenCalledTimes(4);
    expect(maximumActive).toBe(4);

    for (const gate of gates.slice(0, 4)) gate.release();
    await fifthStarted;
    expect(mocks.sendMail).toHaveBeenCalledTimes(5);
    expect(maximumActive).toBe(4);

    gates[4]?.release();
    await expect(notification).resolves.toMatchObject({
      sent: 5,
      failed: 0,
      unavailable: false,
    });
  });

  it("keeps transport failures durable and two workers cannot deliver one lease twice", async () => {
    mocks.createTransport.mockImplementationOnce(() => {
      throw new Error("SMTP transport unavailable");
    });

    const queued = await notifyInternalActivity(loginInput("transport-retry"));

    expect(queued).toMatchObject({ sent: 0, duplicates: 0, failed: 2, unavailable: false });
    expect(queued.deliveries).toEqual([
      expect.objectContaining({ errorCode: "smtp_transport", queued: true }),
      expect.objectContaining({ errorCode: "smtp_transport", queued: true }),
    ]);
    expect(mocks.state.queue.size).toBe(2);

    vi.setSystemTime(new Date(Date.now() + 61_000));
    const [workerOne, workerTwo] = await Promise.all([
      processInternalNotificationOutbox({ maxDeliveries: 5 }),
      processInternalNotificationOutbox({ maxDeliveries: 5 }),
    ]);

    expect(workerOne.sent + workerTwo.sent).toBe(2);
    expect(workerOne.failed + workerTwo.failed).toBe(0);
    expect(mocks.sendMail).toHaveBeenCalledTimes(2);
    expect(mocks.state.queue.size).toBe(0);
    expect(mocks.state.delivered.size).toBe(2);
  });

  it("retries after an SMTP success when the durable delivered marker could not be written", async () => {
    mocks.state.failNextMark = 1;

    const first = await notifyInternalActivity(loginInput("completion-write-failure"));
    const failedDeliveryIndex = first.deliveries.findIndex(
      (delivery) => delivery.status === "failed",
    );
    const failedMessage = mocks.sendMail.mock.calls[failedDeliveryIndex]?.[0];

    expect(first).toMatchObject({ sent: 1, failed: 1, unavailable: true });
    expect(first.errorCode).toBe("outbox_unavailable");
    expect(failedMessage).toBeDefined();
    expect(mocks.state.queue.size).toBe(1);

    vi.setSystemTime(new Date(Date.now() + 61_000));
    const retry = await processInternalNotificationOutbox({ maxDeliveries: 5 });

    expect(retry).toMatchObject({ sent: 1, failed: 0, unavailable: false });
    expect(mocks.sendMail).toHaveBeenCalledTimes(3);
    const duplicateAttempt = mocks.sendMail.mock.calls.find(
      ([message], index) => index >= 2 && message.to === failedMessage?.to,
    )?.[0];
    expect(duplicateAttempt?.messageId).toBe(failedMessage?.messageId);
    expect(mocks.state.queue.size).toBe(0);
    expect(mocks.state.delivered.size).toBe(2);
  });

  it("reports the outbox as unavailable and never falls back to process memory", async () => {
    mocks.state.failOperation = "enqueue";

    const result = await notifyInternalActivity(loginInput("redis-unavailable"));

    expect(result).toMatchObject({
      sent: 0,
      duplicates: 0,
      failed: 2,
      unavailable: true,
      errorCode: "outbox_unavailable",
    });
    expect(result.deliveries).toEqual([
      expect.objectContaining({ errorCode: "outbox_unavailable", queued: false }),
      expect.objectContaining({ errorCode: "outbox_unavailable", queued: false }),
    ]);
    expect(mocks.createTransport).not.toHaveBeenCalled();
    expect(mocks.sendMail).not.toHaveBeenCalled();
    expect(mocks.state.items.size).toBe(0);
  });

  it("returns configuration and input failures without opening SMTP", async () => {
    vi.stubEnv("INTERNAL_NOTIFICATION_EMAILS", "invalid-address");
    await expect(notifyInternalActivity(loginInput("bad-config"))).resolves.toMatchObject({
      sent: 0,
      duplicates: 0,
      failed: 0,
      unavailable: true,
      errorCode: "configuration",
    });

    vi.stubEnv(
      "INTERNAL_NOTIFICATION_EMAILS",
      "hola@universosenda.com,tanisardella@gmail.com",
    );
    await expect(notifyInternalActivity({
      ...loginInput("bad-input"),
      occurredAt: new Date("invalid"),
    })).resolves.toMatchObject({
      sent: 0,
      duplicates: 0,
      failed: 0,
      unavailable: true,
      errorCode: "invalid_input",
    });
    expect(mocks.createTransport).not.toHaveBeenCalled();
  });
});
