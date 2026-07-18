export type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; reason: "invalid-content-type" | "invalid-json" | "too-large" };

export async function readJsonBody(req: Request, maxBytes: number): Promise<JsonBodyResult> {
  const contentType = req.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") {
    return { ok: false, reason: "invalid-content-type" };
  }

  const declaredLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { ok: false, reason: "too-large" };
  }

  const reader = req.body?.getReader();
  if (!reader) {
    return { ok: false, reason: "invalid-json" };
  }

  const decoder = new TextDecoder();
  let receivedBytes = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    receivedBytes += value.byteLength;
    if (receivedBytes > maxBytes) {
      await reader.cancel();
      return { ok: false, reason: "too-large" };
    }

    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();

  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, reason: "invalid-json" };
  }
}
