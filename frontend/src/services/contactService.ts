import { publicApi, unwrap } from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type { ContactInput } from '@/types/models'

export const contactService = {
  submit(input: ContactInput) {
    return unwrap(publicApi.post<ApiResponse<null>>('/contact', input))
  },
}
