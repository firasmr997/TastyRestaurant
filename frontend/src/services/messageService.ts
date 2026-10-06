import { adminApi, toParams, unwrap } from '@/api/client'
import type { ApiResponse, Page } from '@/types/api'
import type { ContactMessage, MessageStatus, UnreadSummary } from '@/types/models'

export interface MessageQuery {
  status?: MessageStatus
  q?: string
  page?: number
  size?: number
}

export const messageService = {
  list(query: MessageQuery = {}, signal?: AbortSignal) {
    return unwrap(adminApi.get<ApiResponse<Page<ContactMessage>>>('/messages', { params: toParams(query), signal }))
  },
  get(id: number, signal?: AbortSignal) {
    return unwrap(adminApi.get<ApiResponse<ContactMessage>>(`/messages/${id}`, { signal }))
  },
  unread(signal?: AbortSignal) {
    return unwrap(adminApi.get<ApiResponse<UnreadSummary>>('/messages/unread', { signal }))
  },
  markRead(id: number) {
    return unwrap(adminApi.put<ApiResponse<ContactMessage>>(`/messages/${id}/read`))
  },
  markUnread(id: number) {
    return unwrap(adminApi.put<ApiResponse<ContactMessage>>(`/messages/${id}/unread`))
  },
  archive(id: number) {
    return unwrap(adminApi.put<ApiResponse<ContactMessage>>(`/messages/${id}/archive`))
  },
  remove(id: number) {
    return unwrap(adminApi.delete<ApiResponse<null>>(`/messages/${id}`))
  },
}
