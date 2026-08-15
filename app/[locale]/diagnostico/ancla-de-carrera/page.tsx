import { permanentRedirect } from "next/navigation";

export default async function LegacyCareerAnchorsPage(
  props: Readonly<{ params: Promise<{ locale: string }> }>,
) {
  const { locale } = await props.params;
  permanentRedirect(locale === "en" ? "/en/test-anclas-de-carrera" : "/test-anclas-de-carrera");
}
