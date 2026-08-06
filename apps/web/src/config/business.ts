import { containsPlaceholder } from "../utils/config";

function publicValue(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

export const business = {
  name: publicValue(import.meta.env.PUBLIC_BUSINESS_NAME, "KHO SỈ HUY THẢO"),
  legalName: publicValue(
    import.meta.env.PUBLIC_LEGAL_NAME,
    "HỘ KINH DOANH NGUYỄN THANH HUY 1",
  ),
  slogan: publicValue(import.meta.env.PUBLIC_SLOGAN, "NHANH GỌN"),
  contacts: [
    {
      phoneDisplay: publicValue(
        import.meta.env.PUBLIC_PHONE_1_DISPLAY,
        "0964 727 949",
      ),
      phoneHref: publicValue(
        import.meta.env.PUBLIC_PHONE_1_HREF,
        "tel:+84964727949",
      ),
      zaloUrl: publicValue(
        import.meta.env.PUBLIC_ZALO_1_URL,
        "https://zalo.me/84964727949",
      ),
    },
    {
      phoneDisplay: publicValue(
        import.meta.env.PUBLIC_PHONE_2_DISPLAY,
        "0968 844 385",
      ),
      phoneHref: publicValue(
        import.meta.env.PUBLIC_PHONE_2_HREF,
        "tel:+84968844385",
      ),
      zaloUrl: publicValue(
        import.meta.env.PUBLIC_ZALO_2_URL,
        "https://zalo.me/84968844385",
      ),
    },
  ],
  address: publicValue(
    import.meta.env.PUBLIC_ADDRESS,
    "119/16A Mễ Cốc, Phú Định, TP. Hồ Chí Minh",
  ),
  openingHours: publicValue(
    import.meta.env.PUBLIC_OPENING_HOURS,
    "Thứ Hai–Thứ Bảy mở cửa từ 08:30, có nghỉ trưa; nghỉ Chủ Nhật",
  ),
  serviceArea: publicValue(
    import.meta.env.PUBLIC_SERVICE_AREA,
    "Giao chành xe toàn quốc; miễn phí giao ra chành xe; có nhận hàng tại kho",
  ),
  siteUrl: publicValue(
    import.meta.env.PUBLIC_SITE_URL,
    "https://khosihuythao.com",
  ),
  apiUrl: publicValue(import.meta.env.PUBLIC_API_URL, "http://localhost:8787"),
  turnstileSiteKey: publicValue(
    import.meta.env.PUBLIC_TURNSTILE_SITE_KEY,
    "TODO_TURNSTILE_SITE_KEY",
  ),
} as const;

export const hasBusinessPlaceholders = [
  business.name,
  business.legalName,
  business.slogan,
  business.address,
  business.openingHours,
  business.serviceArea,
  business.siteUrl,
  business.apiUrl,
  business.turnstileSiteKey,
  ...business.contacts.flatMap((contact) => [
    contact.phoneDisplay,
    contact.phoneHref,
    contact.zaloUrl,
  ]),
].some(containsPlaceholder);
