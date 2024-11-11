import { ZodValidationError } from '@/lib/zod/zod.error'
import { StatusCodes } from 'http-status-codes'
import { ZodError } from 'zod'
import { BaseError } from '@/errors/base/base.error'

export class PostError extends BaseError {}

export class PostCreateError extends PostError {
    constructor(message: string = 'Failed to create Post') {
        super(message, StatusCodes.BAD_REQUEST, 'POST_CREATE_FAILED')
    }
}

export class PostNotFoundError extends PostError {
    constructor(message: string = 'Post not found') {
        super(message, StatusCodes.NOT_FOUND, 'POST_NOT_FOUND')
    }
}

export class PostDuplicateError extends PostError {
    constructor(message: string = 'Post already exists') {
        super(message, StatusCodes.CONFLICT, 'POST_DUPLICATE')
    }
}

export class PostValidationError extends ZodValidationError {
    constructor(error: ZodError) {
        super('POST_VALIDATION_ERROR', error)
    }
}

export class PostDatabaseError extends PostError {
    constructor(message: string = 'Database operation failed') {
        super(message, StatusCodes.SERVICE_UNAVAILABLE, 'DATABASE_ERROR')
    }
}
