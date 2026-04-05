export class AppError extends Error {
    public readonly status: number;
    public readonly isOperational: boolean;

    constructor(message: string, status = 400, isOperational = true) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
