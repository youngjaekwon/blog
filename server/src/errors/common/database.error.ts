import { BaseError } from '@/errors/base/base.error'
import { StatusCodes } from 'http-status-codes'

export class NotFoundError extends BaseError {
    constructor(message: string = 'Resource not found') {
        super(message, StatusCodes.NOT_FOUND, 'NOT_FOUND')
    }
}

export class DuplicateError extends BaseError {
    constructor(message: string = 'Resource already exists') {
        super(message, StatusCodes.CONFLICT, 'DUPLICATE')
    }
}

export class DatabaseError extends BaseError {
    constructor(message: string = 'Database operation failed') {
        super(message, StatusCodes.SERVICE_UNAVAILABLE, 'DATABASE_ERROR')
    }
}
