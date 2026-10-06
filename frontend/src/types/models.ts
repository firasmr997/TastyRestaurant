/** Domain types mirroring the backend DTOs. Field names match the JSON exactly. */

export type Role = 'ADMIN' | 'EDITOR'

export interface User {
  id: number
  name: string
  email: string
  role: Role
}

export interface AuthSession {
  token: string
  tokenType: 'Bearer'
  expiresAt: string
  user: User
}

export interface CategorySummary {
  id: number
  name: string
  nameFr: string | null
  slug: string
}

export interface Category extends CategorySummary {
  description: string | null
  descriptionFr: string | null
  displayOrder: number
  active: boolean
  itemCount: number
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
}

export interface CategoryInput {
  name: string
  nameFr?: string | null
  slug?: string | null
  description?: string | null
  descriptionFr?: string | null
  displayOrder: number
  active: boolean
}

export interface ImageRef {
  id?: number | null
  url: string
  storageKey?: string | null
  altText?: string | null
}

export interface MenuItemSummary {
  id: number
  slug: string
  name: string
  nameFr: string | null
  description: string
  descriptionFr: string | null
  price: number
  ingredients: string[]
  ingredientsFr: string[]
  category: CategorySummary
  mainImage: ImageRef | null
  available: boolean
  featured: boolean
  vegetarian: boolean
  spicy: boolean
  createdAt: string
  updatedAt: string
}

export interface MenuItem extends MenuItemSummary {
  additionalImages: ImageRef[]
  createdBy: string | null
  updatedBy: string | null
}

export interface MenuItemInput {
  name: string
  nameFr?: string | null
  slug?: string | null
  description: string
  descriptionFr?: string | null
  price: number
  categoryId: number
  ingredients: string[]
  ingredientsFr: string[]
  mainImage: ImageRef | null
  additionalImages: ImageRef[]
  available: boolean
  featured: boolean
  vegetarian: boolean
  spicy: boolean
}

export type MenuSort = 'menu' | 'newest' | 'updated' | 'name' | 'price-asc' | 'price-desc'

export interface MenuQuery {
  q?: string
  category?: string
  categoryId?: number
  available?: boolean
  featured?: boolean
  vegetarian?: boolean
  spicy?: boolean
  sort?: MenuSort
  page?: number
  size?: number
}

export interface MenuItemRef {
  id: number
  slug: string
  name: string
  nameFr: string | null
}

export const FOOD_CATEGORIES = ['FOOD', 'SANDWICH', 'BURGER', 'PLATE', 'DESSERT', 'DRINK'] as const
export const RESTAURANT_CATEGORIES = ['EXTERIOR', 'INTERIOR', 'DINING', 'KITCHEN', 'BAR', 'TEAM', 'ATMOSPHERE'] as const

export type FoodCategory = (typeof FOOD_CATEGORIES)[number]
export type RestaurantCategory = (typeof RESTAURANT_CATEGORIES)[number]
export type GalleryCategory = FoodCategory | RestaurantCategory
export type GalleryGroup = 'FOOD' | 'RESTAURANT'

export interface GalleryImage {
  id: number
  title: string
  titleFr: string | null
  description: string | null
  descriptionFr: string | null
  imageUrl: string
  storageKey: string | null
  altText: string | null
  category: GalleryCategory
  group: GalleryGroup
  displayOrder: number
  featured: boolean
  menuItem: MenuItemRef | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
}

export interface GalleryImageInput {
  title: string
  titleFr?: string | null
  description?: string | null
  descriptionFr?: string | null
  imageUrl: string
  storageKey?: string | null
  altText?: string | null
  category: GalleryCategory
  displayOrder: number
  featured: boolean
  menuItemId?: number | null
}

export interface GalleryQuery {
  group?: GalleryGroup
  category?: GalleryCategory[]
  featured?: boolean
  menuItemId?: number
  q?: string
  sort?: 'gallery' | 'newest'
  page?: number
  size?: number
}

export type StorageFolder = 'menu' | 'gallery' | 'restaurant' | 'team'

export interface UploadResult {
  url: string
  storageKey: string
  contentType: string
  size: number
}

export type MessageStatus = 'NEW' | 'READ' | 'ARCHIVED'

export interface ContactMessage {
  id: number
  name: string
  email: string
  phone: string | null
  message: string
  status: MessageStatus
  locale: string | null
  readAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ContactInput {
  name: string
  email: string
  phone?: string
  message: string
  locale: 'en' | 'fr'
  /** Honeypot: always empty for humans. */
  website?: string
}

export interface UnreadSummary {
  unread: number
  latest: ContactMessage[]
}

export interface OpeningHours {
  dayOfWeek: number
  opensAt: string | null
  closesAt: string | null
  closed: boolean
}

export interface Settings {
  name: string
  tagline: string | null
  taglineFr: string | null
  description: string | null
  descriptionFr: string | null
  addressLine: string | null
  city: string | null
  postalCode: string | null
  country: string | null
  phone: string | null
  email: string | null
  mapUrl: string | null
  latitude: number | null
  longitude: number | null
  instagramUrl: string | null
  facebookUrl: string | null
  tiktokUrl: string | null
  currencyCode: string
  announcement: string | null
  announcementFr: string | null
  promoEnabled: boolean
  promoTitle: string | null
  promoTitleFr: string | null
  promoText: string | null
  promoTextFr: string | null
  promoMenuItem: MenuItemSummary | null
  openingHours: OpeningHours[]
  updatedAt: string
  updatedBy: string | null
}

export type SettingsInput = Omit<Settings, 'promoMenuItem' | 'updatedAt' | 'updatedBy'> & {
  promoMenuItemId: number | null
}

export interface DashboardStats {
  totalItems: number
  availableItems: number
  featuredItems: number
  categories: number
  activeCategories: number
  galleryImages: number
  foodImages: number
  restaurantImages: number
  unreadMessages: number
  totalMessages: number
}

export interface Dashboard {
  stats: DashboardStats
  itemsPerCategory: { categoryId: number; name: string; count: number }[]
  messagesPerDay: { date: string; count: number }[]
  recentItems: MenuItemSummary[]
  recentMessages: ContactMessage[]
}
