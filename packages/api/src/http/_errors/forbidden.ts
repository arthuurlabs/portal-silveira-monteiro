import { AppError } from './app-error.js'

export class ForbiddenError extends AppError {
    constructor(message = 'Você não tem permissão para realizar esta ação') {
        super(message, 403)
        this.name = 'ForbiddenError'
    }
}
