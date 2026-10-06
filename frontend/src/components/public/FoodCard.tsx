import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { SmartImage } from '@/components/ui/SmartImage'
import { useI18n } from '@/i18n/useI18n'
import type { MenuItemSummary } from '@/types/models'
import { cn } from '@/utils/cn'
import { DishTags } from './DishTags'
import { PriceSticker } from './PriceSticker'
import { Sticker } from './Sticker'

interface FoodCardProps {
  item: MenuItemSummary
  priority?: boolean
  className?: string
  /** Show the category name in the footer row (menu "All" view). */
  showCategory?: boolean
  sizes?: string
}

/**
 * A dish as a crate label: white stock with an arched photo window, the name in condensed caps,
 * a die-cut price sticker overlapping the window. Sold-out dishes get a stamped band across the photo.
 */
export function FoodCard({ item, priority, className, showCategory, sizes = '(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 90vw' }: FoodCardProps) {
  const { t, path, pick } = useI18n()
  const name = pick(item.name, item.nameFr)
  const description = pick(item.description, item.descriptionFr)

  return (
    <article
      className={cn(
        'group/card relative flex h-full flex-col rounded-card border-[1.5px] border-line bg-surface p-2.5 text-ink',
        'transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'hover:-translate-y-1 hover:border-pickle hover:shadow-lift focus-within:border-pickle',
        className,
      )}
    >
      <div className="relative">
        <SmartImage
          src={item.mainImage?.url}
          alt={item.mainImage?.altText || name}
          width={720}
          sizes={sizes}
          priority={priority}
          frameClassName="aspect-[4/5] [border-radius:50%_50%_0.65rem_0.65rem/30%_30%_0.65rem_0.65rem]"
          className={cn('group-hover/card:scale-[1.05]', !item.available && 'grayscale-[0.7]')}
        />
        {!item.available && (
          <span aria-hidden className="absolute inset-x-0 top-1/2 -translate-y-1/2 -rotate-6 bg-ink/85 py-2 text-center font-stencil text-xl font-bold uppercase tracking-[0.2em] text-label">
            {t.common.soldOut}
          </span>
        )}
        {item.featured && (
          <Sticker tone="tomato" shape="tag" rotate={-4} className="absolute left-2 top-3">
            {t.common.chefsPick}
          </Sticker>
        )}
        <PriceSticker
          price={item.price}
          className="absolute -bottom-5 right-2 group-hover/card:scale-[1.06] group-hover/card:[--sticker-rotate:5deg]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 px-2 pb-2 pt-5">
        <h3 className="pr-16 font-display text-[1.65rem] font-extrabold uppercase leading-[0.95]">
          <Link
            to={path(`/menu/${item.slug}`)}
            className="after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus"
          >
            {name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-[0.95rem] leading-snug text-ink-muted">{description}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="flex flex-col gap-1.5">
            {showCategory && (
              <span className="font-stencil text-sm font-bold uppercase tracking-[0.12em] text-ink-faint">
                {pick(item.category.name, item.category.nameFr)}
              </span>
            )}
            <DishTags item={item} />
            {!item.available && <span className="sr-only">{t.common.soldOut}</span>}
          </div>
          <span aria-hidden className="inline-flex items-center gap-1 text-sm font-semibold text-tomato-deep">
            {t.common.viewDish}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover/card:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  )
}

export function FoodCardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col rounded-card border-[1.5px] border-line bg-surface p-2.5">
      <span className="skeleton block aspect-[4/5] [border-radius:50%_50%_0.65rem_0.65rem/30%_30%_0.65rem_0.65rem]" />
      <span className="mt-5 flex flex-col gap-2 px-2 pb-2">
        <span className="skeleton block h-6 w-3/4 rounded" />
        <span className="skeleton block h-3.5 w-full rounded" />
        <span className="skeleton block h-3.5 w-2/3 rounded" />
      </span>
    </div>
  )
}
