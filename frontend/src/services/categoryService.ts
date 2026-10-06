import { adminApi, publicApi, toParams, unwrap } from '@/api/client'
import type { ApiResponse, Page } from '@/types/api'
import type { Category, CategoryInput } from '@/types/models'

export interface CategoryQuery {
  q?: string
  active?: boolean
  page?: number
  size?: number
}

export const categoryService = {
  /** Active categories in display order, for the public menu. */
  listPublic(signal?: AbortSignal) {
    return unwrap(publicApi.get<ApiResponse<Page<Category>>>('/categories', { params: { size: 100 }, signal }))
  },
  getBySlug(slug: string, signal?: AbortSignal) {
    return unwrap(publicApi.get<ApiResponse<Category>>(`/categories/slug/${encodeURIComponent(slug)}`, { signal }))
  },

  adminList(query: CategoryQuery = {}, signal?: AbortSignal) {
    return unwrap(adminApi.get<ApiResponse<Page<Category>>>('/categories', { params: toParams(query), signal }))
  },
  create(input: CategoryInput) {
    return unwrap(adminApi.post<ApiResponse<Category>>('/categories', input))
  },
  update(id: number, input: CategoryInput) {
    return unwrap(adminApi.put<ApiResponse<Category>>(`/categories/${id}`, input))
  },
  /** Fails with 409 while dishes remain, unless `reassignTo` names the category that receives them. */
  remove(id: number, reassignTo?: number) {
    return unwrap(adminApi.delete<ApiResponse<null>>(`/categories/${id}`, { params: toParams({ reassignTo }) }))
  },
}
