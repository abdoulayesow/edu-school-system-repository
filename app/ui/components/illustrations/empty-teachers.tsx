export function EmptyTeachersIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Blackboard */}
      <rect x="30" y="30" width="140" height="80" rx="4" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/40" />
      <rect x="35" y="35" width="130" height="70" rx="2" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/20" />

      {/* Chalk tray */}
      <rect x="30" y="110" width="140" height="8" rx="2" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/40" />

      {/* Chalk pieces */}
      <rect x="60" y="106" width="16" height="4" rx="1" fill="#D4AF37" />
      <rect x="85" y="106" width="12" height="4" rx="1" fill="white" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/30" />

      {/* Empty teaching area - dashed outline */}
      <circle cx="100" cy="140" r="16" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30" strokeDasharray="4 4" />

      {/* Math symbols on board (faded to show unused) */}
      <text x="55" y="60" fontSize="14" className="fill-muted-foreground/20" fontFamily="system-ui">2+2=</text>
      <text x="110" y="80" fontSize="14" className="fill-muted-foreground/20" fontFamily="system-ui">ABC</text>

      {/* Pointer/stick */}
      <path d="M170 70 L185 55" stroke="#800020" strokeWidth="2" strokeLinecap="round" />
      <circle cx="185" cy="55" r="3" fill="#D4AF37" />
    </svg>
  )
}
