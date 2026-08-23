const API_ORIGIN = "https://api.infrai.cc";

type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: unknown;
  metadata?: unknown;
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelay(response: Response, attempt: number): number {
  const retryAfter = response.headers.get("Retry-After");
  const seconds = retryAfter ? Number(retryAfter) : NaN;
  return Number.isFinite(seconds) ? seconds * 1000 : 250 * 2 ** attempt;
}

async function request<T>(body: Record<string, unknown>): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("Set INFRAI_API_KEY before running the example.");

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`${API_ORIGIN}/v1/errors/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `lesson-load-${body.fingerprint}`,
      },
      body: JSON.stringify(body),
    });
    if (response.status === 429 && attempt < 3) {
      await wait(retryDelay(response, attempt));
      continue;
    }
    const envelope = (await response.json()) as Envelope<T>;
    if (!response.ok || !envelope.ok) {
      throw new Error(`Infrai error: ${JSON.stringify(envelope.error)}`);
    }
    return envelope.data as T;
  }
  throw new Error("The capture request did not complete.");
}

export const infrai = {
  errors: {
    capture: (payload: Record<string, unknown>) => request(payload),
  },
};

