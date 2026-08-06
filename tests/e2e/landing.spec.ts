import { expect, test } from "@playwright/test";

test("renders the landing page without serious browser errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Kho sỉ vật tư công trình",
  );
  await expect(
    page.getByRole("heading", { name: "Một số mặt hàng thực tế" }),
  ).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Zalo 0964 727 949" }).first(),
  ).toHaveAttribute("href", "https://zalo.me/84964727949");
  await expect(
    page.getByRole("link", { name: "Zalo 0968 844 385" }).first(),
  ).toHaveAttribute("href", "https://zalo.me/84968844385");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("publishes focused wholesale SEO content", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("KHO SỈ HUY THẢO | Vật tư công trình TP.HCM");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://127.0.0.1:4321/",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /03-warehouse-cartons-x2000-960\.webp/,
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Kho sỉ vật tư công trình",
  );
  await expect(
    page.getByRole("heading", { name: "Vật tư cho thợ và công trình" }),
  ).toBeVisible();
});

test("opens and closes the accessible product dialog", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: /Mở ảnh lớn:/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog", { name: "Ảnh sản phẩm" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img")).toHaveAttribute("alt", /.+/);
  await page.getByRole("button", { name: "Đóng ảnh" }).click();
  await expect(dialog).toBeHidden();
});

test("validates and submits a quote once", async ({ page }) => {
  let requestCount = 0;
  await page.route("**/api/lead", async (route) => {
    requestCount += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        requestId: "lead_e2e",
        message: "Đã nhận yêu cầu. Cửa hàng sẽ liên hệ lại.",
      }),
    });
  });
  await page.goto("/#quote");
  await page.evaluate(() => {
    const testWindow = window as typeof window & {
      quoteTurnstileWidgetId?: string;
      turnstile?: {
        render: () => string;
        reset: (widgetId: string) => void;
      };
    };
    testWindow.quoteTurnstileWidgetId = "widget-e2e";
    testWindow.turnstile = {
      render: () => "widget-e2e",
      reset: (widgetId: string) => {
        document.body.dataset.turnstileReset = widgetId;
      },
    };
  });
  await page.getByRole("button", { name: "Gửi yêu cầu báo giá" }).click();
  await expect(page.locator("#name-error")).not.toBeEmpty();

  await page.getByLabel(/Họ tên/).fill("Nguyễn Văn A");
  await page.getByLabel(/Số điện thoại/).fill("0912345678");
  await page
    .getByLabel(/Nội dung cần mua/)
    .fill("Cần báo giá 20 lưỡi cắt kính.");
  await page.getByRole("button", { name: "Gửi yêu cầu báo giá" }).click();
  await expect(page.getByRole("status").last()).toContainText(
    "Đã nhận yêu cầu",
  );
  await expect(page.locator("body")).toHaveAttribute(
    "data-turnstile-reset",
    "widget-e2e",
  );
  expect(requestCount).toBe(1);
});

test("explains the production rate limit", async ({ page }) => {
  await page.route("**/api/lead", async (route) => {
    await route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: { code: "RATE_LIMITED", message: "Too many requests." },
      }),
    });
  });
  await page.goto("/#quote");
  await page.locator("#name").fill("Nguyễn Văn A");
  await page.locator("#phone").fill("0912345678");
  await page.locator("#message").fill("Cần báo giá 20 lưỡi cắt kính.");
  await page.locator('#quote-form button[type="submit"]').click();
  await expect(page.locator("#form-status")).toContainText(
    "Vui lòng chờ một phút",
  );
});

test("mobile sticky contact actions remain usable", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "Mobile-only behavior");
  await page.goto("/");
  await expect(page.locator(".mobile-cta")).toBeVisible();
  await expect(
    page.locator(".mobile-cta").getByRole("link", { name: "Zalo 1" }),
  ).toHaveAttribute("href", "https://zalo.me/84964727949");
  await expect(
    page.locator(".mobile-cta").getByRole("link", { name: "Zalo 2" }),
  ).toHaveAttribute("href", "https://zalo.me/84968844385");
});

test("matches the required responsive viewport matrix", async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.includes("desktop"),
    "Run the visual matrix once",
  );
  const viewports = [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(
        `${String(viewport.width)}x${String(viewport.height)}.png`,
      ),
      fullPage: true,
    });
  }
});
