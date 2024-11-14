import { DatabaseError } from '@/errors/common/database.error'
import { errorMiddleware } from '@/middleware/error/error.middleware'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ZodError } from 'zod'

describe('ErrorMiddleware', () => {
    let mockRequest: Partial<Request>
    let mockResponse: Partial<Response>
    let nextFunction: jest.Mock

    beforeEach(() => {
        mockRequest = {}
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }
        nextFunction = jest.fn()
    })

    it('should handle BaseError', () => {
        const error = new DatabaseError('DB Error')

        errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction)

        expect(mockResponse.status).toHaveBeenCalledWith(error.statusCode)
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: error.toJSON(),
        })
    })

    it('should handle unexpected errors', () => {
        const error = new Error('Unknown error')

        errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction)

        expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR)
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: expect.any(Object),
        })
    })

    it('should handle ZodError', () => {
        const zodError = new ZodError([
            {
                code: 'invalid_type',
                expected: 'string',
                received: 'number',
                path: ['title'],
                message: 'Expected string, received number',
            },
        ])

        errorMiddleware(zodError, mockRequest as Request, mockResponse as Response, nextFunction)

        expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.UNPROCESSABLE_ENTITY)
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: {
                message: 'Validation failed',
                errorCode: 'VALIDATION_ERROR',
                errors: [
                    {
                        field: 'title',
                        message: 'Expected string, received number',
                    },
                ],
            },
        })
    })
})
