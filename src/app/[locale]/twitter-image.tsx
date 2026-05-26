import { ImageResponse } from "next/og"

export const alt = "PremiumPeek - Google Play Testing Community"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

interface Props {
  params: { locale: string }
}

export default function TwitterImage({ params }: Props) {
  const isEn = params.locale === "en"
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
        padding: "0 60px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 16 }}>
        <div style={{
          width: 80, height: 130, borderRadius: 20, background: "#2563eb",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </div>
        <span style={{ fontSize: 56, fontWeight: 700, color: "white" }}>PremiumPeek</span>
      </div>
      <span style={{ fontSize: 24, color: "#94a3b8", marginBottom: 12 }}>
        {isEn ? "Google Play Testing Community" : "Google Play Test Topluluğu"}
      </span>
      <span style={{ fontSize: 20, color: "#64748b", textAlign: "center", maxWidth: 700 }}>
        {isEn
          ? "Test your app with 18 developers and publish on Google Play."
          : "18 geliştiriciyle uygulamanızı test edin, Google Play'de yayınlayın."}
      </span>
    </div>,
    { ...size },
  )
}
