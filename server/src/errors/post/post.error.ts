import { BaseError } from '@/errors/base/base.error'
import { StatusCodes } from 'http-status-codes'

export class PostError extends BaseError {}

export class PostCreateError extends PostError {
    constructor(message: string = 'Failed to create Post') {
        super(message, StatusCodes.BAD_REQUEST, 'POST_CREATE_FAILED')
    }
}

export class PostRetrieveError extends PostError {
    constructor(message: string = 'Failed to retrieve Post') {
        super(message, StatusCodes.BAD_REQUEST, 'POST_RETRIEVE_FAILED')
    }
}

export class PostUpdateError extends PostError {
    constructor(message: string = 'Failed to update Post') {
        super(message, StatusCodes.BAD_REQUEST, 'POST_UPDATE_FAILED')
    }
}

export class PostDeleteError extends PostError {
    constructor(message: string = 'Failed to delete Post') {
        super(message, StatusCodes.BAD_REQUEST, 'POST_DELETE_FAILED')
    }
}
