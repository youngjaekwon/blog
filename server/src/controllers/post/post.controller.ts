import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { ResponsePostDTO } from '@/dtos/post/post.response.dto'
import { UpdatePostDTO } from '@/dtos/post/post.update.dto'
import { PostCreateError, PostDeleteError, PostRetrieveError, PostUpdateError } from '@/errors/post/post.error'
import { IPostService } from '@/services/post/post.interface'
import { PaginatedResponse } from '@/types/common/pagination.types'
import { ApiResponse } from '@/types/common/response.types'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

export class PostController {
    constructor(private readonly postService: IPostService) {}

    createPost = async (req: Request, res: Response<ApiResponse<ResponsePostDTO>>) => {
        try {
            const postData: CreatePostDTO = req.body
            const post: ResponsePostDTO = await this.postService.create(postData)
            res.status(StatusCodes.CREATED).json({
                success: true,
                data: post,
            })
        } catch (error) {
            throw new PostCreateError()
        }
    }

    retrievePost = async (req: Request, res: Response<ApiResponse<ResponsePostDTO>>) => {
        try {
            const { id } = req.params
            const post: ResponsePostDTO = await this.postService.retrieve(id)
            res.status(StatusCodes.OK).json({
                success: true,
                data: post,
            })
        } catch (error) {
            throw new PostRetrieveError()
        }
    }

    retrievePosts = async (req: Request, res: Response<ApiResponse<PaginatedResponse<ResponsePostDTO>>>) => {
        try {
            const posts = await this.postService.findAll()
            res.status(StatusCodes.OK).json({
                success: true,
                data: posts,
            })
        } catch (error) {
            throw new PostRetrieveError()
        }
    }

    updatePost = async (req: Request, res: Response<ApiResponse<ResponsePostDTO>>) => {
        try {
            const { id } = req.params
            const postData: UpdatePostDTO = req.body
            const post: ResponsePostDTO = await this.postService.update(id, postData)
            res.status(StatusCodes.OK).json({
                success: true,
                data: post,
            })
        } catch (error) {
            throw new PostUpdateError()
        }
    }

    deletePost = async (req: Request, res: Response<ApiResponse<null>>) => {
        try {
            const { id } = req.params
            await this.postService.delete(id)
            res.status(StatusCodes.NO_CONTENT).json({
                success: true,
                data: null,
            })
        } catch (error) {
            throw new PostDeleteError()
        }
    }
}
