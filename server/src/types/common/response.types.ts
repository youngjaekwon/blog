import { PaginatedResponse } from "@/types/common/pagination.types"

export interface ApiResponseType<T> {
    success: boolean
    data: T
    message?: string
}

export interface ApiErrorResponse {
    success: false
    error: {
        message: string
        errorCode: string
        errors?: { field: string; message: string }[]
    }
}

export type ApiResponse<T> = ApiResponseType<T> | ApiErrorResponse
export type ApiPaginatedResponse<T> = ApiResponseType<PaginatedResponse<T>>
