export function EmptyPaymentsIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Credit card outline */}
      <rect x="45" y="45" width="110" height="70" rx="8" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/40" />

      {/* Card chip */}
      <rect x="60" y="65" width="20" height="16" rx="2" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
      <line x1="60" y1="71" x2="80" y2="71" stroke="#D4AF37" strokeWidth="1" />
      <line x1="60" y1="77" x2="80" y2="77" stroke="#D4AF37" strokeWidth="1" />
      <line x1="70" y1="65" x2="70" y2="81" stroke="#D4AF37" strokeWidth="1" />

      {/* Card stripe area */}
      <rect x="45" y="90" width="110" height="12" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/20" />

      {/* Card number placeholder */}
      <text x="60" y="107" fontSize="8" className="fill-muted-foreground/30" fontFamily="monospace" letterSpacing="2">**** **** ****</text>

      {/* Floating money symbols (faded) */}
      <text x="170" y="40" fontSize="18" className="fill-muted-foreground/20" fontFamily="system-ui">$</text>
      <text x="25" y="60" fontSize="14" className="fill-muted-foreground/15" fontFamily="system-ui">$</text>
      <text x="175" y="90" fontSize="12" className="fill-muted-foreground/15" fontFamily="system-ui">$</text>

      {/* Transfer arrows (inactive) */}
      <path d="M100 125 L100 145" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30" strokeDasharray="4 4" />
      <path d="M95 140 L100 145 L105 140" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30" strokeLinecap="round" strokeLinejoin="round" />

      {/* Zero amount indicator */}
      <circle cx="100" cy="30" r="12" stroke="#800020" strokeWidth="2" fill="none" />
      <text x="100" y="34" textAnchor="middle" fontSize="12" fill="#800020" fontFamily="system-ui" fontWeight="bold">0</text>
    </svg>
  )
}
