import { useQuery } from '@/hooks/useQuery'
import { galleryService } from '@/services/galleryService'
import { menuService } from '@/services/menuService'
import type { GalleryCategory } from '@/types/models'

/** Featured dishes ("Signatures"). */
export function useFeaturedDishes(size = 10) {
  return useQuery(`menu:featured:${size}`, (signal) => menuService.search({ featured: true, size }, signal))
}

export function useCategoryDishes(category: string, size = 4) {
  return useQuery(`menu:category:${category}:${size}`, (signal) => menuService.search({ category, size }, signal))
}

export function useGalleryPhotos(key: string, categories: GalleryCategory[], size: number, featured?: boolean) {
  return useQuery(`gallery:${key}:${size}:${featured ?? 'all'}`, (signal) =>
    galleryService.list({ category: categories, size, featured }, signal),
  )
}

/**
 * The hero's signature dish: the first featured burger photo, joined to the dish it shows so the
 * price sticker carries the real price. Editors control it from admin (featured flag + display order).
 */
export function useHeroDish() {
  const photos = useQuery('gallery:hero', (signal) =>
    galleryService.list({ category: ['BURGER'], featured: true, size: 1 }, signal),
  )
  const photo = photos.data?.content[0]
  const slug = photo?.menuItem?.slug ?? null
  const dish = useQuery(slug ? `menu:slug:${slug}` : null, (signal) => menuService.getBySlug(slug!, signal))
  return {
    photo,
    dish: dish.data,
    isLoading: photos.isLoading || (slug !== null && dish.isLoading),
  }
}
