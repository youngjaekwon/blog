import { BaseError } from '@/errors/base/base.error'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof BaseError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.toJSON(),
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
