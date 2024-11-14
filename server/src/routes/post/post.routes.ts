import { PostController } from '@/controllers/post/post.controller'
import { validateSchema } from '@/middleware/common/zod.middleware'
import { postRepository } from '@/repositories/post/post.repository'
import { PostService } from '@/services/post/post.service'
import { createPostSchema } from '@/validators/post/post.schemas'
import { Router } from 'express'

export const postRouter = Router()

const postService = new PostService(postRepository)
const postController = new PostController(postService)

postRouter.get('/', postController.retrievePosts)
postRouter.post('/', validateSchema(createPostSchema), postController.createPost)
postRouter.get('/:id', postController.retrievePost)

export default postRouter
