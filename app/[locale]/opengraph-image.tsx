import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const copy = {
  es: {
    tagline: "Acompañamos transiciones laborales",
    subtitle: "Orientación vocacional-ocupacional y acompañamiento profesional",
  },
  en: {
    tagline: "We support career transitions",
    subtitle: "Vocational-occupational guidance and professional support",
  },
} as const;

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const text = locale === "en" ? copy.en : copy.es;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#1d172c",
          backgroundImage:
            "radial-gradient(circle at 15% 15%, rgba(184,160,232,0.3), transparent 42%), radial-gradient(circle at 88% 8%, rgba(204,20,140,0.26), transparent 38%)",
          padding: "88px",
          color: "#f5f2f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              border: "3px solid #f5f2f7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 15, height: 15, borderRadius: "50%", backgroundColor: "#cc148c", display: "flex" }} />
          </div>
          <div style={{ display: "flex", fontSize: 58, fontWeight: 700, letterSpacing: -1 }}>Senda</div>
        </div>
        <div style={{ display: "flex", marginTop: 52, fontSize: 44, fontWeight: 500, maxWidth: 940, lineHeight: 1.25 }}>
          {text.tagline}
        </div>
        <div style={{ display: "flex", marginTop: 22, fontSize: 28, color: "#c9a6f0", maxWidth: 860, lineHeight: 1.4 }}>
          {text.subtitle}
        </div>
      </div>
    ),
    { ...size },
  );
}
