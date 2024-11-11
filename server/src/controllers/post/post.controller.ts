import { Request, Response } from 'express'
import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { PostService } from '@/services/post/post.service'
import { StatusCodes } from 'http-status-codes'
import {
    PostCreateError,
    PostDatabaseError,
    PostDuplicateError,
    PostError,
    PostValidationError,
} from '@/errors/post/post.error'
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { ZodError } from 'zod'

export class PostController {
    constructor(private readonly postService: PostService) {}

    createPost = async (req: Request, res: Response) => {
        try {
            const postData: CreatePostDTO = req.body
            const post = await this.postService.create(postData)
            res.status(StatusCodes.CREATED).json(post)
        } catch (error) {
            // Zod Validation Error
            if (error instanceof ZodError) {
                const validationError = new PostValidationError(error)
                return res.status(validationError.statusCode).json(validationError.toJSON())
            }

            // PostError
            if (error instanceof PostError) {
                return res.status(error.statusCode).json(error.toJSON())
            }

            // Prisma Errors
            if (error instanceof PrismaClientKnownRequestError) {
                // 유니크 제약조건 위반 (P2002)
                if (error.code === 'P2002') {
                    const duplicateError = new PostDuplicateError(
                        `Post with this ${(error.meta?.target as string[])?.join(', ')} already exists`
                    )
                    return res.status(duplicateError.statusCode).json(duplicateError.toJSON())
                }
            }

            if (error instanceof PrismaClientInitializationError) {
                const dbError = new PostDatabaseError('Database connection failed')
                return res.status(dbError.statusCode).json(dbError.toJSON())
            }

            const unknownError = new PostCreateError('An unexpected error occurred')
            return res.status(unknownError.statusCode).json(unknownError.toJSON())
        }
    }
}
