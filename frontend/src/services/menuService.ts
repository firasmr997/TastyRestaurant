import { adminApi, publicApi, toParams, unwrap } from '@/api/client'
import type { ApiResponse, Page } from '@/types/api'
import type { MenuItem, MenuItemInput, MenuItemSummary, MenuQuery } from '@/types/models'

export const menuService = {
  /** Public menu: only dishes from active categories. */
  search(query: MenuQuery = {}, signal?: AbortSignal) {
    return unwrap(publicApi.get<ApiResponse<Page<MenuItemSummary>>>('/menu', { params: toParams(query), signal }))
  },
  getBySlug(slug: string, signal?: AbortSignal) {
    return unwrap(publicApi.get<ApiResponse<MenuItem>>(`/menu/slug/${encodeURIComponent(slug)}`, { signal }))
  },

  /** Admin listing: includes dishes from hidden categories. */
  adminSearch(query: MenuQuery = {}, signal?: AbortSignal) {
    return unwrap(adminApi.get<ApiResponse<Page<MenuItemSummary>>>('/menu', { params: toParams(query), signal }))
  },
  adminGet(id: number, signal?: AbortSignal) {
    return unwrap(adminApi.get<ApiResponse<MenuItem>>(`/menu/${id}`, { signal }))
  },
  create(input: MenuItemInput) {
    return unwrap(adminApi.post<ApiResponse<MenuItem>>('/menu', input))
  },
  update(id: number, input: MenuItemInput) {
    return unwrap(adminApi.put<ApiResponse<MenuItem>>(`/menu/${id}`, input))
  },
  updateStatus(id: number, patch: { available?: boolean; featured?: boolean }) {
    return unwrap(adminApi.patch<ApiResponse<MenuItemSummary>>(`/menu/${id}/status`, patch))
  },
  remove(id: number) {
    return unwrap(adminApi.delete<ApiResponse<null>>(`/menu/${id}`))
  },
}
