import { adminApi, unwrap } from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type { StorageFolder, UploadResult } from '@/types/models'

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024

/** Client-side pre-check; the server validates type, extension and file signature again. */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'Use a JPG, PNG, WebP or AVIF image.'
  if (file.size > MAX_IMAGE_BYTES) return 'This image is larger than 8 MB.'
  return null
}

export const imageService = {
  upload(file: File, folder: StorageFolder, onProgress?: (percent: number) => void) {
    const form = new FormData()
    form.append('file', file)
    return unwrap(
      adminApi.post<ApiResponse<UploadResult>>('/images', form, {
        params: { folder },
        onUploadProgress: (event) => {
          if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100))
        },
      }),
    )
  },
  /** Removes an upload that was never saved on a dish or photo (e.g. a cancelled form). */
  deleteUnused(storageKey: string) {
    return unwrap(adminApi.delete<ApiResponse<null>>('/images', { params: { key: storageKey } }))
  },
}
