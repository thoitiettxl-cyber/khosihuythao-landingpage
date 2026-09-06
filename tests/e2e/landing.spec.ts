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
  await expect(page.locator("#quote-form")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Gọi 0964 727 949" }).first(),
  ).toHaveAttribute("href", "tel:+84964727949");
  await expect(
    page.getByRole("link", { name: "Gọi 0968 844 385" }).first(),
  ).toHaveAttribute("href", "tel:+84968844385");
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

test("mobile sticky contact actions remain usable", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "Mobile-only behavior");
  await page.goto("/");
  await expect(page.locator(".mobile-cta")).toBeVisible();
  await expect(
    page.locator(".mobile-cta").getByRole("link", { name: "Gọi 0964 727 949" }),
  ).toHaveAttribute("href", "tel:+84964727949");
  await expect(
    page.locator(".mobile-cta").getByRole("link", { name: "Gọi 0968 844 385" }),
  ).toHaveAttribute("href", "tel:+84968844385");
  await expect(page.locator(".mobile-cta").getByRole("link")).toHaveCount(2);
  await expect(
    page.locator(".mobile-cta").getByRole("link", { name: /^Zalo/ }),
  ).toHaveCount(0);
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
