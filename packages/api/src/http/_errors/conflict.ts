import { AppError } from './app-error.js';

export class ConflictError extends AppError {
    constructor(message = 'Este recurso já existe') {
        super(message, 409);
        this.name = 'ConflictError';
    }
}
