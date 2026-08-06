import { describe, expect, it } from "vitest";
import { normalizePhone, validateLeadInput } from "../src";

describe("lead schema", () => {
  it("normalizes a Vietnamese country code", () => {
    expect(normalizePhone("+84 912 345 678")).toBe("0912345678");
  });

  it("returns cleaned valid data", () => {
    const result = validateLeadInput({
      name: "  Nguyễn   Văn A ",
      phone: "0912 345 678",
      message: "Cần báo giá 20 lưỡi cắt kính.",
      quantity: "20",
      source: "landing-page",
      turnstileToken: "test-token",
    });

    expect(result).toMatchObject({
      ok: true,
      data: { name: "Nguyễn Văn A", phone: "0912345678", quantity: "20" },
    });
  });

  it("rejects invalid required fields without throwing", () => {
    const result = validateLeadInput({
      name: "A",
      phone: "123",
      message: "ngắn",
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected validation to fail.");
    expect(result.fieldErrors.name).toBeTypeOf("string");
    expect(result.fieldErrors.phone).toBeTypeOf("string");
    expect(result.fieldErrors.message).toBeTypeOf("string");
  });

  it("marks the honeypot while preserving a successful-shaped response", () => {
    expect(
      validateLeadInput({
        name: "Nguyễn Văn A",
        phone: "0912345678",
        message: "Cần báo giá lưỡi cắt kính.",
        source: "landing-page",
        turnstileToken: "test-token",
        company: "bot",
      }),
    ).toMatchObject({ ok: true, honeypot: true });
  });
});
