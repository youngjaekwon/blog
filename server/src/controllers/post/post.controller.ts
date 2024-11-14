import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import {
    PostCreateError,
    PostDatabaseError,
    PostDuplicateError,
    PostError,
    PostValidationError,
} from '@/errors/post/post.error'
import { Post } from '@/models/post/post.model'
import { PostService } from '@/services/post/post.service'
import { ApiResponse } from '@/types/common/response.types'
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ZodError } from 'zod'

export class PostController {
    constructor(private readonly postService: PostService) {}

    createPost = async (req: Request, res: Response<ApiResponse<Post>>) => {
        try {
            const postData: CreatePostDTO = req.body
            const post = await this.postService.create(postData)
            res.status(StatusCodes.CREATED).json({
                success: true,
                data: post,
            })
        } catch (error) {
            // Zod Validation Error
            if (error instanceof ZodError) {
                const validationError = new PostValidationError(error)
                return res.status(validationError.statusCode).json({
                    success: false,
                    error: validationError.toJSON(),
                })
            }

            // PostError
            if (error instanceof PostError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.toJSON(),
                })
            }

            // Prisma Errors
            if (error instanceof PrismaClientKnownRequestError) {
                // 유니크 제약조건 위반 (P2002)
                if (error.code === 'P2002') {
                    const duplicateError = new PostDuplicateError(
                        `Post with this ${(error.meta?.target as string[])?.join(', ')} already exists`
                    )
                    return res.status(duplicateError.statusCode).json({
                        success: false,
                        error: duplicateError.toJSON(),
                    })
                }
            }

            if (error instanceof PrismaClientInitializationError) {
                const dbError = new PostDatabaseError('Database connection failed')
                return res.status(dbError.statusCode).json({
                    success: false,
                    error: dbError.toJSON(),
                })
            }

            const unknownError = new PostCreateError('An unexpected error occurred')
            return res.status(unknownError.statusCode).json({
                success: false,
                error: unknownError.toJSON(),
            })
        }
    }

    retrievePost = async (req: Request, res: Response<ApiResponse<Post>>) => {
        const { id } = req.params
        const post = await this.postService.retrieve(id)
        res.status(StatusCodes.OK).json({
            success: true,
            data: post,
        })
    }
}
