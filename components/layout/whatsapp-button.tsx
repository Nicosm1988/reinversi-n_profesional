import { getTranslations } from "next-intl/server";
import { getWhatsAppHref } from "@/lib/contact-config";

export async function WhatsappButton({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "WhatsApp" });
  const href = getWhatsAppHref();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("ariaLabel")}
      className="fixed z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--senda-ink)] text-[var(--senda-bg)] shadow-[0_18px_40px_-16px_rgba(0,0,0,.55)] motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--senda-olive)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--senda-bg)] sm:h-14 sm:w-14"
      style={{
        right: "max(env(safe-area-inset-right, 0px), 1rem)",
        bottom: "max(env(safe-area-inset-bottom, 0px), 5rem)",
      }}
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-6 w-6 sm:h-7 sm:w-7" fill="currentColor">
        <path d="M16.02 3C9.4 3 4.02 8.38 4.02 15c0 2.22.6 4.3 1.65 6.09L3 29l8.1-2.6a12 12 0 0 0 4.92 1.05h.01c6.62 0 12-5.38 12-12s-5.38-12.01-12.01-12.01Zm0 21.8h-.01a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-4.81 1.54 1.57-4.69-.24-.38A9.8 9.8 0 1 1 25.82 15c0 5.4-4.4 9.8-9.8 9.8Zm5.37-7.34c-.29-.15-1.73-.86-2-.95-.27-.1-.46-.15-.66.14-.2.29-.76.95-.93 1.14-.17.2-.34.22-.63.07-.29-.14-1.23-.45-2.34-1.44-.86-.77-1.45-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.14-.17.19-.29.29-.48.1-.2.05-.36-.02-.51-.07-.14-.66-1.59-.9-2.18-.24-.57-.48-.5-.66-.5-.17-.01-.36-.01-.56-.01-.2 0-.51.07-.78.36-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.19 3.03c.14.2 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.62.7.22 1.34.19 1.85.12.56-.08 1.73-.71 1.98-1.39.24-.68.24-1.27.17-1.39-.07-.12-.26-.2-.55-.34Z" />
      </svg>
    </a>
  );
}
