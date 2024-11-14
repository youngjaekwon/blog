import { PostController } from '@/controllers/post/post.controller'
import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { IPostService } from '@/services/post/post.interface'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

jest.mock('@/services/post/post.service')

describe('PostController', () => {
    let postController: PostController
    let mockRequest: Partial<Request>
    let mockResponse: Partial<Response>
    let mockPostService: IPostService

    beforeEach(() => {
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        }

        mockRequest = {}

        mockPostService = {
            create: jest.fn(),
            retrieve: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        } as unknown as IPostService

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
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockCreatedPost,
            })
        })
    })

    describe('retrievePost', () => {
        it('should retrieve a post successfully', async () => {
            // Given
            const mockPostId = '1'
            const mockPost = {
                id: mockPostId,
                title: 'Test Post',
                content: 'Test Content',
                tags: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                views: 0,
            }
            mockRequest.params = { id: mockPostId }
            ;(mockPostService.retrieve as jest.Mock).mockResolvedValue(mockPost)

            // When
            await postController.retrievePost(mockRequest as Request, mockResponse as Response)

            // Then
            expect(mockPostService.retrieve).toHaveBeenCalledWith(mockPostId)
            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK)
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockPost,
            })
        })
    })
})
