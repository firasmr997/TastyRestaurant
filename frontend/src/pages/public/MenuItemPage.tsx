import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, CircleCheck, CircleSlash, SearchX } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { Block, Container } from '@/components/public/Block'
import { DishTags } from '@/components/public/DishTags'
import { FoodCard } from '@/components/public/FoodCard'
import { PriceSticker } from '@/components/public/PriceSticker'
import { QueryError } from '@/components/public/QueryState'
import { Sticker } from '@/components/public/Sticker'
import { Seo } from '@/components/Seo'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'
import { SmartImage } from '@/components/ui/SmartImage'
import { useSettings } from '@/context/SettingsContext'
import { useQuery } from '@/hooks/useQuery'
import { useI18n } from '@/i18n/useI18n'
import { galleryService } from '@/services/galleryService'
import { menuService } from '@/services/menuService'
import type { ImageRef } from '@/types/models'
import { cn } from '@/utils/cn'
import { menuItemJsonLd } from '@/utils/structuredData'
import { LabelFrame } from '@/components/public/LabelFrame'

export default function MenuItemPage() {
  const { slug = '' } = useParams()
  const { t, path, pick, pickList, fmt, locale } = useI18n()
  const { currency } = useSettings()
  const dish = useQuery(`menu:slug:${slug}`, (signal) => menuService.getBySlug(slug, signal))
  const item = dish.data
  const photos = useQuery(item ? `gallery:dish:${item.id}` : null, (signal) => galleryService.list({ menuItemId: item!.id, size: 8 }, signal))
  const related = useQuery(item ? `menu:category:${item.category.slug}:8` : null, (signal) =>
    menuService.search({ category: item!.category.slug, size: 8 }, signal),
  )
  const [active, setActive] = useState(0)

  const images: ImageRef[] = useMemo(() => {
    if (!item) return []
    const list: ImageRef[] = []
    if (item.mainImage) list.push(item.mainImage)
    list.push(...item.additionalImages)
    const known = new Set(list.map((i) => i.url))
    photos.data?.content.forEach((photo) => {
      if (!known.has(photo.imageUrl)) list.push({ url: photo.imageUrl, altText: photo.altText ?? photo.title })
    })
    return list
  }, [item, photos.data])

  if (dish.error?.status === 404) {
    return (
      <Container className="pt-32 pb-24">
        <Seo title={t.dish.notFoundTitle} noIndex />
        <EmptyState
          icon={<SearchX />}
          title={t.dish.notFoundTitle}
          description={t.dish.notFoundText}
          action={<Button to={path('/menu')}>{t.common.backToMenu}</Button>}
        />
      </Container>
    )
  }
  if (dish.error && !item) {
    return (
      <Container className="pt-32 pb-24">
        <QueryError error={dish.error} onRetry={dish.refetch} />
      </Container>
    )
  }

  const name = item ? pick(item.name, item.nameFr) : ''
  const current = images[Math.min(active, Math.max(0, images.length - 1))]
  const ingredients = item ? pickList(item.ingredients, item.ingredientsFr) : []
  const others = (related.data?.content ?? []).filter((d) => d.id !== item?.id).slice(0, 4)

  return (
    <>
      {item && (
        <Seo
          title={name}
          description={pick(item.description, item.descriptionFr)}
          image={item.mainImage?.url}
          type="article"
          jsonLd={menuItemJsonLd(item, currency, locale)}
        />
      )}
      <Block tone="pickle" className="overflow-hidden pt-[6rem] pb-12 lg:pt-[7.5rem] lg:pb-16">
        <LabelFrame />
        <Container className="relative px-10 sm:px-12 lg:px-14">
          <Link
            to={path(item ? `/menu/category/${item.category.slug}` : '/menu')}
            className="group mb-8 inline-flex items-center gap-2 font-display text-lg font-extrabold uppercase tracking-[0.06em] text-pickle-soft hover:text-mustard"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" aria-hidden />
            {item ? pick(item.category.name, item.category.nameFr) : t.common.backToMenu}
          </Link>

          {/* Phones read name, photo, then details; large screens set the photo beside name and details. */}
          <div className="grid gap-8 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-0">
            <div className="lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:pt-6">
              {!item ? (
                <Skeleton className="h-16 w-4/5 rounded" />
              ) : (
                <>
                  <h1 className="text-h1 text-label">{name}</h1>
                  <div className="mt-5 flex flex-wrap items-center gap-3 empty:hidden">
                    <DishTags item={item} />
                  </div>
                </>
              )}
            </div>

            {/* Photo window with thumbnails */}
            <div className="lg:col-span-6 lg:col-start-1 lg:row-span-2 lg:row-start-1">
              <div className="relative">
                <div className="relative aspect-[4/5] overflow-hidden arch rounded-b-[1.1rem] border-[3px] border-mustard bg-pickle-deep">
                  {!item ? (
                    <Skeleton className="absolute inset-0 rounded-none" />
                  ) : (
                    <AnimatePresence initial={false} mode="popLayout">
                      <motion.div
                        key={current?.url ?? 'none'}
                        className="absolute inset-0"
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <SmartImage
                          src={current?.url}
                          alt={current?.altText || name}
                          priority
                          width={1200}
                          sizes="(min-width: 1024px) 45vw, 100vw"
                          frameClassName="h-full w-full"
                          className={cn(!item.available && 'grayscale-[0.6]')}
                        />
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
                {item && <PriceSticker price={item.price} size="lg" rotate={-10} className="absolute -right-2 bottom-10 sm:-right-6" />}
                {item?.featured && (
                  <Sticker tone="tomato" shape="oval" rotate={-8} className="absolute -left-2 top-10 px-5 py-2.5 text-lg sm:-left-5">
                    {t.common.chefsPick}
                  </Sticker>
                )}
              </div>
              {images.length > 1 && (
                <div className="mt-6">
                  <p className="mb-3 font-stencil text-sm font-bold uppercase tracking-[0.14em] text-mustard">{t.dish.morePhotos}</p>
                  <ul className="flex gap-3 overflow-x-auto pb-1">
                    {images.map((image, index) => (
                      <li key={image.url} className="shrink-0">
                        <button
                          type="button"
                          onClick={() => setActive(index)}
                          aria-label={fmt(t.dish.photoOf, { n: index + 1, total: images.length })}
                          aria-pressed={index === active}
                          className={cn(
                            'block size-20 overflow-hidden rounded-control border-[3px] transition-[border-color,transform] sm:size-24',
                            index === active ? 'border-mustard' : 'border-transparent opacity-75 hover:opacity-100',
                          )}
                        >
                          <SmartImage src={image.url} alt="" width={240} sizes="96px" frameClassName="h-full w-full" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* The back of the card */}
            <div className="flex flex-col lg:col-span-6 lg:col-start-7 lg:row-start-2 lg:pt-6">
              {!item ? (
                <SkeletonText lines={4} />
              ) : (
                <>
                  <p className="max-w-[54ch] text-lead text-label/90">{pick(item.description, item.descriptionFr)}</p>

                  <dl className="mt-10 border-[1.5px] border-label/45 text-[0.98rem]">
                    <Fact label={t.dish.ingredients}>
                      {ingredients.length ? (
                        <ul className="flex flex-wrap gap-x-1.5 gap-y-1">
                          {ingredients.map((ingredient, i) => (
                            <li key={ingredient}>
                              {ingredient}
                              {i < ingredients.length - 1 && <span aria-hidden className="text-mustard">,</span>}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        '—'
                      )}
                    </Fact>
                    <Fact label={t.dish.category}>{pick(item.category.name, item.category.nameFr)}</Fact>
                    <Fact label={t.dish.dietary}>
                      {item.vegetarian || item.spicy
                        ? [item.vegetarian && t.common.vegetarian, item.spicy && t.common.spicy].filter(Boolean).join(' · ')
                        : t.dish.none}
                    </Fact>
                    <Fact label={t.dish.availability}>
                      <span className={cn('inline-flex items-center gap-2 font-semibold', item.available ? 'text-[#9be0b0]' : 'text-tomato-bright')}>
                        {item.available ? <CircleCheck className="size-4" aria-hidden /> : <CircleSlash className="size-4" aria-hidden />}
                        {item.available ? t.dish.available : t.dish.unavailable}
                      </span>
                    </Fact>
                  </dl>
                  <p className="mt-6 text-sm text-pickle-soft">{t.dish.orderNote}</p>
                </>
              )}
            </div>
          </div>
        </Container>
      </Block>

      {others.length > 0 && (
        <section aria-labelledby="related-title" className="py-16 lg:py-20">
          <Container>
            <h2 id="related-title" className="text-h2 text-pickle">
              {t.dish.related}
            </h2>
            <ul className="mt-10 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((other) => (
                <li key={other.id}>
                  <FoodCard item={other} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  )
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b-[1.5px] border-label/45 px-4 py-3.5 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="font-stencil text-sm font-bold uppercase tracking-[0.14em] text-mustard sm:pt-0.5">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
