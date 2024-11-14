import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { UpdatePostDTO } from '@/dtos/post/post.update.dto'
import { Post } from '@/models/post/post.model'
import { PaginatedResponse } from '@/types/common/pagination.types'
import { FindManyArgs } from '@/types/common/repository.types'

export interface IPostRepository {
    findById(id: string, include?: Record<string, boolean>): Promise<Post | null>
    findAll(params?: FindManyArgs): Promise<PaginatedResponse<Post>>
    create(data: CreatePostDTO, include?: Record<string, boolean>): Promise<Post>
    update(id: string, data: UpdatePostDTO, include?: Record<string, boolean>): Promise<Post>
    delete(id: string): Promise<void>
}
