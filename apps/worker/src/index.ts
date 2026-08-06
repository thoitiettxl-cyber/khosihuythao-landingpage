import { MAX_LEAD_BYTES, validateLeadInput } from "@landingpage/shared";
import {
  errorResponse,
  isOriginAllowed,
  jsonResponse,
  noContentResponse,
} from "./http";
import { createNotificationProvider } from "./notify";
import { verifyTurnstile } from "./turnstile";

interface HandlerDependencies {
  fetchFn: typeof fetch;
}

const encoder = new TextEncoder();

async function rateLimitKey(request: Request): Promise<string> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(ip));
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function handleRequest(
  request: Request,
  env: Env,
  dependencies: HandlerDependencies = { fetchFn: fetch },
): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return isOriginAllowed(request, env)
      ? noContentResponse(request, env)
      : errorResponse(
          request,
          env,
          403,
          "ORIGIN_FORBIDDEN",
          "Nguồn gửi yêu cầu không được phép.",
        );
  }

  if (request.method === "GET" && url.pathname === "/api/health") {
    return jsonResponse(request, env, {
      ok: true,
      service: "landingpage-lead-api",
    });
  }

  if (request.method !== "POST" || url.pathname !== "/api/lead") {
    return errorResponse(
      request,
      env,
      404,
      "NOT_FOUND",
      "Không tìm thấy endpoint.",
    );
  }
  if (!isOriginAllowed(request, env)) {
    return errorResponse(
      request,
      env,
      403,
      "ORIGIN_FORBIDDEN",
      "Nguồn gửi yêu cầu không được phép.",
    );
  }
  if (
    !request.headers
      .get("Content-Type")
      ?.toLowerCase()
      .includes("application/json")
  ) {
    return errorResponse(
      request,
      env,
      400,
      "CONTENT_TYPE_INVALID",
      "Yêu cầu phải dùng JSON.",
    );
  }

  const declaredLength = Number(request.headers.get("Content-Length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_LEAD_BYTES) {
    return errorResponse(
      request,
      env,
      413,
      "PAYLOAD_TOO_LARGE",
      "Nội dung yêu cầu vượt giới hạn.",
    );
  }

  const rateLimit = await env.LEAD_RATE_LIMITER.limit({
    key: await rateLimitKey(request),
  });
  if (!rateLimit.success) {
    return errorResponse(
      request,
      env,
      429,
      "RATE_LIMITED",
      "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.",
    );
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return errorResponse(
      request,
      env,
      400,
      "BODY_INVALID",
      "Không thể đọc nội dung yêu cầu.",
    );
  }
  if (encoder.encode(rawBody).byteLength > MAX_LEAD_BYTES) {
    return errorResponse(
      request,
      env,
      413,
      "PAYLOAD_TOO_LARGE",
      "Nội dung yêu cầu vượt giới hạn.",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody) as unknown;
  } catch {
    return errorResponse(
      request,
      env,
      400,
      "JSON_INVALID",
      "JSON không hợp lệ.",
    );
  }

  const validation = validateLeadInput(parsed);
  if (!validation.ok) {
    return errorResponse(
      request,
      env,
      400,
      "VALIDATION_FAILED",
      "Vui lòng kiểm tra lại thông tin.",
      {
        fieldErrors: validation.fieldErrors,
      },
    );
  }

  const requestId = `lead_${crypto.randomUUID()}`;
  if (validation.honeypot) {
    return jsonResponse(request, env, {
      ok: true,
      requestId,
      message: "Đã nhận yêu cầu. Cửa hàng sẽ liên hệ lại.",
    });
  }

  const remoteIp = request.headers.get("CF-Connecting-IP");
  const turnstile = await verifyTurnstile(
    validation.data.turnstileToken,
    remoteIp,
    env,
    dependencies.fetchFn,
  );
  if (!turnstile.success) {
    return errorResponse(
      request,
      env,
      403,
      "TURNSTILE_FAILED",
      "Không thể xác minh yêu cầu. Vui lòng thử lại.",
      {
        requestId,
      },
    );
  }

  try {
    const provider = createNotificationProvider(env, dependencies.fetchFn);
    await provider.send(validation.data, requestId);
  } catch (error) {
    console.error(
      JSON.stringify({
        message: "lead notification failed",
        requestId,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    );
    return errorResponse(
      request,
      env,
      500,
      "NOTIFICATION_FAILED",
      "Hệ thống đang bận. Vui lòng gọi hoặc nhắn Zalo.",
      {
        requestId,
      },
    );
  }

  console.log(
    JSON.stringify({
      message: "lead accepted",
      requestId,
      source: validation.data.source,
    }),
  );
  return jsonResponse(request, env, {
    ok: true,
    requestId,
    message: "Đã nhận yêu cầu. Cửa hàng sẽ liên hệ lại.",
  });
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
} satisfies ExportedHandler<Env>;
