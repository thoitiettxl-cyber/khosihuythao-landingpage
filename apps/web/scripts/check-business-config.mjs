const required = [
  "PUBLIC_BUSINESS_NAME",
  "PUBLIC_LEGAL_NAME",
  "PUBLIC_SLOGAN",
  "PUBLIC_PHONE_1_DISPLAY",
  "PUBLIC_PHONE_1_HREF",
  "PUBLIC_ZALO_1_URL",
  "PUBLIC_PHONE_2_DISPLAY",
  "PUBLIC_PHONE_2_HREF",
  "PUBLIC_ZALO_2_URL",
  "PUBLIC_ADDRESS",
  "PUBLIC_OPENING_HOURS",
  "PUBLIC_SERVICE_AREA",
  "PUBLIC_SITE_URL",
];

if (process.env.DEPLOY_ENV === "production") {
  const invalid = required.filter((name) => {
    const value = process.env[name]?.trim();
    return !value || /TODO|example\.invalid|09xx|\+84\.\.\./i.test(value);
  });
  if (invalid.length > 0) {
    console.error(
      `Production build blocked. Configure real values for: ${invalid.join(", ")}`,
    );
    process.exitCode = 1;
  }
}
