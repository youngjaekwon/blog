import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { PostCreateError } from '@/errors/post/post.error'
import { Post } from '@/models/post/post.model'
import { IPostService } from '@/services/post/post.interface'
import { ApiResponse } from '@/types/common/response.types'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

export class PostController {
    constructor(private readonly postService: IPostService) {}

    createPost = async (req: Request, res: Response<ApiResponse<Post>>) => {
        try {
            const postData: CreatePostDTO = req.body
            const post = await this.postService.create(postData)
            res.status(StatusCodes.CREATED).json({
                success: true,
                data: post,
            })
        } catch (error) {
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
