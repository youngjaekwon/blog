import { ZodValidationError } from '@/errors/common/zod.error'
import { validateSchema } from '@/middleware/common/zod.middleware'
import { Request, Response } from 'express'
import { z } from 'zod'

const testCreateSchema = z.object({
    title: z.string().min(1).max(255),
    content: z.string().min(1).max(1000),
})

describe('ValidationMiddleware', () => {
    let mockRequest: Partial<Request>
    let mockResponse: Partial<Response>
    let nextFunction: jest.Mock

    beforeEach(() => {
        mockRequest = {
            body: {},
        }
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }
        nextFunction = jest.fn()
    })

    it('should pass validation and call next for valid data', () => {
        const validData = {
            title: 'Test Post',
            content: 'Test Content',
        }
        mockRequest.body = validData

        const middleware = validateSchema(testCreateSchema)
        middleware(mockRequest as Request, mockResponse as Response, nextFunction)

        expect(nextFunction).toHaveBeenCalled()
        expect(mockRequest.body).toEqual(validData)
    })

    it('should throw ValidationError for invalid data', () => {
        const invalidData = {
            title: '',
            content: 'x'.repeat(1001),
        }
        mockRequest.body = invalidData

        const middleware = validateSchema(testCreateSchema)

        expect(() => middleware(mockRequest as Request, mockResponse as Response, nextFunction)).toThrow(
            ZodValidationError
        )
        expect(nextFunction).not.toHaveBeenCalled()
    })
})
