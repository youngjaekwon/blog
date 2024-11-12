import { PrismaClient } from "@prisma/client"
import { DEFAULT_PAGINATION, FindOptions } from "@/types/common/pagination.types"

export abstract class BaseRepository<
    T extends { id: string },
    TCreateDTO,
    TUpdateDTO,
    TWhereInput,
    TOrderByInput,
    TPrismaModel
> {
    constructor(
        protected readonly prisma: PrismaClient,
        protected readonly model: any
    ) {}

    protected abstract mapToDomain(prismaModel: TPrismaModel): T

    protected abstract getIncludeRelations(): object

    async findById(id: string): Promise<T | null> {
        if (!this.isValidObjectId(id)) return null

        const result = await this.model.findUnique({
            where: { id },
            include: this.getIncludeRelations()
        }) as TPrismaModel | null

        return result ? this.mapToDomain(result) : null
    }

    async create(data: TCreateDTO): Promise<T> {
        const result = await this.model.create({
            data,
            include: this.getIncludeRelations()
        }) as TPrismaModel

        return this.mapToDomain(result)
    }

    async update(id: string, data: TUpdateDTO): Promise<T> {
        if (!this.isValidObjectId(id)) {
            throw new Error('Invalid Id format')
        }

        const result = await this.model.update({
            where: { id },
            data,
            include: this.getIncludeRelations()
        }) as TPrismaModel

        return this.mapToDomain(result)
    }

    async delete(id: string): Promise<void> {
        if (!this.isValidObjectId(id)) {
            throw new Error('Invalid Id format')
        }

        await this.model.delete({
            where: { id }
        })
    }

    async findAll(options: FindOptions): Promise<{ items: T[]; total: number }> {
        const {
            pagination = DEFAULT_PAGINATION,
            sort = { createdAt: 'desc' },
            filter = {}
        } = options

        const validatedPagination = {
            page: Math.max(1, pagination.page ?? DEFAULT_PAGINATION.page),
            limit: Math.min(100, Math.max(1, pagination.limit ?? DEFAULT_PAGINATION.limit)),
            skip: pagination.skip ?? DEFAULT_PAGINATION.skip
        }

        const where = this.buildWhereClause(filter)
        const skip = (validatedPagination.page - 1) * validatedPagination.limit
        const take = validatedPagination.limit

        const [items, total] = await Promise.all([
            this.model.findMany({
                where,
                skip,
                take,
                orderBy: this.buildOrderByClause(sort),
                include: this.getIncludeRelations()
            }),
            this.model.count({ where })
        ])

        return {
            items: items.map((item: TPrismaModel) => this.mapToDomain(item)),
            total
        }
    }

    protected abstract buildWhereClause(filter: Record<string, any>): TWhereInput

    protected abstract buildOrderByClause(sort: Record<string, string>): TOrderByInput

    protected isValidObjectId(id: string): boolean {
        return /^[0-9a-fA-F]{24}$/.test(id)
    }
}