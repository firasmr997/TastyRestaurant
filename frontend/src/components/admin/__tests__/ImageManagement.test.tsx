import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GalleryManager } from '@/components/admin/GalleryManager'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { ToastProvider } from '@/components/ui/Toast'
import { galleryService } from '@/services/galleryService'
import { imageService } from '@/services/imageService'
import { settingsService } from '@/services/settingsService'
import type { GalleryImage, ImageRef } from '@/types'
import { page, renderRoutes, settingsFixture } from '@/test/utils'

vi.mock('@/services/galleryService')
vi.mock('@/services/settingsService')
vi.mock('@/services/menuService')
vi.mock('@/services/imageService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/imageService')>()),
  imageService: { upload: vi.fn(), deleteUnused: vi.fn().mockResolvedValue(null) },
}))

function UploaderHarness({ onChange }: { onChange: (value: ImageRef | null) => void }) {
  const [value, setValue] = useState<ImageRef | null>(null)
  return (
    <ToastProvider>
      <ImageUploader
        label="Main photo"
        folder="menu"
        value={value}
        onChange={(next) => {
          setValue(next)
          onChange(next)
        }}
      />
    </ToastProvider>
  )
}

const photo: GalleryImage = {
  id: 7,
  title: 'The bar after dark',
  titleFr: 'Le bar à la nuit tombée',
  description: null,
  descriptionFr: null,
  imageUrl: '/uploads/restaurant/abc.webp',
  storageKey: 'restaurant/abc.webp',
  altText: 'Bar',
  category: 'BAR',
  group: 'RESTAURANT',
  displayOrder: 0,
  featured: true,
  menuItem: null,
  createdAt: '2026-10-01T10:00:00Z',
  updatedAt: '2026-10-01T10:00:00Z',
  createdBy: 'seed',
  updatedBy: 'seed',
}

describe('Image management', () => {
  beforeEach(() => {
    vi.mocked(settingsService.get).mockResolvedValue(settingsFixture)
  })

  it('uploads a valid image and shows its preview', async () => {
    vi.mocked(imageService.upload).mockResolvedValue({ url: '/uploads/menu/new.webp', storageKey: 'menu/new.webp', contentType: 'image/webp', size: 2048 })
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<UploaderHarness onChange={onChange} />)

    const file = new File([new Uint8Array([1, 2, 3])], 'burger.webp', { type: 'image/webp' })
    await user.upload(screen.getByLabelText('Main photo'), file)

    await waitFor(() => expect(imageService.upload).toHaveBeenCalledWith(file, 'menu', expect.any(Function)))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ url: '/uploads/menu/new.webp', storageKey: 'menu/new.webp' }))
    expect(await screen.findByRole('button', { name: /replace/i })).toBeInTheDocument()
  })

  it('rejects unsupported files before uploading', async () => {
    const user = userEvent.setup({ applyAccept: false })
    render(<UploaderHarness onChange={vi.fn()} />)
    const file = new File(['%PDF'], 'menu.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByLabelText('Main photo'), file)
    expect((await screen.findAllByText(/use a jpg, png, webp or avif image/i)).length).toBeGreaterThan(0)
    expect(imageService.upload).not.toHaveBeenCalled()
  })

  it('deletes a gallery photo after confirmation', async () => {
    vi.mocked(galleryService.adminList).mockResolvedValue(page([photo]))
    vi.mocked(galleryService.remove).mockResolvedValue(null)
    const user = userEvent.setup()
    renderRoutes([{ path: '/admin/restaurant-gallery', element: <GalleryManager group="RESTAURANT" /> }], ['/admin/restaurant-gallery'])

    await user.click(await screen.findByRole('button', { name: /delete the bar after dark/i }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /delete photo/i }))
    await waitFor(() => expect(galleryService.remove).toHaveBeenCalledWith(7))
  })
})
