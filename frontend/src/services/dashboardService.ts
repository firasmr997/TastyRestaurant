import { adminApi, unwrap } from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type { Dashboard } from '@/types/models'

export const dashboardService = {
  get(signal?: AbortSignal) {
    return unwrap(adminApi.get<ApiResponse<Dashboard>>('/dashboard', { signal }))
  },
}
