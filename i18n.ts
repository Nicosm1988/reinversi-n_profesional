import { getRequestConfig } from 'next-intl/server';

type Messages = Record<string, unknown>;

const locales = ['es', 'en'] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = 'es';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge(base: Messages, override: Messages): Messages {
  const output: Messages = { ...base };

  for (const key of Object.keys(override)) {
    const baseValue = output[key];
    const overrideValue = override[key];

    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      output[key] = deepMerge(baseValue, overrideValue);
    } else {
      output[key] = overrideValue;
    }
  }

  return output;
}

function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = requested && isLocale(requested) ? requested : defaultLocale;

  const baseMessages = (await import('./messages/es.json')).default as Messages;
  const localeMessages = locale === defaultLocale
    ? baseMessages
    : ((await import(`./messages/${locale}.json`)).default as Messages);

  return {
    locale,
    messages: deepMerge(baseMessages, localeMessages),
  };
});