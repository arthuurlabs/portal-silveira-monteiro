import { AppError } from './app-error.js'

export class TooManyRequestsError extends AppError {
    constructor(message = 'Muitas requisições. Tente novamente mais tarde') {
        super(message, 429)
        this.name = 'TooManyRequestsError'
    }
}
