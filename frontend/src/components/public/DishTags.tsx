import { Flame, Leaf } from 'lucide-react'
import { useI18n } from '@/i18n/useI18n'
import type { MenuItemSummary } from '@/types/models'
import { cn } from '@/utils/cn'

/** Veggie / spicy markers, readable as text and as icons. */
export function DishTags({ item, className }: { item: Pick<MenuItemSummary, 'vegetarian' | 'spicy'>; className?: string }) {
  const { t } = useI18n()
  if (!item.vegetarian && !item.spicy) return null
  return (
    <span className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {item.vegetarian && (
        <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-xs font-semibold text-success-strong">
          <Leaf className="size-3.5" aria-hidden />
          {t.common.vegetarian}
        </span>
      )}
      {item.spicy && (
        <span className="inline-flex items-center gap-1 rounded-full bg-tomato/12 px-2 py-0.5 text-xs font-semibold text-tomato-deep">
          <Flame className="size-3.5" aria-hidden />
          {t.common.spicy}
        </span>
      )}
    </span>
  )
}
