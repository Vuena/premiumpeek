import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json({ error: "Ödeme sistemi şu an aktif değil. Tüm hizmetler ücretsizdir." }, { status: 503 })
}
