export type SortOrder = 'asc' | 'desc'

export interface WhereOptions {
    [key: string]: WhereOperators | any
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

export interface FindManyArgs {
    where?: WhereOptions
    orderBy?: Record<string, SortOrder>
    include?: Record<string, boolean>
    skip?: number
    take?: number
}

export interface CountArgs {
    where?: WhereOptions
}

export interface RepositoryDelegate<TModel, TCreateDTO, TUpdateDTO> {
    findUnique: (args: FindOneArgs) => Promise<TModel | null>
    findMany: (args: FindManyArgs) => Promise<TModel[]>
    create: (args: CreateArgs<TCreateDTO>) => Promise<TModel>
    update: (args: UpdateArgs<TUpdateDTO>) => Promise<TModel>
    delete: (args: DeleteArgs) => Promise<TModel>
    count: (args: CountArgs) => Promise<number>
}
