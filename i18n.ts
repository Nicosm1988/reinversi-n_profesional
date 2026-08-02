import { getRequestConfig } from 'next-intl/server';
import { routing, type AppLocale } from "@/routing";

function isLocale(value: string): value is AppLocale {
  return routing.locales.includes(value as AppLocale);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: AppLocale = requested && isLocale(requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
