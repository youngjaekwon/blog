import { PostController } from '@/controllers/post/post.controller'
import { validateSchema } from '@/middleware/common/zod.middleware'
import { postRepository } from '@/repositories/post/post.repository'
import { PostService } from '@/services/post/post.service'
import { paginationSchema } from '@/validators/common/pagination.schemas'
import { createPostSchema, updatePostSchema } from '@/validators/post/post.schemas'
import { Router } from 'express'

export const postRouter = Router()

const postService = new PostService(postRepository)
const postController = new PostController(postService)

postRouter.get('/', validateSchema(paginationSchema, 'query'), postController.retrievePosts)
postRouter.post('/', validateSchema(createPostSchema, 'body'), postController.createPost)
postRouter.get('/:id', postController.retrievePost)
postRouter.patch('/:id', validateSchema(updatePostSchema, 'body'), postController.updatePost)
postRouter.delete('/:id', postController.deletePost)

export default postRouter
