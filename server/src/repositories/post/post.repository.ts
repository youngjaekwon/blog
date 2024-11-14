import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { UpdatePostDTO } from '@/dtos/post/post.update.dto'
import { BaseDelegate, BaseRepository } from '@/repositories/base/base.repository'
import { RepositoryDelegate } from '@/types/common/repository.types'
import { Post, Prisma, PrismaClient } from '@prisma/client'

export class PrismaPostDelegate extends BaseDelegate implements RepositoryDelegate<Post, CreatePostDTO, UpdatePostDTO> {
    constructor(private prismaDelegate: Prisma.PostDelegate) {
        super()
    }

    async findUnique(args: any) {
        return this.executeQuery(() => this.prismaDelegate.findUnique(args))
    }

    async findMany(args: any) {
        return this.executeQuery(() => this.prismaDelegate.findMany(args))
    }

    async create(args: any) {
        return this.executeQuery(() => this.prismaDelegate.create(args))
    }

    async update(args: any) {
        return this.executeQuery(() => this.prismaDelegate.update(args))
    }

    async delete(args: any) {
        return this.executeQuery(() => this.prismaDelegate.delete(args))
    }

    async count(args: any) {
        return this.executeQuery(() => this.prismaDelegate.count(args))
    }
}

const prisma = new PrismaClient()
export const postRepository = new BaseRepository<Post, CreatePostDTO, UpdatePostDTO>(
    new PrismaPostDelegate(prisma.post)
)
