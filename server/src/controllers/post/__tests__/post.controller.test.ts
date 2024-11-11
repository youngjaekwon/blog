import { PostController } from "@/controllers/post/post.controller"
import { CreatePostDTO } from "@/dtos/post/post.create.dto"
import { PostService } from "@/services/post/post.service"
import { Request, Response } from 'express'
import { StatusCodes } from "http-status-codes"

jest.mock('@/services/post/post.service')

describe('PostController', () => {
    let postController: PostController
    let mockRequest: Partial<Request>
    let mockResponse: Partial<Response>
    let mockPostService: jest.Mocked<PostService>

    beforeEach(() => {
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }

        mockRequest = {}

        mockPostService = new PostService() as jest.Mocked<PostService>
        PostService.prototype.create = jest.fn()

        postController = new PostController()
    })

    describe('createPost', () => {
        const mockPostData: CreatePostDTO = {
            title: 'Test Post',
            content: 'Test Content'
        }

        it('should create a post successfully', async () => {
            // Given
            const mockCreatedPost = { id: 1, ...mockPostData }
            mockRequest.body = mockPostData
                ; (PostService.prototype.create as jest.Mock).mockResolvedValue(mockCreatedPost)

            // When
            await postController.createPost(
                mockRequest as Request,
                mockResponse as Response
            )

            // Then
            expect(PostService.prototype.create).toHaveBeenCalledWith(mockPostData)
            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.CREATED)
            expect(mockResponse.json).toHaveBeenCalledWith(mockCreatedPost)
        })

        it('should handle errors when creating a post fails', async () => {
            // Given
            mockRequest.body = mockPostData
                ; (PostService.prototype.create as jest.Mock).mockResolvedValue(
                    new Error('Databse error')
                )

            // When
            await postController.createPost(
                mockRequest as Request,
                mockResponse as Response
            )

            // Then
            expect(PostService.prototype.create).toHaveBeenCalledWith(mockPostData)
            expect(mockResponse.status).toHaveBeenCalledWith(
                StatusCodes.INTERNAL_SERVER_ERROR
            )
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error creating post'
            })
        })
    })



})