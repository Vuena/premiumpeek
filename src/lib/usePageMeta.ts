"use client"
import { useEffect } from "react"

interface PageMeta {
  title: string
  description?: string
  canonical?: string
  ogImage?: string
}

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    document.title = meta.title

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name"
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement("meta")
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute("content", content)
    }

    const removeMeta = (name: string, property = false) => {
      const attr = property ? "property" : "name"
      const el = document.querySelector(`meta[${attr}="${name}"]`)
      if (el) el.remove()
    }

    if (meta.description) {
      setMeta("description", meta.description)
      setMeta("og:description", meta.description, true)
      setMeta("twitter:description", meta.description)
    }

    if (meta.canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
      if (!link) {
        link = document.createElement("link")
        link.setAttribute("rel", "canonical")
        document.head.appendChild(link)
      }
      link.setAttribute("href", meta.canonical)
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"
    setMeta("og:title", meta.title, true)
    setMeta("og:url", meta.canonical || baseUrl, true)
    setMeta("og:type", "website", true)
    setMeta("og:site_name", "PremiumPeek", true)
    setMeta("twitter:title", meta.title)
    setMeta("twitter:card", "summary_large_image")
    if (meta.ogImage) {
      setMeta("og:image", meta.ogImage, true)
      setMeta("twitter:image", meta.ogImage)
    }

    return () => {
      removeMeta("og:title", true)
      removeMeta("og:description", true)
      removeMeta("og:url", true)
      removeMeta("og:type", true)
      removeMeta("og:site_name", true)
      removeMeta("og:image", true)
      removeMeta("twitter:title")
      removeMeta("twitter:description")
      removeMeta("twitter:card")
      removeMeta("twitter:image")
    }
  }, [meta.title, meta.description, meta.canonical, meta.ogImage])
}
