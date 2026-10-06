import { cn } from '@/utils/cn'

/**
 * The mustard double-rule label frame drawn inside a dark page header. Its top edge sits below the
 * fixed navigation so the bar reads as printed above the label, never struck through by the rule.
 */
export function LabelFrame({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'label-frame pointer-events-none absolute inset-x-2.5 bottom-2.5 top-[4.6rem] rounded-[1.25rem] [--frame:var(--color-mustard)] sm:inset-x-4 sm:bottom-4 lg:top-[5.35rem]',
        className,
      )}
    />
  )
}
