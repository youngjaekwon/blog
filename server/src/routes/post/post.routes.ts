import { PostController } from '@/controllers/post/post.controller'
import { postRepository } from '@/repositories/post/post.repository'
import { PostService } from '@/services/post/post.service'
import { Router } from 'express'

export const postRouter = Router()

const postService = new PostService(postRepository)
const postController = new PostController(postService)

postRouter.post('/', postController.createPost)

export default postRouter
