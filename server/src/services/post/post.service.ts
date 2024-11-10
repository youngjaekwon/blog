import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { prisma } from '@/lib/prisma'
import { createPostSchema } from '@/validators/post/post.schemas'

export class PostService {
    create = async (data: CreatePostDTO) => {
        const validatedData = createPostSchema.parse(data)

        return prisma.post.create({
            data: {
                title: validatedData.title,
                content: validatedData.content,
                tags: validatedData.tags,
            },
        })
    }
}
