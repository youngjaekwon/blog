import postRouter from '@/routes/post/post.routes'
import { Router } from 'express'

const apiRouter = Router()

apiRouter.use('/posts', postRouter)

export default apiRouter
