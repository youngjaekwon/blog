import { BaseError } from '@/errors/base/base.error'
import { ZodValidationError } from '@/errors/common/zod.error'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ZodError } from 'zod'

export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof ZodError) {
        const validationError = new ZodValidationError(error)
        return res.status(validationError.statusCode).json({
            success: false,
            error: validationError.toJSON(),
        })
    }

    if (error instanceof BaseError) {
        return res.status(error.statusCode).json({
            success: false,
            error: error.toJSON(),
        })
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
            name: 'InternalServerError',
            message: 'An unexpected error occurred',
        },
    })
}
