import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createMemoryRouter, Outlet, RouterProvider, type RouteObject } from 'react-router'
import { ConfirmProvider } from '@/components/ui/ConfirmDialog'
import { ToastProvider } from '@/components/ui/Toast'
import { AuthProvider } from '@/context/AuthContext'
import { SettingsProvider } from '@/context/SettingsContext'
import type { Category, MenuItem, MenuItemSummary, Page, Settings } from '@/types'

function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  )
}

/** Renders routes inside a data router (needed for useBlocker) with the app providers. */
export function renderRoutes(routes: RouteObject[], initialEntries: string[]) {
  const router = createMemoryRouter(
    [{ element: <ProvidersOutlet />, children: routes }],
    { initialEntries },
  )
  const utils = render(<RouterProvider router={router} />)
  return { ...utils, router }
}

function ProvidersOutlet() {
  return (
    <Providers>
      <Outlet />
    </Providers>
  )
}

export function page<T>(content: T[], overrides: Partial<Page<T>> = {}): Page<T> {
  return {
    content,
    page: 0,
    size: content.length || 10,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    ...overrides,
  }
}

export const categoryFixture = (overrides: Partial<Category> = {}): Category => ({
  id: 1,
  name: 'Burgers',
  nameFr: 'Burgers',
  slug: 'burgers',
  description: 'Smashed to order.',
  descriptionFr: null,
  displayOrder: 1,
  active: true,
  itemCount: 2,
  createdAt: '2026-10-01T10:00:00Z',
  updatedAt: '2026-10-01T10:00:00Z',
  createdBy: 'seed',
  updatedBy: 'seed',
  ...overrides,
})

export const dishFixture = (overrides: Partial<MenuItemSummary> = {}): MenuItemSummary => ({
  id: 1,
  slug: 'the-tasty-smash',
  name: 'The Tasty Smash',
  nameFr: 'Le Tasty Smash',
  description: 'Two dry-aged beef patties smashed thin.',
  descriptionFr: null,
  price: 14.5,
  ingredients: ['Dry-aged beef', 'Aged cheddar'],
  ingredientsFr: [],
  category: { id: 1, name: 'Burgers', nameFr: 'Burgers', slug: 'burgers' },
  mainImage: { url: 'https://images.unsplash.com/photo-1', storageKey: null, altText: 'Burger' },
  available: true,
  featured: true,
  vegetarian: false,
  spicy: false,
  createdAt: '2026-10-01T10:00:00Z',
  updatedAt: '2026-10-01T10:00:00Z',
  ...overrides,
})

export const fullDishFixture = (overrides: Partial<MenuItem> = {}): MenuItem => ({
  ...dishFixture(),
  additionalImages: [],
  createdBy: 'seed',
  updatedBy: 'seed',
  ...overrides,
})

export const settingsFixture: Settings = {
  name: 'Tasty',
  tagline: null,
  taglineFr: null,
  description: null,
  descriptionFr: null,
  addressLine: '27 Foundry Lane',
  city: 'Port Aurelle',
  postalCode: '10427',
  country: null,
  phone: '+1 555 0100',
  email: 'hello@tasty.example',
  mapUrl: null,
  latitude: null,
  longitude: null,
  instagramUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
  currencyCode: 'USD',
  announcement: null,
  announcementFr: null,
  promoEnabled: false,
  promoTitle: null,
  promoTitleFr: null,
  promoText: null,
  promoTextFr: null,
  promoMenuItem: null,
  openingHours: [1, 2, 3, 4, 5, 6, 7].map((day) => ({ dayOfWeek: day, opensAt: '11:30', closesAt: '22:30', closed: false })),
  updatedAt: '2026-10-01T10:00:00Z',
  updatedBy: 'seed',
}
