import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { PostNotFoundError } from '@/errors/post/post.error'
import { IPostRepository } from '@/repositories/post/post.interface'
import { createPostSchema } from '@/validators/post/post.schemas'

export class PostService {
    constructor(private readonly postRepository: IPostRepository) {}

    create = async (data: CreatePostDTO) => {
        const validatedData: CreatePostDTO = createPostSchema.parse(data) as CreatePostDTO
        return await this.postRepository.create(validatedData)
    }

    retrieve = async (id: string) => {
        const post = await this.postRepository.findById(id, { comments: true })

        if (!post) {
            throw new PostNotFoundError()
        }

        return post
    }
}
