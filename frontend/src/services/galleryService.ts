import { adminApi, publicApi, toParams, unwrap } from '@/api/client'
import type { ApiResponse, Page } from '@/types/api'
import type { GalleryImage, GalleryImageInput, GalleryQuery } from '@/types/models'

export const galleryService = {
  list(query: GalleryQuery = {}, signal?: AbortSignal) {
    return unwrap(publicApi.get<ApiResponse<Page<GalleryImage>>>('/gallery', { params: toParams(query), signal }))
  },
  adminList(query: GalleryQuery = {}, signal?: AbortSignal) {
    return unwrap(adminApi.get<ApiResponse<Page<GalleryImage>>>('/gallery', { params: toParams(query), signal }))
  },
  create(input: GalleryImageInput) {
    return unwrap(adminApi.post<ApiResponse<GalleryImage>>('/gallery', input))
  },
  update(id: number, input: GalleryImageInput) {
    return unwrap(adminApi.put<ApiResponse<GalleryImage>>(`/gallery/${id}`, input))
  },
  remove(id: number) {
    return unwrap(adminApi.delete<ApiResponse<null>>(`/gallery/${id}`))
  },
}
