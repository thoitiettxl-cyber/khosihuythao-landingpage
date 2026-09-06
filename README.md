# KHO SỈ HUY THẢO — landing page tìm kho và gọi điện

Trang Astro tĩnh tại `https://khosihuythao.com` dành cho một mục tiêu: khách tìm thấy kho trên internet rồi gọi điện hoặc nhắn Zalo theo hai số trên trang. Không form báo giá, không giá bán, không tồn kho realtime. Cloudflare Worker `/api/lead` (Turnstile → Telegram) vẫn nằm trong repo nhưng không còn là việc của landing; không decommission trừ khi được phép riêng.

## Kiến trúc

```text
apps/web          Astro static site, UI, SEO và số liên hệ
apps/worker       Cloudflare Worker /api/health và /api/lead
packages/shared   schema/normalization dùng chung
assets-source     6 ảnh JPEG gốc, không chỉnh sửa
tests/e2e         Playwright desktop/mobile smoke tests
```

Ảnh tối ưu AVIF/WebP ở `apps/web/public/images`. Product card dùng `object-fit: contain`; hero/gallery dùng `cover`. Thông tin vận hành tập trung tại `apps/web/src/config/business.ts` và lấy từ biến môi trường build.

## Chạy local

Yêu cầu Node.js 22.12+ và pnpm 10. Môi trường vận hành chính là Linux Alpine.

Từ thư mục gốc repository:

```sh
pnpm install --frozen-lockfile
cp .env.example .env
cp apps/worker/.dev.vars.example apps/worker/.dev.vars
pnpm dev
```

Landing không cần Worker khi xem trang. Chạy API lead cũ (tùy chọn):

```sh
pnpm dev:worker
```

Thông tin công khai của KHO SỈ HUY THẢO đã được cấu hình trong `.env.example`. `apps/web` không có `.env.example`. Giá trị công khai trùng fallback trong `apps/web/src/config/business.ts`. `apps/web/scripts/check-business-config.mjs` chỉ đọc `process.env` và chỉ khi `DEPLOY_ENV=production`. Banner/`noindex` bật khi field liên hệ khớp `TODO|example.invalid|09xx|+84...`. Worker local (nếu chạy) tắt Turnstile và dùng notification `noop`.

## Kiểm chứng

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
```

`pnpm verify` chạy toàn bộ chuỗi trên. `pnpm build` bao gồm Wrangler dry-run. Production web build bị chặn khi `DEPLOY_ENV=production` và bất kỳ biến bắt buộc nào còn thiếu/TODO.

## Dữ liệu production còn cần

- File logo gốc được upload trực tiếp; URL Postimg đã cung cấp không truy cập được từ môi trường build.
- Giờ đóng cửa và khoảng nghỉ trưa nếu muốn hiển thị chính xác.
- Turnstile/Telegram/URL Worker chỉ cần nếu vận hành lại `/api/lead`; landing hiện tại không đọc các giá trị đó.

Không commit `.env`, `.dev.vars` hoặc secret. Không dùng lại token từng được gửi qua chat/log.

## Cloudflare Worker

Worker lead không còn gắn với landing. Các binding và biến không nhạy cảm nằm trong `apps/worker/wrangler.jsonc`. Rate limit mặc định là 5 lần gọi mỗi 60 giây trên khóa IP đã băm. Trước khi deploy Worker (chỉ khi được phép riêng):

1. Xác nhận `ALLOWED_ORIGINS` vẫn là origin frontend chính xác `https://khosihuythao.com`.
2. Từ `apps/worker`, đặt secret bằng prompt tương tác:

```sh
pnpm exec wrangler secret put TURNSTILE_SECRET --env production
pnpm exec wrangler secret put TELEGRAM_BOT_TOKEN --env production
pnpm exec wrangler secret put TELEGRAM_CHAT_ID --env production
```

3. Kiểm tra và deploy từ thư mục gốc repository (cùng lệnh với `.github/workflows/worker.yml`):

```sh
WORKER_SECRETS_CONFIGURED=true pnpm --filter @landingpage/worker deploy:production
```

Không truyền secret trên command line.

## GitHub Pages

Trong repository độc lập, workflow `.github/workflows/pages.yml` chạy thủ công. Thông tin cửa hàng công khai được cố định trong workflow. Web production không yêu cầu `LANDINGPAGE_API_URL` hay `LANDINGPAGE_TURNSTILE_SITE_KEY`.

Worker có workflow thủ công riêng. Đặt `CLOUDFLARE_API_TOKEN` và `CLOUDFLARE_ACCOUNT_ID` trong GitHub Actions Secrets. Các Worker secret nghiệp vụ phải được cấu hình trước bằng Wrangler.

## Rollback

- GitHub Pages: redeploy commit ổn định trước từ GitHub Environments/Deployments.
- Worker: chạy `pnpm exec wrangler versions list --env production`, rồi `pnpm exec wrangler rollback <VERSION_ID> --env production` sau khi xác nhận đúng version.
- Không xóa Worker, Pages project hoặc secret khi rollback; thao tác đó không cần thiết và khó phục hồi hơn.

## Điều kiện để chứng minh production

Chỉ coi production landing hoàn thành sau khi: GitHub Pages phục vụ đúng canonical domain; DNS/HTTPS ổn định; hai số điện thoại/`tel:` và Zalo đúng; smoke test desktop/mobile không có lỗi nghiêm trọng. Worker lead/Telegram không còn là điều kiện của landing.
