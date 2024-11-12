import { Prisma } from "@prisma/client"

export type SortOrder = 'asc' | 'desc'

type SortKeys = keyof Pick<
    Prisma.PostOrderByWithRelationInput,
    'id' | 'title' | 'content' | 'createdAt' | 'updatedAt' | 'views' | 'tags'
>

export interface PaginationOptions {
    page?: number
    limit?: number
    skip?: number
}

export const DEFAULT_PAGINATION: Required<PaginationOptions> = {
    page: 1,
    limit: 10,
    skip: 0
}

export interface FilterOperator {
    eq?: any
    ne?: any
    gt?: any
    gte?: any
    lt?: any
    lte?: any
    in?: any[]
    nin?: any[]
    regex?: string
    exists?: boolean
}

export interface FilterOptions {
    [key: string]: FilterOperator | any
}

export interface FindOptions {
    pagination?: PaginationOptions
    sort?: Partial<Record<SortKeys, SortOrder>>
    filter?: FilterOptions
    include?: string[]
}

export interface PaginatedResponse<T> {
    items: T[]
    meat: {
        total: number
        page: number
        limit: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
}