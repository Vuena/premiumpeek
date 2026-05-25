export function CreditIcon({ className = "inline-block align-middle" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      width="1em" height="1em" style={{ marginTop: "-0.15em" }}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" fill="none" />
      <text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="bold" stroke="none">$</text>
    </svg>
  )
}
