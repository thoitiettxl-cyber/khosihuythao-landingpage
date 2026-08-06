interface TurnstileResult {
  errorCodes: string[];
  success: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function verifyTurnstile(
  token: string,
  remoteIp: string | null,
  env: Env,
  fetchFn: typeof fetch,
): Promise<TurnstileResult> {
  if (env.TURNSTILE_MODE === "disabled" && env.ENVIRONMENT !== "production") {
    return { success: true, errorCodes: [] };
  }
  if (!token || !env.TURNSTILE_SECRET) {
    return { success: false, errorCodes: ["missing-input"] };
  }

  const form = new FormData();
  form.set("secret", env.TURNSTILE_SECRET);
  form.set("response", token);
  if (remoteIp) form.set("remoteip", remoteIp);
  form.set("idempotency_key", crypto.randomUUID());

  const response = await fetchFn(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: form,
    },
  );
  if (!response.ok)
    return { success: false, errorCodes: ["siteverify-unavailable"] };

  const body: unknown = await response.json();
  if (!isRecord(body))
    return { success: false, errorCodes: ["invalid-siteverify-response"] };
  const errorCodes = Array.isArray(body["error-codes"])
    ? body["error-codes"].filter(
        (code): code is string => typeof code === "string",
      )
    : [];
  return { success: body.success === true, errorCodes };
}
