import { Request, Response } from 'express'
import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { PostService } from '@/services/post/post.service'
import { StatusCodes } from 'http-status-codes'

export class PostController {
    constructor(private readonly postService: PostService) {}

    createPost = async (req: Request, res: Response) => {
        try {
            const postData: CreatePostDTO = req.body
            const post = await this.postService.create(postData)
            res.status(StatusCodes.CREATED).json(post)
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error creating post' })
        }
    }
}
