"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

type CookieCategories = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

const STORAGE_KEY = "cookie-consent"

function getStoredConsent(): CookieCategories | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    return null
  }
  return null
}

function setStoredConsent(categories: CookieCategories) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
}

export function CookieConsent() {
  const t = useTranslations("CookieConsent")
  const [show, setShow] = useState(false)
  const [customizing, setCustomizing] = useState(false)
  const [categories, setCategories] = useState<CookieCategories>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const existing = getStoredConsent()
    if (!existing) setShow(true)
  }, [])

  function handleAcceptAll() {
    const all: CookieCategories = { necessary: true, analytics: true, marketing: true }
    setStoredConsent(all)
    setShow(false)
  }

  function handleRejectAll() {
    const reject: CookieCategories = { necessary: true, analytics: false, marketing: false }
    setStoredConsent(reject)
    setShow(false)
  }

  function handleSave() {
    setStoredConsent(categories)
    setShow(false)
    setCustomizing(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200/50 bg-white/95 shadow-2xl backdrop-blur-md dark:border-zinc-700/50 dark:bg-zinc-900/95">
        {!customizing ? (
          <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {t("title")}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {t("description")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleAcceptAll}
                className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {t("acceptAll")}
              </button>
              <button
                onClick={handleRejectAll}
                className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {t("rejectAll")}
              </button>
              <button
                onClick={() => setCustomizing(true)}
                className="inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                {t("customize")}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {t("title")}
            </h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {t("necessary")}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t("necessaryDesc")}
                  </span>
                </div>
                <div className="relative h-6 w-11 rounded-full bg-zinc-300 dark:bg-zinc-600 opacity-50">
                  <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
                </div>
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {t("analytics")}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t("analyticsDesc")}
                  </span>
                </div>
                <button
                  role="switch"
                  aria-checked={categories.analytics}
                  onClick={() => setCategories((prev) => ({ ...prev, analytics: !prev.analytics }))}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    categories.analytics
                      ? "bg-zinc-900 dark:bg-white"
                      : "bg-zinc-300 dark:bg-zinc-600"
                  )}
                >
                  <div
                    className={cn(
                      "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform dark:bg-zinc-900",
                      categories.analytics && "translate-x-5"
                    )}
                  />
                </button>
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {t("marketing")}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t("marketingDesc")}
                  </span>
                </div>
                <button
                  role="switch"
                  aria-checked={categories.marketing}
                  onClick={() => setCategories((prev) => ({ ...prev, marketing: !prev.marketing }))}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    categories.marketing
                      ? "bg-zinc-900 dark:bg-white"
                      : "bg-zinc-300 dark:bg-zinc-600"
                  )}
                >
                  <div
                    className={cn(
                      "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform dark:bg-zinc-900",
                      categories.marketing && "translate-x-5"
                    )}
                  />
                </button>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {t("save")}
              </button>
              <button
                onClick={() => setCustomizing(false)}
                className="inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
