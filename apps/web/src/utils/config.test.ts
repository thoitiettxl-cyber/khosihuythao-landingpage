import { describe, expect, it } from "vitest";
import { containsPlaceholder, joinBase } from "./config";

describe("site config helpers", () => {
  it("detects production placeholders", () => {
    expect(containsPlaceholder("TODO_BUSINESS_NAME")).toBe(true);
    expect(containsPlaceholder("Cửa hàng Minh Tâm")).toBe(false);
  });

  it("joins GitHub Pages base paths without duplicate slashes", () => {
    expect(joinBase("/repo/", "/images/item.webp")).toBe(
      "/repo/images/item.webp",
    );
  });
});
