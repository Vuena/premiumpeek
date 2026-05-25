const ipMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = ipMap.get(ip)
  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= maxRequests) return false
  entry.count++
  return true
}

let cleanupInterval: ReturnType<typeof setInterval> | null = null

export function initRateLimitCleanup() {
  if (cleanupInterval) return
  cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, val] of ipMap) {
      if (now > val.resetAt) ipMap.delete(key)
    }
  }, 5 * 60 * 1000)
}

if (typeof setInterval !== "undefined") {
  initRateLimitCleanup()
}
