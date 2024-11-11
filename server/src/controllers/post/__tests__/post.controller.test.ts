import { PostController } from '@/controllers/post/post.controller'
import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { PostDatabaseError, PostDuplicateError, PostValidationError } from '@/errors/post/post.error'
import { PostService } from '@/services/post/post.service'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'

jest.mock('@/services/post/post.service')

describe('PostController', () => {
    let postController: PostController
    let mockRequest: Partial<Request>
    let mockResponse: Partial<Response>
    let mockPostService: PostService

    beforeEach(() => {
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        }

        mockRequest = {}

        mockPostService = {
            create: jest.fn(),
        } as unknown as PostService

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

        it('should handle database connection errors', async () => {
            // Given
            mockRequest.body = mockPostData
            const dbError = new PostDatabaseError()
            ;(mockPostService.create as jest.Mock).mockRejectedValue(dbError)

            // When
            await postController.createPost(mockRequest as Request, mockResponse as Response)

            // Then
            expect(mockPostService.create).toHaveBeenCalledWith(mockPostData)
            expect(mockResponse.status).toHaveBeenCalledWith(dbError.statusCode)
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: dbError.message,
                errorCode: dbError.errorCode,
            })
        })

        it('should handle duplicate post errors', async () => {
            // Given
            mockRequest.body = mockPostData
            const duplicateError = new PostDuplicateError()
            ;(mockPostService.create as jest.Mock).mockRejectedValue(duplicateError)

            // When
            await postController.createPost(mockRequest as Request, mockResponse as Response)

            // Then
            expect(mockPostService.create).toHaveBeenCalledWith(mockPostData)
            expect(mockResponse.status).toHaveBeenCalledWith(duplicateError.statusCode)
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: duplicateError.message,
                errorCode: duplicateError.errorCode,
            })
        })

        it('should handle validation errors', async () => {
            // Given
            const invalidPostData = {
                title: '',
                content: 'x'.repeat(1001),
            }
            mockRequest.body = invalidPostData

            const zodError = new z.ZodError([
                {
                    code: 'too_small',
                    minimum: 1,
                    type: 'string',
                    inclusive: true,
                    exact: false,
                    message: 'Title is required',
                    path: ['title'],
                },
                {
                    code: 'too_big',
                    maximum: 1000,
                    type: 'string',
                    inclusive: true,
                    exact: false,
                    message: 'Content is too long',
                    path: ['content'],
                },
            ])
            const validationError = new PostValidationError(zodError)
            ;(mockPostService.create as jest.Mock).mockRejectedValue(zodError)

            // When
            await postController.createPost(mockRequest as Request, mockResponse as Response)

            // Then
            expect(mockPostService.create).toHaveBeenCalledWith(invalidPostData)
            expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.UNPROCESSABLE_ENTITY)
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: validationError.message,
                errorCode: validationError.errorCode,
                errors: validationError.errors,
            })
        })
    })
})
