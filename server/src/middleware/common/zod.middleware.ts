import { NextFunction, Request, Response } from 'express'
import { ZodSchema } from 'zod'

type ValidateTarget = 'body' | 'query' | 'params'

export const validateSchema = (schema: ZodSchema, target: ValidateTarget = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = schema.parse(req[target])
            req[target] = validated
            next()
        } catch (error) {
            next(error)
        }
    }
}
