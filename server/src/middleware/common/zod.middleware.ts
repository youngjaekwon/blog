import { ZodValidationError } from '@/errors/common/zod.error'
import { NextFunction, Request, Response } from 'express'
import { ZodError, ZodSchema } from 'zod'

export const validateSchema = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = schema.parse(req.body)
            req.body = validated
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                throw new ZodValidationError(error)
            }
            throw error
        }
    }
}
