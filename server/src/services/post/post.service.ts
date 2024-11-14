import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { NotFoundError } from '@/errors/common/database.error'
import { IPostRepository } from '@/repositories/post/post.interface'
import { IPostService } from '@/services/post/post.interface'
import { createPostSchema } from '@/validators/post/post.schemas'

export class PostService implements IPostService {
    constructor(private readonly postRepository: IPostRepository) {}

    create = async (data: CreatePostDTO) => {
        const validatedData: CreatePostDTO = createPostSchema.parse(data) as CreatePostDTO
        return await this.postRepository.create(validatedData)
    }

    retrieve = async (id: string) => {
        const post = await this.postRepository.findById(id, { comments: true })

        if (!post) {
            throw new NotFoundError()
        }

        return post
    }

    findAll = async (params?: any) => {
        throw new Error('Method not implemented.')
    }

    update = async (id: string, data: any) => {
        throw new Error('Method not implemented.')
    }

    delete = async (id: string) => {
        throw new Error('Method not implemented.')
    }
}
