import { z } from 'zod'
import { createPostSchema } from '@/validators/post/post.schemas'

export type CreatePostDTO = z.infer<typeof createPostSchema>

type ValidateDTO = {
    title: string
    content: string
    tags?: string[]
}
const _typeCheck: ValidateDTO = {} as CreatePostDTO
