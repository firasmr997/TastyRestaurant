import { adminApi, publicApi, unwrap } from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type { Settings, SettingsInput } from '@/types/models'

export const settingsService = {
  get(signal?: AbortSignal) {
    return unwrap(publicApi.get<ApiResponse<Settings>>('/settings', { signal }))
  },
  update(input: SettingsInput) {
    return unwrap(adminApi.put<ApiResponse<Settings>>('/settings', input))
  },
}
