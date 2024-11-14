import { DatabaseError, DuplicateError } from '@/errors/common/database.error'
import { DEFAULT_PAGINATION, PaginatedResponse } from '@/types/common/pagination.types'
import { FindManyArgs, RepositoryDelegate } from '@/types/common/repository.types'
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export abstract class BaseDelegate {
    protected async executeQuery<T>(query: () => Promise<T>): Promise<T> {
        try {
            return await query()
        } catch (error) {
            if (error instanceof PrismaClientInitializationError) {
                throw new DatabaseError('Database connection failed')
            }
            if (error instanceof PrismaClientKnownRequestError) {
                // 유니크 제약조건 위반 (P2002)
                if (error.code === 'P2002') {
                    throw new DuplicateError()
                }
            }
            throw error
        }
    }
}

export class BaseRepository<TModel, TCreateDTO, TUpdateDTO> {
    constructor(protected delegate: RepositoryDelegate<TModel, TCreateDTO, TUpdateDTO>) {}

    async findById(id: string, include?: Record<string, boolean>): Promise<TModel | null> {
        return this.delegate.findUnique({
            where: { id },
            include,
        })
    }

    async findAll(params?: FindManyArgs): Promise<PaginatedResponse<TModel>> {
        const args = params ?? {}
        const pagination = {
            page: args?.skip
                ? Math.floor(args.skip / (args.take || DEFAULT_PAGINATION.limit)) + 1
                : DEFAULT_PAGINATION.page,
            limit: args?.take || DEFAULT_PAGINATION.limit,
        }

        const [items, total] = await Promise.all([
            this.delegate.findMany(args),
            this.delegate.count({ where: args?.where }),
        ])

        const totalPages = Math.ceil(total / pagination.limit)

        return {
            items,
            meta: {
                total,
                page: pagination.page,
                limit: pagination.limit,
                totalPages,
                hasNext: pagination.page < totalPages,
                hasPrev: pagination.page > 1,
            },
        }
    }

    async create(data: TCreateDTO, include?: Record<string, boolean>): Promise<TModel> {
        return this.delegate.create({ data, include })
    }

    async update(id: string, data: TUpdateDTO, include?: Record<string, boolean>): Promise<TModel> {
        return this.delegate.update({
            where: { id },
            data,
            include,
        })
    }

    async delete(id: string): Promise<void> {
        await this.delegate.delete({
            where: { id },
        })
    }
}
