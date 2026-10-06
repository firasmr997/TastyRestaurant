import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { useReveal } from '@/animations/useReveal'
import { Container } from '@/components/public/Block'
import { EditorialGrid, tileSpan } from '@/components/public/EditorialGrid'
import { GalleryCard } from '@/components/public/GalleryCard'
import { Lightbox } from '@/components/public/Lightbox'
import { SectionTitle } from '@/components/public/SectionTitle'
import { useGalleryPhotos } from '@/hooks/useHomeData'
import { useI18n } from '@/i18n/useI18n'
import { cn } from '@/utils/cn'

/** A slice of the food gallery in the editorial rhythm, opening into the lightbox. */
export function GalleryPreview() {
  const { t, path } = useI18n()
  const { data, isLoading } = useGalleryPhotos('preview', ['BURGER', 'SANDWICH', 'PLATE', 'DESSERT', 'DRINK', 'FOOD'], 8, true)
  const [open, setOpen] = useState<number | null>(null)
  const ref = useReveal<HTMLDivElement>({ stagger: 0.05 })
  const images = data?.content ?? []

  return (
    <section aria-labelledby="gallery-preview-title" className="py-20 lg:py-24">
      <Container ref={ref}>
        <SectionTitle
          title={<span id="gallery-preview-title">{t.home.gallery.title}</span>}
          sub={t.home.gallery.sub}
          action={
            <Link to={path('/gallery')} className="group inline-flex items-center gap-2 font-display text-xl font-extrabold uppercase tracking-[0.04em] text-tomato-deep">
              {t.home.gallery.cta}
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          }
        />
        <EditorialGrid className="mt-10">
          {isLoading && images.length === 0
            ? Array.from({ length: 8 }, (_, i) => <span key={i} className={cn('skeleton rounded-card', tileSpan(i))} />)
            : images.map((image, i) => (
                <div key={image.id} data-reveal className={tileSpan(i)}>
                  <GalleryCard image={image} onOpen={() => setOpen(i)} />
                </div>
              ))}
        </EditorialGrid>
      </Container>
      <Lightbox images={images} index={open} onClose={() => setOpen(null)} onIndexChange={setOpen} />
    </section>
  )
}
