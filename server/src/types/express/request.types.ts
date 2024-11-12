import { Request } from 'express'
import { FindOptions } from '@/types/common/pagination.types'
export interface PaginatedRequest extends Request {
    query: {
        page?: string
        limit?: string
        sort?: string
        filter?: string
        include?: string
    }
}

export interface FindOptionsRequest extends Request {
    findOptions?: FindOptions
}