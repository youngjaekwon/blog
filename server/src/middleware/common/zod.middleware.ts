import { NextFunction, Request, Response } from 'express'
import { ZodSchema } from 'zod'

export const validateSchema = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = schema.parse(req.body)
            req.body = validated
            next()
        } catch (error) {
            next(error)
        }
    }
}
