import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PremiumPeek - Google Play Testing Community",
    short_name: "PremiumPeek",
    description: "Testing community to help developers meet Google Play publishing requirements",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#18181b",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  }
}
