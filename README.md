# KHO SỈ HUY THẢO — landing page nhận yêu cầu

Trang Astro tĩnh tại `https://khosihuythao.com` dành cho một mục tiêu: nhận yêu cầu khách hàng qua form hoặc hai kênh Zalo. Cloudflare Worker xác thực Turnstile và chuyển lead tới Telegram. Dự án không có giỏ hàng, đăng nhập, thanh toán hoặc dữ liệu tồn kho thời gian thực.

## Kiến trúc

```text
apps/web          Astro static site, UI, SEO và form client
apps/worker       Cloudflare Worker /api/health và /api/lead
packages/shared   schema/normalization dùng chung
assets-source     6 ảnh JPEG gốc, không chỉnh sửa
tests/e2e         Playwright desktop/mobile smoke tests
```

Ảnh tối ưu AVIF/WebP ở `apps/web/public/images`. Product card dùng `object-fit: contain`; hero/gallery dùng `cover`. Thông tin vận hành tập trung tại `apps/web/src/config/business.ts` và lấy từ biến môi trường build.

## Chạy local

Yêu cầu Node.js 22.12+ và pnpm 10.

```cmd
cd /d C:\Users\Administrator\Documents\CODEX-GAUNTLET\projects\landingpage
pnpm install --frozen-lockfile
copy .env.example .env
copy apps\worker\.dev.vars.example apps\worker\.dev.vars
pnpm dev
```

Mở cửa sổ Command Prompt thứ hai để chạy API local:

```cmd
cd /d C:\Users\Administrator\Documents\CODEX-GAUNTLET\projects\landingpage
pnpm dev:worker
```

Thông tin công khai của KHO SỈ HUY THẢO đã được cấu hình trong `.env.example`; API local và Turnstile vẫn dùng giá trị phát triển. Trang tự thêm `noindex,nofollow` và hiển thị cảnh báo khi thiếu API/Turnstile production. Worker local tắt Turnstile và dùng notification `noop`; production không cho phép hai chế độ này.

## Kiểm chứng

```cmd
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
- Turnstile site key/secret cho `khosihuythao.com`.
- Telegram bot token mới sau khi thu hồi token đã lộ; Telegram chat ID được đặt bằng Worker Secret.
- URL Worker sau lần deploy đầu tiên.

Không commit `.env`, `.dev.vars` hoặc secret. Không dùng lại token từng được gửi qua chat/log.

## Cloudflare Worker

Các binding và biến không nhạy cảm nằm trong `apps/worker/wrangler.jsonc`. Rate limit mặc định là 5 lần gọi mỗi 60 giây trên khóa IP đã băm. Trước khi deploy:

1. Xác nhận `ALLOWED_ORIGINS` vẫn là origin frontend chính xác `https://khosihuythao.com`.
2. Từ `apps/worker`, đặt secret bằng prompt tương tác:

```cmd
pnpm exec wrangler secret put TURNSTILE_SECRET --env production
pnpm exec wrangler secret put TELEGRAM_BOT_TOKEN --env production
pnpm exec wrangler secret put TELEGRAM_CHAT_ID --env production
```

3. Kiểm tra và deploy:

```cmd
set WORKER_SECRETS_CONFIGURED=true
pnpm deploy:production
```

Không truyền secret trên command line. Kiểm tra `/api/health`, gửi một lead thử, rồi xác nhận Telegram trước khi nối frontend production.

## GitHub Pages

Trong repository độc lập, workflow `.github/workflows/pages.yml` chạy thủ công. Thông tin cửa hàng công khai được cố định trong workflow; hai GitHub Actions Variables còn cần là `LANDINGPAGE_API_URL` và `LANDINGPAGE_TURNSTILE_SITE_KEY`. Workflow đặt `DEPLOY_ENV=production`, vì vậy sẽ dừng trước deploy nếu thiếu một trong hai giá trị.

Worker có workflow thủ công riêng. Đặt `CLOUDFLARE_API_TOKEN` và `CLOUDFLARE_ACCOUNT_ID` trong GitHub Actions Secrets. Các Worker secret nghiệp vụ phải được cấu hình trước bằng Wrangler.

## Rollback

- GitHub Pages: redeploy commit ổn định trước từ GitHub Environments/Deployments.
- Worker: chạy `pnpm exec wrangler versions list --env production`, rồi `pnpm exec wrangler rollback <VERSION_ID> --env production` sau khi xác nhận đúng version.
- Không xóa Worker, Pages project hoặc secret khi rollback; thao tác đó không cần thiết và khó phục hồi hơn.

## Điều kiện để chứng minh production

Chỉ coi production hoàn thành sau khi: Worker health pass; một lead thử đến đúng Telegram; Turnstile chặn token sai; GitHub Pages phục vụ đúng canonical domain; DNS/HTTPS ổn định; và smoke test desktop/mobile không có lỗi nghiêm trọng. Production build cố ý dừng nếu API URL hoặc Turnstile site key vẫn là placeholder.
