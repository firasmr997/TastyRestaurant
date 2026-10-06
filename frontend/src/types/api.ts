/** Response envelopes and shared shapes returned by the Tasty API. */

export interface ApiResponse<T> {
  success: true
  data: T
  message: string
}

export interface ApiFieldError {
  field: string
  message: string
}

export interface ApiErrorBody {
  success: false
  message: string
  errors: ApiFieldError[]
}

export interface Page<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface PageParams {
  page?: number
  size?: number
}
