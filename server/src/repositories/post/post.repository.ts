import { Prisma, PrismaClient, Post as PrismaPost, Comment as PrismaComment } from "@prisma/client"
import { BaseRepository } from "../base/base.repository"
import { Post } from "@/models/post/post.model"
import { Comment } from "@/models/comment/comment.model"
import { CreatePostDTO } from "@/dtos/post/post.create.dto"
import { UpdatePostDTO } from "@/dtos/post/post.update.dto"

export class PostRepository extends BaseRepository<
    Post,
    CreatePostDTO,
    UpdatePostDTO,
    Prisma.PostWhereInput,
    Prisma.PostOrderByWithRelationInput,
    PrismaPost & { comments: PrismaComment[] }
> {
    constructor(prisma: PrismaClient) {
        super(prisma, prisma.post)
    }

    protected mapToDomain(prismaPost: PrismaPost & { comments: PrismaComment[] }): Post {
        return {
            id: prismaPost.id,
            title: prismaPost.title,
            content: prismaPost.content,
            createdAt: prismaPost.createdAt,
            updatedAt: prismaPost.updatedAt,
            views: prismaPost.views,
            tags: prismaPost.tags ?? [],
            comments: prismaPost.comments.map(this.mapCommentToDomain)
        }
    }

    private mapCommentToDomain(prismaComment: PrismaComment): Comment {
        return {
            id: prismaComment.id,
            content: prismaComment.content,
            author: prismaComment.author ?? undefined,
            isAnonymous: prismaComment.isAnonymous,
            postId: prismaComment.postId,
            createdAt: prismaComment.createdAt,
            updatedAt: prismaComment.updatedAt
        }
    }

    protected getIncludeRelations() {
        return { comments: true }
    }

    protected isValidWhereKey(key: string): key is keyof Prisma.PostWhereInput {
        return [
            'id',
            'title',
            'content',
            'createdAt',
            'updatedAt',
            'views',
            'tags'
        ].includes(key)
    }

    protected buildWhereClause(filter: Record<string, any>): Prisma.PostWhereInput {
        const where: Prisma.PostWhereInput = {}

        Object.entries(filter).forEach(([key, value]) => {
            if (!this.isValidWhereKey(key)) return

            if (key === 'id') {
                if (typeof value === 'string' && this.isValidObjectId(value)) {
                    where.id = value
                }
            } else if (typeof value === 'object' && !Array.isArray(value)) {
                this.handleFilterOperators(key, value, where)
            } else {
                this.handleDirectValue(key, value, where)
            }
        })

        return where
    }

    protected buildOrderByClause(
        sort: Record<string, string>
    ): Prisma.PostOrderByWithRelationInput {
        return Object.entries(sort).reduce((acc, [key, value]) => {
            if (this.isValidWhereKey(key)) {
                return {
                    ...acc,
                    [key]: value === 'desc' ? 'desc' : 'asc'
                }
            }
            return acc
        }, {} as Prisma.PostOrderByWithRelationInput)
    }

    private handleFilterOperators(
        key: keyof Prisma.PostWhereInput,
        filterOp: Record<string, any>,
        where: Prisma.PostWhereInput
    ) {
        switch(key) {
            case 'title':
            case 'content':
                if (filterOp.$regex) {
                    where[key] = { contains: filterOp.$regex as string }
                }
                break;
            case 'views':
                this.handleNumberOperators(key, filterOp, where)
                break;
            case 'createdAt':
            case 'updatedAt':
                this.handleDateOperators(key, filterOp, where)
                break;
            case 'tags':
                if (Array.isArray(filterOp.$in)) {
                    where.tags = { hasEvery: filterOp.$in }
                }
                break;
        }
    }

    private handleNumberOperators(
        key: 'views',
        filterOp: Record<string, any>,
        where: Prisma.PostWhereInput
    ) {
        if (filterOp.$gt !== undefined) where[key] = { gt: filterOp.$gt as number }
        if (filterOp.$gte !== undefined) where[key] = { gte: filterOp.$gte as number }
        if (filterOp.$lt !== undefined) where[key] = { lt: filterOp.$lt as number }
        if (filterOp.$lte !== undefined) where[key] = { lte: filterOp.$lte as number }
    }

    private handleDateOperators(
        key: 'createdAt' | 'updatedAt',
        filterOp: Record<string, any>,
        where: Prisma.PostWhereInput
    ) {
        if (filterOp.$gt !== undefined) where[key] = { gt: new Date(filterOp.$gt) }
        if (filterOp.$gte !== undefined) where[key] = { gte: new Date(filterOp.$gte) }
        if (filterOp.$lt !== undefined) where[key] = { lt: new Date(filterOp.$lt) }
        if (filterOp.$lte !== undefined) where[key] = { lte: new Date(filterOp.$lte) }
    }

    private handleDirectValue(
        key: keyof Prisma.PostWhereInput,
        value: any,
        where: Prisma.PostWhereInput
    ) {
        switch(key) {
            case 'title':
            case 'content':
                if (typeof value === 'string') where[key] = value
                break;
            case 'views':
                if (typeof value === 'number') where[key] = value
                break;
            case 'createdAt':
            case 'updatedAt':
                if (value instanceof Date) where[key] = value
                break;
            case 'tags':
                if (Array.isArray(value)) where.tags = { equals: value }
                break;
        }
    }
}