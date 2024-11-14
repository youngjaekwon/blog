import { StatusCodes } from 'http-status-codes'
import { ZodError } from 'zod'

export class ZodValidationError extends Error {
    public statusCode: number
    public errorCode: string
    public errors?: { field: string; message: string }[]

    constructor(error: ZodError, message: string = 'Validation failed', errorCode: string = 'VALIDATION_ERROR') {
        super(message)
        this.name = this.constructor.name
        this.statusCode = StatusCodes.UNPROCESSABLE_ENTITY
        this.errorCode = errorCode
        this.errors = error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }))
    }

    toJSON() {
        return {
            message: this.message,
            errorCode: this.errorCode,
            errors: this.errors,
        }
    }
}
