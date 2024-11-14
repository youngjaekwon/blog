export interface PaginationOptions {
    page?: number
    limit?: number
    skip?: number
}

export const DEFAULT_PAGINATION: Required<PaginationOptions> = {
    page: 1,
    limit: 10,
    skip: 0,
}

export interface PaginatedResponse<T> {
    items: T[]
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
}
