/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_ADDRESS?: string;
  readonly PUBLIC_BASE_PATH?: string;
  readonly PUBLIC_BUSINESS_NAME?: string;
  readonly PUBLIC_LEGAL_NAME?: string;
  readonly PUBLIC_OPENING_HOURS?: string;
  readonly PUBLIC_PHONE_1_DISPLAY?: string;
  readonly PUBLIC_PHONE_1_HREF?: string;
  readonly PUBLIC_PHONE_2_DISPLAY?: string;
  readonly PUBLIC_PHONE_2_HREF?: string;
  readonly PUBLIC_SERVICE_AREA?: string;
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_SLOGAN?: string;
  readonly PUBLIC_ZALO_1_URL?: string;
  readonly PUBLIC_ZALO_2_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
