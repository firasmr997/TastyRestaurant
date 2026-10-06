import { LogoMark } from '@/components/brand/Logo'
import { useI18n } from '@/i18n/useI18n'
import { cn } from '@/utils/cn'

/**
 * Illustrated neighbourhood map in the brand inks. A stand-in until a real map provider (Google Maps,
 * Mapbox, OpenStreetMap) is connected; the address and directions link carry the real information.
 */
export function MapPlaceholder({ className }: { className?: string }) {
  const { t } = useI18n()
  return (
    <figure className={cn('relative overflow-hidden rounded-panel bg-surface-2', className)}>
      <svg viewBox="0 0 600 420" className="h-full w-full" role="img" aria-label={t.contact.mapLabel} preserveAspectRatio="xMidYMid slice">
        <rect width="600" height="420" fill="#e6ece4" />
        {/* water */}
        <path d="M0 330 C120 300 210 360 330 340 C450 320 520 350 600 335 L600 420 L0 420 Z" fill="#bcd3cf" />
        {/* blocks */}
        <g fill="#f6f8f4">
          <rect x="30" y="30" width="120" height="90" rx="6" />
          <rect x="170" y="30" width="150" height="90" rx="6" />
          <rect x="340" y="30" width="110" height="140" rx="6" />
          <rect x="470" y="30" width="100" height="90" rx="6" />
          <rect x="30" y="140" width="120" height="110" rx="6" />
          <rect x="170" y="140" width="150" height="110" rx="6" />
          <rect x="470" y="140" width="100" height="120" rx="6" />
          <rect x="340" y="190" width="110" height="70" rx="6" />
        </g>
        {/* park */}
        <rect x="170" y="140" width="150" height="110" rx="6" fill="#cfe0c4" />
        {/* streets */}
        <g stroke="#1f4d3a" strokeOpacity="0.18" strokeWidth="14" fill="none" strokeLinecap="round">
          <path d="M0 130 H600" />
          <path d="M160 0 V300" />
          <path d="M460 0 V300" />
          <path d="M330 0 V300" />
          <path d="M0 270 C200 262 400 280 600 268" />
        </g>
        <g fill="#1f4d3a" fillOpacity="0.55" fontFamily="Barlow, sans-serif" fontSize="13" fontWeight="600" letterSpacing="1.5">
          <text x="462" y="125">FOUNDRY LANE</text>
          <text x="40" y="292">HARBOUR QUAY</text>
        </g>
      </svg>
      <div className="absolute left-[60%] top-[38%] -translate-x-1/2 -translate-y-full">
        <div className="flex flex-col items-center">
          <LogoMark className="size-16 drop-shadow-[0_8px_14px_rgb(12_20_16/0.35)]" ring="#fffdf8" />
          <span className="-mt-1 h-4 w-[3px] rounded-full bg-tomato" />
        </div>
      </div>
      <figcaption className="absolute bottom-3 left-3 rounded-control bg-label/95 px-3 py-1.5 text-xs font-medium text-ink-muted">
        {t.contact.mapNote}
      </figcaption>
    </figure>
  )
}
