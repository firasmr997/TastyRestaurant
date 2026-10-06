import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CategoriesPage from '@/pages/admin/CategoriesPage'
import { categoryService } from '@/services/categoryService'
import { settingsService } from '@/services/settingsService'
import { categoryFixture, page, renderRoutes, settingsFixture } from '@/test/utils'

vi.mock('@/services/categoryService')
vi.mock('@/services/settingsService')

describe('Admin categories', () => {
  beforeEach(() => {
    vi.mocked(settingsService.get).mockResolvedValue(settingsFixture)
    vi.mocked(categoryService.adminList).mockResolvedValue(
      page([categoryFixture(), categoryFixture({ id: 2, name: 'Salads', slug: 'salads', itemCount: 0 })]),
    )
  })

  it('creates a category from the modal form', async () => {
    vi.mocked(categoryService.create).mockResolvedValue(categoryFixture({ id: 9, name: 'Breakfast', slug: 'breakfast', itemCount: 0 }))
    const user = userEvent.setup()
    renderRoutes([{ path: '/admin/categories', element: <CategoriesPage /> }], ['/admin/categories'])

    await screen.findByText('Salads')
    await user.click(screen.getByRole('button', { name: /add category/i }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText(/^name/i), 'Breakfast')
    await user.clear(within(dialog).getByLabelText(/display order/i))
    await user.type(within(dialog).getByLabelText(/display order/i), '9')
    await user.click(within(dialog).getByRole('button', { name: /create category/i }))

    await waitFor(() =>
      expect(categoryService.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Breakfast', displayOrder: 9, active: true })),
    )
  })

  it('requires a target category before deleting one that still has dishes', async () => {
    vi.mocked(categoryService.remove).mockResolvedValue(null)
    const user = userEvent.setup()
    renderRoutes([{ path: '/admin/categories', element: <CategoriesPage /> }], ['/admin/categories'])

    await user.click(await screen.findByRole('button', { name: /delete burgers/i }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/2 dishes belong to this category/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /move dishes & delete/i }))
    expect(categoryService.remove).not.toHaveBeenCalled()

    await user.selectOptions(within(dialog).getByLabelText(/move the dishes to/i), '2')
    await user.click(within(dialog).getByRole('button', { name: /move dishes & delete/i }))
    await waitFor(() => expect(categoryService.remove).toHaveBeenCalledWith(1, 2))
  })
})
