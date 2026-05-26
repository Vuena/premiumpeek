import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import ContactClient from "./client"

interface Props {
  params: Promise<{ locale: string }>
}

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.premiumpeek.com"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations("ContactPage")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `${siteUrl}/${locale}/contact` },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `${siteUrl}/${locale}/contact`,
    },
  }
}

export default function ContactPage() {
  return <ContactClient />
}
