import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { ResponsePostDTO } from '@/dtos/post/post.response.dto'
import { UpdatePostDTO } from '@/dtos/post/post.update.dto'
import { PaginatedResponse } from '@/types/common/pagination.types'
import { FindManyArgs } from '@/types/common/repository.types'

export interface IPostService {
    create(data: CreatePostDTO): Promise<ResponsePostDTO>

    retrieve(id: string): Promise<ResponsePostDTO>

    findAll(params?: FindManyArgs): Promise<PaginatedResponse<ResponsePostDTO>>

    update(id: string, data: UpdatePostDTO): Promise<ResponsePostDTO>

    delete(id: string): Promise<void>
}
