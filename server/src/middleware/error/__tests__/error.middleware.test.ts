import { DatabaseError } from '@/errors/common/database.error'
import { errorMiddleware } from '@/middleware/error/error.middleware'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

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
})
