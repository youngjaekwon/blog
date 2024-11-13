// src/types/common/repository.types.ts
export type SortOrder = 'asc' | 'desc'

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

/**
 * Prisma style where clause operators
 */
export interface WhereOperators {
    equals?: any
    not?: any
    gt?: any
    gte?: any
    lt?: any
    lte?: any
    in?: any[]
    notIn?: any[]
    contains?: string
    startsWith?: string
    endsWith?: string
    // MongoDB style operators도 지원
    $eq?: any
    $ne?: any
    $gt?: any
    $gte?: any
    $lt?: any
    $lte?: any
    $in?: any[]
    $nin?: any[]
    $regex?: string
    $exists?: boolean
}

export interface WhereOptions {
    [key: string]: WhereOperators | any
}

export interface FindManyArgs {
    where?: WhereOptions
    orderBy?: Record<string, SortOrder>
    include?: Record<string, boolean>
    skip?: number
    take?: number
}

export interface FindOneArgs {
    where: WhereOptions
    include?: Record<string, boolean>
}

export interface CreateArgs<TCreateDTO> {
    data: TCreateDTO
    include?: Record<string, boolean>
}

export interface UpdateArgs<TUpdateDTO> {
    where: WhereOptions
    data: TUpdateDTO
    include?: Record<string, boolean>
}

export interface DeleteArgs {
    where: WhereOptions
}

export interface CountArgs {
    where?: WhereOptions
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

export interface RepositoryDelegate<TModel, TCreateDTO, TUpdateDTO> {
    findUnique: (args: FindOneArgs) => Promise<TModel | null>
    findMany: (args: FindManyArgs) => Promise<TModel[]>
    create: (args: CreateArgs<TCreateDTO>) => Promise<TModel>
    update: (args: UpdateArgs<TUpdateDTO>) => Promise<TModel>
    delete: (args: DeleteArgs) => Promise<TModel>
    count: (args: CountArgs) => Promise<number>
}
