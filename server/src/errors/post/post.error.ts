import { BaseError } from '@/errors/base/base.error'
import { StatusCodes } from 'http-status-codes'

export class PostError extends BaseError {}

export class PostCreateError extends PostError {
    constructor(message: string = 'Failed to create Post') {
        super(message, StatusCodes.BAD_REQUEST, 'POST_CREATE_FAILED')
    }
}

export class PostDatabaseError extends PostError {
    constructor(message: string = 'Database operation failed') {
        super(message, StatusCodes.SERVICE_UNAVAILABLE, 'DATABASE_ERROR')
    }
}
