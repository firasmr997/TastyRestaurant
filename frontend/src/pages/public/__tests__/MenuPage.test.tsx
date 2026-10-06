import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MenuPage from '@/pages/public/MenuPage'
import { categoryService } from '@/services/categoryService'
import { menuService } from '@/services/menuService'
import { settingsService } from '@/services/settingsService'
import { categoryFixture, dishFixture, page, renderRoutes, settingsFixture } from '@/test/utils'

vi.mock('@/services/menuService')
vi.mock('@/services/categoryService')
vi.mock('@/services/settingsService')

const routes = [
  { path: '/menu', element: <MenuPage /> },
  { path: '/menu/category/:categorySlug', element: <MenuPage /> },
  { path: '/fr/menu', element: <MenuPage /> },
]

const dishes = [
  dishFixture(),
  dishFixture({
    id: 2,
    slug: 'caprese-focaccia',
    name: 'Caprese Focaccia',
    nameFr: 'Focaccia caprese',
    category: { id: 2, name: 'Sandwiches', nameFr: 'Sandwichs', slug: 'sandwiches' },
    featured: false,
    vegetarian: true,
    available: false,
    price: 12,
  }),
]

describe('Public menu', () => {
  beforeEach(() => {
    vi.mocked(settingsService.get).mockResolvedValue(settingsFixture)
    vi.mocked(categoryService.listPublic).mockResolvedValue(
      page([categoryFixture(), categoryFixture({ id: 2, name: 'Sandwiches', nameFr: 'Sandwichs', slug: 'sandwiches', displayOrder: 2 })]),
    )
    vi.mocked(menuService.search).mockResolvedValue(page(dishes))
  })

  it('renders the menu grouped by category with prices and states', async () => {
    renderRoutes(routes, ['/menu'])
    expect(await screen.findByRole('heading', { name: 'The Tasty Smash' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Burgers', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sandwiches', level: 2 })).toBeInTheDocument()
    expect(screen.getAllByText('$14.50').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/sold out/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/2 dishes/i)).toBeInTheDocument()
  })

  it('filters by featured and by category', async () => {
    const user = userEvent.setup()
    renderRoutes(routes, ['/menu'])
    await screen.findByRole('heading', { name: 'The Tasty Smash' })

    await user.click(screen.getByRole('button', { name: /chef's picks/i }))
    await waitFor(() => expect(menuService.search).toHaveBeenLastCalledWith(expect.objectContaining({ featured: true }), expect.anything()))

    await user.click(screen.getByRole('link', { name: 'Sandwiches' }))
    await waitFor(() => expect(menuService.search).toHaveBeenLastCalledWith(expect.objectContaining({ category: 'sandwiches' }), expect.anything()))
  })

  it('searches dishes and shows a friendly empty state', async () => {
    const user = userEvent.setup()
    renderRoutes(routes, ['/menu'])
    await screen.findByRole('heading', { name: 'The Tasty Smash' })
    vi.mocked(menuService.search).mockResolvedValue(page([]))
    await user.type(screen.getByLabelText(/search the menu/i), 'zzz')
    expect(await screen.findByText(/no dishes found/i)).toBeInTheDocument()
    expect(menuService.search).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'zzz' }), expect.anything())
  })

  it('shows French names on the French menu', async () => {
    renderRoutes(routes, ['/fr/menu'])
    expect(await screen.findByRole('heading', { name: 'Le Tasty Smash' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sandwichs', level: 2 })).toBeInTheDocument()
  })
})
