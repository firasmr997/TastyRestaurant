import { AnimatePresence, motion } from 'framer-motion'
import { FoodCard, FoodCardSkeleton } from '@/components/public/FoodCard'
import type { MenuItemSummary } from '@/types/models'

interface MenuGridProps {
  items: MenuItemSummary[]
  loading?: boolean
  showCategory?: boolean
  skeletons?: number
}

/** Responsive grid of dish labels; cards fade and slide into their new places when filters change. */
export function MenuGrid({ items, loading, showCategory, skeletons = 8 }: MenuGridProps) {
  if (loading && items.length === 0) {
    return (
      <ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" aria-busy="true">
        {Array.from({ length: skeletons }, (_, i) => (
          <li key={i}>
            <FoodCardSkeleton />
          </li>
        ))}
      </ul>
    )
  }
  return (
    <motion.ul layout className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, delay: Math.min(index, 8) * 0.03, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
          >
            <FoodCard item={item} priority={index < 4} showCategory={showCategory} />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  )
}
