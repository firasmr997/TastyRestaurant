import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MenuEditPage from '@/pages/admin/MenuEditPage'
import { categoryService } from '@/services/categoryService'
import { menuService } from '@/services/menuService'
import { settingsService } from '@/services/settingsService'
import { categoryFixture, fullDishFixture, page, renderRoutes, settingsFixture } from '@/test/utils'

vi.mock('@/services/menuService')
vi.mock('@/services/categoryService')
vi.mock('@/services/settingsService')
vi.mock('@/services/imageService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/imageService')>()),
  imageService: { upload: vi.fn(), deleteUnused: vi.fn().mockResolvedValue(null) },
}))

const routes = [
  { path: '/admin/menu/new', element: <MenuEditPage /> },
  { path: '/admin/menu/:id', element: <MenuEditPage /> },
  { path: '/admin/menu', element: <h1>Menu list</h1> },
]

describe('Admin dish editor', () => {
  beforeEach(() => {
    vi.mocked(settingsService.get).mockResolvedValue(settingsFixture)
    vi.mocked(categoryService.adminList).mockResolvedValue(
      page([categoryFixture(), categoryFixture({ id: 2, name: 'Sandwiches', slug: 'sandwiches' })]),
    )
  })

  it('creates a dish with the entered details', async () => {
    vi.mocked(menuService.create).mockResolvedValue(fullDishFixture({ id: 41, name: 'Garden Melt', slug: 'garden-melt' }))
    const user = userEvent.setup()
    renderRoutes(routes, ['/admin/menu/new'])

    await user.type(await screen.findByRole('textbox', { name: /^name/i }), 'Garden Melt')
    await user.type(screen.getByRole('textbox', { name: /^description/i }), 'Halloumi, roasted peppers and pesto on sourdough.')
    await user.type(screen.getByRole('textbox', { name: /^price/i }), '12.50')
    await waitFor(() => expect(screen.getByRole('option', { name: 'Sandwiches' })).toBeInTheDocument())
    await user.selectOptions(screen.getByRole('combobox', { name: /^category/i }), '2')
    await user.click(screen.getByRole('switch', { name: /vegetarian/i }))
    await user.click(screen.getByRole('button', { name: /create dish/i }))

    await waitFor(() => expect(menuService.create).toHaveBeenCalledTimes(1))
    expect(vi.mocked(menuService.create).mock.calls[0][0]).toMatchObject({
      name: 'Garden Melt',
      price: 12.5,
      categoryId: 2,
      vegetarian: true,
      available: true,
    })
  })

  it('refuses to save an incomplete dish', async () => {
    const user = userEvent.setup()
    renderRoutes(routes, ['/admin/menu/new'])
    await user.click(await screen.findByRole('button', { name: /create dish/i }))
    expect(await screen.findByText(/give the dish a name/i)).toBeInTheDocument()
    expect(screen.getByText(/enter a price/i)).toBeInTheDocument()
    expect(screen.getByText('Choose a category.')).toBeInTheDocument()
    expect(menuService.create).not.toHaveBeenCalled()
  })

  it('edits an existing dish', async () => {
    vi.mocked(menuService.adminGet).mockResolvedValue(fullDishFixture())
    vi.mocked(menuService.update).mockImplementation(async (_id, input) => fullDishFixture({ price: input.price }))
    const user = userEvent.setup()
    renderRoutes(routes, ['/admin/menu/1'])

    const price = await screen.findByDisplayValue('14.50')
    await user.clear(price)
    await user.type(price, '15.00')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(menuService.update).toHaveBeenCalledWith(1, expect.objectContaining({ price: 15, name: 'The Tasty Smash' })))
  })

  it('deletes a dish after confirmation', async () => {
    vi.mocked(menuService.adminGet).mockResolvedValue(fullDishFixture())
    vi.mocked(menuService.remove).mockResolvedValue(null)
    const user = userEvent.setup()
    renderRoutes(routes, ['/admin/menu/1'])

    await screen.findByDisplayValue('The Tasty Smash')
    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/cannot be undone/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /delete dish/i }))

    await waitFor(() => expect(menuService.remove).toHaveBeenCalledWith(1))
    expect(await screen.findByRole('heading', { name: 'Menu list' })).toBeInTheDocument()
  })
})
