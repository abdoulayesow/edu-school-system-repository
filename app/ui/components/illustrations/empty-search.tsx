export function EmptySearchIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Magnifying glass */}
      <circle cx="85" cy="70" r="35" stroke="currentColor" strokeWidth="3" className="text-muted-foreground/40" fill="none" />
      <line x1="110" y1="95" x2="145" y2="130" stroke="currentColor" strokeWidth="4" className="text-muted-foreground/40" strokeLinecap="round" />

      {/* Glass shine */}
      <path d="M65 55 Q70 50 80 52" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Empty result indicators inside glass */}
      <line x1="70" y1="65" x2="100" y2="65" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/20" strokeDasharray="3 3" />
      <line x1="70" y1="75" x2="95" y2="75" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/20" strokeDasharray="3 3" />
      <line x1="75" y1="85" x2="90" y2="85" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/15" strokeDasharray="3 3" />

      {/* X marks for no results */}
      <g className="text-muted-foreground/30">
        <line x1="155" y1="45" x2="165" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="165" y1="45" x2="155" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className="text-muted-foreground/20">
        <line x1="25" y1="90" x2="35" y2="100" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="35" y1="90" x2="25" y2="100" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Small dots scattered */}
      <circle cx="170" cy="80" r="2" className="fill-muted-foreground/20" />
      <circle cx="40" cy="45" r="2" className="fill-muted-foreground/15" />
      <circle cx="160" cy="120" r="1.5" className="fill-muted-foreground/15" />
    </svg>
  )
}
