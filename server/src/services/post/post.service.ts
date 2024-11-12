import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { prisma } from '@/lib/prisma'
import { IPostRepository } from '@/repositories/post/post.interface'
import { createPostSchema } from '@/validators/post/post.schemas'

export class PostService {
    constructor(
        private readonly postRepository: IPostRepository
    ) {}
    create = async (data: CreatePostDTO) => {
        const validatedData: CreatePostDTO = createPostSchema.parse(data) as CreatePostDTO
        return this.postRepository.create(validatedData)
    }
}
