import { describe, expect, it, vi } from "vitest";
import { handleRequest } from "../src";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validPayload(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    name: "Nguyễn Văn A",
    phone: "0912345678",
    message: "Cần báo giá 20 lưỡi cắt kính.",
    source: "landing-page",
    turnstileToken: "test-token",
    ...overrides,
  };
}

function testEnv(overrides: Partial<Env> = {}): Env {
  return {
    ENVIRONMENT: "development",
    ALLOWED_ORIGINS: "http://localhost:4321,http://127.0.0.1:4321",
    TURNSTILE_MODE: "disabled",
    NOTIFICATION_PROVIDER: "noop",
    TURNSTILE_SECRET: "test-secret",
    TELEGRAM_BOT_TOKEN: "test-token",
    TELEGRAM_CHAT_ID: "test-chat",
    LEAD_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) },
    ...overrides,
  };
}

function leadRequest(
  payload: Record<string, unknown>,
  origin = "http://localhost:4321",
): Request {
  return new Request("https://api.example/api/lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      "CF-Connecting-IP": "203.0.113.8",
    },
    body: JSON.stringify(payload),
  });
}

describe("lead worker", () => {
  it("reports health", async () => {
    const response = await handleRequest(
      new Request("https://api.example/api/health"),
      testEnv(),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true });
  });

  it("returns an empty successful preflight response", async () => {
    const response = await handleRequest(
      new Request("https://api.example/api/lead", {
        method: "OPTIONS",
        headers: { Origin: "http://localhost:4321" },
      }),
      testEnv(),
    );
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:4321",
    );
    await expect(response.text()).resolves.toBe("");
  });

  it("accepts a valid lead in local mode", async () => {
    const response = await handleRequest(
      leadRequest(validPayload()),
      testEnv(),
    );
    expect(response.status).toBe(200);
    const body: unknown = await response.json();
    if (!isRecord(body)) throw new Error("Expected an object response.");
    expect(body.ok).toBe(true);
    expect(body.requestId).toBeTypeOf("string");
    expect(String(body.requestId)).toMatch(/^lead_/);
  });

  it("rejects an unlisted origin", async () => {
    const response = await handleRequest(
      leadRequest(validPayload(), "https://attacker.example"),
      testEnv(),
    );
    expect(response.status).toBe(403);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("maps field validation errors", async () => {
    const response = await handleRequest(
      leadRequest(validPayload({ phone: "123" })),
      testEnv(),
    );
    expect(response.status).toBe(400);
    const body: unknown = await response.json();
    if (
      !isRecord(body) ||
      !isRecord(body.error) ||
      !isRecord(body.error.fieldErrors)
    ) {
      throw new Error("Expected structured field errors.");
    }
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("VALIDATION_FAILED");
    expect(body.error.fieldErrors.phone).toBeTypeOf("string");
  });

  it("does not notify honeypot submissions", async () => {
    const fetchFn = vi.fn<typeof fetch>();
    const response = await handleRequest(
      leadRequest(validPayload({ company: "bot" })),
      testEnv(),
      { fetchFn },
    );
    expect(response.status).toBe(200);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("returns 429 when the binding rejects the key", async () => {
    const env = testEnv({
      LEAD_RATE_LIMITER: {
        limit: vi.fn().mockResolvedValue({ success: false }),
      },
    });
    const response = await handleRequest(leadRequest(validPayload()), env);
    expect(response.status).toBe(429);
  });

  it("maps notification provider failures without leaking input", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 502 }));
    const response = await handleRequest(
      leadRequest(validPayload()),
      testEnv({ NOTIFICATION_PROVIDER: "telegram" }),
      { fetchFn },
    );
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: { code: "NOTIFICATION_FAILED" },
    });
  });
});
