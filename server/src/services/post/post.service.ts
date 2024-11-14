import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { NotFoundError } from '@/errors/common/database.error'
import { IPostRepository } from '@/repositories/post/post.interface'
import { IPostService } from '@/services/post/post.interface'
import { responsePostSchema } from '@/validators/post/post.schemas'

export class PostService implements IPostService {
    constructor(private readonly postRepository: IPostRepository) {}

    create = async (data: CreatePostDTO) => {
        const post = await this.postRepository.create(data)
        return responsePostSchema.parse(post)
    }

    retrieve = async (id: string) => {
        const post = await this.postRepository.findById(id, { comments: true })

        if (!post) {
            throw new NotFoundError()
        }

        return responsePostSchema.parse(post)
    }

    findAll = async (params?: any) => {
        const result = await this.postRepository.findAll(params)
        return {
            items: result.items.map((item) => responsePostSchema.parse(item)),
            meta: result.meta,
        }
    }

    update = async (id: string, data: any) => {
        const post = await this.postRepository.update(id, data)
        return responsePostSchema.parse(post)
    }

    delete = async (id: string) => {
        return await this.postRepository.delete(id)
    }
}
