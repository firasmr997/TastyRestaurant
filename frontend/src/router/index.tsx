import type { ComponentType } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router'
import { PublicLayout } from '@/layouts/PublicLayout'
import { RootLayout } from '@/layouts/RootLayout'
import { RequireAuth } from './RequireAuth'
import { RouteError } from './RouteError'

/** Code-split pages: each route downloads its own chunk on first visit. */
const page = (loader: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await loader()).default })

const publicPages: RouteObject[] = [
  { index: true, lazy: page(() => import('@/pages/public/HomePage')) },
  { path: 'menu', lazy: page(() => import('@/pages/public/MenuPage')) },
  { path: 'menu/category/:categorySlug', lazy: page(() => import('@/pages/public/MenuPage')) },
  { path: 'menu/:slug', lazy: page(() => import('@/pages/public/MenuItemPage')) },
  { path: 'gallery', lazy: page(() => import('@/pages/public/GalleryPage')) },
  { path: 'gallery/restaurant', lazy: page(() => import('@/pages/public/GalleryPage')) },
  { path: 'about', lazy: page(() => import('@/pages/public/AboutPage')) },
  { path: 'contact', lazy: page(() => import('@/pages/public/ContactPage')) },
  { path: '*', lazy: page(() => import('@/pages/public/NotFoundPage')) },
]

const adminPages: RouteObject[] = [
  { index: true, lazy: page(() => import('@/pages/admin/DashboardPage')) },
  { path: 'menu', lazy: page(() => import('@/pages/admin/MenuListPage')) },
  { path: 'menu/new', lazy: page(() => import('@/pages/admin/MenuEditPage')) },
  { path: 'menu/:id', lazy: page(() => import('@/pages/admin/MenuEditPage')) },
  { path: 'categories', lazy: page(() => import('@/pages/admin/CategoriesPage')) },
  { path: 'food-images', lazy: page(() => import('@/pages/admin/FoodImagesPage')) },
  { path: 'restaurant-gallery', lazy: page(() => import('@/pages/admin/RestaurantGalleryPage')) },
  { path: 'messages', lazy: page(() => import('@/pages/admin/MessagesPage')) },
  { path: 'settings', lazy: page(() => import('@/pages/admin/SettingsPage')) },
  { path: '*', lazy: page(() => import('@/pages/admin/AdminNotFoundPage')) },
]

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { path: '/admin/login', lazy: page(() => import('@/pages/admin/LoginPage')) },
      {
        path: '/admin',
        lazy: async () => {
          const { AdminLayout } = await import('@/layouts/AdminLayout')
          return {
            Component: () => (
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            ),
          }
        },
        children: adminPages,
      },
      { path: '/fr', element: <PublicLayout />, children: publicPages },
      { path: '/', element: <PublicLayout />, children: publicPages },
    ],
  },
]

export function createRouter() {
  // Honour the Vite base path so the app can also be served from a sub-folder
  // (e.g. the /demos/tasty/ showcase build). Normal builds use '/', which trims
  // to '' and leaves routing unchanged.
  const basename = import.meta.env.BASE_URL?.replace(/\/+$/, '')
  return createBrowserRouter(routes, basename ? { basename } : undefined)
}
