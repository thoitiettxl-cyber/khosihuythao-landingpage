export const MAX_LEAD_BYTES = 16_384;

export interface LeadInput {
  area?: string;
  company?: string;
  message: string;
  name: string;
  phone: string;
  quantity?: string;
  source: "landing-page";
  turnstileToken: string;
}

export interface LeadData {
  area?: string;
  message: string;
  name: string;
  phone: string;
  quantity?: string;
  source: "landing-page";
  turnstileToken: string;
}

export type LeadValidationResult =
  | { ok: true; data: LeadData; honeypot: boolean }
  | { ok: false; fieldErrors: Record<string, string> };

const whitespace = /\s+/g;
const vietnamesePhone = /^(?:\+?84|0)(?:\d[ .-]?){8,10}$/;

function clean(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  const withoutControlCharacters = Array.from(value)
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint >= 32 && codePoint !== 127;
    })
    .join("");
  return withoutControlCharacters
    .replace(whitespace, " ")
    .trim()
    .slice(0, maxLength);
}

export function normalizePhone(value: string): string {
  const compact = value.replace(/[ .()-]/g, "");
  return compact.startsWith("+84")
    ? `0${compact.slice(3)}`
    : compact.startsWith("84")
      ? `0${compact.slice(2)}`
      : compact;
}

export function validateLeadInput(value: unknown): LeadValidationResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ok: false,
      fieldErrors: { form: "Dữ liệu gửi lên không hợp lệ." },
    };
  }

  const input = value as Record<string, unknown>;
  const name = clean(input.name, 80);
  const phoneRaw = clean(input.phone, 24);
  const phone = normalizePhone(phoneRaw);
  const message = clean(input.message, 1_000);
  const quantity = clean(input.quantity, 40);
  const area = clean(input.area, 120);
  const turnstileToken = clean(input.turnstileToken, 2_048);
  const company = clean(input.company, 120);
  const fieldErrors: Record<string, string> = {};

  if (name.length < 2)
    fieldErrors.name = "Vui lòng nhập họ tên (ít nhất 2 ký tự).";
  if (
    !vietnamesePhone.test(phoneRaw) ||
    phone.length < 9 ||
    phone.length > 11
  ) {
    fieldErrors.phone = "Vui lòng nhập số điện thoại Việt Nam hợp lệ.";
  }
  if (message.length < 10)
    fieldErrors.message = "Vui lòng mô tả nhu cầu (ít nhất 10 ký tự).";
  if (input.source !== "landing-page")
    fieldErrors.source = "Nguồn yêu cầu không hợp lệ.";

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    honeypot: company.length > 0,
    data: {
      name,
      phone,
      message,
      source: "landing-page",
      turnstileToken,
      ...(quantity ? { quantity } : {}),
      ...(area ? { area } : {}),
    },
  };
}
