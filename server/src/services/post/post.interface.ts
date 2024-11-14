import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { UpdatePostDTO } from '@/dtos/post/post.update.dto'
import { Post } from '@/models/post/post.model'
import { PaginatedResponse } from '@/types/common/pagination.types'
import { FindManyArgs } from '@/types/common/repository.types'

export interface IPostService {
    create(data: CreatePostDTO): Promise<Post>

    retrieve(id: string): Promise<Post>

    findAll(params?: FindManyArgs): Promise<PaginatedResponse<Post>>

    update(id: string, data: UpdatePostDTO): Promise<Post>

    delete(id: string): Promise<void>
}
