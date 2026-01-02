export function EmptyExpensesIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Receipt/bill */}
      <path d="M60 25 L140 25 L140 125 L135 120 L130 125 L125 120 L120 125 L115 120 L110 125 L105 120 L100 125 L95 120 L90 125 L85 120 L80 125 L75 120 L70 125 L65 120 L60 125 Z" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/40" fill="none" />

      {/* Receipt lines (empty) */}
      <line x1="75" y1="45" x2="125" y2="45" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/20" strokeDasharray="4 4" />
      <line x1="75" y1="60" x2="125" y2="60" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/20" strokeDasharray="4 4" />
      <line x1="75" y1="75" x2="110" y2="75" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/20" strokeDasharray="4 4" />

      {/* Total line area */}
      <line x1="75" y1="95" x2="125" y2="95" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/30" />
      <text x="78" y="108" fontSize="10" className="fill-muted-foreground/30" fontFamily="system-ui">0 GNF</text>

      {/* Coins stack */}
      <ellipse cx="160" cy="110" rx="20" ry="8" stroke="#D4AF37" strokeWidth="2" fill="none" />
      <ellipse cx="160" cy="100" rx="20" ry="8" stroke="#D4AF37" strokeWidth="2" fill="none" />
      <ellipse cx="160" cy="90" rx="20" ry="8" stroke="#D4AF37" strokeWidth="2" fill="none" />
      <line x1="140" y1="90" x2="140" y2="110" stroke="#D4AF37" strokeWidth="2" />
      <line x1="180" y1="90" x2="180" y2="110" stroke="#D4AF37" strokeWidth="2" />

      {/* Empty wallet */}
      <rect x="25" y="80" width="30" height="24" rx="3" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30" strokeDasharray="4 4" />
      <path d="M25 90 L55 90" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/20" />
    </svg>
  )
}
