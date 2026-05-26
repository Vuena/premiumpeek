import { redirect } from "@/i18n/navigation"

interface Props {
  params: Promise<{ locale: string }>
}

export default async function CreditsPage({ params }: Props) {
  const { locale } = await params
  redirect({ href: "/dashboard", locale })
}
