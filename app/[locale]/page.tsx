import type { Metadata } from "next";
import { SendaHome } from "@/components/sections/senda-home";

export async function generateMetadata(
  props: Readonly<{ params: Promise<{ locale: string }> }>,
): Promise<Metadata> {
  const { locale } = await props.params;
  const localizedPath = locale === "en" ? "/en" : "/";

  return {
    alternates: {
      canonical: localizedPath,
      languages: { es: "/", en: "/en", "x-default": "/" },
    },
  };
}

export default function Home() {
  return <SendaHome />;
}
