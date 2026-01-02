export function EmptyEnrollmentsIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Clipboard */}
      <rect x="55" y="25" width="90" height="115" rx="4" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/40" />
      <rect x="75" y="20" width="50" height="10" rx="3" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/40" />
      <circle cx="100" cy="25" r="4" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/40" />

      {/* Form lines (empty) */}
      <line x1="70" y1="55" x2="130" y2="55" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/20" strokeDasharray="4 4" />
      <line x1="70" y1="75" x2="130" y2="75" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/20" strokeDasharray="4 4" />
      <line x1="70" y1="95" x2="130" y2="95" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/20" strokeDasharray="4 4" />
      <line x1="70" y1="115" x2="100" y2="115" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/20" strokeDasharray="4 4" />

      {/* Empty checkboxes */}
      <rect x="70" y="42" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/30" />
      <rect x="70" y="62" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/30" />
      <rect x="70" y="82" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/30" />

      {/* Pen nearby */}
      <path d="M150 100 L165 85" stroke="#800020" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M165 85 L168 82" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />

      {/* Plus sign indicating add new */}
      <circle cx="160" cy="130" r="14" stroke="#D4AF37" strokeWidth="2" />
      <line x1="160" y1="123" x2="160" y2="137" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
      <line x1="153" y1="130" x2="167" y2="130" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
