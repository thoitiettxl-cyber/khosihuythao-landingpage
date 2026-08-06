import type { LeadData } from "@landingpage/shared";

export interface NotificationProvider {
  send(lead: LeadData, requestId: string): Promise<void>;
}

function formatTelegramMessage(lead: LeadData, requestId: string): string {
  return [
    "Yêu cầu báo giá mới",
    `Mã: ${requestId}`,
    `Họ tên: ${lead.name}`,
    `Điện thoại: ${lead.phone}`,
    `Nhu cầu: ${lead.message}`,
    ...(lead.quantity ? [`Số lượng: ${lead.quantity}`] : []),
    ...(lead.area ? [`Khu vực: ${lead.area}`] : []),
  ].join("\n");
}

export function createNotificationProvider(
  env: Env,
  fetchFn: typeof fetch,
): NotificationProvider {
  if (
    env.NOTIFICATION_PROVIDER === "noop" &&
    env.ENVIRONMENT !== "production"
  ) {
    return { send: () => Promise.resolve() };
  }
  if (
    env.NOTIFICATION_PROVIDER !== "telegram" ||
    !env.TELEGRAM_BOT_TOKEN ||
    !env.TELEGRAM_CHAT_ID
  ) {
    throw new Error("Notification provider is not configured.");
  }

  return {
    async send(lead, requestId) {
      const response = await fetchFn(
        `https://api.telegram.org/bot${encodeURIComponent(env.TELEGRAM_BOT_TOKEN)}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: formatTelegramMessage(lead, requestId),
          }),
        },
      );
      if (!response.ok)
        throw new Error(
          `Telegram notification failed with status ${String(response.status)}.`,
        );
    },
  };
}
