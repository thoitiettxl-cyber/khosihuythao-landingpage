export interface ApiErrorBody {
  error: {
    code: string;
    fieldErrors?: Record<string, string>;
    message: string;
  };
  ok: false;
  requestId?: string;
}

export function parseAllowedOrigins(value: string): Set<string> {
  return new Set(
    value
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

export function isOriginAllowed(request: Request, env: Env): boolean {
  const origin = request.headers.get("Origin");
  return (
    origin === null || parseAllowedOrigins(env.ALLOWED_ORIGINS).has(origin)
  );
}

export function corsHeaders(request: Request, env: Env): Headers {
  const headers = new Headers({ Vary: "Origin" });
  const origin = request.headers.get("Origin");
  if (origin && parseAllowedOrigins(env.ALLOWED_ORIGINS).has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Max-Age", "86400");
  }
  return headers;
}

export function jsonResponse(
  request: Request,
  env: Env,
  body: object,
  status = 200,
): Response {
  const headers = corsHeaders(request, env);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return Response.json(body, { status, headers });
}

export function errorResponse(
  request: Request,
  env: Env,
  status: number,
  code: string,
  message: string,
  options: { fieldErrors?: Record<string, string>; requestId?: string } = {},
): Response {
  const body: ApiErrorBody = {
    ok: false,
    error: {
      code,
      message,
      ...(options.fieldErrors ? { fieldErrors: options.fieldErrors } : {}),
    },
    ...(options.requestId ? { requestId: options.requestId } : {}),
  };
  return jsonResponse(request, env, body, status);
}
