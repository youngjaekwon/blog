export class BaseError extends Error {
    constructor(public message: string, public statusCode: number, public errorCode: string) {
        super(message)
        this.name = this.constructor.name
    }

    toJSON() {
        return {
            message: this.message,
            errorCode: this.errorCode,
        }
    }
}
