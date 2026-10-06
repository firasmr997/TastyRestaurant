import { useId, useState } from 'react'
import { cn } from '@/utils/cn'

export interface BarDatum {
  key: string
  label: string
  /** Longer label for tooltips and the table view. */
  fullLabel?: string
  value: number
}

function niceMax(value: number): number {
  if (value <= 4) return 4
  const step = Math.pow(10, Math.floor(Math.log10(value)))
  return Math.ceil(value / step) * step
}

/**
 * Single-series column chart (one hue, so no legend: the panel title names it). Columns are capped at
 * 24px with a 4px rounded data end on a single baseline, hairline gridlines, a hover tooltip per column
 * and a table view for screen readers.
 */
export function ColumnChart({ data, color = 'var(--color-tomato)', unit, height = 200 }: { data: BarDatum[]; color?: string; unit: string; height?: number }) {
  const id = useId()
  const [hover, setHover] = useState<number | null>(null)
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)))
  const ticks = [0, max / 2, max]
  const slot = 100 / Math.max(1, data.length)

  return (
    <figure aria-labelledby={`${id}-caption`}>
      <div className="relative flex gap-3" style={{ height }}>
        <div className="flex flex-col justify-between py-0 text-right text-xs text-ink-muted tnum" aria-hidden>
          {[...ticks].reverse().map((tick) => (
            <span key={tick} className="-translate-y-1/2 leading-none first:translate-y-0 last:translate-y-0">
              {Number.isInteger(tick) ? tick : tick.toFixed(1)}
            </span>
          ))}
        </div>
        <div className="relative flex-1" onMouseLeave={() => setHover(null)}>
          {ticks.map((tick) => (
            <span key={tick} aria-hidden className="absolute inset-x-0 h-px bg-line" style={{ bottom: `${(tick / max) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end" aria-hidden>
            {data.map((d, i) => (
              <div
                key={d.key}
                className="relative flex h-full items-end justify-center"
                style={{ width: `${slot}%` }}
                onMouseEnter={() => setHover(i)}
              >
                <span
                  className={cn('block w-full max-w-6 rounded-t-[4px] transition-opacity', hover !== null && hover !== i && 'opacity-45')}
                  style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 3 : 0, background: color, marginInline: 1 }}
                />
              </div>
            ))}
          </div>
          {hover !== null && data[hover] && (
            <div
              role="tooltip"
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-control bg-ink px-2.5 py-1.5 text-xs text-label shadow-overlay"
              style={{ left: `${slot * hover + slot / 2}%`, bottom: `calc(${(data[hover].value / max) * 100}% + 8px)` }}
            >
              <span className="font-semibold">{data[hover].fullLabel ?? data[hover].label}</span>
              <span className="tnum ml-2">
                {data[hover].value} {unit}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 flex pl-8 text-[0.7rem] text-ink-muted" aria-hidden>
        {data.map((d, i) => (
          <span key={d.key} className="text-center" style={{ width: `${slot}%` }}>
            {i % 2 === 0 || data.length <= 8 ? d.label : ''}
          </span>
        ))}
      </div>
      <figcaption id={`${id}-caption`} className="sr-only">
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>{unit}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.key}>
                <td>{d.fullLabel ?? d.label}</td>
                <td>{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  )
}

/** Single-series horizontal bars with the value at the tip. */
export function HorizontalBars({ data, color = 'var(--color-pickle)', unit }: { data: BarDatum[]; color?: string; unit: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <ul className="flex flex-col gap-3">
      {data.map((d) => (
        <li key={d.key} className="grid grid-cols-[8.5rem_1fr] items-center gap-3 text-sm">
          <span className="truncate font-medium" title={d.fullLabel ?? d.label}>
            {d.label}
          </span>
          <span className="flex items-center gap-2" title={`${d.value} ${unit}`}>
            <span className="block h-3.5 rounded-r-[4px]" style={{ width: `${(d.value / max) * 85}%`, minWidth: d.value ? 4 : 0, background: color }} />
            <span className="tnum text-xs font-semibold text-ink-muted">
              {d.value}
              <span className="sr-only"> {unit}</span>
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}
