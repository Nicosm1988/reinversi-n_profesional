type LogLevel = "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

export function logEvent(level: LogLevel, event: string, meta: LogMeta = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...meta,
  };

  const message = JSON.stringify(payload);
  if (level === "error") {
    console.error(message);
    return;
  }

  if (level === "warn") {
    console.warn(message);
    return;
  }

  console.info(message);
}