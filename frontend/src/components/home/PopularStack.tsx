import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { useReveal } from '@/animations/useReveal'
import { Block, Container } from '@/components/public/Block'
import { FoodCard, FoodCardSkeleton } from '@/components/public/FoodCard'
import { buttonClasses } from '@/components/ui/Button'
import { useCategoryDishes } from '@/hooks/useHomeData'
import { useI18n } from '@/i18n/useI18n'
import type { MenuItemSummary } from '@/types/models'
import { cn } from '@/utils/cn'

/**
 * Signatures above already shows the featured dishes, so the stack leads with the rest of the range,
 * dishes on today's menu first. The sort is stable, so the kitchen's menu order holds within each group.
 */
function pickTwo(items: MenuItemSummary[] = []) {
  const rank = (item: MenuItemSummary) => (item.featured ? 2 : 0) + (item.available ? 0 : 1)
  return [...items].sort((a, b) => rank(a) - rank(b)).slice(0, 2)
}

/** Burgers and sandwiches on a tomato field: the heart of the menu. */
export function PopularStack() {
  const { t, path } = useI18n()
  const burgers = useCategoryDishes('burgers', 6)
  const sandwiches = useCategoryDishes('sandwiches', 6)
  const ref = useReveal<HTMLDivElement>()
  const items = [...pickTwo(burgers.data?.content), ...pickTwo(sandwiches.data?.content)]
  const loading = burgers.isLoading || sandwiches.isLoading

  return (
    <Block tone="tomato" aria-labelledby="stack-title" className="py-16 sm:py-20 lg:py-24">
      <Container ref={ref} className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-8 lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
          <div>
            <h2 id="stack-title" data-reveal className="text-h2">
              {t.home.stack.title}
            </h2>
            <p data-reveal className="mt-5 max-w-[34ch] text-lead text-white/85">
              {t.home.stack.sub}
            </p>
          </div>
          <div data-reveal className="flex flex-wrap gap-3">
            <Link
              to={path('/menu/category/burgers')}
              className={cn(buttonClasses({ variant: 'inverse', size: 'lg' }), 'font-display text-lg uppercase tracking-[0.06em] text-tomato-deep')}
            >
              {t.home.stack.cta}
              <ArrowRight className="size-5 transition-transform duration-300 group-hover/button:translate-x-1" aria-hidden />
            </Link>
          </div>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
          {loading && items.length === 0
            ? Array.from({ length: 4 }, (_, i) => (
                <li key={i}>
                  <FoodCardSkeleton />
                </li>
              ))
            : items.map((item) => (
                <li key={item.id} data-reveal>
                  <FoodCard item={item} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" />
                </li>
              ))}
        </ul>
      </Container>
    </Block>
  )
}
