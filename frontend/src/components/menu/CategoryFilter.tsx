import { Leaf, Star, Utensils } from 'lucide-react'
import { Link } from 'react-router'
import { useI18n } from '@/i18n/useI18n'
import type { Category } from '@/types/models'
import { cn } from '@/utils/cn'

export interface MenuToggles {
  available: boolean
  featured: boolean
  vegetarian: boolean
}

interface CategoryFilterProps {
  categories: Category[] | undefined
  activeSlug: string | undefined
  toggles: MenuToggles
  onToggle: (key: keyof MenuToggles) => void
  /** Keeps the current search and toggles when switching category. */
  search: string
}

/**
 * Sticky filter bar: categories as a strip of ruled cells (the active one floods tomato) and three
 * toggle cells. Categories are links, so every filtered view has a clean shareable URL.
 */
export function CategoryFilter({ categories, activeSlug, toggles, onToggle, search }: CategoryFilterProps) {
  const { t, path, pick } = useI18n()
  const toggleItems: { key: keyof MenuToggles; label: string; Icon: typeof Star }[] = [
    { key: 'available', label: t.menu.availableOnly, Icon: Utensils },
    { key: 'featured', label: t.menu.featuredOnly, Icon: Star },
    { key: 'vegetarian', label: t.menu.vegetarianOnly, Icon: Leaf },
  ]
  const cellBorder = 'border-l-[1.5px] border-ink first:border-l-0'

  return (
    <div className="sticky top-[4.5rem] z-30 border-y-[1.5px] border-ink bg-label lg:top-[5rem]">
      <div className="mx-auto flex max-w-[96rem] flex-col lg:flex-row">
        <nav aria-label={t.menu.filters} className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex w-max">
            <li className={cellBorder}>
              <Link to={path('/menu') + search} aria-current={!activeSlug ? 'page' : undefined} className="cell h-12 hover:bg-tomato/12">
                {t.menu.all}
              </Link>
            </li>
            {(categories ?? []).map((category) => (
              <li key={category.id} className={cellBorder}>
                <Link
                  to={path(`/menu/category/${category.slug}`) + search}
                  aria-current={activeSlug === category.slug ? 'page' : undefined}
                  className="cell h-12 hover:bg-tomato/12"
                >
                  {pick(category.name, category.nameFr)}
                </Link>
              </li>
            ))}
            {!categories &&
              Array.from({ length: 6 }, (_, i) => (
                <li key={i} className={cn(cellBorder, 'flex h-12 items-center px-5')}>
                  <span className="skeleton block h-4 w-16 rounded" />
                </li>
              ))}
          </ul>
        </nav>
        <div className="flex overflow-x-auto border-t-[1.5px] border-ink [scrollbar-width:none] lg:border-l-[1.5px] lg:border-t-0 [&::-webkit-scrollbar]:hidden">
          {toggleItems.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              aria-pressed={toggles[key]}
              onClick={() => onToggle(key)}
              className={cn('cell h-12 shrink-0 !text-[0.95rem] hover:bg-tomato/12', cellBorder)}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
