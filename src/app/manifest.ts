import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PremiumPeek - Google Play Test Topluluğu",
    short_name: "PremiumPeek",
    description: "Google Play yayın şartlarını karşılamak için test topluluğu",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#18181b",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  }
}
