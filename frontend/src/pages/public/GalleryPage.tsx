import { ImageOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { Block, Container } from '@/components/public/Block'
import { EditorialGrid, tileSpan } from '@/components/public/EditorialGrid'
import { GalleryCard } from '@/components/public/GalleryCard'
import { Lightbox } from '@/components/public/Lightbox'
import { QueryError } from '@/components/public/QueryState'
import { Seo } from '@/components/Seo'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useQuery } from '@/hooks/useQuery'
import { stripLocale } from '@/i18n/locale'
import { useI18n } from '@/i18n/useI18n'
import { galleryService } from '@/services/galleryService'
import { FOOD_CATEGORIES, RESTAURANT_CATEGORIES, type GalleryCategory, type GalleryGroup } from '@/types/models'
import { cn } from '@/utils/cn'
import { LabelFrame } from '@/components/public/LabelFrame'

const PAGE_SIZE = 24

/** Food gallery at /gallery, restaurant gallery at /gallery/restaurant; ?c= narrows to one category. */
export default function GalleryPage() {
  const { t, path } = useI18n()
  const { pathname } = useLocation()
  const group: GalleryGroup = stripLocale(pathname).startsWith('/gallery/restaurant') ? 'RESTAURANT' : 'FOOD'
  const [searchParams, setSearchParams] = useSearchParams()
  const allowed: readonly GalleryCategory[] = group === 'FOOD' ? FOOD_CATEGORIES : RESTAURANT_CATEGORIES
  const requested = searchParams.get('c') as GalleryCategory | null
  const category = requested && allowed.includes(requested) ? requested : null
  const [pages, setPages] = useState(1)
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => setPages(1), [group, category])

  const size = Math.min(PAGE_SIZE * pages, 96)
  const query = useQuery(
    `gallery:page:${group}:${category ?? 'all'}:${size}`,
    (signal) => galleryService.list({ group, category: category ? [category] : undefined, size }, signal),
    { keepPrevious: true },
  )
  const images = query.data?.content ?? []
  const total = query.data?.totalElements ?? 0
  const meta = group === 'FOOD' ? t.meta.gallery : t.meta.galleryRestaurant

  const selectCategory = (value: GalleryCategory | null) => {
    setSearchParams(value ? { c: value } : {}, { replace: true })
  }

  return (
    <>
      <Seo title={meta.title} description={meta.description} />
      <Block tone="ink" className="overflow-hidden pt-[6.5rem] pb-10 lg:pt-[8rem] lg:pb-12">
        <LabelFrame />
        <Container className="relative px-10 sm:px-12 lg:px-14">
          <h1 className="font-inline text-[clamp(4rem,2rem+9vw,9rem)] font-black leading-[0.85] text-label">{t.gallery.title}</h1>
          <p className="mt-5 max-w-[46ch] text-lead text-label/80">{t.gallery.intro}</p>
          <nav aria-label={t.gallery.title} className="mt-10 inline-flex border-[1.5px] border-label/70">
            <Link to={path('/gallery')} aria-current={group === 'FOOD' ? 'page' : undefined} className="cell h-14 !px-6 !text-xl hover:bg-tomato/25">
              {t.gallery.food}
            </Link>
            <Link
              to={path('/gallery/restaurant')}
              aria-current={group === 'RESTAURANT' ? 'page' : undefined}
              className="cell h-14 border-l-[1.5px] border-label/70 !px-6 !text-xl hover:bg-tomato/25"
            >
              {t.gallery.restaurant}
            </Link>
          </nav>
        </Container>
      </Block>

      <div className="sticky top-[4.5rem] z-30 mt-2 border-y-[1.5px] border-ink bg-label sm:mt-3 lg:top-[5rem] lg:mt-4">
        <div className="mx-auto max-w-[96rem] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex w-max">
            {[null, ...allowed].map((value) => (
              <li key={value ?? 'all'} className="border-l-[1.5px] border-ink first:border-l-0">
                <button
                  type="button"
                  aria-pressed={category === value}
                  onClick={() => selectCategory(value)}
                  className={cn('cell h-12 hover:bg-tomato/12')}
                >
                  {value ? t.gallery.categories[value] : t.gallery.all}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Container className="py-12 lg:py-16">
        {query.error && !query.data ? (
          <QueryError error={query.error} onRetry={query.refetch} />
        ) : !query.isLoading && images.length === 0 ? (
          <EmptyState icon={<ImageOff />} title={t.gallery.emptyTitle} description={t.gallery.emptyText} />
        ) : (
          <EditorialGrid>
            {query.isLoading && images.length === 0
              ? Array.from({ length: 12 }, (_, i) => <span key={i} className={cn('skeleton rounded-card', tileSpan(i))} />)
              : images.map((image, i) => (
                  <div key={image.id} className={tileSpan(i)}>
                    <GalleryCard image={image} onOpen={() => setOpen(i)} priority={i < 4} />
                  </div>
                ))}
          </EditorialGrid>
        )}
        {query.data && images.length < total && size < 96 && (
          <div className="mt-12 flex justify-center">
            <Button variant="outline" size="lg" loading={query.isFetching} onClick={() => setPages((p) => p + 1)} className="font-display uppercase tracking-[0.06em]">
              {t.common.loadMore}
            </Button>
          </div>
        )}
      </Container>
      <Lightbox images={images} index={open} onClose={() => setOpen(null)} onIndexChange={setOpen} />
    </>
  )
}
