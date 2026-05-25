"use client"

import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

export function CtaButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const { user } = useAuth()
  return <Link href={user ? "/dashboard" : "/signup"} className={className}>{children}</Link>
}
