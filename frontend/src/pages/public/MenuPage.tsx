import { SearchX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { CategoryFilter, type MenuToggles } from '@/components/menu/CategoryFilter'
import { MenuGrid } from '@/components/menu/MenuGrid'
import { MenuHeader } from '@/components/menu/MenuHeader'
import { Container } from '@/components/public/Block'
import { QueryError } from '@/components/public/QueryState'
import { Seo } from '@/components/Seo'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useQuery } from '@/hooks/useQuery'
import { useI18n } from '@/i18n/useI18n'
import { categoryService } from '@/services/categoryService'
import { menuService } from '@/services/menuService'
import type { Category, MenuItemSummary } from '@/types/models'

const PAGE_SIZE = 12

export default function MenuPage() {
  const { t, fmt, pick, path } = useI18n()
  const { categorySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const debouncedQuery = useDebouncedValue(query.trim(), 300)
  const toggles: MenuToggles = {
    available: searchParams.get('available') === '1',
    featured: searchParams.get('featured') === '1',
    vegetarian: searchParams.get('veg') === '1',
  }
  const [pages, setPages] = useState(1)

  // Mirror the debounced search in the URL so results are shareable.
  useEffect(() => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (debouncedQuery) next.set('q', debouncedQuery)
        else next.delete('q')
        return next
      },
      { replace: true },
    )
  }, [debouncedQuery, setSearchParams])

  const filterKey = `${categorySlug ?? 'all'}|${debouncedQuery}|${toggles.available}|${toggles.featured}|${toggles.vegetarian}`
  useEffect(() => setPages(1), [filterKey])

  const categories = useQuery('categories:public', (signal) => categoryService.listPublic(signal), { staleTime: 5 * 60_000 })
  const activeCategory = categories.data?.content.find((c) => c.slug === categorySlug)
  const unknownCategory = !!categorySlug && !!categories.data && !activeCategory

  const filtersActive = !!debouncedQuery || toggles.available || toggles.featured || toggles.vegetarian
  // The "All" view reads like a printed card, so it loads the whole menu (capped) in one go.
  const grouped = !categorySlug && !filtersActive
  const size = grouped ? 96 : Math.min(PAGE_SIZE * pages, 96)
  const menu = useQuery(
    unknownCategory ? null : `menu:list:${filterKey}:${size}`,
    (signal) =>
      menuService.search(
        {
          q: debouncedQuery || undefined,
          category: categorySlug,
          available: toggles.available || undefined,
          featured: toggles.featured || undefined,
          vegetarian: toggles.vegetarian || undefined,
          sort: 'menu',
          size,
        },
        signal,
      ),
    { keepPrevious: true },
  )

  const items = menu.data?.content ?? []
  const total = menu.data?.totalElements ?? 0
  const toggle = (key: keyof MenuToggles) => {
    const param = key === 'vegetarian' ? 'veg' : key
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (next.get(param) === '1') next.delete(param)
      else next.set(param, '1')
      return next
    })
  }

  const clearAll = () => {
    setQuery('')
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const preservedSearch = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const resultLabel = menu.data ? (total === 1 ? t.menu.resultOne : fmt(t.menu.results, { count: total })) : ''
  const title = activeCategory ? pick(activeCategory.name, activeCategory.nameFr) : t.menu.title
  const intro = activeCategory?.description ? pick(activeCategory.description, activeCategory.descriptionFr) : t.menu.intro

  return (
    <>
      <Seo
        title={activeCategory ? `${title} · ${t.meta.menu.title}` : t.meta.menu.title}
        description={activeCategory?.description ? pick(activeCategory.description, activeCategory.descriptionFr) : t.meta.menu.description}
        type="restaurant.menu"
      />
      <MenuHeader title={title} intro={intro} query={query} onQueryChange={setQuery} resultLabel={resultLabel} />
      <div className="mt-2 sm:mt-3 lg:mt-4">
        <CategoryFilter
          categories={categories.data?.content}
          activeSlug={categorySlug}
          toggles={toggles}
          onToggle={toggle}
          search={preservedSearch}
        />
      </div>

      <Container className="py-12 lg:py-16">
        {unknownCategory ? (
          <EmptyState
            icon={<SearchX />}
            title={t.menu.categoryNotFound}
            action={<Button to={path('/menu')}>{t.common.backToMenu}</Button>}
          />
        ) : menu.error && !menu.data ? (
          <QueryError error={menu.error} onRetry={menu.refetch} />
        ) : !menu.isLoading && items.length === 0 ? (
          <EmptyState
            icon={<SearchX />}
            title={t.menu.emptyTitle}
            description={debouncedQuery ? fmt(t.menu.emptyText, { query: debouncedQuery }) : t.menu.emptyTextFilters}
            action={
              <Button variant="outline" onClick={clearAll}>
                {t.menu.clearFilters}
              </Button>
            }
          />
        ) : grouped && categories.data ? (
          <GroupedMenu items={items} categories={categories.data.content} loading={menu.isLoading} />
        ) : (
          <MenuGrid items={items} loading={menu.isLoading} showCategory={!categorySlug} />
        )}

        {menu.data && items.length < total && size < 96 && (
          <div className="mt-12 flex justify-center">
            <Button variant="outline" size="lg" loading={menu.isFetching} onClick={() => setPages((p) => p + 1)} className="font-display uppercase tracking-[0.06em]">
              {t.common.loadMore}
            </Button>
          </div>
        )}
      </Container>
    </>
  )
}

/** "All" view: the menu reads like a printed card, section by section in display order. */
function GroupedMenu({ items, categories, loading }: { items: MenuItemSummary[]; categories: Category[]; loading: boolean }) {
  const { pick } = useI18n()
  const sections = useMemo(
    () =>
      categories
        .map((category) => ({ category, items: items.filter((item) => item.category.id === category.id) }))
        .filter((section) => section.items.length > 0),
    [categories, items],
  )
  if (loading && items.length === 0) return <MenuGrid items={[]} loading />
  return (
    <div className="flex flex-col gap-16 lg:gap-20">
      {sections.map(({ category, items: sectionItems }) => (
        <section key={category.id} aria-labelledby={`cat-${category.id}`}>
          <div className="mb-8 flex flex-col gap-2 border-b-[3px] border-ink pb-4 md:flex-row md:items-end md:justify-between">
            <h2 id={`cat-${category.id}`} className="text-h2 text-pickle">
              {pick(category.name, category.nameFr)}
            </h2>
            {category.description && (
              <p className="max-w-[48ch] text-ink-muted md:text-right">{pick(category.description, category.descriptionFr)}</p>
            )}
          </div>
          <MenuGrid items={sectionItems} />
        </section>
      ))}
    </div>
  )
}
