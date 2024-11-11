import { PostController } from '@/controllers/post/post.controller'
import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { PostService } from '@/services/post/post.service'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

jest.mock('@/services/post/post.service')

describe('PostController', () => {
    let postController: PostController
    let mockRequest: Partial<Request>
    let mockResponse: Partial<Response>
    let mockPostService: jest.Mocked<PostService>

    beforeEach(() => {
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        }

        mockRequest = {}

        mockPostService = {
            create: jest.fn(),
        } as unknown as jest.Mocked<PostService>

        postController = new PostController(mockPostService)
    })

    describe('createPost', () => {
        const mockPostData: CreatePostDTO = {
            title: 'Test Post',
            content: 'Test Content',
        }

        it('should create a post successfully', async () => {
            // Given
            const mockCreatedPost = {
                id: '1',
                ...mockPostData,
                tags: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                views: 0,
            }
            mockRequest.body = mockPostData
            ;(mockPostService.create as jest.Mock).mockResolvedValue(mockCreatedPost)

            // When
            await postController.createPost(mockRequest as Request, mockResponse as Response)

            // Then
            expect(mockPostService.create).toHaveBeenCalledWith(mockPostData)
            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.CREATED)
            expect(mockResponse.json).toHaveBeenCalledWith(mockCreatedPost)
        })

        it('should handle errors when creating a post fails', async () => {
            // Given
            mockRequest.body = mockPostData
            ;(mockPostService.create as jest.Mock).mockRejectedValue(new Error('Database error'))

            // When
            await postController.createPost(mockRequest as Request, mockResponse as Response)

            // Then
            expect(mockPostService.create).toHaveBeenCalledWith(mockPostData)
            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR)
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error creating post',
            })
        })
    })
})
