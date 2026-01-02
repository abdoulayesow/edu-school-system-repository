export function EmptyDataIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* File/document stack */}
      <rect x="50" y="40" width="80" height="100" rx="4" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30" strokeDasharray="6 4" />
      <rect x="55" y="35" width="80" height="100" rx="4" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/35" strokeDasharray="6 4" />
      <rect x="60" y="30" width="80" height="100" rx="4" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/40" fill="none" />

      {/* Document corner fold */}
      <path d="M120 30 L140 30 L140 50 L120 50 Z" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/40" fill="none" />
      <path d="M120 30 L120 50 L140 50" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/30" />

      {/* Empty content lines */}
      <line x1="75" y1="65" x2="125" y2="65" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/20" strokeDasharray="4 4" />
      <line x1="75" y1="80" x2="120" y2="80" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/20" strokeDasharray="4 4" />
      <line x1="75" y1="95" x2="110" y2="95" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/15" strokeDasharray="4 4" />
      <line x1="75" y1="110" x2="100" y2="110" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/10" strokeDasharray="4 4" />

      {/* Decorative elements */}
      <circle cx="160" cy="60" r="15" stroke="#D4AF37" strokeWidth="2" fill="none" />
      <line x1="160" y1="53" x2="160" y2="67" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
      <line x1="153" y1="60" x2="167" y2="60" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />

      {/* Info icon */}
      <circle cx="35" cy="100" r="12" stroke="#800020" strokeWidth="2" fill="none" />
      <line x1="35" y1="96" x2="35" y2="104" stroke="#800020" strokeWidth="2" strokeLinecap="round" />
      <circle cx="35" cy="91" r="1.5" fill="#800020" />
    </svg>
  )
}
