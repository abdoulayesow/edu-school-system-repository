export function EmptyStudentsIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Desk */}
      <rect x="40" y="100" width="120" height="8" rx="2" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/40" />
      <rect x="50" y="108" width="8" height="20" rx="1" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/40" />
      <rect x="142" y="108" width="8" height="20" rx="1" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/40" />

      {/* Empty chair */}
      <rect x="80" y="85" width="40" height="6" rx="2" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30" strokeDasharray="4 4" />
      <rect x="85" y="91" width="6" height="16" rx="1" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30" strokeDasharray="4 4" />
      <rect x="109" y="91" width="6" height="16" rx="1" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30" strokeDasharray="4 4" />

      {/* Book on desk */}
      <rect x="55" y="92" width="24" height="6" rx="1" fill="none" stroke="#D4AF37" strokeWidth="2" />
      <path d="M67 92 L67 98" stroke="#D4AF37" strokeWidth="1" />

      {/* Pencil */}
      <path d="M125 94 L138 88" stroke="#800020" strokeWidth="2" strokeLinecap="round" />
      <path d="M125 94 L123 96" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />

      {/* Question mark indicating missing student */}
      <circle cx="100" cy="50" r="24" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30" strokeDasharray="6 4" />
      <text x="100" y="58" textAnchor="middle" fontSize="24" className="fill-muted-foreground/50" fontFamily="system-ui">?</text>
    </svg>
  )
}
