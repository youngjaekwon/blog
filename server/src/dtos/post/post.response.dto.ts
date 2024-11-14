import { responsePostSchema } from '@/validators/post/post.schemas'
import { z } from 'zod'

export type ResponsePostDTO = z.infer<typeof responsePostSchema>

type ValidateDTO = {
    id: string
    title: string
    content: string
    tags: string[]
    createdAt: Date
    updatedAt: Date
    views: number
}
const _typeCheck: ValidateDTO = {} as ResponsePostDTO
